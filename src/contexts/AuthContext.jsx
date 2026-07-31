import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setUnauthorizedHandler } from "@/lib/api";

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
      // /auth/me/modules returns { modules, permissions, organizationIds, isSuperAdmin }
      const mod = modRes.data?.data || {};
      setPermissions(mod.permissions || {});
      setModules(mod.modules || []);
      setUser((prev) => {
        const merged = {
          ...(prev || {}),
          ...me,
          organizationIds: mod.organizationIds || [],
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

  const canDo = (module, action) => {
    if (!user) return false;
    if (user.primaryRoleKey === "SUPER_ADMIN") return true;
    return permissions?.[module]?.includes(action) || false;
  };

  const isSuperAdmin = user?.primaryRoleKey === "SUPER_ADMIN";

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
        loginWithPassword,
        requestOtp,
        verifyOtp,
        requestEmailOtp,
        verifyEmailOtp,
        loginWithEmailPassword,
        loginWithGoogle,
        logout,
        canDo,
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
