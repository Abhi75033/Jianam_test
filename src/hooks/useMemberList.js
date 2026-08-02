import { useCallback, useEffect, useState } from "react";
import { memberClient as api } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";

/**
 * useMemberList — one fetch/loading/empty pattern for the member list screens.
 *
 * Nine member pages rendered hardcoded demo arrays with no loading state, no
 * error state and no empty state. Rather than repeat that plumbing nine times,
 * each page now declares its endpoint and a `map` that reshapes the API row
 * into whatever the existing markup already reads — so the UI is untouched and
 * only the data source changes.
 *
 * The envelope varies across endpoints ({data:[…]}, {data:{items:[…]}}), so
 * unwrapping is handled here rather than in every caller.
 *
 * @param {string}   path            e.g. "/news"
 * @param {object}   [opts]
 * @param {object}   [opts.params]   query params
 * @param {Function} [opts.map]      (row, index) => shaped row
 * @param {boolean}  [opts.enabled]  skip the call when false
 */
export function useMemberList(path, { params, map, enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const key = JSON.stringify(params || null);

  const load = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.get(path, params ? { params } : undefined);
      const raw = res?.data?.data;
      const list = Array.isArray(raw) ? raw : raw?.items || [];
      setItems(map ? list.map(map) : list);
    } catch (e) {
      setError(extractErrorMessage(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key, enabled]);

  useEffect(() => { load(); }, [load]);

  return { items, loading, error, reload: load };
}

/**
 * useMemberItem — the single-record equivalent, for detail screens.
 */
export function useMemberItem(path, { map, enabled = true } = {}) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!enabled || !path) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.get(path);
      const raw = res?.data?.data ?? null;
      setItem(raw && map ? map(raw) : raw);
    } catch (e) {
      setError(extractErrorMessage(e));
      setItem(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, enabled]);

  useEffect(() => { load(); }, [load]);

  return { item, loading, error, reload: load };
}

/* ─── Shared display helpers ───────────────────────────────────────────────
 * The demo arrays carried pre-formatted strings ("2 hours ago", "14.2k"). Real
 * API rows carry timestamps and numbers, so these bridge the two without the
 * markup having to change.
 * ------------------------------------------------------------------------ */

/** "2 hours ago" / "3 days ago" from an ISO timestamp. */
export function relativeTime(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** 14200 -> "14.2k" */
export function compactNumber(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0";
  if (v < 1000) return String(v);
  if (v < 1_000_000) return `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

/** Long-form date the news/tour cards display. */
export function longDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}
