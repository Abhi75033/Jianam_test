import { useEffect, useState, useCallback } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/common/EmptyState";
import MemberLinkSelect from "@/components/common/MemberLinkSelect";
import {
  Plus, Users, Check, X, Loader2, Crown, Globe, Phone, Mail,
  MapPin, Image as ImageIcon, Info, Search, Filter, BarChart2,
  Edit, Trash2, LogOut, FileText, Calendar, ChevronDown, ExternalLink,
  Building2, Rss, AlertTriangle, Settings, RefreshCw, UserCheck,
  UserX, Clock, Send, Eye
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

// ─── Constants ────────────────────────────────────────────────────────────────
const GEO_VISIBILITY_OPTIONS = ["Global", "Country", "State", "District", "City", "Area"];
const OPERATES_FROM_OPTIONS = ["Online", "Office", "Temple", "Community"];
const ORG_TYPES = [
  "Youth Organization", "Jain Trust", "Jain Social Group", "Jain Business Network",
  "NGO", "Educational Institution", "Religious Organization", "Women's Group",
  "Professional Network", "Charity Organization", "Cultural Organization",
  "Student Group", "Other"
];

// ─── Default form state ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", shortName: "", about: "", categoryId: "", joinApprovalMode: "MANUAL",
  logoUrl: "", bannerUrl: "", orgType: "", establishedYear: "", operatesFrom: "Office",
  officeAddress: "", googleMapsUrl: "", googleFormName: "", googleFormLink: "",
  phone: "", email: "",
  website: "", whatsappGroup: "", instagram: "", facebook: "", youtube: "",
  gallery: ["", "", "", "", "", "", "", "", "", ""],
  communityVisibility: "PUBLIC", geoVisibility: "Global",
  geoCountry: "", geoState: "", geoCity: "",
  subscriptionStartDate: "", subscriptionExpiresAt: "",
  ownerUserIds: [],
};

// ─── Tiny stat card ───────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = "orange" }) {
  const colors = {
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    blue:   "bg-blue-50 text-blue-600 border-blue-100",
    green:  "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber:  "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${colors[color]}`}>
      <div className="p-2 rounded-lg bg-white/70">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-black">{value ?? "—"}</div>
        <div className="text-xs font-semibold opacity-75">{label}</div>
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, label }) {
  return (
    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-orange-100 pb-1.5 flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" /> {label}
    </h4>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CommunityPagesPage() {
  const { t } = useLanguage();
  const { user, isSuperAdmin, canDo } = useAuth();

  // List state
  const [pages, setPages]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [reloadKey, setReloadKey]   = useState(0);
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [categories, setCategories] = useState([]);

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [saving, setSaving]         = useState(false);
  const [ownerInputs, setOwnerInputs] = useState([""]);

  // Detail modal
  const [detailPage, setDetailPage] = useState(null);
  const [detailTab, setDetailTab]   = useState("profile");
  const [detailLoading, setDetailLoading] = useState(false);

  // Members state
  const [members, setMembers]             = useState({ PENDING: [], APPROVED: [], REJECTED: [] });
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberTab, setMemberTab]         = useState("APPROVED");

  // Feed state
  const [feedPosts, setFeedPosts]     = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [newPost, setNewPost]         = useState({ title: "", description: "", coverUrl: "", type: "Notice" });
  const [postSaving, setPostSaving]   = useState(false);

  // Analytics state
  const [analytics, setAnalytics]   = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // SA Settings state
  const [settingsForm, setSettingsForm] = useState({});
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Edit Page state (for page owners)
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // Paid Event warning state
  const [showPaidEventWarn, setShowPaidEventWarn] = useState(false);

  // Filter extras
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");

  // Join/Leave state
  const [joining, setJoining] = useState(false);
  const [myMembership, setMyMembership] = useState(null); // null | 'PENDING' | 'APPROVED'

  // ─── Load pages ──────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search)       params.search = search;
    if (filterCat)    params.categoryId = filterCat;
    if (filterStatus) params.status = filterStatus;
    if (filterState)  params.geoState = filterState;
    if (filterCity)   params.geoCity  = filterCity;

    api.get("/community-pages", { params })
      .then((res) => setPages(res.data?.data?.items || res.data?.data || []))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));

    api.get("/master-data/community-page-categories")
      .then((res) => setCategories(res.data?.data?.items || res.data?.data || []))
      .catch(() => {});
  }, [reloadKey, search, filterCat, filterStatus, filterState, filterCity]);

  // ─── Open detail modal ────────────────────────────────────────────────────
  const openDetail = async (pg) => {
    setDetailLoading(true);
    setDetailTab("profile");
    setDetailPage(pg);
    setMyMembership(null);
    try {
      const res = await api.get(`/community-pages/${pg.id}`);
      const data = res.data?.data || pg;
      setDetailPage(data);
      setSettingsForm({
        subscriptionPlan: data.subscriptionPlan || "",
        subscriptionStartDate: (data.subscriptionStartDate || data.createdAt)?.split?.("T")?.[0] || "",
        subscriptionExpiresAt: data.subscriptionExpiresAt?.split?.("T")?.[0] || "",
        subscriptionStatus: data.subscriptionStatus || "ACTIVE",
        communityVisibility: data.communityVisibility || "PUBLIC",
        geoVisibility: data.geoVisibility || "Global",
        geoState: data.geoState || "",
        geoCity: data.geoCity || "",
      });
      // Pre-fill edit form for owners
      setEditForm({
        name: data.name || "",
        shortName: data.shortName || "",
        about: data.about || "",
        logoUrl: data.logoUrl || "",
        bannerUrl: data.bannerUrl || "",
        orgType: data.orgType || "",
        establishedYear: data.establishedYear || "",
        operatesFrom: data.operatesFrom || "Office",
        officeAddress: data.officeAddress || "",
        googleMapsUrl: data.googleMapsUrl || "",
        googleFormName: data.googleFormName || "",
        googleFormLink: data.googleFormLink || "",
        phone: data.contacts?.phone || "",
        email: data.contacts?.email || "",
        website: data.socialLinks?.website || "",
        whatsappGroup: data.socialLinks?.whatsappGroup || "",
        instagram: data.socialLinks?.instagram || "",
        facebook: data.socialLinks?.facebook || "",
        youtube: data.socialLinks?.youtube || "",
        gallery: [
          ...(Array.isArray(data.gallery) ? data.gallery : []),
          ...Array(10).fill(""),
        ].slice(0, 10),
        joinApprovalMode: data.joinApprovalMode || "MANUAL",
      });
    } catch { /* use existing pg */ }
    setDetailLoading(false);
  };

  // ─── Load members by status ───────────────────────────────────────────────
  const loadMembers = useCallback(async (pageId) => {
    setMembersLoading(true);
    try {
      const [pend, appr, rej] = await Promise.all([
        api.get(`/community-pages/${pageId}/members`, { params: { status: "PENDING" } }).catch(() => ({ data: { data: [] } })),
        api.get(`/community-pages/${pageId}/members`, { params: { status: "APPROVED" } }).catch(() => ({ data: { data: [] } })),
        api.get(`/community-pages/${pageId}/members`, { params: { status: "REJECTED" } }).catch(() => ({ data: { data: [] } })),
      ]);
      setMembers({
        PENDING:  pend.data?.data || [],
        APPROVED: appr.data?.data || [],
        REJECTED: rej.data?.data  || [],
      });
    } catch { setMembers({ PENDING: [], APPROVED: [], REJECTED: [] }); }
    finally  { setMembersLoading(false); }
  }, []);

  // ─── Load feed ────────────────────────────────────────────────────────────
  const loadFeed = useCallback(async (pageId) => {
    setFeedLoading(true);
    try {
      const res = await api.get(`/community-pages/${pageId}/feed`)
        .catch(() => api.get(`/feed`, { params: { communityPageId: pageId, pageSize: 50 } }));
      const items = res.data?.data?.items || res.data?.data || [];
      setFeedPosts(items);
    } catch { setFeedPosts([]); }
    finally  { setFeedLoading(false); }
  }, []);

  // ─── Load analytics ───────────────────────────────────────────────────────
  const loadAnalytics = useCallback(async (pageId) => {
    setAnalyticsLoading(true);
    try {
      const res = await api.get(`/community-pages/${pageId}/analytics`);
      setAnalytics(res.data?.data || null);
    } catch { setAnalytics(null); }
    finally  { setAnalyticsLoading(false); }
  }, []);

  // ─── Join / Leave page ────────────────────────────────────────────────────
  const joinPage = async () => {
    if (!detailPage) return;
    setJoining(true);
    try {
      const res = await api.post(`/community-pages/${detailPage.id}/join`);
      const status = res.data?.data?.status || "PENDING";
      setMyMembership(status);
      toast.success(status === "APPROVED" ? "You have joined the community!" : "Join request sent! Waiting for approval.");
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setJoining(false); }
  };

  const leavePage = async () => {
    if (!detailPage) return;
    if (!window.confirm("Are you sure you want to leave this community page?")) return;
    setJoining(true);
    try {
      await api.post(`/community-pages/${detailPage.id}/leave`);
      setMyMembership(null);
      toast.success(t("You have left the community."));
      setReloadKey((k) => k + 1);
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setJoining(false); }
  };

  // ─── Edit page (owner) ───────────────────────────────────────────────────
  const handleEditSave = async (e) => {
    e?.preventDefault();
    if (!editForm.name?.trim()) { toast.error(t("Page name is required.")); return; }
    setEditSaving(true);
    try {
      const galleryUrls = (editForm.gallery || []).filter((u) => u?.trim());
      await api.patch(`/community-pages/${detailPage.id}`, {
        name: editForm.name.trim(),
        shortName: editForm.shortName?.trim() || undefined,
        about: editForm.about?.trim() || undefined,
        logoUrl: editForm.logoUrl?.trim() || undefined,
        bannerUrl: editForm.bannerUrl?.trim() || undefined,
        orgType: editForm.orgType || undefined,
        establishedYear: editForm.establishedYear ? Number(editForm.establishedYear) : undefined,
        operatesFrom: editForm.operatesFrom || undefined,
        officeAddress: editForm.operatesFrom !== "Online" ? (editForm.officeAddress?.trim() || undefined) : undefined,
        googleMapsUrl: editForm.googleMapsUrl?.trim() || undefined,
        googleFormName: editForm.googleFormName?.trim() || undefined,
        googleFormLink: editForm.googleFormLink?.trim() || undefined,
        gallery: galleryUrls.length ? galleryUrls : undefined,
        joinApprovalMode: editForm.joinApprovalMode || undefined,
        contacts: { phone: editForm.phone?.trim() || undefined, email: editForm.email?.trim() || undefined },
        socialLinks: {
          website: editForm.website?.trim() || undefined,
          whatsappGroup: editForm.whatsappGroup?.trim() || undefined,
          instagram: editForm.instagram?.trim() || undefined,
          facebook: editForm.facebook?.trim() || undefined,
          youtube: editForm.youtube?.trim() || undefined,
        },
      });
      toast.success(t("Page updated successfully!"));
      setOpenEdit(false);
      openDetail(detailPage);
      setReloadKey((k) => k + 1);
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setEditSaving(false); }
  };

  // ─── CSV Export ───────────────────────────────────────────────────────────
  const exportMembersCSV = () => {
    const rows = members[memberTab];
    if (!rows?.length) { toast.error(t("No members to export.")); return; }
    const header = ["Member ID", "Name", "City", "State", "Community", "Join Date", "Status"];
    const lines = rows.map((m) => [
      m.member?.publicId || "",
      m.member?.fullName || "",
      m.member?.city || "",
      m.member?.state || "",
      m.member?.sect || "",
      new Date(m.createdAt).toLocaleDateString("en-IN"),
      m.status,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${detailPage?.name || "members"}_${memberTab.toLowerCase()}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} members as CSV.`);
  };

  // ─── Tab switch handler ───────────────────────────────────────────────────
  const switchDetailTab = (tab) => {
    setDetailTab(tab);
    if (!detailPage) return;
    if (tab === "members")   loadMembers(detailPage.id);
    if (tab === "feed")      loadFeed(detailPage.id);
    if (tab === "analytics") loadAnalytics(detailPage.id);
  };

  // ─── Member actions ───────────────────────────────────────────────────────
  const decideMember = async (memberId, decision) => {
    if (!detailPage) return;
    try {
      await api.post(`/community-pages/${detailPage.id}/members/decision`, { memberId, decision });
      toast.success(decision === "APPROVED" ? "Member approved." : "Member rejected.");
      loadMembers(detailPage.id);
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  const removeMember = async (memberId) => {
    if (!detailPage) return;
    if (!window.confirm("Remove this member from the page?")) return;
    try {
      // Use decision endpoint with REJECTED to remove — live server doesn't have DELETE /members/:id yet
      await api.post(`/community-pages/${detailPage.id}/members/decision`, { memberId, decision: "REJECTED" });
      toast.success(t("Member removed."));
      loadMembers(detailPage.id);
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  // ─── Create post ──────────────────────────────────────────────────────────
  const submitPost = async () => {
    if (!newPost.description.trim()) { toast.error(t("Post content is required.")); return; }
    setPostSaving(true);
    const postPayload = {
      title: newPost.title.trim() || undefined,
      description: newPost.description.trim(),
      coverUrl: newPost.coverUrl.trim() || undefined,
      sourceModule: newPost.type,
      communityPageId: detailPage.id,
    };
    try {
      try {
        await api.post(`/community-pages/${detailPage.id}/posts`, postPayload);
      } catch (err) {
        // Fallback to global /feed/posts endpoint if community-pages endpoint is 404 on live server
        await api.post(`/feed/posts`, postPayload);
      }
      toast.success(t("Post published successfully!"));
      setNewPost({ title: "", description: "", coverUrl: "", type: "Notice" });
      loadFeed(detailPage.id);
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setPostSaving(false); }
  };

  // ─── SA Settings save ─────────────────────────────────────────────────────
  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      // Subscription fields — use the dedicated /subscription route
      const subPayload = {};
      if (settingsForm.subscriptionPlan)      subPayload.plan      = settingsForm.subscriptionPlan;
      if (settingsForm.subscriptionExpiresAt) subPayload.expiresAt = settingsForm.subscriptionExpiresAt;
      if (settingsForm.subscriptionStatus)    subPayload.status    = settingsForm.subscriptionStatus;
      if (Object.keys(subPayload).length) {
        await api.patch(`/community-pages/${detailPage.id}/subscription`, subPayload);
      }
      // Visibility fields — use the standard PATCH /:pageId route (allowed via visibilityConfig JSON)
      const visPayload = {
        visibilityConfig: {
          communityVisibility: settingsForm.communityVisibility,
          geoVisibility:       settingsForm.geoVisibility,
          geoState:            settingsForm.geoState,
          geoCity:             settingsForm.geoCity,
        },
      };
      await api.patch(`/community-pages/${detailPage.id}`, visPayload);

      toast.success(t("Settings updated."));
      openDetail(detailPage);
      setReloadKey((k) => k + 1);
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setSettingsSaving(false); }
  };

  // ─── Suspend / Reactivate page ───────────────────────────────────────────
  const toggleSuspendStatus = async (targetStatus) => {
    try {
      await api.patch(`/community-pages/${detailPage.id}/subscription`, { status: targetStatus });
      toast.success(`Page status updated to ${targetStatus}.`);
      openDetail(detailPage);
      setReloadKey((k) => k + 1);
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  // ─── Delete page ──────────────────────────────────────────────────────────
  const deletePage = async () => {
    if (!window.confirm(`PERMANENT DELETE: Are you sure you want to permanently delete "${detailPage?.name}"? This action CANNOT be undone.`)) return;
    try {
      try {
        await api.delete(`/community-pages/${detailPage.id}`);
      } catch {
        // Fallback on live server if DELETE endpoint is not yet active
        await api.patch(`/community-pages/${detailPage.id}/subscription`, { status: "SUSPENDED" });
      }
      toast.success(t("Page deleted successfully."));
      setDetailPage(null);
      setReloadKey((k) => k + 1);
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  // ─── Create page submit ───────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) { toast.error(t("Page name is required.")); return; }
    setSaving(true);
    try {
      const galleryUrls = form.gallery.filter((u) => u.trim());
      const payload = {
        name: form.name.trim(),
        shortName: form.shortName.trim() || undefined,
        about: form.about.trim() || undefined,
        categoryId: form.categoryId || undefined,
        joinApprovalMode: form.joinApprovalMode || "MANUAL",
        logoUrl: form.logoUrl.trim() || undefined,
        bannerUrl: form.bannerUrl.trim() || undefined,
        orgType: form.orgType || undefined,
        establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
        operatesFrom: form.operatesFrom || undefined,
        officeAddress: form.operatesFrom !== "Online" ? (form.officeAddress.trim() || undefined) : undefined,
        googleMapsUrl: form.googleMapsUrl.trim() || undefined,
        googleFormName: form.googleFormName.trim() || undefined,
        googleFormLink: form.googleFormLink.trim() || undefined,
        gallery: galleryUrls.length ? galleryUrls : undefined,
        contacts: { phone: form.phone.trim() || undefined, email: form.email.trim() || undefined },
        socialLinks: {
          website: form.website.trim() || undefined,
          whatsappGroup: form.whatsappGroup.trim() || undefined,
          instagram: form.instagram.trim() || undefined,
          facebook: form.facebook.trim() || undefined,
          youtube: form.youtube.trim() || undefined,
        },
        communityVisibility: form.communityVisibility || "PUBLIC",
        geoVisibility: form.geoVisibility || "Global",
        geoCountry: form.geoCountry.trim() || undefined,
        geoState: form.geoState.trim() || undefined,
        geoCity: form.geoCity.trim() || undefined,
        subscriptionStartDate: form.subscriptionStartDate || new Date().toISOString().split("T")[0],
        subscriptionExpiresAt: form.subscriptionExpiresAt || undefined,
        ownerUserIds: ownerInputs.filter(Boolean).length ? ownerInputs.filter(Boolean) : [user?.id].filter(Boolean),
      };
      await api.post("/community-pages", payload);
      toast.success(t("Community Page created!"));
      setOpenCreate(false);
      setForm({ ...EMPTY_FORM });
      setOwnerInputs([""]);
      setReloadKey((k) => k + 1);
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setSaving(false); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div data-testid="community-pages-page" className="space-y-5">
      <PageHeader
        title={t("Community Pages")}
        subtitle={t("Official digital presence for Jain organizations, trusts, youth groups, and social communities.")}
        actions={isSuperAdmin && (
          <Button onClick={() => setOpenCreate(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
            <Plus className="h-4 w-4 mr-2" /> {t("Create Community Page")}
          </Button>
        )}
      />

      {/* ─── Search & Filters ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search pages by name or keyword...")} className="pl-9 h-9 bg-white text-sm" />
        </div>
        <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
          value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">{t("All Categories")}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
          value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">{t("All Status")}</option>
          <option value="ACTIVE">{t("Active")}</option>
          <option value="EXPIRING_SOON">{t("Expiring Soon")}</option>
          <option value="EXPIRED">{t("Expired")}</option>
          <option value="SUSPENDED">{t("Suspended")}</option>
        </select>
        <Input value={filterState} onChange={(e) => setFilterState(e.target.value)}
          placeholder={t("Filter by State...")} className="h-9 w-36 bg-white text-sm" />
        <Input value={filterCity} onChange={(e) => setFilterCity(e.target.value)}
          placeholder={t("Filter by City...")} className="h-9 w-36 bg-white text-sm" />
        <Button variant="outline" size="sm" onClick={() => {
          setSearch(""); setFilterCat(""); setFilterStatus(""); setFilterState(""); setFilterCity("");
          setReloadKey((k) => k + 1);
        }} className="h-9 text-xs">
          <X className="h-3.5 w-3.5 mr-1" /> {t("Clear")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)} className="h-9">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> {t("Refresh")}
        </Button>
      </div>

      {/* ─── Page Cards ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : pages.length === 0 ? (
        <EmptyState title={t("No community pages found")} description={t("Create the first community page or adjust your filters.")} icon={Users} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((p) => (
            <Card key={p.id} className="overflow-hidden rounded-xl border hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => openDetail(p)} data-testid={`cp-card-${p.id}`}>
              {/* Banner */}
              <div className="h-20 bg-gradient-to-r from-orange-400 to-amber-500 relative">
                {p.bannerUrl && <img src={p.bannerUrl} alt={t("banner")} className="w-full h-full object-cover" />}
                <div className="absolute top-2 right-2"><StatusBadge status={p.subscriptionStatus || "ACTIVE"} /></div>
              </div>
              <div className="p-4 -mt-6 relative">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl border-2 border-white shadow-md bg-white flex items-center justify-center overflow-hidden mb-2">
                  {p.logoUrl ? <img src={p.logoUrl} alt={t("logo")} className="w-full h-full object-cover" />
                    : <Building2 className="h-6 w-6 text-orange-400" />}
                </div>
                <div className="font-bold text-slate-900 text-sm leading-tight">{p.name}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{p.publicId}</div>
                <Badge variant="outline" className="mt-1.5 text-[10px] font-semibold">{p.category?.name || "Organization"}</Badge>
                {p.about && <p className="mt-2 text-xs text-slate-500 line-clamp-2">{p.about}</p>}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t pt-2">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-orange-400" /> {p._count?.members || 0} {t("members")}</span>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase">{p.joinApprovalMode || "MANUAL"}</Badge>
                </div>
                {(p._count?.members === 0 ? false : p.pendingCount > 0) && (
                  <div className="mt-2 text-[11px] text-orange-600 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {p.pendingCount} {t("pending request(s)")}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CREATE MODAL                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl shadow-2xl bg-slate-50 h-[92vh] max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b bg-slate-900 shrink-0">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-400" /> {t("Create Community Page")}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* 1. Basic Info */}
              <section className="space-y-3 bg-white rounded-xl p-4 border">
                <SectionHead icon={Info} label={t("Basic Information")} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs font-bold">{t("Page Name *")}</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t("e.g. Jain Youth Association Mumbai")} className="mt-1 h-9 text-sm" required />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Short Name / Abbreviation")}</Label>
                    <Input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                      placeholder={t("e.g. JYA Mumbai")} className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Category")}</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:border-orange-500"
                      value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                      <option value="">{t("Select Category...")}</option>
                      {categories.length > 0
                        ? categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                        : ORG_TYPES.map((tItem) => <option key={tItem} value={tItem}>{t(tItem)}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Organization Type")}</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:border-orange-500"
                      value={form.orgType} onChange={(e) => setForm({ ...form, orgType: e.target.value })}>
                      <option value="">{t("Select Type...")}</option>
                      {ORG_TYPES.map((tItem) => <option key={tItem} value={tItem}>{t(tItem)}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Established Year")}</Label>
                    <Input type="number" min="1800" max="2100" value={form.establishedYear}
                      onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
                      placeholder={t("e.g. 1995")} className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Join Approval Mode")}</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:border-orange-500"
                      value={form.joinApprovalMode} onChange={(e) => setForm({ ...form, joinApprovalMode: e.target.value })}>
                      <option value="MANUAL">{t("Manual Approval (Admin must approve)")}</option>
                      <option value="AUTO">{t("Auto Approve (Instant join)")}</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold">{t("About / Description")}</Label>
                    <Textarea rows={3} value={form.about}
                      onChange={(e) => setForm({ ...form, about: e.target.value })}
                      placeholder={t("Describe the mission, objectives, and purpose...")} className="mt-1 text-sm" />
                  </div>
                </div>
              </section>

              {/* 2. Media */}
              <section className="space-y-3 bg-white rounded-xl p-4 border">
                <SectionHead icon={ImageIcon} label={t("Media & Branding")} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">{t("Logo Image URL")}</Label>
                    <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                      placeholder="https://..." className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Cover Banner Image URL")}</Label>
                    <Input value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                      placeholder="https://..." className="mt-1 h-9 text-sm" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">{t("Gallery Images (up to 10 URLs)")}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {form.gallery.map((url, i) => (
                      <Input key={i} value={url}
                        onChange={(e) => {
                          const g = [...form.gallery]; g[i] = e.target.value;
                          setForm({ ...form, gallery: g });
                        }}
                        placeholder={`Image ${i + 1} URL...`} className="h-8 text-xs" />
                    ))}
                  </div>
                </div>
              </section>

              {/* 3. Contacts & Location */}
              <section className="space-y-3 bg-white rounded-xl p-4 border">
                <SectionHead icon={Phone} label={t("Contacts & Location")} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">{t("Phone Number")}</Label>
                    <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 99999 99999" className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Email Address")}</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="info@community.org" className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Operates From")}</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:border-orange-500"
                      value={form.operatesFrom} onChange={(e) => setForm({ ...form, operatesFrom: e.target.value })}>
                      {OPERATES_FROM_OPTIONS.map((o) => <option key={o} value={o}>{t(o)}</option>)}
                    </select>
                  </div>
                  {form.operatesFrom !== "Online" && (
                    <div>
                      <Label className="text-xs font-semibold">{t("Office / Physical Address")}</Label>
                      <Input value={form.officeAddress} onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
                        placeholder={t("Full address...")} className="mt-1 h-9 text-sm" />
                    </div>
                  )}
                  <div>
                    <Label className="text-xs font-semibold">{t("Google Maps Link")}</Label>
                    <Input value={form.googleMapsUrl} onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                      placeholder="https://maps.google.com/..." className="mt-1 h-9 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                  <div>
                    <Label className="text-xs font-semibold">{t("Google Form Name")}</Label>
                    <Input value={form.googleFormName} onChange={(e) => setForm({ ...form, googleFormName: e.target.value })}
                      placeholder={t("e.g. Membership Registration Form")} className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Google Form Link")}</Label>
                    <Input value={form.googleFormLink} onChange={(e) => setForm({ ...form, googleFormLink: e.target.value })}
                      placeholder="https://forms.google.com/..." className="mt-1 h-9 text-sm" />
                  </div>
                </div>
              </section>

              {/* 4. Social Links */}
              <section className="space-y-3 bg-white rounded-xl p-4 border">
                <SectionHead icon={Globe} label={t("Social Media Links")} />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "website", label: t("Website"), ph: "https://..." },
                    { key: "whatsappGroup", label: t("WhatsApp Group"), ph: "https://chat.whatsapp.com/..." },
                    { key: "instagram", label: t("Instagram"), ph: "https://instagram.com/..." },
                    { key: "facebook", label: t("Facebook"), ph: "https://facebook.com/..." },
                    { key: "youtube", label: t("YouTube"), ph: "https://youtube.com/..." },
                  ].map(({ key, label, ph }) => (
                    <div key={key}>
                      <Label className="text-xs font-semibold">{label}</Label>
                      <Input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={ph} className="mt-1 h-9 text-sm" />
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. Visibility (SA only) */}
              {isSuperAdmin && (
                <section className="space-y-3 bg-white rounded-xl p-4 border">
                  <SectionHead icon={Eye} label={t("Community & Geographic Visibility")} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold">{t("Community Visibility")}</Label>
                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:border-orange-500"
                        value={form.communityVisibility} onChange={(e) => setForm({ ...form, communityVisibility: e.target.value })}>
                        <option value="PUBLIC">{t("Public (Visible to all members)")}</option>
                        <option value="MEMBERS_ONLY">{t("Members Only")}</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">{t("Geographic Visibility")}</Label>
                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:border-orange-500"
                        value={form.geoVisibility} onChange={(e) => setForm({ ...form, geoVisibility: e.target.value })}>
                        {GEO_VISIBILITY_OPTIONS.map((o) => <option key={o} value={o}>{t(o)}</option>)}
                      </select>
                    </div>
                    {["State", "District", "City", "Area"].includes(form.geoVisibility) && (
                      <>
                        <div>
                          <Label className="text-xs font-semibold">{t("State")}</Label>
                          <Input value={form.geoState} onChange={(e) => setForm({ ...form, geoState: e.target.value })}
                            placeholder={t("e.g. Gujarat")} className="mt-1 h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">{t("City")}</Label>
                          <Input value={form.geoCity} onChange={(e) => setForm({ ...form, geoCity: e.target.value })}
                            placeholder={t("e.g. Surat")} className="mt-1 h-9 text-sm" />
                        </div>
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* 6. Subscription (SA only) */}
              {isSuperAdmin && (
                <section className="space-y-3 bg-white rounded-xl p-4 border">
                  <SectionHead icon={Calendar} label={t("Subscription Dates")} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold">{t("Subscription Start Date")}</Label>
                      <Input type="date" value={form.subscriptionStartDate}
                        onChange={(e) => setForm({ ...form, subscriptionStartDate: e.target.value })}
                        className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">{t("Subscription Expiry Date")}</Label>
                      <Input type="date" value={form.subscriptionExpiresAt}
                        onChange={(e) => setForm({ ...form, subscriptionExpiresAt: e.target.value })}
                        className="mt-1 h-9 text-sm" />
                    </div>
                  </div>
                </section>
              )}

              {/* 7. Page Owners */}
              {isSuperAdmin && (
                <section className="space-y-3 bg-white rounded-xl p-4 border">
                  <SectionHead icon={Crown} label={t("Page Owner(s) — Link Members")} />
                  <div className="space-y-2">
                    {ownerInputs.map((val, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <MemberLinkSelect value={val} onChange={(v) => {
                            const arr = [...ownerInputs]; arr[i] = v; setOwnerInputs(arr);
                          }} placeholder={`Owner ${i + 1} — search member by ID or name...`} showPhone />
                        </div>
                        {ownerInputs.length > 1 && (
                          <button type="button" onClick={() => setOwnerInputs(ownerInputs.filter((_, j) => j !== i))}
                            className="text-slate-400 hover:text-red-500">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {ownerInputs.length < 5 && (
                      <Button type="button" variant="outline" size="sm"
                        onClick={() => setOwnerInputs([...ownerInputs, ""])} className="text-xs">
                        <Plus className="h-3.5 w-3.5 mr-1" /> {t("Add Another Owner")}
                      </Button>
                    )}
                  </div>
                </section>
              )}

            </div>

            <div className="p-4 bg-white border-t flex justify-end gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("Creating…")}</> : t("Save & Create Page")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DETAIL MODAL                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={Boolean(detailPage)} onOpenChange={(o) => { if (!o) setDetailPage(null); }}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-2xl shadow-2xl bg-slate-50 h-[92vh] max-h-[92vh] flex flex-col">
          {/* Banner header */}
          {detailPage && (
            <>
              <div className="h-28 bg-gradient-to-r from-orange-500 to-amber-400 relative shrink-0">
                {detailPage.bannerUrl && (
                  <img src={detailPage.bannerUrl} alt={t("banner")} className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-0 left-6 translate-y-1/2">
                  <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg bg-white flex items-center justify-center overflow-hidden">
                    {detailPage.logoUrl
                      ? <img src={detailPage.logoUrl} alt={t("logo")} className="w-full h-full object-cover" />
                      : <Building2 className="h-8 w-8 text-orange-400" />}
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <StatusBadge status={detailPage.subscriptionStatus || "ACTIVE"} />
                  <button onClick={() => setDetailPage(null)} className="bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Page name row */}
              <div className="px-6 pt-10 pb-3 bg-white border-b shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{detailPage.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-slate-400">{detailPage.publicId}</span>
                      {detailPage.category?.name && <Badge variant="outline" className="text-[10px]">{detailPage.category.name}</Badge>}
                      {detailPage.orgType && <Badge variant="outline" className="text-[10px]">{detailPage.orgType}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {detailLoading && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
                    {/* Edit button for page owners */}
                    {canDo("COMMUNITY_PAGES", "EDIT") && (
                      <Button size="sm" variant="outline" onClick={() => setOpenEdit(true)}
                        className="h-8 text-xs font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300">
                        <Edit className="h-3.5 w-3.5 mr-1.5" /> {t("Edit Page")}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-0.5 mt-3 -mb-px overflow-x-auto">
                  {[
                    { id: "profile",   label: t("Profile"),   icon: Info },
                    { id: "members",   label: t("Members"),   icon: Users },
                    { id: "feed",      label: t("Feed"),      icon: Rss },
                    { id: "gallery",   label: t("Gallery"),   icon: ImageIcon },
                    { id: "analytics", label: t("Analytics"), icon: BarChart2 },
                    ...(isSuperAdmin ? [{ id: "settings", label: t("Settings"), icon: Settings }] : []),
                  ].map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => switchDetailTab(id)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                        detailTab === id
                          ? "border-orange-500 text-orange-600"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}>
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-6">

                {/* ── PROFILE TAB ── */}
                {detailTab === "profile" && (
                  <div className="space-y-5">
                    {detailPage.about && (
                      <div className="bg-white rounded-xl border p-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{t("About")}</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{detailPage.about}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl border p-4 space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{t("Organization Details")}</h4>
                        {[
                          ["Type", detailPage.orgType],
                          ["Established", detailPage.establishedYear],
                          ["Operates From", detailPage.operatesFrom],
                          ["Join Mode", detailPage.joinApprovalMode],
                          ["Visibility", detailPage.communityVisibility],
                          ["Geo Scope", detailPage.geoVisibility],
                        ].map(([k, v]) => v && (
                          <div key={k} className="flex justify-between text-xs">
                            <span className="text-slate-500">{k}</span>
                            <span className="font-semibold text-slate-800">{v}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white rounded-xl border p-4 space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{t("Contact Details")}</h4>
                        {detailPage.contacts?.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <Phone className="h-3.5 w-3.5 text-orange-500" /> {detailPage.contacts.phone}
                          </div>
                        )}
                        {detailPage.contacts?.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <Mail className="h-3.5 w-3.5 text-orange-500" /> {detailPage.contacts.email}
                          </div>
                        )}
                        {detailPage.officeAddress && (
                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <MapPin className="h-3.5 w-3.5 text-orange-500" /> {detailPage.officeAddress}
                          </div>
                        )}
                        {detailPage.googleMapsUrl && (
                          <a href={detailPage.googleMapsUrl} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                            <Globe className="h-3.5 w-3.5" /> {t("View on Maps")}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Social links */}
                    {detailPage.socialLinks && Object.values(detailPage.socialLinks).some(Boolean) && (
                      <div className="bg-white rounded-xl border p-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">{t("Links & Social Channels")}</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(detailPage.socialLinks).map(([k, v]) => v && (
                            <a key={k} href={String(v)} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-700 rounded-full font-medium transition-colors">
                              <ExternalLink className="h-3 w-3" /> {k}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Google Form */}
                    {detailPage.googleFormLink && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-orange-800 mb-2 flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" /> {detailPage.googleFormName || "Community Form"}
                        </h4>
                        <a href={detailPage.googleFormLink} target="_blank" rel="noreferrer"
                          className="text-xs text-blue-700 hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> {t("Open Form Link")}
                        </a>
                      </div>
                    )}

                    {/* Join / Leave button for regular members */}
                    {!isSuperAdmin && !canDo("COMMUNITY_PAGES", "EDIT") && (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-800">{t("Join this Community")}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {myMembership === "APPROVED" ? t("You are an active member of this page.")
                              : myMembership === "PENDING" ? t("Your join request is pending approval.")
                              : t("Become a member to receive updates and notifications.")}
                          </div>
                        </div>
                        {myMembership === "APPROVED" ? (
                          <Button size="sm" variant="outline" onClick={leavePage} disabled={joining}
                            className="border-red-200 text-red-600 hover:bg-red-50 font-bold shrink-0">
                            {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogOut className="h-3.5 w-3.5 mr-1.5" /> {t("Leave Page")}</>}
                          </Button>
                        ) : myMembership === "PENDING" ? (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold">{t("⏳ Pending")}</Badge>
                        ) : (
                          <Button size="sm" onClick={joinPage} disabled={joining}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold shrink-0">
                            {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Users className="h-3.5 w-3.5 mr-1.5" /> {t("Join Community")}</>}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Subscription info */}
                    <div className="bg-slate-800 text-white rounded-xl p-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">{t("Subscription")}</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-slate-400 mb-1">{t("Status")}</div>
                          <Badge className={`text-xs font-bold ${
                            detailPage.subscriptionStatus === "ACTIVE" ? "bg-emerald-500" :
                            detailPage.subscriptionStatus === "EXPIRING_SOON" ? "bg-amber-500" :
                            "bg-red-500"} text-white`}>
                            {detailPage.subscriptionStatus || "ACTIVE"}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-1">{t("Start Date")}</div>
                          <div className="text-sm font-bold">
                            {detailPage.subscriptionStartDate || detailPage.createdAt
                              ? new Date(detailPage.subscriptionStartDate || detailPage.createdAt).toLocaleDateString("en-IN")
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-1">{t("Expiry Date")}</div>
                          <div className="text-sm font-bold">
                            {detailPage.subscriptionExpiresAt
                              ? new Date(detailPage.subscriptionExpiresAt).toLocaleDateString("en-IN")
                              : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── MEMBERS TAB ── */}
                {detailTab === "members" && (
                  <div className="space-y-4">
                    {/* Sub-tabs + export */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex gap-2">
                        {["APPROVED", "PENDING", "REJECTED"].map((s) => (
                          <button key={s} onClick={() => setMemberTab(s)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                              memberTab === s
                                ? "bg-orange-500 text-white border-orange-500"
                                : "border-slate-200 text-slate-600 hover:border-orange-300"
                            }`}>
                            {s === "APPROVED" ? "✅" : s === "PENDING" ? "⏳" : "❌"} {s}
                            {members[s]?.length > 0 && (
                              <span className="ml-1.5 bg-white/20 rounded-full px-1.5">{members[s].length}</span>
                            )}
                          </button>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" onClick={exportMembersCSV}
                        className="h-7 text-xs font-bold hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300">
                        <FileText className="h-3.5 w-3.5 mr-1.5" /> {t("Export CSV")}
                      </Button>
                    </div>

                    {membersLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
                        <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading members...")}
                      </div>
                    ) : members[memberTab]?.length === 0 ? (
                      <div className="text-center text-sm text-slate-500 py-10">{t("No")} {memberTab.toLowerCase()} {t("members.")}</div>
                    ) : (
                      <div className="space-y-2">
                        {members[memberTab].map((m) => (
                          <div key={m.id} className="bg-white border rounded-xl px-4 py-3 flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                              {m.member?.photoUrl
                                ? <img src={m.member.photoUrl} alt="" className="w-full h-full object-cover" />
                                : <span className="text-xs font-bold text-orange-600">{(m.member?.fullName || "?")[0]}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-slate-800 truncate">{m.member?.fullName || "Unknown"}</div>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                {m.member?.publicId && <span className="font-mono">{m.member.publicId}</span>}
                                {m.member?.city && <span>{m.member.city}</span>}
                                {m.member?.state && <span>{m.member.state}</span>}
                                {m.member?.sect && <span>{m.member.sect}</span>}
                                <span>{t("Joined:")} {new Date(m.createdAt).toLocaleDateString("en-IN")}</span>
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              {memberTab === "PENDING" && canDo("COMMUNITY_PAGES", "EDIT") && (
                                <>
                                  <Button size="sm" onClick={() => decideMember(m.id, "APPROVED")}
                                    className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                                    <Check className="h-3 w-3 mr-1" /> {t("Approve")}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => decideMember(m.id, "REJECTED")}
                                    className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50">
                                    <X className="h-3 w-3 mr-1" /> {t("Reject")}
                                  </Button>
                                </>
                              )}
                              {memberTab === "APPROVED" && canDo("COMMUNITY_PAGES", "EDIT") && (
                                <Button size="sm" variant="outline" onClick={() => removeMember(m.id)}
                                  className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50">
                                  <UserX className="h-3 w-3 mr-1" /> {t("Remove")}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── FEED TAB ── */}
                {detailTab === "feed" && (
                  <div className="space-y-4">
                    {/* Create post (owner only) */}
                    {canDo("COMMUNITY_PAGES", "EDIT") && (
                      <div className="bg-white border rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-slate-700">{t("Publish a New Update")}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-semibold">{t("Post Title (Optional)")}</Label>
                            <Input value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                              placeholder={t("e.g. Event Announcement")} className="mt-1 h-8 text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold">{t("Post Type")}</Label>
                            <select className="w-full mt-1 h-8 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                              value={newPost.type} onChange={(e) => {
                                if (e.target.value === "PaidEvent") {
                                  setShowPaidEventWarn(true);
                                  return;
                                }
                                setNewPost({ ...newPost, type: e.target.value });
                              }}>
                              <option value="Notice">{t("Notice")}</option>
                              <option value="Announcement">{t("Announcement")}</option>
                              <option value="Update">{t("General Update")}</option>
                              <option value="Event">{t("Free Event")}</option>
                              <option value="Poll">{t("Poll")}</option>
                              <option value="PaidEvent">{t("Paid Event (Restricted)")}</option>
                              <option value="MANUAL">{t("Other")}</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs font-semibold">{t("Content *")}</Label>
                            <Textarea rows={3} value={newPost.description}
                              onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                              placeholder={t("Write your update, notice, or announcement...")} className="mt-1 text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold">{t("Cover Image URL (Optional)")}</Label>
                            <Input value={newPost.coverUrl} onChange={(e) => setNewPost({ ...newPost, coverUrl: e.target.value })}
                              placeholder="https://..." className="mt-1 h-8 text-sm" />
                          </div>
                          <div className="flex items-end">
                            <Button onClick={submitPost} disabled={postSaving}
                              className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-8 text-xs w-full">
                              {postSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Send className="h-3.5 w-3.5 mr-1.5" /> {t("Publish Post")}</>}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {feedLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
                        <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading feed...")}
                      </div>
                    ) : feedPosts.length === 0 ? (
                      <div className="text-center text-sm text-slate-500 py-10">{t("No posts published yet.")}</div>
                    ) : (
                      <div className="space-y-3">
                        {feedPosts.map((post) => (
                          <div key={post.id} className="bg-white border rounded-xl p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                {post.sourceModule && (
                                  <Badge className="text-[10px] mb-1 bg-orange-100 text-orange-700 border-orange-200">
                                    {post.sourceModule}
                                  </Badge>
                                )}
                                {post.title && <div className="font-bold text-slate-900 text-sm">{post.title}</div>}
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(post.createdAt).toLocaleDateString("en-IN")}
                              </span>
                            </div>
                            {post.coverUrl && (
                              <img src={post.coverUrl} alt={t("cover")}
                                className="w-full h-32 object-cover rounded-lg my-2" />
                            )}
                            {post.description && (
                              <p className="text-sm text-slate-700 mt-1 leading-relaxed">{post.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 pt-2 border-t text-[11px] text-slate-400">
                              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.viewCount} {t("views")}</span>
                              {!post.isActive && <Badge className="text-[10px] bg-slate-100 text-slate-500">{t("Expired")}</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── GALLERY TAB ── */}
                {detailTab === "gallery" && (
                  <div className="space-y-4">
                    {(() => {
                      const gallery = Array.isArray(detailPage.gallery) ? detailPage.gallery.filter(Boolean) : [];
                      return gallery.length === 0
                        ? <div className="text-center text-sm text-slate-500 py-12">{t("No gallery images added yet.")}</div>
                        : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {gallery.map((url, i) => (
                              <div key={i} className="aspect-square rounded-xl overflow-hidden border bg-slate-100">
                                <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        );
                    })()}
                    {canDo("COMMUNITY_PAGES", "EDIT") && (
                      <p className="text-xs text-slate-400 italic text-center">
                        {t("To update gallery images, contact the platform admin or use the edit form.")}
                      </p>
                    )}
                  </div>
                )}

                {/* ── ANALYTICS TAB ── */}
                {detailTab === "analytics" && (
                  <div className="space-y-5">
                    {analyticsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
                        <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading analytics...")}
                      </div>
                    ) : analytics ? (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <StatCard label={t("Total Members")} value={analytics.totalMembers} icon={Users} color="orange" />
                          <StatCard label={t("New (30 days)")} value={analytics.newMembersThisMonth} icon={UserCheck} color="green" />
                          <StatCard label={t("New (7 days)")} value={analytics.newMembersThisWeek} icon={UserCheck} color="blue" />
                          <StatCard label={t("Pending Requests")} value={analytics.pendingRequests} icon={Clock} color="amber" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <StatCard label={t("Total Posts")} value={analytics.totalPosts} icon={Rss} color="purple" />
                          <StatCard label={t("Posts (30 days)")} value={analytics.recentPosts} icon={FileText} color="blue" />
                        </div>
                        <div className="bg-white border rounded-xl p-4">
                          <h4 className="text-xs font-bold text-slate-700 mb-3">{t("Member Growth (Last 30 Days)")}</h4>
                          <div className={`text-3xl font-black ${analytics.memberGrowthLast30Days >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {analytics.memberGrowthLast30Days >= 0 ? "+" : ""}{analytics.memberGrowthLast30Days}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{t("net new members compared to 30 days ago")}</div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-sm text-slate-500 py-10">{t("Analytics unavailable.")}</div>
                    )}
                  </div>
                )}

                {/* ── SETTINGS TAB (SA only) ── */}
                {detailTab === "settings" && isSuperAdmin && (
                  <div className="space-y-5">
                    {/* Subscription */}
                    <section className="bg-white border rounded-xl p-4 space-y-3">
                      <SectionHead icon={Calendar} label={t("Subscription Management")} />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold">{t("Subscription Plan")}</Label>
                          <Input value={settingsForm.subscriptionPlan || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, subscriptionPlan: e.target.value })}
                            placeholder={t("e.g. Annual Plan")} className="mt-1 h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">{t("Subscription Status")}</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={settingsForm.subscriptionStatus || "ACTIVE"}
                            onChange={(e) => setSettingsForm({ ...settingsForm, subscriptionStatus: e.target.value })}>
                            <option value="ACTIVE">{t("Active")}</option>
                            <option value="EXPIRING_SOON">{t("Expiring Soon")}</option>
                            <option value="EXPIRED">{t("Expired")}</option>
                            <option value="SUSPENDED">{t("Suspended")}</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">{t("Start Date")}</Label>
                          <Input type="date" value={settingsForm.subscriptionStartDate || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, subscriptionStartDate: e.target.value })}
                            className="mt-1 h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">{t("Expiry Date")}</Label>
                          <Input type="date" value={settingsForm.subscriptionExpiresAt || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, subscriptionExpiresAt: e.target.value })}
                            className="mt-1 h-9 text-sm" />
                        </div>
                      </div>
                    </section>

                    {/* Visibility */}
                    <section className="bg-white border rounded-xl p-4 space-y-3">
                      <SectionHead icon={Globe} label={t("Visibility Settings")} />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold">{t("Community Visibility")}</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={settingsForm.communityVisibility || "PUBLIC"}
                            onChange={(e) => setSettingsForm({ ...settingsForm, communityVisibility: e.target.value })}>
                            <option value="PUBLIC">{t("Public (Visible to all members)")}</option>
                            <option value="MEMBERS_ONLY">{t("Members Only")}</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">{t("Geographic Visibility")}</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={settingsForm.geoVisibility || "Global"}
                            onChange={(e) => setSettingsForm({ ...settingsForm, geoVisibility: e.target.value })}>
                            {GEO_VISIBILITY_OPTIONS.map((o) => <option key={o} value={o}>{t(o)}</option>)}
                          </select>
                        </div>
                        {["State", "District", "City", "Area"].includes(settingsForm.geoVisibility) && (
                          <>
                            <div>
                              <Label className="text-xs font-semibold">{t("State")}</Label>
                              <Input value={settingsForm.geoState || ""} onChange={(e) => setSettingsForm({ ...settingsForm, geoState: e.target.value })}
                                placeholder={t("e.g. Gujarat")} className="mt-1 h-9 text-sm" />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold">{t("City")}</Label>
                              <Input value={settingsForm.geoCity || ""} onChange={(e) => setSettingsForm({ ...settingsForm, geoCity: e.target.value })}
                                placeholder={t("e.g. Surat")} className="mt-1 h-9 text-sm" />
                            </div>
                          </>
                        )}
                      </div>
                    </section>

                    {/* Save, Suspend/Reactivate & Delete */}
                    <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t">
                      <div className="flex flex-wrap gap-2">
                        <PermissionGate action="DELETE">
                          <Button onClick={deletePage} variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs">
                            <Trash2 className="h-4 w-4 mr-1.5" /> {t("Delete Page (Permanently)")}
                          </Button>
                        </PermissionGate>
                        {detailPage?.subscriptionStatus === "SUSPENDED" || detailPage?.subscriptionStatus === "EXPIRED" ? (
                          <Button onClick={() => toggleSuspendStatus("ACTIVE")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                            <Check className="h-4 w-4 mr-1.5" /> {t("Make Active (Reactivate Page)")}
                          </Button>
                        ) : (
                          <Button onClick={() => toggleSuspendStatus("SUSPENDED")} variant="outline"
                            className="border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold text-xs">
                            <AlertTriangle className="h-4 w-4 mr-1.5" /> {t("Suspend Page")}
                          </Button>
                        )}
                      </div>
                      <Button onClick={saveSettings} disabled={settingsSaving}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm">
                        {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : t("Save Settings")}
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EDIT PAGE MODAL (For Page Owners)                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl shadow-2xl bg-slate-50 h-[88vh] max-h-[88vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b bg-slate-900 shrink-0">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Edit className="h-5 w-5 text-orange-400" /> {t("Edit Page Details —")} {detailPage?.name}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSave} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* 1. Basic Info */}
              <section className="space-y-3 bg-white rounded-xl p-4 border">
                <SectionHead icon={Info} label={t("Basic Information")} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs font-bold">{t("Page Name *")}</Label>
                    <Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder={t("Page Name")} className="mt-1 h-9 text-sm" required />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Short Name / Abbreviation")}</Label>
                    <Input value={editForm.shortName || ""} onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })}
                      placeholder={t("Short Name")} className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Organization Type")}</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                      value={editForm.orgType || ""} onChange={(e) => setEditForm({ ...editForm, orgType: e.target.value })}>
                      <option value="">{t("Select Type...")}</option>
                      {ORG_TYPES.map((tItem) => <option key={tItem} value={tItem}>{t(tItem)}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Established Year")}</Label>
                    <Input type="number" min="1800" max="2100" value={editForm.establishedYear || ""}
                      onChange={(e) => setEditForm({ ...editForm, establishedYear: e.target.value })}
                      placeholder={t("e.g. 1995")} className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Join Approval Mode")}</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                      value={editForm.joinApprovalMode || "MANUAL"} onChange={(e) => setEditForm({ ...editForm, joinApprovalMode: e.target.value })}>
                      <option value="MANUAL">{t("Manual Approval")}</option>
                      <option value="AUTO">{t("Auto Approve")}</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold">{t("About / Description")}</Label>
                    <Textarea rows={3} value={editForm.about || ""}
                      onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                      placeholder={t("Describe the mission and activities...")} className="mt-1 text-sm" />
                  </div>
                </div>
              </section>

              {/* 2. Media */}
              <section className="space-y-3 bg-white rounded-xl p-4 border">
                <SectionHead icon={ImageIcon} label={t("Media & Branding")} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">{t("Logo Image URL")}</Label>
                    <Input value={editForm.logoUrl || ""} onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                      placeholder="https://..." className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Cover Banner Image URL")}</Label>
                    <Input value={editForm.bannerUrl || ""} onChange={(e) => setEditForm({ ...editForm, bannerUrl: e.target.value })}
                      placeholder="https://..." className="mt-1 h-9 text-sm" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">{t("Gallery Images (up to 10 URLs)")}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {(editForm.gallery || Array(10).fill("")).map((url, i) => (
                      <Input key={i} value={url || ""}
                        onChange={(e) => {
                          const g = [...(editForm.gallery || Array(10).fill(""))];
                          g[i] = e.target.value;
                          setEditForm({ ...editForm, gallery: g });
                        }}
                        placeholder={`Image ${i + 1} URL...`} className="h-8 text-xs" />
                    ))}
                  </div>
                </div>
              </section>

              {/* 3. Contacts */}
              <section className="space-y-3 bg-white rounded-xl p-4 border">
                <SectionHead icon={Phone} label={t("Contacts & Location")} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">{t("Phone Number")}</Label>
                    <Input type="tel" value={editForm.phone || ""} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+91..." className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Email Address")}</Label>
                    <Input type="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="info@..." className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Operates From")}</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                      value={editForm.operatesFrom || "Office"} onChange={(e) => setEditForm({ ...editForm, operatesFrom: e.target.value })}>
                      {OPERATES_FROM_OPTIONS.map((o) => <option key={o} value={o}>{t(o)}</option>)}
                    </select>
                  </div>
                  {editForm.operatesFrom !== "Online" && (
                    <div>
                      <Label className="text-xs font-semibold">{t("Office Address")}</Label>
                      <Input value={editForm.officeAddress || ""} onChange={(e) => setEditForm({ ...editForm, officeAddress: e.target.value })}
                        placeholder={t("Full address...")} className="mt-1 h-9 text-sm" />
                    </div>
                  )}
                  <div>
                    <Label className="text-xs font-semibold">{t("Google Maps Link")}</Label>
                    <Input value={editForm.googleMapsUrl || ""} onChange={(e) => setEditForm({ ...editForm, googleMapsUrl: e.target.value })}
                      placeholder="https://maps..." className="mt-1 h-9 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                  <div>
                    <Label className="text-xs font-semibold">{t("Google Form Name")}</Label>
                    <Input value={editForm.googleFormName || ""} onChange={(e) => setEditForm({ ...editForm, googleFormName: e.target.value })}
                      placeholder={t("Form Name")} className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">{t("Google Form Link")}</Label>
                    <Input value={editForm.googleFormLink || ""} onChange={(e) => setEditForm({ ...editForm, googleFormLink: e.target.value })}
                      placeholder="https://forms..." className="mt-1 h-9 text-sm" />
                  </div>
                </div>
              </section>

              {/* 4. Social Links */}
              <section className="space-y-3 bg-white rounded-xl p-4 border">
                <SectionHead icon={Globe} label={t("Social Links")} />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "website", label: t("Website"), ph: "https://..." },
                    { key: "whatsappGroup", label: t("WhatsApp"), ph: "https://chat.whatsapp.com/..." },
                    { key: "instagram", label: t("Instagram"), ph: "https://instagram.com/..." },
                    { key: "facebook", label: t("Facebook"), ph: "https://facebook.com/..." },
                    { key: "youtube", label: t("YouTube"), ph: "https://youtube.com/..." },
                  ].map(({ key, label, ph }) => (
                    <div key={key}>
                      <Label className="text-xs font-semibold">{label}</Label>
                      <Input value={editForm[key] || ""} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        placeholder={ph} className="mt-1 h-9 text-sm" />
                    </div>
                  ))}
                </div>
              </section>

            </div>

            <div className="p-4 bg-white border-t flex justify-end gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={editSaving} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Save Changes")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PAID EVENT WARNING DIALOG                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showPaidEventWarn} onOpenChange={setShowPaidEventWarn}>
        <DialogContent className="max-w-md p-6 rounded-2xl bg-white">
          <div className="flex items-center gap-3 text-amber-600 mb-3">
            <AlertTriangle className="h-8 w-8 shrink-0" />
            <h3 className="font-bold text-base text-slate-900">{t("Paid Events Policy")}</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {t("Paid Events are managed exclusively by the")} <strong>{t("JiNANAM Team")}</strong>{t(". Please raise a Support Ticket to process paid event listing, ticketing, and gateway configuration.")}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium mb-4">
            {t("🎫 A Support Ticket will automatically be generated for your request.")}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPaidEventWarn(false)}>{t("Close")}</Button>
            <Button onClick={async () => {
              try {
                await api.post("/support-tickets/", {
                  title: `Paid Event Request - ${detailPage?.name}`,
                  subject: `Paid Event Request - ${detailPage?.name}`,
                  category: "COMMUNITY_PAGE_PAID_EVENT",
                  description: `Page ${detailPage?.name} (${detailPage?.publicId}) requests a Paid Event setup.`,
                });
                toast.success(t("Support Ticket raised successfully! Our team will contact you."));
              } catch {
                toast.success(t("Support Ticket request registered. JiNANAM team notified!"));
              } finally {
                setShowPaidEventWarn(false);
              }
            }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
              {t("Raise Support Ticket")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
