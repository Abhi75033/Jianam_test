import { useEffect, useState } from "react";
import { api, extractErrorMessage, STATIC_URL } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Bell,
  PenSquare,
  Share2,
  Bookmark,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  FileText,
  Video,
  ImageIcon,
  ExternalLink,
  Pin,
  BarChart2,
  BookmarkCheck,
  Globe,
  Tag,
  Check,
  ChevronRight,
  Eye,
  MousePointerClick
} from "lucide-react";
import { formatDateTime, initials } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FeedPage({ defaultCompose = false, defaultTab = "all" }) {
  const { t } = useLanguage();
  const { user, isSuperAdmin, canDo } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Active view tab state
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Search & Filter state
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterKeys, setFilterKeys] = useState([]);
  const [savedOnly, setSavedOnly] = useState(false);

  // Compose State
  const [composeOpen, setComposeOpen] = useState(defaultCompose);
  const [composeSaving, setComposeSaving] = useState(false);

  useEffect(() => {
    setComposeOpen(defaultCompose);
    setActiveTab(defaultTab);
  }, [defaultCompose, defaultTab]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    coverUrl: "",
    images: "",
    videoUrl: "",
    pdfUrl: "",
    externalLink: "",
    startAt: "",
    endAt: "",
    isPinned: false,
    organizationId: "",
    visibilityConfig: {
      isPublic: true,
      community: { communityIds: [], subCommunityIds: [], gacchaIds: [] },
      geo: { country: "", state: "", city: "" }
    }
  });

  // Master Data Lists for Compose Visibility
  const [myOrgs, setMyOrgs] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [subCommunities, setSubCommunities] = useState([]);
  const [gacchas, setGacchas] = useState([]);

  // Share Modal State
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePost, setSharePost] = useState(null);

  // Analytics Modal State
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsPost, setAnalyticsPost] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const loadFeed = async (resetPage = false) => {
    const nextPage = resetPage ? 1 : page;
    setLoading(true);
    try {
      const params = {
        page: nextPage,
        pageSize: 10,
        q: q || undefined,
        categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
        savedOnly: savedOnly || undefined
      };
      
      const queryParts = [];
      if (filterKeys.includes("myTemples")) queryParts.push("myTemples");
      if (filterKeys.includes("myJainCentres")) queryParts.push("myJainCentres");
      if (filterKeys.includes("myMonks")) queryParts.push("myMonks");
      if (filterKeys.includes("nearby")) queryParts.push("nearby");
      if (filterKeys.includes("myCommunity")) queryParts.push("myCommunity");
      if (filterKeys.includes("events")) queryParts.push("events");
      if (filterKeys.includes("tours")) queryParts.push("tours");
      if (filterKeys.includes("notices")) queryParts.push("notices");
      if (filterKeys.includes("offers")) queryParts.push("offers");
      
      const queryString = queryParts.map(k => `filterKeys=${k}`).join("&");
      const url = `/feed?page=${nextPage}&pageSize=10${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}${params.categoryId ? `&categoryId=${params.categoryId}` : ""}${params.savedOnly ? `&savedOnly=true` : ""}${queryString ? `&${queryString}` : ""}`;

      const res = await api.get(url);
      const feedItems = res.data?.data?.items || res.data?.data || [];
      const loadedTotal = res.data?.data?.total || feedItems.length;

      if (resetPage) {
        setItems(feedItems);
      } else {
        setItems((prev) => [...prev, ...feedItems]);
      }
      setTotal(loadedTotal);
      setHasMore(feedItems.length === 10);
      if (resetPage) setPage(1);
    } catch (e) {
      toast.error(t("Failed to load feed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, selectedCategory, filterKeys, savedOnly]);

  useEffect(() => {
    api.get("/master-data/feed-categories").then((res) => {
      setCategories(res.data?.data || []);
    }).catch(() => {});

    // Preload visibility list dependencies for composition
    api.get("/temples").then((res) => {
      setMyOrgs(res.data?.data?.items || res.data?.data || []);
    }).catch(() => {});
    api.get("/master-data/communities").then((res) => {
      setCommunities(res.data?.data || []);
    }).catch(() => {});
    api.get("/master-data/sub-communities").then((res) => {
      setSubCommunities(res.data?.data || []);
    }).catch(() => {});
    api.get("/master-data/gacchas").then((res) => {
      setGacchas(res.data?.data || []);
    }).catch(() => {});
  }, []);

  const handleLoadMore = () => {
    setPage((prev) => {
      const next = prev + 1;
      setTimeout(() => loadFeed(false), 50);
      return next;
    });
  };

  const handlePostClick = async (postId) => {
    try {
      await api.post(`/feed/posts/${postId}/click`);
    } catch (err) {}
  };

  const handleBookmarkToggle = async (postItem, index) => {
    const isBookmarked = postItem.saves?.some(s => s.memberId === user?.id) || postItem.isBookmarkedByMe;
    try {
      if (isBookmarked) {
        await api.delete(`/feed/posts/${postItem.id}/bookmark`);
        toast.success(t("Bookmark removed"));
      } else {
        await api.post(`/feed/posts/${postItem.id}/bookmark`);
        toast.success(t("Post bookmarked"));
      }
      // Reload current items
      loadFeed(true);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleShareTrigger = (postItem) => {
    setSharePost(postItem);
    setShareOpen(true);
    api.post(`/feed/posts/${postItem.id}/share`).catch(() => {});
  };

  const copyShareLink = (postItem) => {
    const deepLink = `https://jinanam.com/feed/posts/${postItem.id}`;
    navigator.clipboard.writeText(deepLink);
    toast.success(t("Deep link copied to clipboard!"));
    setShareOpen(false);
  };

  const handleViewAnalytics = async (postItem) => {
    setAnalyticsPost(postItem);
    setAnalyticsOpen(true);
    setAnalyticsLoading(true);
    try {
      const res = await api.get(`/feed/posts/${postItem.id}/analytics`);
      setAnalyticsData(res.data?.data || null);
    } catch (err) {
      toast.error(t("Failed to load analytics"));
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error(t("Title is required."));
      return;
    }
    setComposeSaving(true);
    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        coverUrl: formData.coverUrl.trim() || undefined,
        videoUrl: formData.videoUrl.trim() || undefined,
        pdfUrl: formData.pdfUrl.trim() || undefined,
        externalLink: formData.externalLink.trim() || undefined,
        categoryId: formData.categoryId || undefined,
        organizationId: formData.organizationId || undefined,
        startAt: formData.startAt ? new Date(formData.startAt).toISOString() : undefined,
        endAt: formData.endAt ? new Date(formData.endAt).toISOString() : undefined,
        images: formData.images ? formData.images.split(",").map(i => i.trim()).filter(Boolean) : undefined
      };

      await api.post("/feed/posts", payload);
      toast.success(t("Feed post published successfully!"));
      setComposeOpen(false);
      setFormData({
        title: "",
        description: "",
        categoryId: "",
        coverUrl: "",
        images: "",
        videoUrl: "",
        pdfUrl: "",
        externalLink: "",
        startAt: "",
        endAt: "",
        isPinned: false,
        organizationId: "",
        visibilityConfig: {
          isPublic: true,
          community: { communityIds: [], subCommunityIds: [], gacchaIds: [] },
          geo: { country: "", state: "", city: "" }
        }
      });
      loadFeed(true);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setComposeSaving(false);
    }
  };

  const toggleFilter = (key) => {
    setFilterKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const getHeaderTitle = () => {
    if (defaultCompose) return t("nav.createPost", "Create New Post");
    if (activeTab === "scheduled") return t("nav.scheduledPosts", "Scheduled Posts");
    if (activeTab === "featured") return t("nav.featuredPosts", "Featured Posts");
    if (activeTab === "reported") return t("nav.reportedPosts", "Reported Posts");
    return t("nav.feedManagement", "JiNANAM Community Feed");
  };

  return (
    <div className="space-y-6" data-testid="feed-page">
      {/* Upper Title Section */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-purple-800 to-indigo-900 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">{getHeaderTitle()}</h1>
          </div>
          <p className="text-purple-100 text-xs mt-1 max-w-lg">
            {t("feed.subtitle", "Personalized, community-specific, and location-aware updates matching your preferences and spiritual alignment.")}
          </p>
        </div>
        <div className="flex gap-2 self-start md:self-center shrink-0">
          {(isSuperAdmin || canDo("FEED", "CREATE")) && (
            <Button onClick={() => setComposeOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold h-10 px-5 shadow-md" data-testid="feed-compose">
              <PenSquare className="h-4 w-4 mr-2" /> {t("action.add", "Compose Post")}
            </Button>
          )}
          <Button variant="outline" onClick={() => setSavedOnly(!savedOnly)} className={savedOnly ? "bg-white text-purple-800 font-bold border-white" : "bg-purple-900/40 text-white border-purple-600 hover:bg-purple-900/60"}>
            <BookmarkCheck className="h-4 w-4 mr-2" /> {savedOnly ? t("feed.savedActive", "Saved Feed Active") : t("feed.viewSaved", "View Saved Feed")}
          </Button>
        </div>
      </div>

      {/* Mode Sub-Navigation Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        {[
          { key: "all", labelKey: "nav.feedManagement", defaultLabel: "Feed Management" },
          { key: "scheduled", labelKey: "nav.scheduledPosts", defaultLabel: "Scheduled Posts" },
          { key: "featured", labelKey: "nav.featuredPosts", defaultLabel: "Featured Posts" },
          { key: "reported", labelKey: "nav.reportedPosts", defaultLabel: "Reported Posts" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === tab.key
                ? "bg-white text-purple-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t(tab.labelKey, tab.defaultLabel)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Left Side: Filter & Options Panel */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Card className="p-4 border border-slate-200 bg-white rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t("🔍 Search Feed")}</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("Search keywords, temples...")}
                className="pl-8 text-xs bg-slate-50 border-slate-200 h-9 rounded-lg"
              />
            </div>
          </Card>

          <Card className="p-4 border border-slate-200 bg-white rounded-xl shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("📋 Feed Filters")}</h3>
              <div className="space-y-1.5">
                {[
                  { key: "myTemples", label: t("My Followed Temples") },
                  { key: "myJainCentres", label: t("My Jain Centres") },
                  { key: "myMonks", label: t("My Followed Monks") },
                  { key: "nearby", label: t("Nearby Updates (20KM)") },
                  { key: "myCommunity", label: t("My Community Sect") }
                ].map(f => (
                  <label key={f.key} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer py-1 hover:text-slate-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={filterKeys.includes(f.key)}
                      onChange={() => toggleFilter(f.key)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                    />
                    <span>{t(f.label)}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("🏷️ Core Types")}</h3>
              <div className="space-y-1.5">
                {[
                  { key: "events", label: t("Events & Pravachans") },
                  { key: "tours", label: t("Jatras / Tours") },
                  { key: "notices", label: t("Notices & Maryadas") },
                  { key: "offers", label: t("Offers & Benefits") }
                ].map(f => (
                  <label key={f.key} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer py-1 hover:text-slate-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={filterKeys.includes(f.key)}
                      onChange={() => toggleFilter(f.key)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                    />
                    <span>{t(f.label)}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Timeline Content */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          {/* Horizontal Categories Tabs Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === "all"
                  ? "bg-purple-800 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t("🌟 All Updates")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === cat.id
                    ? "bg-purple-800 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading && items.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5 border border-slate-200 bg-white rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-4 w-full" />
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title={savedOnly ? t("Saved Feed is empty") : t("No updates matches criteria")}
              description={t("Be the first to create a manual feed announcement or filter search preferences to refresh results.")}
              icon={PenSquare}
            />
          ) : (
            <div className="space-y-5">
              {items.map((wrapper, idx) => {
                if (wrapper.kind === "AD" && wrapper.ad) {
                  const ad = wrapper.ad;
                  return (
                    <Card key={`ad-${ad.id}-${idx}`} className="p-4 border-2 border-indigo-200 bg-indigo-50/50 rounded-2xl shadow-sm relative overflow-hidden">
                      <div className="absolute right-3 top-3 px-2 py-0.5 rounded bg-indigo-200 text-indigo-800 font-bold text-[9px] uppercase tracking-wider">
                        {t("Sponsored")}
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 items-center">
                        {ad.bannerUrl && (
                          <img src={ad.bannerUrl} alt={t("Ad banner")} className="w-full md:w-44 h-24 object-cover rounded-xl border" />
                        )}
                        <div className="flex-1 space-y-1.5 text-center md:text-left">
                          <h4 className="font-bold text-slate-800 text-sm">{t("Exclusive Jain Community Partner")}</h4>
                          <p className="text-xs text-slate-500">{t("Discover premium offers and events aligned with our community ethics.")}</p>
                          {ad.targetLink && (
                            <a href={ad.targetLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-700 font-bold hover:underline mt-1">
                              {t("Learn More")} <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                }

                // POST Rendering
                const p = wrapper.post || wrapper;
                const author = p.organization?.name || "JiNANAM Official Feed";
                const isPinned = p.isPinned;
                const imagesList = Array.isArray(p.images) ? p.images : [];

                return (
                  <Card
                    key={`post-${p.id}-${idx}`}
                    onClick={() => handlePostClick(p.id)}
                    className={`p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all relative ${
                      isPinned ? "border-amber-300 ring-2 ring-amber-100/50" : "border-slate-200"
                    }`}
                    data-testid={`feed-post-${idx}`}
                  >
                    {isPinned && (
                      <div className="absolute right-4 top-4 flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        <Pin className="h-2.5 w-2.5" /> {t("Pinned Post")}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10 border border-slate-100">
                        {p.organization?.logoUrl && (
                          <img src={p.organization.logoUrl} alt={author} className="h-full w-full object-cover" />
                        )}
                        <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-sm">
                          {initials(author)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm truncate">{author}</span>
                          {p.category?.name && (
                            <Badge className="bg-purple-100 text-purple-800 border-none text-[9px] px-2 py-0">
                              {p.category.name}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {formatDateTime(p.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {p.title && <h2 className="text-base font-bold text-slate-800 leading-snug">{p.title}</h2>}
                      {p.description && <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">{p.description}</p>}
                    </div>

                    {/* Media Attachments */}
                    {p.coverUrl && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 shadow-sm max-h-80">
                        <img src={p.coverUrl} alt={t("Cover")} className="w-full object-cover h-64 hover:scale-[1.02] transition-transform duration-300" />
                      </div>
                    )}

                    {imagesList.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {imagesList.map((img, imIdx) => (
                          <div key={imIdx} className="rounded-lg overflow-hidden border max-h-48">
                            <img src={img} alt="" className="w-full object-cover h-40" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Poll Component (§4.11.4) */}
                    {p.poll && (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 mb-4">
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                          <span className="text-sm">📊</span>
                          <span>{p.poll.question}</span>
                        </div>
                        <div className="space-y-1.5">
                          {(Array.isArray(p.poll.options) ? p.poll.options : []).map((opt, oIdx) => {
                            const totalVotes = p.poll.votes?.length || 0;
                            const optVotes = p.poll.votes?.filter(v => v.optionIndex === oIdx).length || 0;
                            const optPct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                            const hasVoted = p.poll.votes?.some(v => v.memberId === user?.id);

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={hasVoted}
                                onClick={async () => {
                                  try {
                                    await api.post(`/feed/polls/${p.poll.id}/vote`, { optionIndex: oIdx });
                                    toast.success(t("Vote recorded successfully!"));
                                    loadFeed(true);
                                  } catch (e) {
                                    toast.error(extractErrorMessage(e));
                                  }
                                }}
                                className="w-full text-left p-2 rounded-lg border bg-white hover:bg-purple-50/50 transition-all text-xs relative overflow-hidden"
                              >
                                <div className="absolute left-0 top-0 bottom-0 bg-purple-100/60 transition-all" style={{ width: `${optPct}%` }}></div>
                                <div className="relative flex justify-between items-center font-semibold text-slate-700">
                                  <span>{opt}</span>
                                  <span className="text-[10px] text-slate-400 font-mono-num">{optPct}% ({optVotes} {t("votes)")}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* External PDF/Video Links & Action Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4 border-b pb-4 border-slate-100">
                      {p.pdfUrl && (
                        <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[11px] px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                          <FileText className="h-3.5 w-3.5 text-red-500" /> {t("View PDF Announcement")}
                        </a>
                      )}
                      {p.videoUrl && (
                        <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[11px] px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                          <Video className="h-3.5 w-3.5 text-blue-500" /> {t("Watch Video Attachment")}
                        </a>
                      )}
                      {p.externalLink && (
                        <a href={p.externalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[11px] px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                          <ExternalLink className="h-3.5 w-3.5 text-purple-500" /> {t("Visit Web link")}
                        </a>
                      )}

                      {/* Contextual Action Redirects */}
                      {p.category?.name === "Events" && p.sourceId && (
                        <a href={`/events`} className="inline-flex items-center gap-1.5 bg-orange-500 text-white font-bold text-[11px] px-4 py-1.5 rounded-lg hover:bg-orange-600 transition-colors shadow-sm ml-auto">
                          {t("View Event Detail")}
                        </a>
                      )}
                      {p.category?.name === "Tours" && p.sourceId && (
                        <a href={`/tours`} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-bold text-[11px] px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm ml-auto">
                          {t("Book Now")}
                        </a>
                      )}
                      {p.category?.name === "Offers & Benefits" && p.sourceId && (
                        <a href={`/offers`} className="inline-flex items-center gap-1.5 bg-indigo-600 text-white font-bold text-[11px] px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm ml-auto">
                          {t("Claim Offer")}
                        </a>
                      )}
                    </div>

                    {/* Engagement Actions Footer */}
                    <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                      <div className="flex items-center gap-4">
                        <button type="button" onClick={() => handleBookmarkToggle(p, idx)} className="flex items-center gap-1.5 hover:text-purple-800 transition-colors">
                          <Bookmark className={`h-4 w-4 ${p.saves?.some(s => s.memberId === user?.id) || p.isBookmarkedByMe ? "fill-purple-700 text-purple-700" : ""}`} /> {t("Bookmark")}
                        </button>
                        <button type="button" onClick={() => handleShareTrigger(p)} className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                          <Share2 className="h-4 w-4" /> {t("Share")}
                        </button>
                      </div>

                      {/* Admin Analytics Click */}
                      {(isSuperAdmin || (p.organizationId && user?.organizationIds?.includes(p.organizationId))) && (
                        <button type="button" onClick={() => handleViewAnalytics(p)} className="flex items-center gap-1 bg-slate-50 text-slate-600 hover:text-purple-800 border px-3 py-1 rounded-lg transition-all text-[11px]">
                          <BarChart2 className="h-3.5 w-3.5" /> {t("Stats Dashboard")}
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button onClick={handleLoadMore} disabled={loading} className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-6 shadow-sm">
                    {loading ? t("Loading Feed...") : t("Load More Posts")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleComposeSubmit}>
            <DialogHeader>
              <DialogTitle className="text-slate-800 flex items-center gap-2">
                {t("🪶 Compose New Feed Announcement")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Post Title *")}</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder={t("e.g. Mahaparva Paryushan Celebrations")} className="mt-1 h-9 bg-white" required />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Category *")}</Label>
                  <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                    value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} required>
                    <option value="">{t("Select category...")}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Post Body Description")}</Label>
                <textarea rows={4} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none"
                  value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t("Write your announcement body details...")} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Publish/Start Date")}</Label>
                  <Input type="datetime-local" value={formData.startAt} onChange={(e) => setFormData({ ...formData, startAt: e.target.value })} className="mt-1 h-9 bg-white" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Expiry/End Date")}</Label>
                  <Input type="datetime-local" value={formData.endAt} onChange={(e) => setFormData({ ...formData, endAt: e.target.value })} className="mt-1 h-9 bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Cover Image URL")}</Label>
                  <Input value={formData.coverUrl} onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })} placeholder="https://image-link.com" className="mt-1 h-9 bg-white" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Gallery Images URLs (comma-separated)")}</Label>
                  <Input value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} placeholder={t("img1.jpg, img2.jpg")} className="mt-1 h-9 bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Video Link")}</Label>
                  <Input value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} placeholder="https://youtube.com/..." className="mt-1 h-9 bg-white" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("PDF Attachment Link")}</Label>
                  <Input value={formData.pdfUrl} onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })} placeholder="https://announcement.pdf" className="mt-1 h-9 bg-white" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("External URL Redirect")}</Label>
                  <Input value={formData.externalLink} onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })} placeholder="https://website.com" className="mt-1 h-9 bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Post On Behalf Of Org")}</Label>
                  <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                    value={formData.organizationId} onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}>
                    <option value="">{t("JiNANAM Official Feed")}</option>
                    {myOrgs.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <Label htmlFor="isPinned" className="text-xs font-bold text-slate-700 cursor-pointer">{t("Pin post to top of feed")}</Label>
                </div>
              </div>

              {/* Visibility Engine Setup */}
              <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-purple-700" /> {t("Feed Visibility Targeting Engine")}
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-500">{t("Target Country")}</Label>
                    <Input value={formData.visibilityConfig.geo.country} onChange={(e) => setFormData({
                      ...formData,
                      visibilityConfig: {
                        ...formData.visibilityConfig,
                        geo: { ...formData.visibilityConfig.geo, country: e.target.value }
                      }
                    })} placeholder={t("e.g. India")} className="h-9 bg-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-500">{t("Target State")}</Label>
                    <Input value={formData.visibilityConfig.geo.state} onChange={(e) => setFormData({
                      ...formData,
                      visibilityConfig: {
                        ...formData.visibilityConfig,
                        geo: { ...formData.visibilityConfig.geo, state: e.target.value }
                      }
                    })} placeholder={t("e.g. Gujarat")} className="h-9 bg-white mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-500">{t("Target Community Sect")}</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                      value={formData.visibilityConfig.community.communityIds?.[0] || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        visibilityConfig: {
                          ...formData.visibilityConfig,
                          community: {
                            ...formData.visibilityConfig.community,
                            communityIds: e.target.value ? [e.target.value] : []
                          }
                        }
                      })}>
                      <option value="">{t("All Sects")}</option>
                      {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-500">{t("Sub Community")}</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                      value={formData.visibilityConfig.community.subCommunityIds?.[0] || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        visibilityConfig: {
                          ...formData.visibilityConfig,
                          community: {
                            ...formData.visibilityConfig.community,
                            subCommunityIds: e.target.value ? [e.target.value] : []
                          }
                        }
                      })}>
                      <option value="">{t("All Sub-Sects")}</option>
                      {subCommunities.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-500">{t("Target Gaccha")}</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                      value={formData.visibilityConfig.community.gacchaIds?.[0] || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        visibilityConfig: {
                          ...formData.visibilityConfig,
                          community: {
                            ...formData.visibilityConfig.community,
                            gacchaIds: e.target.value ? [e.target.value] : []
                          }
                        }
                      })}>
                      <option value="">{t("All Gacchas")}</option>
                      {gacchas.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setComposeOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={composeSaving} className="bg-purple-800 hover:bg-purple-900 text-white font-bold">
                {composeSaving ? t("Publishing Announcement...") : t("Publish Post")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share Modal Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-1.5">
              <Share2 className="h-5 w-5 text-purple-700" /> {t("Share Announcement")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-xs text-slate-500">{t("Share this post with family and friends through Jain community deep links.")}</p>
            
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=Check%20out%20this%20update%20on%20JiNANAM:%20https://jinanam.com/feed/posts/${sharePost?.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 border rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all"
              >
                {t("🟢 WhatsApp")}
              </a>
              <a
                href={`https://t.me/share/url?url=https://jinanam.com/feed/posts/${sharePost?.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 border rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all"
              >
                {t("🔵 Telegram")}
              </a>
            </div>
            
            <Button onClick={() => copyShareLink(sharePost)} className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs">
              {t("🔗 Copy Deep Link")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Analytics Dashboard Overlay Modal */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-purple-700" /> {t("Feed Card Performance Report")}
            </DialogTitle>
          </DialogHeader>
          {analyticsLoading ? (
            <div className="py-8 space-y-2 text-center">
              <div className="h-8 w-8 rounded-full border-2 border-purple-700 border-t-transparent animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">{t("Loading performance metrics...")}</p>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <Card className="p-3 border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Eye className="h-3 w-3" /> {t("Total Views")}
                  </div>
                  <div className="text-xl font-bold font-mono text-purple-800">
                    {analyticsData?.viewCount || 0}
                  </div>
                </Card>
                <Card className="p-3 border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <MousePointerClick className="h-3 w-3" /> {t("Link Clicks")}
                  </div>
                  <div className="text-xl font-bold font-mono text-indigo-700">
                    {analyticsData?.clickCount || 0}
                  </div>
                </Card>
                <Card className="p-3 border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <BookmarkCheck className="h-3 w-3" /> {t("Bookmarks")}
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-600">
                    {analyticsData?.bookmarkCount || 0}
                  </div>
                </Card>
                <Card className="p-3 border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Share2 className="h-3 w-3" /> {t("Reach")}
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-600">
                    {analyticsData?.reach || 0}
                  </div>
                </Card>
              </div>

              <div className="p-3.5 border rounded-xl bg-purple-50/50 text-[11px] text-purple-900 leading-relaxed">
                {t("📢 **Reach Factor**: This card is getting 25% higher visual visibility index due to matching target geography and followers preferences.")}
              </div>

              <Button onClick={() => window.open(`/api/feed/analytics/report?format=csv&organizationId=${analyticsPost?.organizationId}`, "_blank")} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border font-bold text-xs">
                {t("📥 Export Organization Report (CSV)")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
