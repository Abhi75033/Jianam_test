import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Star, Search, MapPin, Navigation, Users, Calendar,
  Sparkles, ChevronRight, Phone, MessageSquare, Heart, ShieldCheck,
  Clock, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import ListState from "@/components/member/ListState";
import { useMemberList, compactNumber } from "@/hooks/useMemberList";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";

function mapMS(m, i) {
  return {
    id: m.id || m.publicId || i,
    name: m.fullName || m.name || m.dikshaName,
    title: m.title || m.designation || "",
    sect: m.sect || "",
    status: m.trackingStatus || m.status || "Offline",
    location: m.currentLocation || m.city || "",
    currentPlace: m.currentLocation || m.city || "",
    chaturmas: m.chaturmasPlace || m.chaturmas || "",
    followers: compactNumber(m.followerCount ?? 0),
    count: m.followerCount ?? 0,
    pravachan: m.pravachanTime || "",
    image: m.photoUrl || m.image || null,
  };
}

export default function MemberMSListPage() {
  const { items: msList, loading, error, reload } = useMemberList("/monks/", { map: mapMS });
  const { t } = useLanguage();
  const { isEntityFollowed } = useVisibilityEngine();
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = msList.filter((ms) => {
    if (statusFilter !== "All") {
      const isVihaar = String(ms.status).toLowerCase().includes("mov") || String(ms.status).toLowerCase().includes("vihaar");
      if (statusFilter === "Vihaar" && !isVihaar) return false;
      if (statusFilter === "Staying" && isVihaar) return false;
    }
    if (search && !ms.name.toLowerCase().includes(search.toLowerCase()) && !ms.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* ── Top Header Banner ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span>{t("Maharaj Saheb (MS) Directory")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t("Live Vihaar tracking, Chaturmas announcements, and daily Pravachan timings.")}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search Guru name, city or sect…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* ── Status Filters ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: "All", label: "All Sadhus & Sadhvis" },
          { key: "Staying", label: "🏠 Sthir (Staying)" },
          { key: "Vihaar", label: "🚶 Vihaar (Moving)" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={cn(
              "text-xs font-bold px-4 py-2 rounded-2xl border transition-all active:scale-95 shadow-xs whitespace-nowrap",
              statusFilter === key
                ? "bg-gradient-to-r from-amber-500 to-orange-500 border-transparent text-white shadow-amber-500/20"
                : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
            )}
          >
            {t(label)}
          </button>
        ))}
      </div>

      {/* ── MS Directory Grid Layout ──────────────────────────────────────── */}
      <ListState
        loading={loading}
        error={error}
        count={filtered.length}
        onRetry={reload}
        emptyTitle={t("No Maharaj Saheb profiles found")}
        emptyHint={t("Try searching with another name or city.")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((ms) => {
            const isVihaar = String(ms.status).toLowerCase().includes("mov") || String(ms.status).toLowerCase().includes("vihaar");
            const followed = isEntityFollowed(ms.id);

            return (
              <Link
                key={ms.id}
                to={`/member/ms/${ms.id}`}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all overflow-hidden flex flex-col justify-between p-5 sm:p-6 group active:scale-99"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-100 via-orange-100 to-yellow-100 border border-amber-200/80 flex items-center justify-center text-2xl shrink-0 shadow-2xs font-bold overflow-hidden">
                        {ms.image ? (
                          <img src={ms.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          "🙏"
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                            {ms.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">
                          {ms.sect || "Jain Shraman Sangha"}
                        </p>
                      </div>
                    </div>

                    <span className={cn(
                      "text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 flex items-center gap-1.5",
                      isVihaar
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isVihaar ? "bg-amber-500" : "bg-blue-500")} />
                      <span>{isVihaar ? t("Vihaar") : t("Staying")}</span>
                    </span>
                  </div>

                  {/* Current Location */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400">{t("Current Stay / Vihar Point")}</div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                      <span className="truncate">{ms.location || t("Location updating…")}</span>
                    </div>
                  </div>

                  {ms.chaturmas && (
                    <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{t("Chaturmas")}: {ms.chaturmas}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{ms.followers} {t("followers")}</span>
                  </span>

                  <span className="text-orange-600 font-extrabold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{t("View Profile")}</span>
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </ListState>

    </div>
  );
}
