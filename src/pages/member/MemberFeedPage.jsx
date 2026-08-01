import { useState, useEffect } from "react";
import {
  Search, Bookmark, Share2, Bell, Filter, MapPin, Eye, Flag, Newspaper, TrendingUp, Sparkles, Plus, X, Heart, Star, Building2, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { toast } from "sonner";

const INITIAL_POSTS = [
  {
    id: 1,
    entityPublicId: "JFJT108",
    entityType: "TEMPLE",
    category: "Temple Update",
    org: "Shree Ajitnath Derasar",
    orgCity: "Mumbai",
    orgArea: "Thane West",
    sect: "Shwetambar",
    subCommunity: "Murtipujak",
    emoji: "🛕",
    title: "Paryushan Parva 2025 — Special Pravachan Schedule Announced",
    body: "This Paryushan, Param Pujya Acharya Dev will deliver Pravachan daily from 7:30 AM to 9:30 AM in the main hall. All devotees are welcome to join live or in person.",
    views: 1240,
    bookmarked: false,
    liked: false,
    daysAgo: 0,
  },
  {
    id: 2,
    entityPublicId: "JFMS108",
    entityType: "MONK",
    category: "MS Update",
    org: "Palitana Tirth (Acharya Dev)",
    orgCity: "Palitana",
    orgArea: "Shatrunjay",
    sect: "Shwetambar",
    subCommunity: "Murtipujak",
    emoji: "🙏",
    title: "Chaturmas 2025 — Acharya Dev & Sadhvi Sangha arrive at Palitana",
    body: "We are honoured to announce that Param Pujya Acharya Dev Shri and the Sadhvi Sangha will observe Chaturmas 2025 at Palitana. Daily Pravachan schedule will follow shortly.",
    views: 5830,
    bookmarked: true,
    liked: true,
    daysAgo: 1,
  },
  {
    id: "ad-1",
    isAd: true,
    entityPublicId: "JFD108",
    entityType: "DHARAMSHALA",
    title: "Book your Palitana Dharamshala Stay (Common Facility)",
    org: "Palitana Board Dharamshala",
    emoji: "🏨",
    body: "Comfortable AC rooms from ₹500/night. Common facility available for all Jain and Non-Jain members with instant confirmation.",
    cta: "Book Now",
    ctaTo: "/bookings",
  },
  {
    id: 3,
    entityPublicId: "JFJC108",
    entityType: "JAIN_CENTER",
    category: "Event",
    org: "JiNANAM Jain Center",
    orgCity: "Mumbai",
    orgArea: "Thane West",
    sect: "Shwetambar",
    subCommunity: "Murtipujak",
    emoji: "🎉",
    title: "Mahavir Jayanti Grand Celebration — Register Now",
    body: "Join thousands of devotees for a grand Mahavir Jayanti celebration. Free entry. Prasad and Bhojanshala available.",
    views: 9200,
    bookmarked: false,
    liked: false,
    daysAgo: 2,
  },
];

const CATEGORIES = [
  "All", "Temple Updates", "MS Updates", "Events", "Tours",
  "Notices", "Offers", "JiNANAM"
];

export default function MemberFeedPage() {
  const { t } = useLanguage();
  const { userPreferences, followedIds, toggleFollow, isEntityFollowed, sortContent } = useVisibilityEngine();

  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const onBookmark = (id) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
    toast.success(t("Saved to bookmarks"));
  };

  const onShare = (post) => {
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.body, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("Link copied to clipboard"));
    }
  };

  // Visibility Engine Sorting (Followed Entity = Priority 1)
  const sortedPosts = sortContent(posts);

  const filtered = sortedPosts.filter((p) => {
    if (p.isAd) return true;
    if (search) {
      const q = search.toLowerCase();
      const matchText = p.title?.toLowerCase().includes(q) || p.org?.toLowerCase().includes(q);
      const matchId = p.entityPublicId?.toLowerCase().includes(q);
      if (!matchText && !matchId) return false;
    }
    if (category !== "All" && !p.category?.toLowerCase().includes(category.toLowerCase().replace(" ", ""))) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-orange-500" />
              <span>Community Feed</span>
            </h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              Visibility Engine Active
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Prioritized by your followed entities & community ({userPreferences.sect} • {userPreferences.area}, {userPreferences.city}).
          </p>
        </div>

        {/* Unique ID & Keyword Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search by Name or Unique ID (e.g. JFJT108)…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all",
              category === c
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            )}
          >
            {t(c)}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-4">
          {filtered.map((post) => {
            if (post.isAd) {
              return (
                <div key={post.id} className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl border border-indigo-900 shadow-lg space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-amber-400 uppercase">
                    <span>SPONSORED ADVERTISEMENT • COMMON FACILITY</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10">{post.entityPublicId}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{post.emoji}</span>
                    <div>
                      <h3 className="text-base font-black text-white">{post.title}</h3>
                      <p className="text-xs text-slate-300 mt-1">{post.body}</p>
                    </div>
                  </div>
                </div>
              );
            }

            const followed = isEntityFollowed(post.entityPublicId);

            return (
              <div key={post.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 relative">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl shrink-0 font-bold">
                      {post.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-extrabold text-slate-900">{post.org}</h3>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {post.entityPublicId}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {post.orgCity} • {post.sect} {post.subCommunity}
                      </div>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={() => toggleFollow(post.entityPublicId)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0",
                      followed
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                    )}
                  >
                    {followed ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    <span>{followed ? "Following" : "Follow"}</span>
                  </button>
                </div>

                {/* Priority Badge */}
                {followed && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                    <Star className="h-3 w-3 fill-amber-500" />
                    <span>Priority 1 — Followed Entity</span>
                  </div>
                )}

                {/* Body Content */}
                <div className="space-y-1">
                  <h2 className="text-sm font-black text-slate-900 leading-snug">{post.title}</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">{post.body}</p>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400 font-bold">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views} views</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onBookmark(post.id)} className={cn("p-2 rounded-xl transition-colors", post.bookmarked ? "text-orange-500 bg-orange-50" : "hover:bg-slate-100")}>
                      <Bookmark className="h-4 w-4" />
                    </button>
                    <button onClick={() => onShare(post)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Info & Followed Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>Followed Entities ({followedIds.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Content published by your followed entities is automatically boosted to Priority 1 (Highest) across all screens.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {followedIds.map((id) => (
                <span key={id} className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <span>{id}</span>
                  <button onClick={() => toggleFollow(id)} className="hover:text-red-600">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
