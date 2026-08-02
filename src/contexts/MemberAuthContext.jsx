import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  memberClient,
  setMemberUnauthorizedHandler,
  getMemberDeviceId,
  getMemberSession,
  saveMemberSession,
  clearMemberSession,
} from "@/lib/memberClient";
import { disconnectMemberSockets } from "@/lib/memberSocket";

/**
 * MemberAuthContext — the Member panel's own session, fully separate from the
 * admin one.
 *
 * Why this exists: both panels used to share `AuthContext` and one set of
 * localStorage keys, so a Super Admin session silently became the member
 * session too, and `/` dropped you into the admin dashboard. This context reads
 * and writes only `jinanam_member_*`, so:
 *
 *   - signing into the admin panel has no effect on the member panel;
 *   - signing out of one leaves the other signed in;
 *   - both can be active at once in the same browser.
 *
 * It also refuses non-member roles outright: an admin token pasted into member
 * storage will not unlock the member panel.
 */
const MemberAuthContext = createContext(null);

/** Roles allowed to use the member panel. Everything else is an admin account. */
const MEMBER_ROLES = ["MEMBER", "NON_JAIN_MEMBER"];

export function isMemberRole(role) {
  return MEMBER_ROLES.includes(String(role || "").toUpperCase());
}

export function MemberAuthProvider({ children }) {
  const [member, setMember] = useState(() => getMemberSession());
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  const signOutLocal = useCallback(() => {
    clearMemberSession();
    // Drop the realtime connection too — it holds the old token, and the next
    // member on this device would otherwise inherit it.
    disconnectMemberSockets();
    setMember(null);
  }, []);

  useEffect(() => {
    setMemberUnauthorizedHandler(() => signOutLocal());
  }, [signOutLocal]);

  /** Re-read the signed-in member from the API. */
  const refreshMember = useCallback(async () => {
    try {
      const { data } = await memberClient.get("/auth/me");
      const me = data?.data || null;
      if (!me) return null;
      // Guard: an admin account must never drive the member panel. The role
      // key varies by endpoint (`primaryRoleKey` on /auth/me, `role` on the
      // login response), so check both before deciding to sign someone out.
      const role = me.primaryRoleKey || me.role;
      if (role && !isMemberRole(role)) {
        signOutLocal();
        return null;
      }
      saveMemberSession({ user: me });
      setMember(me);
      return me;
    } catch {
      return null;
    }
  }, [signOutLocal]);

  useEffect(() => {
    (async () => {
      if (localStorage.getItem("jinanam_member_access_token")) {
        await refreshMember();
      }
      setInitializing(false);
    })();
  }, [refreshMember]);

  /**
   * Store tokens from any successful auth call, rejecting non-member roles.
   *
   * The API answers with FLAT fields — { userId, publicId, role, accessToken,
   * refreshToken } — not a nested `user`. Reading `payload.user` therefore gave
   * null, the session was never stored, and the route guard bounced a
   * successful login straight back to the sign-in page.
   */
  const acceptSession = useCallback((payload) => {
    if (!payload) return null;
    const user =
      payload.user ||
      payload.member ||
      (payload.userId || payload.publicId
        ? {
            id: payload.userId,
            userId: payload.userId,
            publicId: payload.publicId,
            primaryRoleKey: payload.role || payload.primaryRoleKey,
            mobile: payload.mobile,
          }
        : null);

    if (user && !isMemberRole(user.primaryRoleKey)) {
      const err = new Error(
        "This is a member sign-in. Please use the admin portal for administrator accounts."
      );
      err.code = "NOT_A_MEMBER";
      throw err;
    }
    saveMemberSession({
      accessToken: payload?.accessToken,
      refreshToken: payload?.refreshToken,
      user,
    });
    setMember(user);
    return user;
  }, []);

  const device = () => ({
    deviceId: getMemberDeviceId(),
    deviceType: "WEB",
    os: navigator.platform || "web",
  });

  const loginWithPassword = useCallback(
    async ({ mobile, password }) => {
      setLoading(true);
      try {
        const { data } = await memberClient.post("/auth/login/password", {
          mobile,
          password,
          ...device(),
        });
        return acceptSession(data?.data);
      } finally {
        setLoading(false);
      }
    },
    [acceptSession]
  );

  const requestOtp = useCallback(async (mobile) => {
    setLoading(true);
    try {
      const { data } = await memberClient.post("/auth/otp/request", {
        mobile,
        purpose: "LOGIN",
      });
      return data?.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async ({ mobile, otp }) => {
      setLoading(true);
      try {
        const { data } = await memberClient.post("/auth/otp/verify", {
          mobile,
          otp,
          purpose: "LOGIN",
          ...device(),
        });
        return acceptSession(data?.data);
      } finally {
        setLoading(false);
      }
    },
    [acceptSession]
  );

  /**
   * These two have no backend: /auth/login/email and /auth/google are not
   * routes on the API. They exist so the buttons don't crash on an undefined
   * handler, and so the user is told why instead of seeing a raw 404.
   */
  const loginWithEmailPassword = useCallback(async () => {
    const err = new Error(
      "Email sign-in isn't available yet. Please use your mobile number."
    );
    err.code = "NOT_IMPLEMENTED";
    throw err;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const err = new Error(
      "Google sign-in isn't available yet. Please use your mobile number."
    );
    err.code = "NOT_IMPLEMENTED";
    throw err;
  }, []);

  const logout = useCallback(async () => {
    try {
      await memberClient.post("/auth/logout", { deviceId: getMemberDeviceId() });
    } catch {
      /* logging out locally matters more than the server round trip */
    }
    signOutLocal();
  }, [signOutLocal]);

  return (
    <MemberAuthContext.Provider
      value={{
        member,
        user: member, // alias, so existing member screens keep working
        isAuthenticated: !!member,
        initializing,
        loading,
        loginWithPassword,
        loginWithEmailPassword,
        loginWithGoogle,
        requestOtp,
        verifyOtp,
        logout,
        refreshMember,
      }}
    >
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) {
    throw new Error("useMemberAuth must be used inside <MemberAuthProvider>");
  }
  return ctx;
}

export default MemberAuthContext;
