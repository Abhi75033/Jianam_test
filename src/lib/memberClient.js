/**
 * memberClient.js — the Member panel's own HTTP client.
 *
 * The member panel and the admin panel previously shared one axios instance and
 * one set of localStorage keys. That single shared session is why signing in as
 * Super Admin also "signed you in" to the member panel: both read
 * `jinanam_access_token`, so whichever session existed drove both.
 *
 * This client is deliberately isolated:
 *   - its own token keys (`jinanam_member_*`), so an admin session is invisible
 *     to it and a member session is invisible to the admin panel;
 *   - its own refresh + 401 handling, so one panel logging out never clears the
 *     other's session;
 *   - no delete guard and no admin interceptors — the member API surface is
 *     member-scoped by the server.
 *
 * Both panels can therefore be signed in at once in the same browser, which is
 * exactly what you want while testing.
 */
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

/** Member-scoped storage keys — never share these with the admin panel. */
export const MEMBER_KEYS = {
  access: "jinanam_member_access_token",
  refresh: "jinanam_member_refresh_token",
  user: "jinanam_member_user",
  device: "jinanam_member_device_id",
};

export const memberClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

let onMemberUnauthorized = null;
export function setMemberUnauthorizedHandler(fn) {
  onMemberUnauthorized = fn;
}

export function getMemberDeviceId() {
  let id = localStorage.getItem(MEMBER_KEYS.device);
  if (!id) {
    id = `web-member-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(MEMBER_KEYS.device, id);
  }
  return id;
}

export function getMemberSession() {
  try {
    return JSON.parse(localStorage.getItem(MEMBER_KEYS.user) || "null");
  } catch {
    return null;
  }
}

export function saveMemberSession({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(MEMBER_KEYS.access, accessToken);
  if (refreshToken) localStorage.setItem(MEMBER_KEYS.refresh, refreshToken);
  if (user) localStorage.setItem(MEMBER_KEYS.user, JSON.stringify(user));
}

export function clearMemberSession() {
  localStorage.removeItem(MEMBER_KEYS.access);
  localStorage.removeItem(MEMBER_KEYS.refresh);
  localStorage.removeItem(MEMBER_KEYS.user);
}

memberClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(MEMBER_KEYS.access);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight refresh: concurrent 401s wait on one refresh call rather than
// each firing their own and racing to overwrite the token.
let refreshInFlight = null;

memberClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    const refreshToken = localStorage.getItem(MEMBER_KEYS.refresh);
    if (!refreshToken) {
      clearMemberSession();
      if (onMemberUnauthorized) onMemberUnauthorized();
      return Promise.reject(error);
    }

    try {
      refreshInFlight =
        refreshInFlight ||
        axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      const { data } = await refreshInFlight;
      refreshInFlight = null;

      const newAccess = data?.data?.accessToken;
      const newRefresh = data?.data?.refreshToken;
      if (!newAccess) throw new Error("no access token in refresh response");

      saveMemberSession({ accessToken: newAccess, refreshToken: newRefresh });
      original.headers.Authorization = `Bearer ${newAccess}`;
      return memberClient(original);
    } catch (e) {
      refreshInFlight = null;
      clearMemberSession();
      if (onMemberUnauthorized) onMemberUnauthorized();
      return Promise.reject(error);
    }
  }
);

export default memberClient;
