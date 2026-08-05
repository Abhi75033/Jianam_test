import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useMemberSocket } from "@/hooks/useMemberSocket";
import {
  Search, Bookmark, Share2, Bell, Filter, MapPin, Eye, Flag, Newspaper, TrendingUp, Sparkles, Plus, X, Heart, Star, Building2, Check, BarChart3
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
  "All", "Temple Updates", "MS Updates", "Events", "Tours",
  "Notices", "Offers", "JiNANAM"
];

/**
 * The sidebar links to /member/feed?filter=ms|events|sponsored. Those tabs used
 * to render an identical unfiltered list because nothing read the param, so
 * four distinct-looking tabs behaved the same. This maps the URL onto the
 * category the page already filters by.
 */
const FILTER_TO_CATEGORY = {
  ms: "MS Updates",
  events: "Events",
  notices: "Notices",
  offers: "Offers",
  tours: "Tours",
  temple: "Temple Updates",
};

/** Maps an API feed post onto the fields this page renders. */
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
    // organizationId is a real top-level field on the post (confirmed by
    // admin FeedPage.jsx's own org-scoping check at its "edit" gate) — the
    // org's actual backend id, unlike entityPublicId above. Needed to call
    // the real follow endpoint; see followPost below for why the org's
    // *type* still has to be resolved separately.
    orgId: p_.organizationId || p_.organization?.id || "",
    daysAgo: relativeTime(p_.publishedAt || p_.createdAt),
    views: compactNumber(p_.viewCount ?? 0),
    liked: Boolean(p_.isLiked),
    bookmarked: Boolean(p_.isBookmarked),
    isAd: Boolean(p_.isSponsored ?? p_.isAd),
    emoji: p_.emoji || "🛕",
    cta: p_.ctaLabel || null,
    ctaTo: p_.ctaTo || null,
    // §4.11.4 — polls have no standalone listing endpoint (only vote/results),
    // so they ride along on whichever feed post embeds them.
    poll: p_.poll || null,
  };
}

/**
 * A feed post carries its org's real backend id (orgId, above) but not its
 * type — there's no `organization.type` field anywhere in the API (checked
 * every org list/select in the codebase; useOrgs.js merges temples,
 * dharamshalas, jain centers, sthanaks and community pages into one flat
 * list with no type tag at all). The only way to learn an org's type is to
 * ask each endpoint until one has it — same fallback MemberTempleDetailPage
 * already uses to load the org itself.
 */
const ORG_TYPE_ENDPOINTS = [["temple", "/temples"], ["dharamshala", "/dharamshalas"], ["jaincentre", "/jain-centers"]];
async function resolveOrgType(orgId) {
  for (const [type, prefix] of ORG_TYPE_ENDPOINTS) {
    try {
      const res = await memberClient.get(`${prefix}/${orgId}`);
      if (res?.data?.data) return type;
    } catch {
      /* try the next org type */
    }
  }
  return null;
}

export default function MemberFeedPage() {
  const { t } = useLanguage();
  const { user } = useMemberAuth();
  const { userPreferences, followedIds, followedMeta, toggleFollow, isEntityFollowed, sortContent } = useVisibilityEngine();
  const [resolvingFollowId, setResolvingFollowId] = useState(null);
  // Persists across renders without a re-render of its own — a follow-type
  // lookup for one org shouldn't repeat for every other post from the same
  // org further down the same feed.
  const orgTypeCache = useRef({});

  const { items: fetchedPosts, loading, error, reload } = useMemberList("/feed/", { map: mapPost });
  const [posts, setPosts] = useState([]);
  useEffect(() => { setPosts(fetchedPosts); }, [fetchedPosts]);

  // Live: a post published while the feed is open is prepended rather than
  // waiting for the next visit.
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

  // Keep the chips in step when the sidebar changes the URL under us.
  useEffect(() => {
    setCategory(FILTER_TO_CATEGORY[urlFilter] || "All");
  }, [urlFilter]);

  /** Selecting a chip updates the URL too, so the tab stays shareable. */
  const selectCategory = (c) => {
    setCategory(c);
    const key = Object.keys(FILTER_TO_CATEGORY).find((k) => FILTER_TO_CATEGORY[k] === c);
    if (key) setSearchParams({ filter: key });
    else setSearchParams({});
  };
  const [search, setSearch] = useState("");

  // Toggling the icon only ever flipped local state — a refresh silently
  // reverted every save. POST/DELETE /feed/posts/{id}/bookmark are the real
  // endpoints (see admin FeedPage.jsx's toggleBookmark); this makes the
  // toggle actually persist, and rolls back the optimistic flip if it 404s.
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

  const votePoll = async (postId, pollId, optionIndex) => {
    try {
      await memberClient.post(`/feed/polls/${pollId}/vote`, { optionIndex });
      setPosts((prev) => prev.map((p) => {
        if (p.id !== postId || !p.poll) return p;
        const votes = [...(p.poll.votes || []), { optionIndex, memberId: user?.id }];
        return { ...p, poll: { ...p.poll, votes } };
      }));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  /**
   * The Follow button used to be local-only here because a feed post's org
   * type was unknowable. It's still unknowable *up front*, but resolvable —
   * see resolveOrgType above. Reuses a real type+id the moment one is known
   * (cached from an earlier resolve, or already captured in followedMeta by
   * another screen), so most clicks don't need a lookup at all.
   */
  const followPost = async (post) => {
    const existing = followedMeta[post.entityPublicId];
    if (existing?.type && existing?.apiId) {
      toggleFollow(post.entityPublicId, existing);
      return;
    }
    if (!post.orgId) {
      toggleFollow(post.entityPublicId); // no real id at all — local-only, unchanged from before
      return;
    }
    const cached = orgTypeCache.current[post.orgId];
    if (cached) {
      toggleFollow(post.entityPublicId, { type: cached, apiId: post.orgId, name: post.org, image: post.emoji, category: cached });
      return;
    }
    setResolvingFollowId(post.id);
    const type = await resolveOrgType(post.orgId);
    setResolvingFollowId(null);
    if (type) {
      orgTypeCache.current[post.orgId] = type;
      toggleFollow(post.entityPublicId, { type, apiId: post.orgId, name: post.org, image: post.emoji, category: type });
    } else {
      // Couldn't place it under any known org type — fall back rather than
      // block the member from following at all.
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

  // Visibility Engine Sorting (Followed Entity = Priority 1)
  const sortedPosts = sortContent(posts);

  const filtered = sortedPosts.filter((p) => {
    // ?filter=sponsored is the Sponsored Posts tab
    if (sponsoredOnly && !p.isAd) return false;
    if (p.isAd) return true;
    if (search) {
      const q = search.toLowerCase();
      const matchText = p.title?.toLowerCase().includes(q) || p.org?.toLowerCase().includes(q);
      const matchId = p.entityPublicId?.toLowerCase().includes(q);
      if (!matchText && !matchId) return false;
    }
    // Spaces were stripped from the needle but not the haystack, so any
    // two-word category ("MS Updates", "Temple Updates") could never match.
    // Normalise both sides.
    if (category !== "All") {
      const squash = (v) => String(v || "").toLowerCase().replace(/\s+/g, "");
      if (!squash(p.category).includes(squash(category))) return false;
    }
    return true;
  });

  // Sponsored posts previously clustered wherever sortContent happened to
  // place them — the spec calls for one every 7 organic items, spaced out
  // rather than bunched. Sponsored Posts tab already isolates ads (all of
  // `filtered` is ads there), so interleaving only applies to the mixed feed.
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
            onClick={() => selectCategory(c)}
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
          {interleaved.map((post) => {
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

                  {/* Follow Button. Resolves the post's org type on first
                      click (see followPost above) so this calls the real
                      follow endpoint instead of only updating local state. */}
                  <button
                    onClick={() => followPost(post)}
                    disabled={resolvingFollowId === post.id}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60",
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

                {/* Poll (§4.11.4) */}
                {post.poll && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                      <BarChart3 className="h-3.5 w-3.5 text-purple-500" />
                      <span>{post.poll.question}</span>
                    </div>
                    <div className="space-y-1.5">
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
                            className="w-full text-left p-2 rounded-lg border border-slate-200 bg-white hover:bg-purple-50/50 transition-all text-xs relative overflow-hidden disabled:cursor-default"
                          >
                            <div className="absolute left-0 top-0 bottom-0 bg-purple-100/60 transition-all" style={{ width: `${optPct}%` }} />
                            <div className="relative flex justify-between items-center font-semibold text-slate-700">
                              <span>{opt}</span>
                              <span className="text-[10px] text-slate-400">{optPct}% ({optVotes} {t("votes")})</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

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
