import { useState, useEffect } from "react";
import { api, extractErrorMessage, API_BASE } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/common/DataTable";
import {
  Plus,
  Search,
  Bookmark,
  Share2,
  ExternalLink,
  MapPin,
  MessageSquare,
  Globe,
  Trash2,
  Edit,
  Eye,
  SlidersHorizontal,
  Info,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Tag,
  Download,
  Percent,
  Compass
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { OFFER_CATEGORIES, OFFER_CATEGORY_OPTIONS } from "@/constants/dropdownOptions";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

// OFFER_CATEGORIES imported from @/constants/dropdownOptions

const standardDisclaimer = "Disclaimer: JiNANAM only provides a platform for businesses to showcase their offers. JiNANAM does not guarantee, endorse, verify, or take responsibility for the quality, availability, pricing, products, services, disputes, losses, damages, or claims arising from these offers. Members are advised to verify all information directly with the respective business before making any purchase or transaction.";

export default function OffersPage() {
  const { t } = useLanguage();
  const { canDo, user, isSuperAdmin } = useAuth();
  
  // Scoped authorization logic (§5.14)
  const isAuthorizedAdmin = isSuperAdmin || user?.primaryRoleKey === "SUPER_ADMIN";

  // Page Tab state
  const [activeTab, setActiveTab] = useState(isAuthorizedAdmin ? "admin_dashboard" : "browse_offers");

  // Lists States
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedOffersList, setSavedOffersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Search & Filter options
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterType, setFilterType] = useState("all"); // all | nearby | home-city | expiring-soon

  // Selection & Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOffer, setDetailOffer] = useState(null);
  const [editingOfferItem, setEditingOfferItem] = useState(null);

  // Form Fields - Onboarding Offer
  const [companyName, setCompanyName] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [offerCategory, setOfferCategory] = useState("Food");

  // Visibility Engine settings
  const [geoCountry, setGeoCountry] = useState("India");
  const [geoState, setGeoState] = useState("");
  const [geoDistrict, setGeoDistrict] = useState("");
  const [geoCity, setGeoCity] = useState("");
  const [geoArea, setGeoArea] = useState("");
  const [geoRadius, setGeoRadius] = useState(5);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load categories
      const catRes = await api.get("/master-data/offer-categories").catch(() => ({ data: { data: [] } }));
      setCategories(catRes.data?.data?.items || catRes.data?.data || []);

      // 2. Load admin offers list (includes expired via includeExpired endpoint filter)
      const offersRes = await api.get(`/offers`, { params: { includeExpired: isAuthorizedAdmin ? "true" : "false" } });
      const rawOffers = offersRes.data?.data || [];
      setOffers(rawOffers);

      // 3. Load user saved/bookmarked offers
      if (!isAuthorizedAdmin) {
        const savedRes = await api.get(`/offers/browse`, { params: { section: "saved" } }).catch(() => ({ data: { data: [] } }));
        setSavedOffersList(savedRes.data?.data || []);
      }
    } catch (e) {
      toast.error(t("Failed to load offer boards"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  // Handle Offer Registration Submittal
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        companyName,
        companyLogoUrl: companyLogoUrl || "logo_placeholder.png",
        bannerUrl: bannerUrl || "banner_placeholder.png",
        title: offerTitle,
        description: offerDesc,
        categoryId: categories.find(c => c.name === offerCategory)?.id || undefined,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        contact: { phone: contactNumber },
        links: {
          whatsapp: whatsappNumber,
          website: companyWebsite || redirectUrl,
          maps: googleMapsLink
        },
        visibilityConfig: {
          geo: {
            country: geoCountry,
            state: geoState,
            district: geoDistrict,
            city: geoCity,
            area: geoArea,
            gpsRadiusKm: Number(geoRadius)
          }
        }
      };

      await api.post("/offers", payload);
      toast.success(t("New offer published and Visibility target rules scheduled!"));
      setCreateOpen(false);
      setReloadKey(k => k + 1);
      resetForm();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleEditOffer = async (e) => {
    e.preventDefault();
    if (!editingOfferItem) return;
    try {
      const payload = {
        companyName,
        companyLogoUrl,
        bannerUrl,
        title: offerTitle,
        description: offerDesc,
        categoryId: categories.find(c => c.name === offerCategory)?.id || undefined,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        contact: { phone: contactNumber },
        links: {
          whatsapp: whatsappNumber,
          website: companyWebsite || redirectUrl,
          maps: googleMapsLink
        },
        visibilityConfig: {
          geo: {
            country: geoCountry,
            state: geoState,
            district: geoDistrict,
            city: geoCity,
            area: geoArea,
            gpsRadiusKm: Number(geoRadius)
          }
        }
      };

      await api.patch(`/offers/${editingOfferItem.id}`, payload);
      toast.success(t("Offer details updated successfully."));
      setEditOpen(false);
      setEditingOfferItem(null);
      setReloadKey(k => k + 1);
      resetForm();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const resetForm = () => {
    setCompanyName(""); setCompanyLogoUrl(""); setOfferTitle(""); setOfferDesc("");
    setBannerUrl(""); setRedirectUrl(""); setCompanyWebsite(""); setContactNumber("");
    setWhatsappNumber(""); setGoogleMapsLink(""); setStartAt(""); setEndAt("");
    setOfferCategory("Food"); setGeoState(""); setGeoDistrict(""); setGeoCity("");
    setGeoArea(""); setGeoRadius(5);
  };

  const openEditModal = (o) => {
    setEditingOfferItem(o);
    setCompanyName(o.companyName || "");
    setCompanyLogoUrl(o.companyLogoUrl || "");
    setOfferTitle(o.title || "");
    setOfferDesc(o.description || "");
    setBannerUrl(o.bannerUrl || "");
    setRedirectUrl(o.links?.website || "");
    setCompanyWebsite(o.links?.website || "");
    setContactNumber(o.contact?.phone || "");
    setWhatsappNumber(o.links?.whatsapp || "");
    setGoogleMapsLink(o.links?.maps || "");
    setStartAt(o.startAt ? new Date(o.startAt).toISOString().slice(0, 10) : "");
    setEndAt(o.endAt ? new Date(o.endAt).toISOString().slice(0, 10) : "");
    setOfferCategory(o.category?.name || "Food");
    
    const geo = o.visibilityConfig?.geo || {};
    setGeoState(geo.state || "");
    setGeoDistrict(geo.district || "");
    setGeoCity(geo.city || "");
    setGeoArea(geo.area || "");
    setGeoRadius(geo.gpsRadiusKm || 5);
    
    setEditOpen(true);
  };

  const toggleSaveOffer = async (offer) => {
    const isSaved = savedOffersList.some(s => s.id === offer.id);
    try {
      if (isSaved) {
        await api.post(`/offers/${offer.id}/unsave`);
        toast.success(t("Offer removed from your Bookmarks list."));
      } else {
        await api.post(`/offers/${offer.id}/save`);
        toast.success(t("Offer bookmarked! View under Saved Offers."));
      }
      setReloadKey(k => k + 1);
    } catch (e) {
      toast.error(t("Failed to update saved offers state"));
    }
  };

  const handleShareOffer = (offer) => {
    const link = `https://jinanam.org/offers/${offer.publicId || offer.id}`;
    navigator.clipboard.writeText(link);
    toast.success(t("JiNANAM Deep Link copied to clipboard!"));
    api.post(`/offers/${offer.id}/track/share`).catch(() => {});
  };

  const trackClick = (offer) => {
    api.post(`/offers/${offer.id}/track/click`).catch(() => {});
  };

  const trackView = (offer) => {
    api.post(`/offers/${offer.id}/track/view`).catch(() => {});
  };

  const handleExportReport = () => {
    const format = prompt("Choose export format: csv, xlsx, or pdf", "csv");
    if (!format) return;
    const link = document.createElement("a");
    link.href = `${API_BASE}/offers/export?format=${format.toLowerCase()}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exporting Offers report as ${format.toUpperCase()}...`);
  };

  const handleDeleteOffer = async (offerId) => {
    if (!confirm("Are you sure you want to archive/delete this offer?")) return;
    try {
      await api.patch(`/offers/${offerId}`, { deletedAt: new Date().toISOString() });
      toast.success(t("Offer moved to Expired/Archived lists."));
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Determine offer statuses locally
  const now = new Date();
  const activeOffers = offers.filter(o => new Date(o.startAt) <= now && new Date(o.endAt) >= now && !o.deletedAt);
  const upcomingOffers = offers.filter(o => new Date(o.startAt) > now && !o.deletedAt);
  const expiredOffers = offers.filter(o => (new Date(o.endAt) < now || o.deletedAt));

  // Visual filter matching logic
  const filteredOffersList = activeOffers.filter((o) => {
    const matchesQuery = q
      ? o.title.toLowerCase().includes(q.toLowerCase()) ||
        o.companyName.toLowerCase().includes(q.toLowerCase())
      : true;

    const matchesCategory = selectedCategory !== "all"
      ? o.category?.name === selectedCategory
      : true;

    return matchesQuery && matchesCategory;
  });

  const columns = [
    { key: "publicId", header: t("Offer ID"), render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId}</Badge> },
    { key: "companyName", header: t("Merchant"), render: (r) => <span className="font-bold text-slate-800 text-xs">{r.companyName}</span> },
    { key: "title", header: t("Offer Title"), render: (r) => <span className="text-slate-600 font-medium text-xs">{r.title}</span> },
    { key: "category", header: t("Category"), render: (r) => <Badge variant="secondary" className="text-[9px]">{r.category?.name || "Others"}</Badge> },
    { key: "startAt", header: t("Start Date"), render: (r) => <span className="text-slate-500 font-mono text-xs">{formatDate(r.startAt)}</span> },
    { key: "endAt", header: t("End Date"), render: (r) => <span className="text-slate-500 font-mono text-xs">{formatDate(r.endAt)}</span> },
    {
      key: "metrics",
      header: t("Views / Clicks / Saves"),
      render: (r) => (
        <span className="text-xs font-semibold text-slate-700 font-mono-num">
          👁️ {r.viewCount} | 🖱️ {r.clickCount} | 💾 {r._count?.saves ?? 0}
        </span>
      )
    },
    {
      key: "actions",
      header: t("Actions"),
      render: (r) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => openEditModal(r)}>
            <Edit className="h-3 w-3 mr-1" /> {t("Edit")}
          </Button>
          <PermissionGate action="DELETE">
            <Button size="sm" variant="outline" className="h-7 text-[10px] text-red-650 hover:bg-red-50" onClick={() => handleDeleteOffer(r.id)}>
              <Trash2 className="h-3 w-3 mr-1" /> {t("Delete")}
            </Button>
          </PermissionGate>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6" data-testid="offers-page">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-pink-700 to-rose-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Percent className="h-6 w-6 text-rose-200" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">{t("Offers & Exclusive Benefits")}</h1>
          </div>
          <p className="text-rose-100 text-xs mt-1 max-w-lg">
            {t("Curated merchant discounts, exclusive community deals, travel offers, and health benefits.")}
          </p>
        </div>
        {isAuthorizedAdmin && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Button
              onClick={handleExportReport}
              variant="outline"
              className="bg-rose-800/40 hover:bg-rose-800/60 text-white font-bold h-10 px-4 border border-rose-400/40"
            >
              <Download className="h-4 w-4 mr-2" /> {t("Export Reports")}
            </Button>
            <Button
              onClick={() => { resetForm(); setCreateOpen(true); }}
              className="bg-white hover:bg-rose-50 text-rose-700 font-bold h-10 px-5 shadow-md border border-white"
            >
              <Plus className="h-4 w-4 mr-2" /> {t("Create New Offer")}
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
          {isAuthorizedAdmin && (
            <TabsTrigger value="admin_dashboard" className="px-5 py-2 font-bold text-xs rounded-lg">{t("🛡️ Super Admin Control Board")}</TabsTrigger>
          )}
          <TabsTrigger value="browse_offers" className="px-5 py-2 font-bold text-xs rounded-lg">{t("🎁 Browse Offers & Benefits")}</TabsTrigger>
          <TabsTrigger value="saved_offers" className="px-5 py-2 font-bold text-xs rounded-lg">{t("💾 Saved Bookmarks")}</TabsTrigger>
        </TabsList>

        {/* Tab 1: Super Admin Controls */}
        {isAuthorizedAdmin && (
          <TabsContent value="admin_dashboard" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 bg-white border rounded-xl shadow-sm">
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Total Active deals")}</div>
                <div className="text-2xl font-black text-slate-800 mt-1">{activeOffers.length}</div>
              </Card>
              <Card className="p-4 bg-white border rounded-xl shadow-sm">
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Upcoming deals")}</div>
                <div className="text-2xl font-black text-indigo-750 mt-1">{upcomingOffers.length}</div>
              </Card>
              <Card className="p-4 bg-white border rounded-xl shadow-sm">
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Expired / Archived")}</div>
                <div className="text-2xl font-black text-slate-500 mt-1">{expiredOffers.length}</div>
              </Card>
              <Card className="p-4 bg-white border rounded-xl shadow-sm">
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Total Views & clicks")}</div>
                <div className="text-xs font-bold text-slate-600 mt-2 font-mono">
                  👁️ {offers.reduce((acc, curr) => acc + (curr.viewCount || 0), 0)} | 🖱️ {offers.reduce((acc, curr) => acc + (curr.clickCount || 0), 0)}
                </div>
              </Card>
            </div>

            <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{t("Super Admin Offers Ledger")}</h3>
                  <p className="text-[11px] text-slate-400">{t("Track clicks, audit merchant visibility rules, and onboard new campaigns.")}</p>
                </div>
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("action.search", "Search...")} className="pl-8 text-xs h-9" />
                </div>
              </div>

              <DataTable
                columns={columns}
                rows={q ? offers.filter(o => o.title.toLowerCase().includes(q.toLowerCase())) : offers}
                loading={loading}
                testId="offers-table"
                emptyTitle={t("No offers configured")}
                emptyDescription={t("Select Create New Offer to onboard promo banners.")}
              />
            </Card>
          </TabsContent>
        )}

        {/* Tab 2: Member Browse Offers */}
        <TabsContent value="browse_offers" className="space-y-6">
          {/* Banner Featured Carousels */}
          {activeOffers.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-pink-600" /> {t("Featured Benefits")}</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {activeOffers.slice(0, 4).map((offer, idx) => (
                  <Card key={idx} className="min-w-[280px] sm:min-w-[340px] max-w-sm rounded-xl overflow-hidden bg-white border shadow-sm shrink-0 snap-start relative"
                    onClick={() => { setDetailOffer(offer); trackView(offer); }}>
                    <div className="h-32 w-full bg-slate-100 overflow-hidden relative">
                      <img src={offer.bannerUrl || "/static/offers/banner.png"} alt="" className="h-full w-full object-cover" />
                      <div className="absolute top-2.5 left-2.5">
                        <Badge className="bg-pink-600 text-white font-bold text-[9px] uppercase tracking-wider">{t("Featured")}</Badge>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full overflow-hidden border flex items-center justify-center">
                          <img src={offer.companyLogoUrl || "/static/offers/logo.png"} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest truncate">{offer.companyName}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{offer.title}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{offer.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Category Chips Selector */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Merchant Categories")}</Label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-1.5 rounded-full border transition-all font-semibold ${
                  selectedCategory === "all" ? "bg-pink-600 border-pink-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t("All Categories")}
              </button>
              {OFFER_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full border transition-all font-semibold shrink-0 ${
                    selectedCategory === cat ? "bg-pink-600 border-pink-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-5 pt-2">
            {/* Filter Search side bar */}
            <Card className="col-span-12 md:col-span-3 p-4 bg-white border rounded-xl shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">{t("Search & Filters")}</h3>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search merchant, title...")} className="pl-8 text-xs" />
              </div>

              <div>
                <Label className="text-[10px] text-slate-400 uppercase font-bold">{t("Offer Scope Filter")}</Label>
                <select className="w-full mt-1.5 h-8 rounded border text-xs px-2 bg-slate-50 focus:outline-none"
                  value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">{t("Display All Active")}</option>
                  <option value="nearby">{t("Offers Near Me (GPS)")}</option>
                  <option value="home-city">{t("In My Home City")}</option>
                  <option value="expiring-soon">{t("Expiring Soon (7 Days)")}</option>
                </select>
              </div>
            </Card>

            {/* Offers Grid list */}
            <div className="col-span-12 md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {filteredOffersList.length === 0 ? (
                <div className="col-span-12 p-10 text-center bg-white border border-dashed rounded-2xl text-slate-400">
                  {t("No active offers matches the selected categories and search queries.")}
                </div>
              ) : (
                filteredOffersList.map((offer, idx) => (
                  <Card key={idx} className="rounded-xl bg-white border shadow-sm overflow-hidden flex flex-col justify-between"
                    onClick={() => { setDetailOffer(offer); trackView(offer); }}>
                    <div>
                      <div className="h-28 w-full bg-slate-50 overflow-hidden relative">
                        <img src={offer.bannerUrl || "/static/offers/banner.png"} alt="" className="h-full w-full object-cover" />
                        <div className="absolute top-2.5 right-2.5 flex gap-1">
                          <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full bg-white/95" onClick={(e) => { e.stopPropagation(); toggleSaveOffer(offer); }}>
                            <Bookmark className={`h-3.5 w-3.5 ${savedOffersList.some(s => s.id === offer.id) ? "fill-pink-600 text-pink-600" : "text-slate-600"}`} />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3.5 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-black text-pink-600">{offer.category?.name || "Others"}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{offer.title}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{offer.description}</p>
                      </div>
                    </div>

                    <div className="p-3 border-t flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-semibold font-mono-num">{t("Valid:")} {formatDate(offer.endAt)}</span>
                      <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[10px]" onClick={(e) => { e.stopPropagation(); handleShareOffer(offer); }}>
                        <Share2 className="h-3 w-3 mr-1" /> {t("Share Deal")}
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Saved Bookmarked Offers */}
        <TabsContent value="saved_offers" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {savedOffersList.length === 0 ? (
              <div className="col-span-4 p-10 text-center bg-white border border-dashed rounded-2xl text-slate-400">
                {t("No bookmarked offers. Select the bookmark tag on browse deals to save.")}
              </div>
            ) : (
              savedOffersList.map((offer, idx) => (
                <Card key={idx} className="rounded-xl bg-white border shadow-sm overflow-hidden flex flex-col justify-between"
                  onClick={() => { setDetailOffer(offer); trackView(offer); }}>
                  <div>
                    <div className="h-28 w-full bg-slate-50 overflow-hidden relative">
                      <img src={offer.bannerUrl || "/static/offers/banner.png"} alt="" className="h-full w-full object-cover" />
                      <div className="absolute top-2.5 right-2.5 flex gap-1">
                        <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full bg-white/95" onClick={(e) => { e.stopPropagation(); toggleSaveOffer(offer); }}>
                          <Bookmark className="h-3.5 w-3.5 fill-pink-600 text-pink-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-2">
                      <span className="text-[9px] uppercase font-black text-pink-650">{offer.category?.name}</span>
                      <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{offer.title}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{offer.description}</p>
                    </div>
                  </div>
                  <div className="p-3 border-t flex items-center justify-between bg-slate-50/50">
                    <span className="text-[9px] text-slate-400 font-semibold font-mono-num">{t("Valid:")} {formatDate(offer.endAt)}</span>
                    <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[10px]" onClick={(e) => { e.stopPropagation(); handleShareOffer(offer); }}>
                      <Share2 className="h-3 w-3 mr-1" /> {t("Share")}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* dialog 1: Create New Offer */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto text-xs bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading font-black text-slate-850">
              <Percent className="h-5 w-5 text-pink-600" /> {t("Configure Promotional Offer")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOffer} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Merchant Company Name *")}</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t("e.g. Swiggy / MakeMyTrip")} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Offer Category *")}</Label>
                <SearchableSelect
                  value={offerCategory}
                  onValueChange={setOfferCategory}
                  options={OFFER_CATEGORY_OPTIONS}
                  placeholder={t("Select Category")}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Company Logo Image URL")}</Label>
              <Input value={companyLogoUrl} onChange={(e) => setCompanyLogoUrl(e.target.value)} placeholder={t("/static/merchant/swiggy.png")} className="h-9 mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Offer Promo Title *")}</Label>
                <Input value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} placeholder={t("e.g. Flat 20% Off on Jain Meals")} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Promo Banner/Image URL")}</Label>
                <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder={t("/static/banners/offer1.png")} className="h-9 mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Offer Full Description")}</Label>
              <Textarea value={offerDesc} onChange={(e) => setOfferDesc(e.target.value)} placeholder={t("Provide full details of the offer benefits, guidelines, minimum order, etc.")} className="mt-1" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Redirect Landing Page URL")}</Label>
                <Input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="https://website.com/deal" className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Company Website")}</Label>
                <Input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://swiggy.com" className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Contact Number")}</Label>
                <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="9876543210" className="h-9 mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("WhatsApp Contact Number")}</Label>
                <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder={t("e.g. 9876543210")} className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Google Maps Store Link")}</Label>
                <Input value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)} placeholder="https://maps.google.com/..." className="h-9 mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Start Date *")}</Label>
                <Input type="date" value={startAt} onChange={(e) => setStartAt(e.target.value)} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("End Expiry Date *")}</Label>
                <Input type="date" value={endAt} onChange={(e) => setEndAt(e.target.value)} required className="h-9 mt-1" />
              </div>
            </div>

            <div className="border-t pt-3 space-y-3">
              <h4 className="font-bold text-slate-700 text-xs">{t("Geo-Visibility Target Rules")}</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Country")}</Label>
                  <Input value={geoCountry} onChange={(e) => setGeoCountry(e.target.value)} className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("State Target")}</Label>
                  <Input value={geoState} onChange={(e) => setGeoState(e.target.value)} placeholder={t("Gujarat")} className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("City Target")}</Label>
                  <Input value={geoCity} onChange={(e) => setGeoCity(e.target.value)} placeholder={t("Palitana")} className="h-9 mt-1" />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold h-9">{t("Publish Offer Campaign")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 2: Edit Offer */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto text-xs bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading font-black text-slate-805">{t("Modify Promotional Offer")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditOffer} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Merchant Company Name *")}</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Offer Category *")}</Label>
                <SearchableSelect
                  value={offerCategory}
                  onValueChange={setOfferCategory}
                  options={OFFER_CATEGORY_OPTIONS}
                  placeholder={t("Select Category")}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Offer Promo Title *")}</Label>
                <Input value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Promo Banner/Image URL")}</Label>
                <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} className="h-9 mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Offer Full Description")}</Label>
              <Textarea value={offerDesc} onChange={(e) => setOfferDesc(e.target.value)} className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Start Date *")}</Label>
                <Input type="date" value={startAt} onChange={(e) => setStartAt(e.target.value)} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("End Expiry Date *")}</Label>
                <Input type="date" value={endAt} onChange={(e) => setEndAt(e.target.value)} required className="h-9 mt-1" />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-pink-650 hover:bg-pink-700 text-white font-bold h-9">{t("Save Offer Changes")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 3: Member Offer Detail Card Modal */}
      <Dialog open={detailOffer !== null} onOpenChange={(o) => { if (!o) setDetailOffer(null); }}>
        <DialogContent className="sm:max-w-md text-xs max-h-[85vh] overflow-y-auto">
          {detailOffer && (
            <div className="space-y-4 pt-1">
              <div className="h-36 w-full bg-slate-50 overflow-hidden relative rounded-xl border">
                <img src={detailOffer.bannerUrl || "/static/offers/banner.png"} alt="" className="h-full w-full object-cover" />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden border flex items-center justify-center shrink-0">
                  <img src={detailOffer.companyLogoUrl || "/static/offers/logo.png"} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-850 line-clamp-1">{detailOffer.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{detailOffer.companyName} | {detailOffer.category?.name || "Merchant"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] uppercase font-bold text-slate-400">{t("Deal Details")}</Label>
                <p className="text-slate-650 leading-relaxed bg-slate-50 p-3 rounded-lg border">{detailOffer.description || "No full description configured."}</p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-450 bg-slate-100 p-2.5 rounded-lg font-mono">
                <span>{t("Start:")} {formatDate(detailOffer.startAt)}</span>
                <span>{t("Expires:")} {formatDate(detailOffer.endAt)}</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1.5 shrink-0 justify-between items-center border-t border-b py-3">
                <div className="flex gap-1.5">
                  {detailOffer.links?.whatsapp && (
                    <a href={`https://wa.me/${detailOffer.links.whatsapp}`} target="_blank" rel="noreferrer" onClick={() => trackClick(detailOffer)}>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-[11px]">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> {t("WhatsApp")}
                      </Button>
                    </a>
                  )}
                  {detailOffer.links?.website && (
                    <a href={detailOffer.links.website} target="_blank" rel="noreferrer" onClick={() => trackClick(detailOffer)}>
                      <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white font-bold h-8 text-[11px]">
                        <Globe className="h-3.5 w-3.5 mr-1" /> {t("Website")}
                      </Button>
                    </a>
                  )}
                  {detailOffer.links?.maps && (
                    <a href={detailOffer.links.maps} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="h-8 text-[11px]">
                        <MapPin className="h-3.5 w-3.5 mr-1" /> {t("Map Location")}
                      </Button>
                    </a>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => toggleSaveOffer(detailOffer)}>
                    <Bookmark className={`h-4 w-4 ${savedOffersList.some(s => s.id === detailOffer.id) ? "fill-pink-600 text-pink-600" : "text-slate-650"}`} />
                  </Button>
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleShareOffer(detailOffer)}>
                    <Share2 className="h-4 w-4 text-slate-650" />
                  </Button>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[9px] text-slate-400 leading-normal flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p>{standardDisclaimer}</p>
              </div>

              <DialogFooter className="pt-1.5">
                <Button variant="ghost" onClick={() => setDetailOffer(null)}>{t("Close Deal View")}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
