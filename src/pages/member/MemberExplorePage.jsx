import { useState } from "react";
import {
  Search, MapPin, Navigation, Star, ChevronRight,
  Building2, Users, Sparkles, Newspaper, CalendarCheck,
  Heart, BookOpen, Map, Filter, X
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/* ─── Demo data ──────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { key: "temples",   label: "Temples",        emoji: "🛕" },
  { key: "jaincentre",label: "Jain Centres",   emoji: "🏛️" },
  { key: "dharamshala",label: "Dharamshalas",  emoji: "🏨" },
  { key: "ms",        label: "MS",             emoji: "🙏" },
  { key: "events",    label: "Events",         emoji: "🎉" },
  { key: "tours",     label: "Tours",          emoji: "🗺️" },
  { key: "community", label: "Community Pages",emoji: "👥" },
  { key: "news",      label: "News",           emoji: "📰" },
  { key: "offers",    label: "Offers",         emoji: "🏷️" },
  { key: "bhojanshala",label: "Bhojanshala",  emoji: "🍱" },
];

const DEMO_RESULTS = {
  temples: [
    { id: 1, name: "Shree Ajitnath Derasar", city: "Mumbai", community: "Shwetambar · Tapa Gaccha", distance: "1.2 km", open: true, rating: 4.8, followers: "12.4k" },
    { id: 2, name: "Palitana Shatrunjay Tirth", city: "Palitana", community: "Shwetambar · Murtipujak", distance: "450 km", open: true, rating: 4.9, followers: "85k" },
    { id: 3, name: "Ranakpur Jain Temple", city: "Ranakpur", community: "Digambar", distance: "820 km", open: false, rating: 4.7, followers: "34k" },
  ],
  dharamshala: [
    { id: 1, name: "Palitana Dharamshala Board", city: "Palitana", distance: "450 km", open: true, rating: 4.5, followers: "22k" },
    { id: 2, name: "Shree Sangh Dharamshala", city: "Mumbai", distance: "2 km", open: true, rating: 4.2, followers: "5.1k" },
  ],
  ms: [
    { id: 1, name: "Param Pujya Acharya Dev", city: "Mumbai", status: "Staying", followers: "45k" },
    { id: 2, name: "Pujya Sadhvi Chandraprabhaji", city: "Ahmedabad", status: "Vihaar", followers: "18k" },
  ],
};

const TRENDING = [
  { label: "Palitana Tirth", emoji: "🛕", type: "Temple" },
  { label: "Paryushan 2025", emoji: "📿", type: "Event" },
  { label: "Ranakpur Yatra", emoji: "🗺️", type: "Tour" },
  { label: "Acharya Dev Chaturmas", emoji: "🙏", type: "MS Update" },
];

/* ─── Result cards ──────────────────────────────────────────────────────── */
function TempleResult({ item }) {
  return (
    <Link to={`/member/temples/${item.id}`} className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-2xl shrink-0">
        🛕
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="h-2.5 w-2.5 text-slate-400" />
          <span className="text-[10px] text-slate-500">{item.city}</span>
        </div>
        <div className="text-[9px] text-slate-400 mt-0.5 truncate">{item.community}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", item.open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
            {item.open ? "Open" : "Closed"}
          </span>
          <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" /> {item.rating}
          </span>
          <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
            <Users className="h-2.5 w-2.5" /> {item.followers}
          </span>
          <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
            <Navigation className="h-2.5 w-2.5" /> {item.distance}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
    </Link>
  );
}

function MSResult({ item }) {
  return (
    <Link to={`/member/ms/${item.id}`} className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-saffron-50 to-amber-100 border-2 border-amber-200 flex items-center justify-center text-2xl shrink-0">
        🙏
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="h-2.5 w-2.5 text-slate-400" />
          <span className="text-[10px] text-slate-500">{item.city}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full",
            item.status === "Staying" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700")}>
            {item.status}
          </span>
          <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
            <Users className="h-2.5 w-2.5" /> {item.followers}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
    </Link>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function MemberExplorePage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list | map

  const results = activeCategory
    ? (DEMO_RESULTS[activeCategory] || [])
    : [];

  return (
    <div className="space-y-4">
      {/* ── Search bar ─────────────────────────────────────────────── */}
      <div className="pt-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search temples, MS, events, cities, IDs…")}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* ── Browse categories ───────────────────────────────────────── */}
      {!search && (
        <>
          <section>
            <h2 className="text-sm font-bold text-slate-800 mb-3">{t("Browse")}</h2>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map(({ key, label, emoji }) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all",
                    activeCategory === key
                      ? "bg-orange-500 border-orange-500 text-white shadow-md scale-105"
                      : "bg-white border-slate-100 text-slate-600 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  )}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-[8px] font-bold leading-tight text-center">{t(label)}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Trending ─────────────────────────────────────────────── */}
          {!activeCategory && (
            <section>
              <h2 className="text-sm font-bold text-slate-800 mb-3">🔥 {t("Trending")}</h2>
              <div className="space-y-2">
                {TRENDING.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setSearch(item.label)}
                    className="w-full flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow text-left"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-800">{item.label}</div>
                      <div className="text-[9px] text-slate-400">{item.type}</div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Results ─────────────────────────────────────────────────── */}
      {(activeCategory || search) && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">
              {activeCategory
                ? CATEGORIES.find((c) => c.key === activeCategory)?.label
                : `Results for "${search}"`}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-1.5 rounded-lg border transition-colors text-xs", viewMode === "list" ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-slate-200 text-slate-500")}
              >
                ☰
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={cn("p-1.5 rounded-lg border transition-colors text-xs", viewMode === "map" ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-slate-200 text-slate-500")}
              >
                <Map className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {viewMode === "map" ? (
            <div className="bg-slate-100 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-500 border border-slate-200">
              <Map className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-xs font-medium">{t("Map View")}</p>
              <p className="text-[10px] text-slate-400 mt-1">{t("Google Maps integration — connect API key")}</p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {results.length === 0 ? (
                <div className="text-center py-10">
                  <Search className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm font-medium text-slate-400">{t("No results yet")}</p>
                  <p className="text-xs text-slate-300 mt-1">{t("Connect the backend to see live results")}</p>
                </div>
              ) : (
                results.map((item) =>
                  activeCategory === "ms"
                    ? <MSResult key={item.id} item={item} />
                    : <TempleResult key={item.id} item={item} />
                )
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Quick access links ──────────────────────────────────────── */}
      {!search && !activeCategory && (
        <section className="pb-4">
          <h2 className="text-sm font-bold text-slate-800 mb-3">{t("Quick Access")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Nearby Temples", emoji: "🛕", to: "/member/explore", q: "temples" },
              { label: "Available Dharamshalas", emoji: "🏨", to: "/member/explore", q: "dharamshala" },
              { label: "Follow MS", emoji: "🙏", to: "/member/ms" },
              { label: "Ongoing Tours", emoji: "🗺️", to: "/member/tours" },
              { label: "Today's Events", emoji: "🎉", to: "/member/events" },
              { label: "Offers Near Me", emoji: "🏷️", to: "/member/offers" },
            ].map(({ label, emoji, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-xs font-semibold text-slate-700">{t(label)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
