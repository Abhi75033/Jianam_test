import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Star, Search, MapPin, Navigation, Users, Calendar,
  Sparkles, ChevronRight, Phone, MessageSquare, Heart, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import ListState from "@/components/member/ListState";
import { useMemberList, relativeTime, compactNumber, longDate } from "@/hooks/useMemberList";


/** Maps an API monk row onto the fields this page renders. */
function mapMS(m, i) {
  return {
    id: m.id || m.publicId || i,
    name: m.fullName || m.name,
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
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = msList.filter((ms) => {
    if (statusFilter !== "All" && ms.status !== statusFilter) return false;
    if (search && !ms.name.toLowerCase().includes(search.toLowerCase()) && !ms.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* ── Top Header Banner ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            <span>{t("Live MS Updates & Guru Directory")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time Vihaar tracking, Chaturmas announcements, and daily Pravachan timings of Maharaj Saheb & Sadhvi Bhagwants.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search MS name, city, sect…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
          />
        </div>
      </div>

      {/* ── Status Filters ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {["All", "Staying", "Vihaar"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={cn(
              "text-xs font-bold px-4 py-2 rounded-2xl border transition-all",
              statusFilter === st
                ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20"
                : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100"
            )}
          >
            {st === "All" ? "All Saints" : st === "Staying" ? "🏠 Staying (Sthir)" : "🚶 Vihaar (Moving)"}
          </button>
        ))}
      </div>

      {/* ── MS Directory Grid Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((ms) => (
          <div
            key={ms.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between p-6"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center text-3xl shrink-0 shadow-2xs">
                    {ms.image}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      {ms.title}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-1 leading-tight">{ms.name}</h2>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{ms.sect}</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-500" /> Location:
                  </span>
                  <span className="font-bold text-slate-800">{ms.location}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className={cn("font-extrabold text-[10px] px-2 py-0.5 rounded-full", ms.status === "Staying" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700")}>
                    {ms.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/40 text-slate-500">
                  <span>Chaturmas: <strong className="text-slate-800">{ms.chaturmas}</strong></span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Pravachan: <strong className="text-slate-800">{ms.pravachan}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {ms.followers} followers
              </span>
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
                Follow MS
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
