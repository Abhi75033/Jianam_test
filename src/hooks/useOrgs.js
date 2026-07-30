import { useEffect, useState } from "react";
import { api } from "@/lib/api";

let cache = null;

/**
 * Fetches all organizations (temples + dharamshalas + jain centers) once and
 * caches them for the session. Used by super-admin pages that need an
 * organization context and by org-select form fields.
 */
export function useOrgs() {
  const [orgs, setOrgs] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let mounted = true;
    Promise.all([
      api.get("/temples").catch(() => ({ data: { data: [] } })),
      api.get("/dharamshalas").catch(() => ({ data: { data: [] } })),
      api.get("/jain-centers").catch(() => ({ data: { data: [] } })),
      api.get("/sthanaks").catch(() => ({ data: { data: [] } })),
      api.get("/community-pages").catch(() => ({ data: { data: [] } })),
    ])
      .then((results) => {
        const list = results.flatMap((r) => {
          const d = r.data?.data;
          return Array.isArray(d) ? d : d?.items || [];
        });
        cache = list;
        if (mounted) setOrgs(list);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { orgs, loading };
}

/** { value, label } options for select fields. */
export function orgOptions(orgs) {
  return (orgs || []).map((o) => ({ value: o.id, label: `${o.name}${o.city ? ` · ${o.city}` : ""}` }));
}
