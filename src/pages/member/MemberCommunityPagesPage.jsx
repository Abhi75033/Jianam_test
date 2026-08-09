import { Link } from "react-router-dom";
import { Users2, Search, ChevronRight, Users, Sparkles, Building2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemberList } from "@/hooks/useMemberList";
import ListState from "@/components/member/ListState";
import { STATIC_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

function mapPage(p, i) {
  return {
    id: p.id || p.publicId || i,
    publicId: p.publicId,
    name: p.name,
    about: p.about || "",
    category: p.category?.name || "Sangh Trust",
    memberCount: p._count?.members ?? 0,
    logoSrc: p.logoUrl ? (p.logoUrl.startsWith("http") ? p.logoUrl : `${STATIC_URL}/${p.logoUrl}`) : null,
  };
}

export default function MemberCommunityPagesPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const { items: pages, loading, error, reload } = useMemberList("/community-pages/", {
    params: search.trim() ? { q: search.trim() } : undefined,
    map: mapPage,
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Users2 className="h-4.5 w-4.5" />
          </div>
          <span>{t("Community Pages & Trusts")}</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {t("Connect with Youth groups, Sangh trusts, Humanitarian institutions, and social committees.")}
        </p>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search community organizations…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Pages Grid */}
      <ListState
        loading={loading}
        error={error}
        count={pages.length}
        emptyTitle={t("No community pages found")}
        emptyHint={t("Registered community organizations will appear here.")}
        onRetry={reload}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pages.map((p) => (
            <Link
              key={p.id}
              to={`/member/community-pages/${p.publicId || p.id}`}
              className="flex items-center gap-3.5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 hover:border-indigo-300 hover:shadow-md active:scale-99 transition-all group"
            >
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                {p.logoSrc ? (
                  <img src={p.logoSrc} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : (
                  <Users2 className="h-6 w-6" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  {p.name}
                </h3>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md truncate">
                    {p.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {p.memberCount} {t("members")}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-colors shrink-0">
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </ListState>

    </div>
  );
}
