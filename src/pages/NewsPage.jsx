import { useEffect, useState } from "react";
import { api, extractErrorMessage, API_BASE } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Bookmark,
  Share2,
  ExternalLink,
  Trash2,
  Edit,
  SlidersHorizontal,
  Info,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Newspaper,
  Phone,
  BookmarkCheck,
  Eye,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgs } from "@/hooks/useOrgs";
import { OrgSelect } from "@/components/common/OrgSelect";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { NEWS_CATEGORY_OPTIONS } from "@/constants/dropdownOptions";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

// NEWS_CATEGORIES imported from @/constants/dropdownOptions

const getCoverUrl = (url) => {
  if (!url || url.includes("placeholder") || (!url.startsWith("http") && !url.startsWith("/static"))) {
    return "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80";
  }
  return url;
};

const getBottomUrl = (url) => {
  if (!url) return null;
  if (url.includes("placeholder") || (!url.startsWith("http") && !url.startsWith("/static"))) {
    return "https://images.unsplash.com/photo-1609137144814-72251fb264cb?w=600&auto=format&fit=crop&q=80";
  }
  return url;
};

export default function NewsPage() {
  const { t } = useLanguage();
  const { canDo, user, isSuperAdmin } = useAuth();
  const { orgs } = useOrgs();
  const [selectedOrg, setSelectedOrg] = useState("");
  const orgId = user?.organizationIds?.[0] || selectedOrg || (isSuperAdmin ? orgs[0]?.id : undefined);

  // States
  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Tab State
  const [activeTab, setActiveTab] = useState("admin_news");

  // Selection & Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailNews, setDetailNews] = useState(null);
  const [editingNewsItem, setEditingNewsItem] = useState(null);

  // Search / Filters
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterArchived, setFilterArchived] = useState(false);

  // Form Fields - Create News
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [bottomImageUrl, setBottomImageUrl] = useState("");
  const [categoryName, setCategoryName] = useState("Temple News");
  const [externalLinks, setExternalLinks] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [savingNews, setSavingNews] = useState(false);

  // Inshorts Simulator Variables
  const [simIndex, setSimIndex] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const catRes = await api.get("/master-data/news-categories").catch(() => ({ data: { data: [] } }));
      setCategories(catRes.data?.data?.items || catRes.data?.data || []);

      // 2. Fetch active news
      const newsRes = await api.get("/news").catch(() => ({ data: { data: [] } }));
      const rows = newsRes.data?.data || [];
      setNewsList(rows);

      // 3. Fetch bookmarks
      const bookRes = await api.get("/news/bookmarks/my").catch(() => ({ data: { data: [] } }));
      setBookmarks(bookRes.data?.data || []);
    } catch (e) {
      toast.error(t("Failed to load news feed board"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reloadKey]);

  // Onboard News Campaign
  const handleCreateNews = async (e) => {
    e.preventDefault();
    if (!title || !desc) {
      toast.error(t("News headline and description body are required."));
      return;
    }
    setSavingNews(true);
    try {
      const payload = {
        organizationId: orgId,
        title,
        description: desc,
        coverUrl: coverUrl || "cover_news_placeholder.png",
        bottomImageUrl: bottomImageUrl || undefined,
        categoryId: categories.find(c => c.name === categoryName)?.id || undefined,
        links: externalLinks ? externalLinks.split(",").map(l => l.trim()) : [],
        isBreaking,
        isFeatured
      };

      await api.post("/news", payload);
      toast.success(t("News article published successfully! Global notification broadcasted."));
      setCreateOpen(false);
      setReloadKey(k => k + 1);
      resetNewsForm();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSavingNews(false);
    }
  };

  const handleEditNews = async (e) => {
    e.preventDefault();
    if (!editingNewsItem) return;
    try {
      const payload = {
        title,
        description: desc,
        coverUrl,
        bottomImageUrl: bottomImageUrl || undefined,
        categoryId: categories.find(c => c.name === categoryName)?.id || undefined,
        links: externalLinks ? externalLinks.split(",").map(l => l.trim()) : [],
        isBreaking,
        isFeatured
      };

      await api.patch(`/news/${editingNewsItem.id}`, payload);
      toast.success(t("News article details updated."));
      setEditOpen(false);
      setEditingNewsItem(null);
      setReloadKey(k => k + 1);
      resetNewsForm();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const resetNewsForm = () => {
    setTitle(""); setDesc(""); setCoverUrl(""); setBottomImageUrl("");
    setCategoryName("Temple News"); setExternalLinks(""); setIsBreaking(false); setIsFeatured(false);
  };

  const openEditModal = (n) => {
    setEditingNewsItem(n);
    setTitle(n.title || "");
    setDesc(n.description || "");
    setCoverUrl(n.coverUrl || "");
    setBottomImageUrl(n.bottomImageUrl || "");
    setCategoryName(n.category?.name || "Temple News");
    setExternalLinks(n.links ? n.links.join(", ") : "");
    setIsBreaking(n.isBreaking || false);
    setIsFeatured(n.isFeatured || false);
    setEditOpen(true);
  };

  const toggleBookmark = async (news) => {
    const isBookmarked = bookmarks.some(b => b.id === news.id);
    try {
      if (isBookmarked) {
        await api.post(`/news/${news.id}/unbookmark`);
        toast.success(t("Article removed from bookmarks."));
      } else {
        await api.post(`/news/${news.id}/bookmark`);
        toast.success(t("Article bookmarked!"));
      }
      setReloadKey(k => k + 1);
    } catch (e) {
      toast.error(t("Failed to update bookmark state"));
    }
  };

  const handleShareNews = (news) => {
    const link = `https://jinanam.org/news/${news.publicId || news.id}`;
    navigator.clipboard.writeText(link);
    toast.success(t("JiNANAM Deep Link copied to clipboard!"));
  };

  const handlePermanentDelete = async (newsId) => {
    if (!confirm("Are you sure you want to permanently delete this news?")) return;
    try {
      await api.delete(`/news/${newsId}`);
      toast.success(t("News article permanently removed."));
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleRestoreArchive = async (newsId) => {
    try {
      await api.post(`/news/${newsId}/restore`);
      toast.success(t("News article restored to active timeline."));
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Sort & Display Priority rules (§5.15): Breaking -> Featured -> Latest -> Remaining
  const sortedNewsList = [...newsList].sort((a, b) => {
    if (a.isBreaking && !b.isBreaking) return -1;
    if (!a.isBreaking && b.isBreaking) return 1;
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
  });

  const filteredNews = sortedNewsList.filter((n) => {
    if (filterArchived && !n.isArchived) return false;
    if (!filterArchived && n.isArchived) return false;
    if (q && !n.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (selectedCategory !== "all" && n.category?.name !== selectedCategory) return false;
    return true;
  });

  const handleExportReports = async (format) => {
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const res = await fetch(`${API_BASE}/news`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Report generation failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `news-registry-${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xlsx" : "csv"}`;
      a.click();
      toast.success(t("Report downloaded."));
    } catch (e) {
      toast.error(t("Export failed"));
    }
  };

  return (
    <div className="space-y-6" data-testid="news-page">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-700 to-teal-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-emerald-200" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">{t("JiNANAM Newsroom")}</h1>
          </div>
          <p className="text-emerald-100 text-xs mt-1 max-w-lg">
            {t("Swipe-based, short format community updates. Auto-archives news articles after 7 days.")}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {canDo("NEWS", "CREATE") && (
            <Button
              onClick={() => { resetNewsForm(); setCreateOpen(true); }}
              className="bg-white hover:bg-emerald-50 text-emerald-800 font-bold h-10 px-5 shadow-md border border-white"
            >
              <Plus className="h-4 w-4 mr-2" /> {t("Write News Article")}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="admin_news" className="px-5 py-2 font-bold text-xs rounded-lg">{t("🛡️ Newsroom Control Ledger (")}{newsList.length})</TabsTrigger>
          <TabsTrigger value="swipe_simulator" className="px-5 py-2 font-bold text-xs rounded-lg">{t("📱 Mobile Swipe Simulator")}</TabsTrigger>
        </TabsList>

        {/* Tab 1: Control Ledger */}
        <TabsContent value="admin_news" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg"><Newspaper className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Total Active Articles")}</div>
                <div className="text-xl font-black text-slate-805">{newsList.filter(n => !n.isArchived).length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-lg"><Sparkles className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Breaking news")}</div>
                <div className="text-xl font-black text-rose-750">{newsList.filter(n => n.isBreaking).length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-lg"><Calendar className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Archived (> 7 Days)")}ys)</div>
                <div className="text-xl font-black text-slate-500">{newsList.filter(n => n.isArchived).length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg"><Download className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Reports Exports")}</div>
                <div className="flex gap-1.5 mt-1">
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleExportReports("xlsx")}>{t("Excel")}</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleExportReports("csv")}>CSV</Button>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{t("Newsroom Ledger")}</h3>
                <p className="text-[11px] text-slate-400">{t("Audit news categories, restore expired archives, and monitor article performance statistics.")}</p>
              </div>
              <div className="flex gap-2">
                <SearchableSelect
                  className="h-8 text-xs bg-slate-50 w-44"
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  options={[{ value: "all", label: t("All Categories") }, ...NEWS_CATEGORY_OPTIONS]}
                  placeholder={t("All Categories")}
                />
                <div className="flex items-center gap-1">
                  <label className="text-[11px] font-bold text-slate-500 cursor-pointer flex items-center gap-1.5">
                    <input type="checkbox" checked={filterArchived} onChange={(e) => setFilterArchived(e.target.checked)} className="rounded border-slate-300" />
                    {t("Show Archived")}
                  </label>
                </div>
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search news headlines...")} className="pl-8 text-xs h-8" />
                </div>
              </div>
            </div>

            <DataTable
              columns={[
                { key: "publicId", header: t("News ID"), render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId}</Badge> },
                {
                  key: "title",
                  header: t("Headline / Category"),
                  render: (r) => (
                    <div>
                      <div className="font-bold text-slate-805 text-xs">{r.title}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{r.category?.name || "Temple News"}</div>
                    </div>
                  )
                },
                {
                  key: "tags",
                  header: t("Tags"),
                  render: (r) => (
                    <div className="flex gap-1">
                      {r.isBreaking && <Badge variant="destructive" className="text-[9px] uppercase tracking-wider">{t("Breaking")}</Badge>}
                      {r.isFeatured && <Badge className="bg-amber-500 text-white text-[9px] uppercase tracking-wider">{t("Featured")}</Badge>}
                    </div>
                  )
                },
                { key: "published", header: t("Published At"), render: (r) => <span className="text-slate-500 font-mono text-xs">{formatDateTime(r.publishedAt || r.createdAt)}</span> },
                {
                  key: "actions",
                  header: t("Actions"),
                  render: (r) => (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => openEditModal(r)}>
                        <Edit className="h-3 w-3 mr-1" /> {t("Edit")}
                      </Button>
                      {r.isArchived && isSuperAdmin && (
                        <Button size="sm" variant="outline" className="h-7 text-[10px] bg-slate-50 text-slate-700" onClick={() => handleRestoreArchive(r.id)}>
                          <RotateCcw className="h-3 w-3 mr-1" /> {t("Restore")}
                        </Button>
                      )}
                      {isSuperAdmin && (
                        <PermissionGate action="DELETE">
                          <Button size="sm" variant="outline" className="h-7 text-[10px] text-red-650 hover:bg-red-50" onClick={() => handlePermanentDelete(r.id)}>
                            <Trash2 className="h-3 w-3 mr-1" /> {t("Delete")}
                          </Button>
                        </PermissionGate>
                      )}
                    </div>
                  )
                }
              ]}
              rows={filteredNews}
              loading={loading}
              testId="news-table"
              emptyTitle={t("No news articles found")}
              emptyDescription={t("Onboard new articles using Write News Article button above.")}
            />
          </Card>
        </TabsContent>

        {/* Tab 2: Swipe-Based Reading Simulator */}
        <TabsContent value="swipe_simulator" className="space-y-4">
          <div className="flex justify-center items-center py-6">
            {filteredNews.length === 0 ? (
              <div className="p-10 text-center bg-white border border-dashed rounded-2xl text-slate-400 max-w-sm w-full">
                {t("No active news articles configured to simulate swipe feed.")}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {/* Phone Mock Frame */}
                <div className="relative w-[340px] h-[580px] bg-slate-900 rounded-[40px] border-[12px] border-slate-950 shadow-2xl overflow-hidden flex flex-col justify-between text-white snap-y">
                  {/* Top Cover Image */}
                  <div className="h-44 w-full bg-slate-800 overflow-hidden relative">
                    <img src={getCoverUrl(filteredNews[simIndex]?.coverUrl)} alt="" className="h-full w-full object-cover" />
                    {/* Floating tags */}
                    <div className="absolute top-4 left-4 flex gap-1">
                      {filteredNews[simIndex]?.isBreaking && (
                        <Badge variant="destructive" className="text-[8px] uppercase font-black tracking-widest bg-red-600 border-0">{t("Breaking")}</Badge>
                      )}
                      {filteredNews[simIndex]?.isFeatured && (
                        <Badge className="bg-amber-500 text-white text-[8px] uppercase font-black tracking-widest border-0">{t("Featured")}</Badge>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 p-5 space-y-3 overflow-y-auto bg-slate-900/95">
                    <div className="text-[9px] uppercase font-black text-emerald-450">{filteredNews[simIndex]?.category?.name || "Temple News"}</div>
                    <h3 className="font-heading font-black text-sm text-slate-100 leading-tight">{filteredNews[simIndex]?.title}</h3>
                    <p className="text-[11px] text-slate-350 leading-relaxed font-medium">{filteredNews[simIndex]?.description}</p>
                  </div>

                  {/* Bottom Image (if configured) */}
                  {getBottomUrl(filteredNews[simIndex]?.bottomImageUrl) && (
                    <div className="h-24 w-full bg-slate-800 overflow-hidden">
                      <img src={getBottomUrl(filteredNews[simIndex]?.bottomImageUrl)} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}

                  {/* Footer links & actions */}
                  <div className="p-4 bg-slate-950 flex items-center justify-between border-t border-slate-800 shrink-0">
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-800 text-slate-400" onClick={() => toggleBookmark(filteredNews[simIndex])}>
                        <Bookmark className={`h-4 w-4 ${bookmarks.some(b => b.id === filteredNews[simIndex].id) ? "fill-emerald-500 text-emerald-500" : ""}`} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-800 text-slate-400" onClick={() => handleShareNews(filteredNews[simIndex])}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] text-slate-400" onClick={() => {
                        if (simIndex > 0) setSimIndex(simIndex - 1);
                        else setSimIndex(filteredNews.length - 1); // Loops back to end
                      }}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] text-slate-400" onClick={() => {
                        if (simIndex < filteredNews.length - 1) setSimIndex(simIndex + 1);
                        else setSimIndex(0); // Loops back to start
                      }}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{t("Swipe / click arrows to navigate (")}{simIndex + 1} of {filteredNews.length})</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* dialog 1: Write News Article */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading font-black text-slate-850">
              <Newspaper className="h-5 w-5 text-emerald-650" /> {t("Publish News Article")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNews} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Headline Title *")}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("e.g. Paryushan Parva Commences Tomorrow")} required className="h-9 mt-1" />
              </div>
              <div>
                <SearchableSelect
                  value={categoryName}
                  onValueChange={setCategoryName}
                  options={NEWS_CATEGORY_OPTIONS}
                  placeholder={t("Select Category")}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Cover Image URL *")}</Label>
                <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder={t("/static/news/cover1.png")} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Bottom Image URL (Optional)")}</Label>
                <Input value={bottomImageUrl} onChange={(e) => setBottomImageUrl(e.target.value)} placeholder={t("/static/news/bottom1.png")} className="h-9 mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("News Description Body *")}</Label>
              <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("Provide short, informative updates in Inshorts style...")} required className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                <span className="font-semibold text-slate-700">{t("Mark as Breaking News")}</span>
                <Switch checked={isBreaking} onCheckedChange={setIsBreaking} />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                <span className="font-semibold text-slate-700">{t("Mark as Featured News")}</span>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("External Web Redirect Link (Optional)")}</Label>
              <Input value={externalLinks} onChange={(e) => setExternalLinks(e.target.value)} placeholder="https://website.com/news-detail" className="h-9 mt-1" />
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-lg border text-emerald-800 text-[10px] leading-normal flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>
                {t("By publishing, this news article will be distributed to **all active Jain members** without community hierarchies, and will automatically archive after **7 days**.")}
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={savingNews} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9">
                {savingNews ? t("Publishing...") : t("Publish News Article")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 2: Edit News */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl text-xs">
          <DialogHeader>
            <DialogTitle className="font-heading font-black text-slate-805">{t("Modify News Article")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditNews} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Headline Title *")}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="h-9 mt-1" />
              </div>
              <div>
                <SearchableSelect
                  value={categoryName}
                  onValueChange={setCategoryName}
                  options={NEWS_CATEGORY_OPTIONS}
                  placeholder={t("Select Category")}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Cover Image URL *")}</Label>
                <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Bottom Image URL (Optional)")}</Label>
                <Input value={bottomImageUrl} onChange={(e) => setBottomImageUrl(e.target.value)} className="h-9 mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("News Description Body *")}</Label>
              <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} required className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                <span className="font-semibold text-slate-700">{t("Mark as Breaking News")}</span>
                <Switch checked={isBreaking} onCheckedChange={setIsBreaking} />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                <span className="font-semibold text-slate-700">{t("Mark as Featured News")}</span>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => { setEditOpen(false); setEditingNewsItem(null); }}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9">{t("Save News Changes")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
