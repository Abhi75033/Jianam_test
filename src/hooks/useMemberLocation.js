import { useCallback, useEffect, useRef, useState } from "react";
import { memberClient } from "@/lib/memberClient";

const CACHE_KEY = "jinanam_member_geo";
/** A fix older than this is treated as stale rather than shown as current. */
const MAX_AGE_MS = 30 * 60 * 1000;

function readCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (!raw || Date.now() - raw.at > MAX_AGE_MS) return null;
    return raw;
  } catch {
    return null;
  }
}

function writeCache(coords) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(coords));
  } catch {
    /* storage full or disabled — location still works for this session */
  }
}

/**
 * useMemberLocation — the member panel's GPS layer.
 *
 * §4.3.4 / §4.15.6 need "current GPS location, else registered address" driving
 * feed and directory priority. Before this hook, zero geolocation calls existed
 * anywhere in the member panel, so every "Nearby" section and every distance
 * chip was permanently blank.
 *
 * Deliberately does NOT auto-prompt on mount. Browsers gate the permission
 * dialog behind a user gesture on most platforms, and firing it unprompted is
 * exactly the pattern that gets a site auto-denied and blocklisted by the user.
 * `request()` is called from a button click. The one exception: if permission
 * was already granted in an earlier visit, `navigator.permissions.query` finds
 * that out without showing a dialog, and this hook uses that to restore a fix
 * silently.
 */
export function useMemberLocation() {
  const [coords, setCoords] = useState(() => {
    const cached = readCache();
    return cached ? { lat: cached.lat, lng: cached.lng } : null;
  });
  const [status, setStatus] = useState("idle"); // idle | locating | granted | denied | unsupported | error
  const [error, setError] = useState("");
  const syncedRef = useRef(false);

  const syncToServer = useCallback((c) => {
    // Best-effort: the member's own dashboard should not break because this
    // one background write failed.
    memberClient
      .post("/members/me/location", { latitude: c.lat, longitude: c.lng })
      .catch(() => {});
  }, []);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("locating");
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setStatus("granted");
        writeCache({ ...c, at: Date.now() });
        syncToServer(c);
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        setError(err.message || "Could not determine your location.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: MAX_AGE_MS }
    );
  }, [syncToServer]);

  // Silent restore: only when the browser already knows permission is granted,
  // so this never shows a prompt on a fresh visit.
  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;
    if (!("permissions" in navigator) || !("geolocation" in navigator)) return;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted") request();
      })
      .catch(() => {
        /* permissions API not supported everywhere (Safari < 16); the button
           covers this case */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { coords, status, error, request };
}

export default useMemberLocation;
