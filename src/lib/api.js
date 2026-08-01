import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

export const STATIC_URL =
  process.env.REACT_APP_STATIC_URL || "http://localhost:8000/static";

export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

/**
 * Endpoints whose DELETE verb detaches a relationship rather than destroying a
 * record (unfollow, un-bookmark, un-save, leaving a page). These stay available
 * to delegated accounts — the delete guard below only blocks destructive calls.
 */
const DETACH_DELETE_PATTERNS = [
  /\/bookmark$/,
  /\/unsave$/,
  /\/unfollow$/,
  /\/leave$/,
];

/**
 * Delete guard — the enforcement half of the CRU-not-D rule.
 *
 * Hiding delete buttons in the UI is a courtesy; this is the guarantee. Any
 * DELETE issued by an account that did not receive DELETE rights (i.e. anyone
 * who was onboarded by someone else) is rejected before it leaves the browser.
 *
 * This is a client-side guard for a client-side affordance. The API must apply
 * the same rule server-side — a delegated account can still call the endpoint
 * directly, so treat this as defence in depth, not the boundary.
 */
export function isDeleteBlocked(method, url) {
  if (String(method || "").toUpperCase() !== "DELETE") return false;
  if (DETACH_DELETE_PATTERNS.some((re) => re.test(String(url || "").split("?")[0]))) {
    return false;
  }
  try {
    const user = JSON.parse(localStorage.getItem("jinanam_user") || "null");
    const role = user?.primaryRoleKey || user?.role;
    return role !== "SUPER_ADMIN";
  } catch {
    return true; // no readable session → fail closed
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jinanam_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (isDeleteBlocked(config.method, config.url)) {
    const err = new Error(
      "Delete is reserved for Super Admin. Your account can view, add and edit records in the tabs granted to you."
    );
    err.code = "DELETE_NOT_PERMITTED";
    err.isPermissionError = true;
    return Promise.reject(err);
  }

  return config;
});

let refreshingPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    // Try refresh on 401 once
    if (status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("jinanam_refresh_token");
      if (refreshToken) {
        try {
          refreshingPromise =
            refreshingPromise ||
            axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { data } = await refreshingPromise;
          refreshingPromise = null;
          const newAccess = data?.data?.accessToken;
          const newRefresh = data?.data?.refreshToken;
          if (newAccess) {
            localStorage.setItem("jinanam_access_token", newAccess);
            if (newRefresh) localStorage.setItem("jinanam_refresh_token", newRefresh);
            original.headers.Authorization = `Bearer ${newAccess}`;
            return api(original);
          }
        } catch (e) {
          refreshingPromise = null;
        }
      }
      // Refresh failed → logout
      localStorage.removeItem("jinanam_access_token");
      localStorage.removeItem("jinanam_refresh_token");
      localStorage.removeItem("jinanam_user");
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(err) {
  if (!err) return "An error occurred";
  if (typeof err === "string") return err;

  const resData = err?.response?.data;
  if (typeof resData === "string") return resData;

  const e = resData?.error || resData;
  if (typeof e === "string") return e;

  if (e?.fieldErrors && typeof e.fieldErrors === "object") {
    const details = Object.entries(e.fieldErrors)
      .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(", ") : typeof msg === "string" ? msg : JSON.stringify(msg)}`)
      .join("; ");
    if (details) return details;
  }

  if (Array.isArray(e?.errors) && e.errors.length) {
    const details = e.errors
      .map((x) => (typeof x === "string" ? x : `${x.field || "error"}: ${x.message || "invalid"}`))
      .join(", ");
    if (details) return details;
  }

  if (typeof e?.message === "string") return e.message;
  if (typeof resData?.message === "string") return resData.message;

  if (typeof err?.message === "string") return err.message;
  return "Request failed";
}

export const API_BASE = API_BASE_URL;
