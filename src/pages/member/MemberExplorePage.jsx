import { useState, useEffect } from "react";
import {
  Search, MapPin, Navigation, Star, ChevronRight,
  Building2, Users, Sparkles, Newspaper, CalendarCheck,
  Heart, BookOpen, Map, Filter, X, Gift, Utensils,
  Hotel, Flame, Compass, ArrowUpRight
} from "lucide-react";
import { Link, useSearchParams, useOutletContext } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import ListState from "@/components/member/ListState";
import { useMemberList, compactNumber } from "@/hooks/useMemberList";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { formatDistance } from "@/lib/geo";
import LocationPrompt from "@/components/member/LocationPrompt";

const CATEGORIES = [
  { key: "temples",      label: "Temples",         icon: Building2, color: "from-amber-500 to-orange-500",   bg: "bg-amber-50 text-amber-600" },
  { key: "jaincentre",   label: "Jain Centres",    icon: Compass,   color: "from-blue-500 to-indigo-600",     bg: "bg-blue-50 text-blue-600" },
  { key: "dharamshala",  label: "Dharamshalas",    icon: Hotel,     color: "from-sky-500 to-cyan-600",        bg: "bg-sky-50 text-sky-600" },
  { key: "ms",           label: "Maharaj Saheb",   icon: Sparkles,  color: "from-orange-500 to-amber-600",    bg: "bg-orange-50 text-orange-600" },
  { key: "events",       label: "Events & Seva",   icon: Flame,     color: "from-rose-500 to-pink-600",       bg: "bg-rose-50 text-rose-600" },
  { key: "tours",        label: "Tours & Yatras",  icon: Map,       color: "from-purple-500 to-indigo-600",   bg: "bg-purple-50 text-purple-600" },
  { key: "community",    label: "Sangh Pages",     icon: Users,     color: "from-teal-500 to-emerald-600",    bg: "bg-teal-50 text-teal-600" },
  { key: "news",         label: "Daily News",      icon: Newspaper, color: "from-slate-700 to-slate-900",     bg: "bg-slate-50 text-slate-700" },
  { key: "offers",       label: "Offers & Deals",  icon: Gift,      color: "from-emerald-500 to-green-600",   bg: "bg-emerald-50 text-emerald-600" },
  { key: "bhojanshala",  label: "Bhojanshalas",    icon: Utensils,  color: "from-amber-600 to-yellow-600",    bg: "bg-yellow-50 text-yellow-700" },
];

function ResultCard({ item, isMs }) {
  const { t } = useLanguage();
  const linkTo = isMs ? `/member/ms/${item.id}` : `/member/temples/${item.id}`;

  return (
    <Link
      to={linkTo}
      className="flex items-center gap-3.5 sm:gap-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-3.5 sm:p-4 hover:shadow-md hover:border-orange-300 active:scale-98 transition-all group"
    >
      <div className={cn(
        "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-2xs font-bold border",
        isMs
          ? "bg-gradient-to-br from-orange-50 to-amber-100 text-orange-700 border-orange-200/60"
          : "bg-gradient-to-br from-amber-50 to-orange-50 text-orange-600 border-amber-200/60"
      )}>
        {isMs ? <Sparkles className="h-6 w-6 text-orange-600" /> : <Building2 className="h-6 w-6 text-orange-600" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
            {item.name}
          </h3>
          {item.open != null && (
            <span className={cn(
              "text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0",
              item.open ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
            )}>
              {item.open ? t("Open") : t("Closed")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-0.5">
          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{item.city || "India"}</span>
          {item.community && <span className="truncate">• {item.community}</span>}
        </div>

        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-bold flex-wrap">
          {item.rating && (
            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{item.rating}</span>
            </span>
          )}
          {item.followers && (
            <span className="flex items-center gap-1 text-slate-500">
              <Users className="h-3 w-3" />
              <span>{item.followers} {t("followers")}</span>
            </span>
          )}
          {item.distance && (
            <span className="flex items-center gap-1 text-orange-600 font-extrabold bg-orange-50 px-2 py-0.5 rounded-md">
              <Navigation className="h-2.5 w-2.5" />
              <span>{item.distance}</span>
            </span>
          )}
        </div>
      </div>

      <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-orange-50 text-slate-400 group-hover:text-orange-600 flex items-center justify-center transition-colors shrink-0">
        <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

const CATEGORY_SOURCE = {
  temples:      { path: "/temples",        label: "temples" },
  jaincentre:   { path: "/jain-centers",   label: "Jain centres" },
  dharamshala:  { path: "/dharamshalas",   label: "dharamshalas" },
  ms:           { path: "/monks/",         label: "Maharaj Saheb" },
  events:       { path: "/events/member",  label: "events" },
  news:         { path: "/news",           label: "news" },
  offers:       { path: "/offers",         label: "offers" },
  bhojanshala:  { path: "/temples/bhojanalay-directory", label: "bhojanshalas" },
  community:    { path: "/community-pages", label: "community pages" },
};

function mapResult(r, i) {
  return {
    id: r.id || r.publicId || i,
    name: r.name || r.fullName || r.title,
    city: r.city || r.location || r.currentLocation || "",
    community: [r.sect, r.subSect || r.gacchaName].filter(Boolean).join(" · "),
    distance: r.distance || "",
    latitude: r.latitude ?? r.lat ?? null,
    longitude: r.longitude ?? r.lng ?? null,
    open: r.isOpen ?? r.status === "ACTIVE" ?? true,
    rating: r.rating ?? null,
    followers: compactNumber(r.followerCount ?? 0),
  };
}

export default function MemberExplorePage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("cat") || "temples");

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) setActiveCategory(cat);
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  const chooseCategory = (key) => {
    setActiveCategory(key);
    setSearchParams(key ? { cat: key } : {});
  };

  const { status: locStatus, error: locError, request: requestLocation } = useOutletContext() || {};
  const source = activeCategory ? CATEGORY_SOURCE[activeCategory] : CATEGORY_SOURCE.temples;
  
  const { items: rawResults, loading, error, reload } = useMemberList(source?.path, {
    params: search.trim() ? { q: search.trim() } : undefined,
    map: mapResult,
    enabled: Boolean(source),
  });

  const { distanceTo, hasDeviceLocation } = useVisibilityEngine();
  const results = hasDeviceLocation
    ? [...rawResults]
        .map((r) => {
          const km = distanceTo(r);
          return km != null ? { ...r, distance: formatDistance(km), _km: km } : r;
        })
        .sort((a, b) => (a._km ?? Infinity) - (b._km ?? Infinity))
    : rawResults;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* ── Search & Location Hero Header ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <span>{t("Universal Directory")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t("Discover Temples, Jain Centres, Maharaj Saheb, Dharamshalas and Events near you.")}
          </p>
        </div>

        {/* Search input with live clear button */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search by name, city, area or Unique ID (e.g. Palitana, JFJT108)…")}
            className="w-full pl-11 pr-10 py-3 text-xs sm:text-sm font-medium rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
          <LocationPrompt status={locStatus} error={locError} onRequest={requestLocation} />
          <span className="text-[11px] font-bold text-slate-400">
            {results.length} {t("results found")}
          </span>
        </div>
      </div>

      {/* ── Category Grid & Mobile Slider ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
        {CATEGORIES.map(({ key, label, icon: Icon, bg }) => {
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              onClick={() => chooseCategory(key)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-2xl sm:rounded-3xl border transition-all active:scale-95 text-center group select-none",
                isActive
                  ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white border-transparent shadow-md shadow-orange-500/20"
                  : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 shadow-2xs hover:shadow-xs"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105",
                isActive ? "bg-white/20 text-white" : bg
              )}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-[11px] font-extrabold leading-tight truncate max-w-full">
                {t(label)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Directory Search Results ──────────────────────────────────────── */}
      <ListState
        loading={loading}
        error={error}
        count={results.length}
        onRetry={reload}
        emptyTitle={t("No results match your search")}
        emptyHint={t("Try searching for another keyword or selecting a different category above.")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {results.map((item) => (
            <ResultCard key={item.id} item={item} isMs={activeCategory === "ms"} />
          ))}
        </div>
      </ListState>

    </div>
  );
}
