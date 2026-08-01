import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { api, setUnauthorizedHandler } from "@/lib/api";
import {
  ACTIONS,
  buildCapabilities,
  can as canAccess,
  delegatableModules as computeDelegatable,
  grantedModules as computeGranted,
  canDelegate,
  isSuperRole,
} from "@/lib/access";

const AuthContext = createContext(null);

const ACCESS_KEY = "jinanam_access_token";
const REFRESH_KEY = "jinanam_refresh_token";
const USER_KEY = "jinanam_user";
const DEVICE_KEY = "jinanam_device_id";

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = "web-" + (crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [permissions, setPermissions] = useState({});
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(!!localStorage.getItem(ACCESS_KEY));

  const persist = (u, access, refresh) => {
    setUser(u);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  };

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", { deviceId: getDeviceId() });
    } catch {}
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setPermissions({});
    setModules([]);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setPermissions({});
      setModules([]);
    });
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const [meRes, modRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/auth/me/modules").catch(() => ({ data: { data: {} } })),
      ]);
      const me = meRes.data?.data || {};
      const mod = modRes.data?.data || {};

      /*
       * /settings/* is Super-Admin-only, so asking for permission overrides on
       * every sign-in put a red 403 in the console for every other account. The
       * result was already discarded for them (grants come from /auth/me/modules),
       * so the call is now made only when it can actually succeed.
       */
      const overrideRes =
        me.primaryRoleKey === "SUPER_ADMIN"
          ? await api.get("/settings/users/me/permission-overrides").catch(() => null)
          : null;

      let moduleList = [];
      const overrides = overrideRes?.data?.data;

      // 1. Check local admin permission cache for instant client sync
      const cached = me.id ? localStorage.getItem(`jinanam_admin_modules_${me.id}`) ||
                     localStorage.getItem(`jinanam_admin_modules_${me.userId}`) ||
                     localStorage.getItem(`jinanam_admin_modules_${me.mobile}`) : null;

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) moduleList = parsed;
        } catch {}
      }

      if (moduleList.length === 0) {
        if (Array.isArray(overrides) && overrides.length > 0) {
          moduleList = overrides.filter((o) => o.allowed).map((o) => o.module);
        } else if (Array.isArray(mod.modules) && mod.modules.length > 0) {
          moduleList = mod.modules;
        } else if (Array.isArray(me.grantedModules) && me.grantedModules.length > 0) {
          moduleList = me.grantedModules;
        } else if (Array.isArray(me.modules) && me.modules.length > 0) {
          moduleList = me.modules;
        }
      }

      setPermissions(mod.permissions || me.permissions || {});
      setModules(moduleList);
      setUser((prev) => {
        const merged = {
          ...(prev || {}),
          ...me,
          organizationIds: mod.organizationIds || me.organizationIds || [],
          grantedModules: moduleList,
          modules: moduleList,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(merged));
        return merged;
      });
      return me;
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem(ACCESS_KEY)) {
      refreshMe().finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
  }, [refreshMe]);

  const loginWithPassword = async ({ mobile, password }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login/password", {
        mobile,
        password,
        deviceId: getDeviceId(),
        deviceType: "WEB",
      });
      const d = data.data;
      // Backend returns: { userId, publicId, role, accessToken, refreshToken }
      // Build a user object from those fields
      const userObj = d.user ?? {
        id: d.userId,
        publicId: d.publicId,
        primaryRoleKey: d.role,
        mobile,
      };
      persist(userObj, d.accessToken, d.refreshToken);
      await refreshMe();
      return d;
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (mobile) => {
    const { data } = await api.post("/auth/otp/request", { mobile, purpose: "LOGIN" });
    return data.data;
  };

  const verifyOtp = async ({ mobile, otp }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/verify", {
        mobile,
        otp,
        purpose: "LOGIN",
        deviceId: getDeviceId(),
        deviceType: "WEB",
      });
      const d = data.data;
      const userObj = d.user ?? {
        id: d.userId,
        publicId: d.publicId,
        primaryRoleKey: d.role,
        mobile,
      };
      persist(userObj, d.accessToken, d.refreshToken);
      await refreshMe();
      return d;
    } finally {
      setLoading(false);
    }
  };

  const requestEmailOtp = async (email) => {
    const { data } = await api.post("/auth/email/otp/request", { email });
    return data.data;
  };

  const verifyEmailOtp = async ({ email, otp }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/email/otp/verify", {
        email,
        otp,
        deviceId: getDeviceId(),
        deviceType: "WEB",
      });
      const d = data.data;
      const userObj = d.user ?? {
        id: d.userId,
        publicId: d.publicId,
        primaryRoleKey: d.role,
        email,
      };
      persist(userObj, d.accessToken, d.refreshToken);
      await refreshMe();
      return d;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmailPassword = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login/email", {
        email,
        password,
        deviceId: getDeviceId(),
        deviceType: "WEB",
      });
      const d = data.data;
      const userObj = d.user ?? {
        id: d.userId,
        publicId: d.publicId,
        primaryRoleKey: d.role,
        email,
      };
      persist(userObj, d.accessToken, d.refreshToken);
      await refreshMe();
      return d;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async ({ email, googleId, firstName, lastName, photoUrl }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/google", {
        email,
        googleId,
        firstName,
        lastName,
        photoUrl,
        deviceId: getDeviceId(),
        deviceType: "WEB",
      });
      const d = data.data;
      const userObj = d.user ?? {
        id: d.userId,
        publicId: d.publicId,
        primaryRoleKey: d.role,
        email,
      };
      persist(userObj, d.accessToken, d.refreshToken);
      await refreshMe();
      return d;
    } finally {
      setLoading(false);
    }
  };

  const role = user?.primaryRoleKey || user?.role || null;
  const isSuperAdmin = isSuperRole(role);

  /**
   * The account's capability map — the single source of truth for "what may
   * this user do?". Super Admin gets every module with every action; anyone
   * who received their tabs from someone else gets VIEW/CREATE/EDIT on those
   * tabs and never DELETE (see src/lib/access.js).
   */
  const capabilities = useMemo(
    () => (user ? buildCapabilities({ role, modules, permissions }) : {}),
    [user, role, modules, permissions]
  );

  /** Tabs this account holds. */
  const allowedModules = useMemo(() => computeGranted(capabilities), [capabilities]);

  /** Tabs this account may pass on to accounts it onboards (never more than it holds). */
  const delegatableModules = useMemo(
    () => computeDelegatable(capabilities, role),
    [capabilities, role]
  );

  /**
   * canDo(module, action) — kept for the existing call sites. Now backed by the
   * capability map, so an Admin granted a tab genuinely gets its Create/Edit
   * affordances instead of falling through to `false`.
   */
  const canDo = useCallback(
    (module, action = ACTIONS.VIEW) => canAccess(capabilities, module, action),
    [capabilities]
  );

  const canView = useCallback((m) => canDo(m, ACTIONS.VIEW), [canDo]);
  const canCreate = useCallback((m) => canDo(m, ACTIONS.CREATE), [canDo]);
  const canEdit = useCallback((m) => canDo(m, ACTIONS.EDIT), [canDo]);
  /** Destructive rights are never delegated — only Super Admin deletes. */
  const canDelete = useCallback((m) => canDo(m, ACTIONS.DELETE), [canDo]);
  const canApprove = useCallback((m) => canDo(m, ACTIONS.APPROVE), [canDo]);

  /** May this account onboard others and delegate its own tabs onward? */
  const canOnboard = canDelegate(role) && delegatableModules.length > 0;

  /**
   * Organisation scope — the specific temples / centres / dharamshalas this
   * account was assigned. Tab access answers "which modules?"; this answers
   * "which records?". An admin granted the Temple tab still only manages the
   * temples mapped to them.
   */
  const organizationIds = useMemo(() => {
    const raw =
      user?.organizationIds ||
      user?.userOrganizations?.map((uo) => uo.organizationId || uo.organization?.id) ||
      [];
    return Array.from(new Set(raw.filter(Boolean)));
  }, [user]);

  /** Monk admins are global by design and are not pinned to organisations. */
  const isGlobalScope = isSuperAdmin || role === "MONK_ADMIN";

  /**
   * Can this account act on a specific organisation record?
   *
   * Super Admin and monk admins: anywhere. A scoped admin: only where assigned,
   * matched on either the internal id or the public id since callers have
   * whichever the route gave them.
   *
   * When the backend returns no scope at all we deliberately do NOT block. The
   * module grant has already gated the tab and the server is the real authority
   * on records — failing closed here just locked legitimate admins out of their
   * own temple. Absence of scope data means "unknown", not "denied".
   */
  const canManageOrg = useCallback(
    (targetOrgId, targetPublicId) => {
      if (isGlobalScope) return true;
      if (organizationIds.length === 0) return true; // scope unknown → let the server decide
      if (!targetOrgId && !targetPublicId) return true;
      return (
        (targetOrgId && organizationIds.includes(targetOrgId)) ||
        (targetPublicId && organizationIds.includes(targetPublicId))
      );
    },
    [isGlobalScope, organizationIds]
  );

  /** True when a scoped admin has been given no organisations at all. */
  const hasNoOrgScope = !isGlobalScope && organizationIds.length === 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        modules,
        loading,
        initializing,
        isAuthenticated: !!user,
        isSuperAdmin,
        role,
        capabilities,
        allowedModules,
        delegatableModules,
        canOnboard,
        organizationIds,
        isGlobalScope,
        hasNoOrgScope,
        canManageOrg,
        loginWithPassword,
        requestOtp,
        verifyOtp,
        requestEmailOtp,
        verifyEmailOtp,
        loginWithEmailPassword,
        loginWithGoogle,
        logout,
        canDo,
        canView,
        canCreate,
        canEdit,
        canDelete,
        canApprove,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
