import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2, Search, MapPin, Navigation, Star, Clock, Users,
  Heart, Phone, Globe, ChevronRight, ShieldCheck, CheckCircle,
  Share2, Bookmark, Flag, CalendarCheck, Sparkles, MessageSquare, AlertCircle, Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { toast } from "sonner";

const DEMO_ORGANIZATIONS = [
  {
    id: "t-1",
    publicId: "JFJT108",
    name: "Shree Ajitnath Jain Derasar",
    city: "Mumbai, Maharashtra",
    area: "Thane West",
    sect: "Shwetambar · Murtipujak (Tapa Gaccha)",
    type: "Shikhar Baddha Temple",
    distance: "1.2 km",
    open: true,
    rating: 4.8,
    reviews: 320,
    followers: "12,400",
    timings: "Pakshal: 6:00 AM | Aarti: 7:00 PM",
    bhojanshala: true,
    dharamshala: true,
    emoji: "🛕",
    currentChaturmas: "Acharya Dev Chaturmas 2025 (Ongoing)",
    dhajaYear: "2025 — Shri Rahul Shah (Booked)",
  },
  {
    id: "sk-1",
    publicId: "JFSK108",
    name: "Shree Sthanakvasi Jain Stanak",
    city: "Mumbai, Maharashtra",
    area: "Mulund East",
    sect: "Shwetambar · Sthanakvasi",
    type: "Jain Stanak",
    distance: "3.5 km",
    open: true,
    rating: 4.9,
    reviews: 210,
    followers: "9,800",
    timings: "Samayik: 6:30 AM & 6:30 PM | Pravachan: 8:00 AM",
    bhojanshala: true,
    dharamshala: false,
    emoji: "🏛️",
    currentChaturmas: "Pujya Sadhvi Shri Chaturmas 2025",
    dhajaYear: "Not Applicable (Sthanakvasi)",
  },
  {
    id: "t-2",
    publicId: "JFJT109",
    name: "Palitana Shatrunjay Tirth",
    city: "Palitana, Gujarat",
    area: "Shatrunjay",
    sect: "Shwetambar · Murtipujak",
    type: "Maha Tirth",
    distance: "450 km",
    open: true,
    rating: 4.9,
    reviews: 1420,
    followers: "85,000",
    timings: "5:00 AM – 7:00 PM",
    bhojanshala: true,
    dharamshala: true,
    emoji: "🌄",
    currentChaturmas: "Sadhvi Sangha Chaturmas (Ongoing)",
    dhajaYear: "2025 — Finalized",
  },
  {
    id: "jc-1",
    publicId: "JFJC108",
    name: "JiNANAM Jain Centre (Mumbai)",
    city: "Mumbai, Maharashtra",
    area: "Thane West",
    sect: "Shwetambar",
    type: "Jain Centre",
    distance: "2.5 km",
    open: true,
    rating: 4.7,
    reviews: 190,
    followers: "8,900",
    timings: "6:00 AM – 9:00 PM",
    bhojanshala: true,
    dharamshala: false,
    emoji: "🏬",
    currentChaturmas: "Pathshala & Cultural Center",
    dhajaYear: "Not Applicable",
  },
];

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

  const onReportInfo = (tName, tId) => {
    toast.success(t("Support Ticket created for reporting incorrect information on {0} ({1}). Track in Support.", [tName, tId]));
  };

  const filtered = DEMO_ORGANIZATIONS.filter((tmpl) => {
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
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-orange-500" />
            <span>{t("Temples, Stanaks & Jain Centres Directory")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Explore Derasars (JFJT), Stanaks (JFSK), Jain Centres (JFJC), Samayik & Pravachan timings, Chaturmas schedules & Bookings.
          </p>
        </div>

        {/* Unique ID & Name Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search Name or ID (e.g. JFSK108, JFJT108)…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["All", "Open Now", "Sthanakvasi", "With Bhojanshala", "With Dharamshala"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap",
              filter === f
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            )}
          >
            {t(f)}
          </button>
        ))}
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((tmpl) => {
          const followed = isEntityFollowed(tmpl.publicId);

          return (
            <div key={tmpl.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 relative flex flex-col justify-between">
              
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl shrink-0">
                      {tmpl.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-black text-slate-900">{tmpl.name}</h2>
                        <span className="text-[10px] font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                          {tmpl.publicId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {tmpl.city} • {tmpl.sect}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollow(tmpl.publicId)}
                    className={cn(
                      "p-2 rounded-xl text-xs font-bold border transition-colors",
                      followed ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                    title={followed ? "Followed" : "Follow Entity"}
                  >
                    <Bookmark className={cn("h-4 w-4", followed && "fill-amber-500 text-amber-500")} />
                  </button>
                </div>

                {/* Rating & Distance */}
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-amber-500" />
                    <span>{tmpl.rating}</span>
                    <span className="text-slate-400 font-normal">({tmpl.reviews} reviews)</span>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    <span>{tmpl.distance} away</span>
                  </span>
                </div>

                {/* Timings & Highlights */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-orange-500" />
                    <span>{tmpl.timings}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 pt-1">
                    <span>🕉️ Chaturmas: {tmpl.currentChaturmas}</span>
                  </div>
                  {tmpl.dhajaYear !== "Not Applicable (Sthanakvasi)" && (
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                      <span>🚩 Dhaja Record: {tmpl.dhajaYear}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    to="/member/donations"
                    className="py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-center font-bold text-xs border border-orange-200 transition-colors"
                  >
                    Donate
                  </Link>

                  {tmpl.dharamshala ? (
                    <Link
                      to="/member/bookings"
                      className="py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-center font-bold text-xs border border-sky-200 transition-colors"
                    >
                      Book Stay
                    </Link>
                  ) : (
                    <button
                      onClick={() => onShare(tmpl.name, tmpl.publicId)}
                      className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-center font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </button>
                  )}

                  <button
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(tmpl.name + " " + tmpl.city)}`, "_blank")}
                    className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-center font-bold text-xs border border-emerald-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Navigation className="h-3.5 w-3.5" /> Maps
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                  <button
                    onClick={() => onReportInfo(tmpl.name, tmpl.publicId)}
                    className="hover:text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" /> Report Incorrect Info
                  </button>
                  <span>Last Updated: Today</span>
                </div>
              </div>

              {/* Section 21 Disclaimer Banner */}
              <div className="mt-2 text-[9px] text-slate-400 leading-tight bg-slate-50 p-2 rounded-xl border border-slate-200">
                📌 <em>All timings, facilities, and contact details are subject to change. Please contact the Stanak/Derasar directly before planning your visit.</em>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
