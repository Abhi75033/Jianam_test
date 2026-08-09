import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useMemberSocket } from "@/hooks/useMemberSocket";
import {
  Search, Bookmark, Share2, Bell, Filter, MapPin, Eye, Flag, Newspaper, TrendingUp,
  Sparkles, Plus, X, Heart, Star, Building2, Check, BarChart3, Gift, Compass,
  Megaphone, Calendar, Flame, Map, CheckCircle2, MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import ListState from "@/components/member/ListState";
import { useMemberList, relativeTime, compactNumber } from "@/hooks/useMemberList";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = [
  { label: "All", icon: Sparkles },
  { label: "Temple Updates", icon: Building2 },
  { label: "MS Updates", icon: Sparkles },
  { label: "Events", icon: Calendar },
  { label: "Tours", icon: Map },
  { label: "Notices", icon: Megaphone },
  { label: "Offers", icon: Gift },
  { label: "JiNANAM", icon: Compass }
];

const FILTER_TO_CATEGORY = {
  ms: "MS Updates",
  events: "Events",
  notices: "Notices",
  offers: "Offers",
  tours: "Tours",
  temple: "Temple Updates",
};

function getCategoryIcon(cat) {
  const c = String(cat || "").toLowerCase();
  if (c.includes("temple")) return Building2;
  if (c.includes("ms") || c.includes("monk")) return Sparkles;
  if (c.includes("event")) return Calendar;
  if (c.includes("tour") || c.includes("yatra")) return Map;
  if (c.includes("offer") || c.includes("discount")) return Gift;
  if (c.includes("notice") || c.includes("announcement")) return Megaphone;
  return Newspaper;
}

function mapPost(p_, i) {
  return {
    id: p_.id || p_.publicId || i,
    title: p_.title,
    body: p_.body || p_.content || "",
    category: p_.category || "Community",
    org: p_.organization?.name || p_.author?.name || "",
    orgCity: p_.organization?.city || "",
    orgArea: p_.organization?.area || "",
    sect: p_.organization?.sect || "",
    subCommunity: p_.organization?.subSect || "",
    entityType: p_.entityType || p_.organization?.type || "",
    entityPublicId: p_.organization?.publicId || p_.entityPublicId || "",
    orgId: p_.organizationId || p_.organization?.id || "",
    daysAgo: relativeTime(p_.publishedAt || p_.createdAt),
    views: compactNumber(p_.viewCount ?? 0),
    liked: Boolean(p_.isLiked),
    likeCount: p_.likeCount || 0,
    bookmarked: Boolean(p_.isBookmarked),
    isAd: Boolean(p_.isSponsored ?? p_.isAd),
    cta: p_.ctaLabel || null,
    ctaTo: p_.ctaTo || null,
    poll: p_.poll || null,
  };
}

const ORG_TYPE_ENDPOINTS = [["temple", "/temples"], ["dharamshala", "/dharamshalas"], ["jaincentre", "/jain-centers"]];
async function resolveOrgType(orgId) {
  for (const [type, prefix] of ORG_TYPE_ENDPOINTS) {
    try {
      const res = await memberClient.get(`${prefix}/${orgId}`);
      if (res?.data?.data) return type;
    } catch {}
  }
  return null;
}

export default function MemberFeedPage() {
  const { t } = useLanguage();
  const { user } = useMemberAuth();
  const { userPreferences, followedIds, followedMeta, toggleFollow, isEntityFollowed, sortContent } = useVisibilityEngine();
  const [resolvingFollowId, setResolvingFollowId] = useState(null);
  const orgTypeCache = useRef({});

  const { items: fetchedPosts, loading, error, reload } = useMemberList("/feed/", { map: mapPost });
  const [posts, setPosts] = useState([]);
  useEffect(() => { setPosts(fetchedPosts); }, [fetchedPosts]);

  useMemberSocket("/dashboards", {
    "feed:new": (evt) => {
      if (!evt?.id) return;
      setPosts((prev) => prev.some((p) => p.id === evt.id) ? prev : [mapPost(evt, 0), ...prev]);
    },
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilter = searchParams.get("filter");
  const sponsoredOnly = urlFilter === "sponsored";
  const [category, setCategory] = useState(FILTER_TO_CATEGORY[urlFilter] || "All");

  useEffect(() => {
    setCategory(FILTER_TO_CATEGORY[urlFilter] || "All");
  }, [urlFilter]);

  const selectCategory = (c) => {
    setCategory(c);
    const key = Object.keys(FILTER_TO_CATEGORY).find((k) => FILTER_TO_CATEGORY[k] === c);
    if (key) setSearchParams({ filter: key });
    else setSearchParams({});
  };
  const [search, setSearch] = useState("");

  const onBookmark = async (id) => {
    const wasBookmarked = posts.find((p) => p.id === id)?.bookmarked;
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
    try {
      if (wasBookmarked) await memberClient.delete(`/feed/posts/${id}/bookmark`);
      else await memberClient.post(`/feed/posts/${id}/bookmark`);
      toast.success(wasBookmarked ? t("Removed from bookmarks") : t("Saved to bookmarks"));
    } catch (err) {
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, bookmarked: wasBookmarked } : p));
      toast.error(extractErrorMessage(err));
    }
  };

  const onLike = (id) => {
    setPosts((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const nextLiked = !p.liked;
      return {
        ...p,
        liked: nextLiked,
        likeCount: nextLiked ? (p.likeCount + 1) : Math.max(0, p.likeCount - 1),
      };
    }));
  };

  const votePoll = async (postId, pollId, optionIndex) => {
    try {
      await memberClient.post(`/feed/polls/${pollId}/vote`, { optionIndex });
      setPosts((prev) => prev.map((p) => {
        if (p.id !== postId || !p.poll) return p;
        const votes = [...(p.poll.votes || []), { optionIndex, memberId: user?.id }];
        return { ...p, poll: { ...p.poll, votes } };
      }));
      toast.success(t("Vote recorded successfully!"));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const followPost = async (post) => {
    const existing = followedMeta[post.entityPublicId];
    if (existing?.type && existing?.apiId) {
      toggleFollow(post.entityPublicId, existing);
      return;
    }
    if (!post.orgId) {
      toggleFollow(post.entityPublicId);
      return;
    }
    const cached = orgTypeCache.current[post.orgId];
    if (cached) {
      toggleFollow(post.entityPublicId, { type: cached, apiId: post.orgId, name: post.org, category: cached });
      return;
    }
    setResolvingFollowId(post.id);
    const type = await resolveOrgType(post.orgId);
    setResolvingFollowId(null);
    if (type) {
      orgTypeCache.current[post.orgId] = type;
      toggleFollow(post.entityPublicId, { type, apiId: post.orgId, name: post.org, category: type });
    } else {
      toggleFollow(post.entityPublicId);
    }
  };

  const onShare = (post) => {
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.body, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("Link copied to clipboard"));
    }
  };

  const sortedPosts = sortContent(posts);

  const filtered = sortedPosts.filter((p) => {
    if (sponsoredOnly && !p.isAd) return false;
    if (p.isAd) return true;
    if (search) {
      const q = search.toLowerCase();
      const matchText = p.title?.toLowerCase().includes(q) || p.org?.toLowerCase().includes(q);
      const matchId = p.entityPublicId?.toLowerCase().includes(q);
      if (!matchText && !matchId) return false;
    }
    if (category !== "All") {
      const squash = (v) => String(v || "").toLowerCase().replace(/\s+/g, "");
      if (!squash(p.category).includes(squash(category))) return false;
    }
    return true;
  });

  const interleaved = sponsoredOnly ? filtered : (() => {
    const organic = filtered.filter((p) => !p.isAd);
    const ads = filtered.filter((p) => p.isAd);
    if (!ads.length) return organic;
    const out = [];
    let adIdx = 0;
    organic.forEach((post, i) => {
      out.push(post);
      if ((i + 1) % 7 === 0 && adIdx < ads.length) out.push(ads[adIdx++]);
    });
    out.push(...ads.slice(adIdx));
    return out;
  })();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* ── Top Header & Feed Search ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Newspaper className="h-4.5 w-4.5" />
              </div>
              <span>{t("Community Feed")}</span>
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              {t("Visibility Engine Active")}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t("Prioritized by your followed temples, Maharaj Saheb and Jain community")}
          </p>
        </div>

        {/* Unique ID & Keyword Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search by Sangh, MS or ID…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* ── Category Filter Horizontal Scroll ─────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => selectCategory(label)}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 shadow-xs",
              category === label
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/20"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{t(label)}</span>
          </button>
        ))}
      </div>

      {/* ── Main Feed Content ─────────────────────────────────────────────── */}
      <ListState loading={loading} error={error} count={interleaved.length} onRetry={reload}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-4">
            {interleaved.map((post) => {
              if (post.isAd) {
                return (
                  <div key={post.id} className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl border border-indigo-900/60 shadow-lg space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-amber-400 uppercase">
                      <span>{t("SPONSORED ANNOUNCEMENT")}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10">{post.entityPublicId}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">{post.title}</h3>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{post.body}</p>
                      </div>
                    </div>
                  </div>
                );
              }

              const followed = isEntityFollowed(post.entityPublicId);
              const CategoryIcon = getCategoryIcon(post.category);

              return (
                <article key={post.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 relative">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg shrink-0 border border-orange-100 shadow-2xs">
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{post.org}</h3>
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {post.entityPublicId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <span>{post.orgCity || "India"}</span>
                          {post.sect && <span>• {post.sect}</span>}
                          <span>• {post.daysAgo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Follow Toggle */}
                    <button
                      onClick={() => followPost(post)}
                      disabled={resolvingFollowId === post.id}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-60",
                        followed
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                      )}
                    >
                      {followed ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      <span>{followed ? t("Following") : t("Follow")}</span>
                    </button>
                  </div>

                  {/* Priority 1 Followed Badge */}
                  {followed && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase shadow-2xs">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{t("Priority 1 — Followed Entity")}</span>
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="space-y-1.5">
                    <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug">{post.title}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{post.body}</p>
                  </div>

                  {/* Poll Component */}
                  {post.poll && (
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                        <span>{post.poll.question}</span>
                      </div>
                      <div className="space-y-2">
                        {(Array.isArray(post.poll.options) ? post.poll.options : []).map((opt, oIdx) => {
                          const totalVotes = post.poll.votes?.length || 0;
                          const optVotes = post.poll.votes?.filter((v) => v.optionIndex === oIdx).length || 0;
                          const optPct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                          const hasVoted = post.poll.votes?.some((v) => v.memberId === user?.id);

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={hasVoted}
                              onClick={() => votePoll(post.id, post.poll.id, oIdx)}
                              className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-purple-50/60 transition-all text-xs relative overflow-hidden disabled:cursor-default"
                            >
                              <div className="absolute left-0 top-0 bottom-0 bg-purple-100/70 transition-all" style={{ width: `${optPct}%` }} />
                              <div className="relative flex justify-between items-center font-semibold text-slate-800">
                                <span>{opt}</span>
                                <span className="text-[10px] text-slate-500 font-bold">{optPct}% ({optVotes} {t("votes")})</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-bold">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => onLike(post.id)}
                        className={cn("flex items-center gap-1.5 transition-colors", post.liked ? "text-rose-600" : "hover:text-rose-500")}
                      >
                        <Heart className={cn("h-4 w-4", post.liked && "fill-rose-500 text-rose-500")} />
                        <span>{post.likeCount || (post.liked ? 1 : 0)}</span>
                      </button>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => onBookmark(post.id)}
                        className={cn("p-2 rounded-xl active:scale-95 transition-all", post.bookmarked ? "text-orange-500 bg-orange-50" : "hover:bg-slate-100 text-slate-400")}
                        title={t("Save Post")}
                      >
                        <Bookmark className={cn("h-4 w-4", post.bookmarked && "fill-orange-500")} />
                      </button>
                      <button
                        onClick={() => onShare(post)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 active:scale-95 transition-all"
                        title={t("Share")}
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Sidebar: Followed Summary & Tips */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>{t("Followed Entities")} ({followedIds.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t("Posts from followed Derasars and Maharaj Saheb are automatically prioritized at the top of your feed.")}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {followedIds.map((id) => (
                  <span key={id} className="text-[10px] font-mono font-bold bg-amber-100/80 text-amber-900 px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-amber-200/60 shadow-2xs">
                    <span>{id}</span>
                    <button onClick={() => toggleFollow(id)} className="hover:text-red-600 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </ListState>

    </div>
  );
}
