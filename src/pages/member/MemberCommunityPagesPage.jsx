import { Link } from "react-router-dom";
import { Users2, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemberList } from "@/hooks/useMemberList";
import ListState from "@/components/member/ListState";
import { STATIC_URL } from "@/lib/api";

/**
 * MemberCommunityPagesPage — Community Pages directory. Did not exist as a
 * member screen at all, despite the module having its own PRD section
 * ("Community Pages Management") and a rich API surface (list, join, leave,
 * feed, members, analytics) that nothing in the member panel called.
 *
 * Field names (name, about, logoUrl, bannerUrl, category.name,
 * _count.members) are taken from the admin CommunityPagesPage, which reads
 * the real GET /community-pages/ response.
 */
function mapPage(p, i) {
  return {
    id: p.id || p.publicId || i,
    publicId: p.publicId,
    name: p.name,
    about: p.about || "",
    category: p.category?.name || "",
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
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Users2 className="h-5 w-5 text-indigo-600" /> {t("Community Pages")}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {t("Youth groups, trusts and social pages you can join and follow.")}
        </p>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search community pages…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      <ListState
        loading={loading}
        error={error}
        count={pages.length}
        emptyTitle={t("No community pages yet")}
        emptyHint={t("Registered organisations will appear here once they set up a page.")}
        onRetry={reload}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pages.map((p) => (
            <Link
              key={p.id}
              to={`/member/community-pages/${p.publicId || p.id}`}
              className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
                {p.logoSrc ? (
                  <img src={p.logoSrc} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : (
                  <Users2 className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 truncate">{p.name}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  {p.category && <span>{p.category}</span>}
                  <span>· {p.memberCount} {t("members")}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
            </Link>
          ))}
        </div>
      </ListState>
    </div>
  );
}
