import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Newspaper, Search, Clock, Eye, Share2, Bookmark, MapPin,
  TrendingUp, Sparkles, ChevronRight, Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const CATEGORIES = ["All News", "Tirth & Temples", "MS & Saints", "Events & Utsav", "Community", "Global Jain News"];

const DEMO_NEWS = [
  {
    id: 1,
    title: "Historic 99 Yatra Commences at Palitana Shatrunjay Tirth",
    summary: "Over 5,000 Jain pilgrims gather at Palitana for the annual 99 Yatra. Local trusts arrange special Bhojanshala and medical camps along the route.",
    category: "Tirth & Temples",
    author: "JiNANAM News Desk",
    date: "31 July 2026",
    time: "2 hours ago",
    views: "14.2k",
    trending: true,
    emoji: "🛕",
    readTime: "3 min read"
  },
  {
    id: 2,
    title: "Param Pujya Acharya Dev Announces Paryushan 2025 Pravachan Schedule",
    summary: "Daily morning and evening spiritual discourses will be held at Mumbai Derasar premises. Live web broadcast will be available on JiNANAM App.",
    category: "MS & Saints",
    author: "Mahavir Seva Trust",
    date: "30 July 2026",
    time: "5 hours ago",
    views: "9.8k",
    trending: true,
    emoji: "🙏",
    readTime: "4 min read"
  },
  {
    id: 3,
    title: "New Bhojanshala Facility Inaugourated at Ranakpur Jain Temple",
    summary: "Modern hygiene-compliant Bhojanshala capable of serving 2,000 devotees simultaneously opened today with Navkarsi facilities.",
    category: "Tirth & Temples",
    author: "Ranakpur Trust",
    date: "29 July 2026",
    time: "1 day ago",
    views: "6.5k",
    emoji: "🍱",
    readTime: "2 min read"
  },
  {
    id: 4,
    title: "Global Jain Youth Summit 2025 Announced for October",
    summary: "Youth leaders from over 40 countries to assemble for discussions on Ahimsa, Jain philosophy in modern corporate life, and community welfare.",
    category: "Global Jain News",
    author: "JiNANAM Foundation",
    date: "28 July 2026",
    time: "2 days ago",
    views: "11.1k",
    emoji: "🌍",
    readTime: "5 min read"
  },
];

export default function MemberNewsPage() {
  const { t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState("All News");
  const [search, setSearch] = useState("");

  const filtered = DEMO_NEWS.filter((n) => {
    if (selectedCat !== "All News" && n.category !== selectedCat) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.summary.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const onShare = (item) => {
    if (navigator.share) {
      navigator.share({ title: item.title, text: item.summary, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("News link copied to clipboard!"));
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ── Top Header Banner ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-orange-500" />
            <span>{t("Today's News & Bulletins")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Verified updates from Jain Tirths, Acharya Bhagwants, Sangh Announcements & Community News.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search news, headlines, topics…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
          />
        </div>
      </div>

      {/* ── Category Chips ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCat(c)}
            className={cn(
              "shrink-0 text-xs font-bold px-4 py-2 rounded-2xl border transition-all",
              selectedCat === c
                ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100"
            )}
          >
            {t(c)}
          </button>
        ))}
      </div>

      {/* ── Multi-Column Desktop Grid Layout ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main News List Column */}
        <div className="lg:col-span-8 space-y-6">
          {filtered.map((item) => (
            <article key={item.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/60">
                    {item.category}
                  </span>
                  {item.trending && (
                    <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Trending
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100/80 border border-amber-200/60 flex items-center justify-center text-3xl shrink-0 shadow-2xs">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-slate-900 leading-snug hover:text-orange-600 transition-colors cursor-pointer">
                    {item.title}
                  </h2>
                  <p className="text-xs font-medium text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700">{item.author}</span>
                  <span>•</span>
                  <span>{item.readTime}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {item.views}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => onShare(item)} className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => toast.success(t("Article bookmarked"))} className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Sidebar Trending Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span>Trending Bulletins</span>
            </h3>
            {DEMO_NEWS.filter(n => n.trending).map((n) => (
              <div key={n.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:bg-orange-50/60 hover:border-orange-200 transition-all cursor-pointer">
                <div className="text-[10px] font-bold text-orange-600">{n.category}</div>
                <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">{n.title}</h4>
                <div className="text-[10px] text-slate-400 mt-2">{n.views} views • {n.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
