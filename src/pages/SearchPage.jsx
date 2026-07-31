import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Search as SearchIcon, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const TYPE_LABEL = {
  ORGANIZATION: "Organization",
  MONK: "Monk",
  EVENT: "Event",
  COMMUNITY_PAGE: "Community Page",
  MEMBER: "Member",
  TOUR: "Tour",
};

const TYPE_PATH = {
  ORGANIZATION: (r) => `/temples/${r.id}`,
  MONK: (r) => `/monks`,
  EVENT: (r) => `/events`,
  COMMUNITY_PAGE: (r) => `/community-pages`,
  MEMBER: (r) => `/members`,
  TOUR: (r) => `/tours`,
};

export default function SearchPage() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [q, setQ] = useState(params.get("q") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    api.get("/search", { params: { q, page: 1, pageSize: 30 } })
      .then((res) => {
        const rawResults = res.data?.data?.results || [];
        const flattened = (Array.isArray(rawResults) ? rawResults : []).map((r) => ({
          type: r.type,
          ...r.entity,
        }));
        setResults(flattened);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q]);

  const submit = (e) => {
    e.preventDefault();
    setParams({ q });
  };

  const grouped = results.reduce((acc, r) => {
    const t = r.type || "OTHER";
    (acc[t] = acc[t] || []).push(r);
    return acc;
  }, {});

  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h2 className="text-xl font-bold text-slate-800">{t("Access Denied")}</h2>
        <p className="text-sm text-slate-500">{t("Only Super Admins can access this page.")}</p>
      </div>
    );
  }

  return (
    <div data-testid="search-page">
      <PageHeader
        title={t("Global Search")}
        subtitle={t("Search across members, temples, monks, events, community pages — or type a public ID like JFJT108.")}
      />
      <form onSubmit={submit} className="mb-6">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search anything…")}
            className="pl-9 h-11 bg-white"
            data-testid="search-input"
            autoFocus
          />
        </div>
      </form>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : q && results.length === 0 ? (
        <EmptyState title={t("No results")} description={`Nothing matched "${q}".`} />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                {TYPE_LABEL[type] || type} · {items.length}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.map((r, i) => (
                  <Card
                    key={r.id || i}
                    className="p-3 rounded-md border-border hover:shadow-sm hover:-translate-y-[1px] transition-all cursor-pointer"
                    onClick={() => TYPE_PATH[type]?.(r) && navigate(TYPE_PATH[type](r))}
                    data-testid={`search-result-${i}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{r.name || r.title || r.dikshaName || r.firstName || "—"}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {r.subtitle || r.city || r.venue || r.publicId}
                        </div>
                      </div>
                      {r.publicId && (
                        <Badge variant="outline" className="font-mono text-[10px] shrink-0">{r.publicId}</Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
