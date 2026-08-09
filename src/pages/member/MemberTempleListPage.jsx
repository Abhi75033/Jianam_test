import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2, Search, MapPin, Navigation, Star, Clock, Users,
  Heart, Phone, Globe, ChevronRight, ShieldCheck, CheckCircle2,
  Share2, Bookmark, Flag, CalendarCheck, Sparkles, MessageSquare,
  AlertCircle, Home, Utensils, Hotel, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import ListState from "@/components/member/ListState";
import { useMemberList, compactNumber } from "@/hooks/useMemberList";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { toast } from "sonner";

function buildTimings(o) {
  const t = {
    Aarti: o.aartiTiming, Pakshal: o.pakshalTiming,
    Pravachan: o.pravachanTiming, Samayik: o.samayikTiming,
  };
  const present = Object.entries(t).filter(([, v]) => v);
  return present.length ? Object.fromEntries(present) : null;
}

function mapOrg(o, i) {
  return {
    id: o.id || o.publicId || i,
    publicId: o.publicId,
    name: o.name,
    type: o.type || "TEMPLE",
    city: o.city || "",
    area: o.area || "",
    sect: [o.sect, o.subSect || o.gacchaName].filter(Boolean).join(" · "),
    distance: o.distance || "",
    open: o.isOpen ?? (o.status ? o.status === "ACTIVE" : true),
    rating: o.rating ?? null,
    reviews: o.reviewCount ?? 0,
    followers: compactNumber(o.followerCount ?? 0),
    timings: o.timings || buildTimings(o),
    dhajaYear: o.dhajaRecords?.[0]?.year || o.dhajaYear || null,
    currentChaturmas: o.chaturmasStays?.[0]?.monk?.fullName || o.currentChaturmas || null,
    bhojanshala: o.hasBhojanshala ?? o.bhojanshala ?? false,
    dharamshala: o.hasDharamshala ?? o.dharamshala ?? false,
  };
}

export default function MemberTempleListPage() {
  const { t } = useLanguage();
  const { isEntityFollowed, toggleFollow } = useVisibilityEngine();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const onShare = (tName, tId) => {
    if (navigator.share) {
      navigator.share({ title: tName, text: `Unique ID: ${tId}` });
    } else {
      navigator.clipboard.writeText(`${tName} (${tId})`);
      toast.success(t("Link copied to clipboard!"));
    }
  };

  const { items: orgs, loading, error, reload } = useMemberList("/temples", {
    params: search.trim() ? { q: search.trim() } : undefined,
    map: mapOrg,
  });

  const filtered = orgs.filter((tmpl) => {
    if (filter === "Open Now" && !tmpl.open) return false;
    if (filter === "Sthanakvasi" && !tmpl.sect.includes("Sthanakvasi")) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchText = tmpl.name.toLowerCase().includes(q) || tmpl.city.toLowerCase().includes(q);
      const matchId = tmpl.publicId?.toLowerCase().includes(q);
      if (!matchText && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <span>{t("Temples, Sthanaks & Jain Centres")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t("Explore Derasars, Sthanaks, Jain Centres, Darshan timings, Dharamshalas and facilities.")}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search Derasar, city, or ID…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {["All", "Open Now", "Sthanakvasi"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "text-xs font-bold px-4 py-2 rounded-2xl border transition-all active:scale-95 shadow-xs whitespace-nowrap",
              filter === f
                ? "bg-gradient-to-r from-orange-500 to-amber-500 border-transparent text-white shadow-orange-500/20"
                : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
            )}
          >
            {t(f)}
          </button>
        ))}
      </div>

      {/* Temples Grid */}
      <ListState
        loading={loading}
        error={error}
        count={filtered.length}
        onRetry={reload}
        emptyTitle={t("No temples match your search")}
        emptyHint={t("Try searching for another temple name, city, or check back soon.")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((tmpl) => {
            const followed = isEntityFollowed(tmpl.publicId);

            return (
              <div
                key={tmpl.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-300 transition-all overflow-hidden flex flex-col justify-between p-5 sm:p-6 group"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-100 border border-orange-200/70 text-orange-600 flex items-center justify-center font-bold text-xl shrink-0 shadow-2xs">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <Link to={`/member/temples/${tmpl.id}`}>
                          <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                            {tmpl.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {tmpl.publicId}
                          </span>
                          <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0", tmpl.open ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600")}>
                            {tmpl.open ? t("Open") : t("Closed")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address & Sect */}
                  <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{tmpl.area ? `${tmpl.area}, ` : ""}{tmpl.city || "India"}</span>
                    </div>
                    {tmpl.sect && (
                      <div className="text-[11px] text-slate-400 truncate">
                        {tmpl.sect}
                      </div>
                    )}
                  </div>

                  {/* Facilities Badges */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {tmpl.dharamshala && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-100">
                        <Hotel className="h-3 w-3" />
                        <span>{t("Dharamshala")}</span>
                      </span>
                    )}
                    {tmpl.bhojanshala && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                        <Utensils className="h-3 w-3" />
                        <span>{t("Bhojanshala")}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{tmpl.followers}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onShare(tmpl.name, tmpl.publicId)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 active:scale-95 transition-all"
                      title={t("Share")}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/member/temples/${tmpl.id}`}
                      className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs active:scale-95 transition-all flex items-center gap-1"
                    >
                      <span>{t("View Details")}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ListState>

    </div>
  );
}
