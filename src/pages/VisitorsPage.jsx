import { useEffect, useState, useRef } from "react";
import { api, extractErrorMessage, API_BASE } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toOptions } from "@/constants/dropdownOptions";
import {
  Search,
  ScanLine,
  LogOut,
  Users,
  Car,
  UserCheck,
  Download,
  Camera,
  X,
  Loader2,
  AlertTriangle,
  Globe,
  Wifi,
  WifiOff,
  Clock,
  FileText,
  User,
  ShieldAlert,
  ArrowRightLeft,
  Calendar,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTime, initials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgs } from "@/hooks/useOrgs";
import { OrgSelect } from "@/components/common/OrgSelect";
import { useSocket } from "@/hooks/useSocket";
import { LiveBadge } from "@/components/common/LiveBadge";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VisitorsPage() {
  const { t } = useLanguage();
  const { canDo, user, isSuperAdmin } = useAuth();
  const { orgs } = useOrgs();
  const [selectedOrg, setSelectedOrg] = useState("");
  const orgId = user?.organizationIds?.[0] || selectedOrg || (isSuperAdmin ? orgs[0]?.id : undefined);

  const [live, setLive] = useState([]);
  const [history, setHistory] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reload, setReload] = useState(0);

  // Advanced Filters for Admin Search
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVisitType, setFilterVisitType] = useState("all");
  const [filterVehicleType, setFilterVehicleType] = useState("all");
  const [filterVisitStatus, setFilterVisitStatus] = useState("all");
  const [filterVerification, setFilterVerification] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");

  // Offline Simulation Mode State
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("JINANAM_OFFLINE_VISITORS") || "[]");
    } catch {
      return [];
    }
  });

  // Check-In dialog state
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [entryType, setEntryType] = useState("MEMBER");
  
  // Form fields
  const [memberPublicId, setMemberPublicId] = useState("");
  const [passengerPublicIds, setPassengerPublicIds] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorMobile, setVisitorMobile] = useState("");
  const [visitorAddress, setVisitorAddress] = useState("");
  const [visitorArea, setVisitorArea] = useState("");
  const [visitorCity, setVisitorCity] = useState("");
  const [visitorState, setVisitorState] = useState("");
  const [visitorPincode, setVisitorPincode] = useState("");
  const [numberOfVisitors, setNumberOfVisitors] = useState(1);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [visitType, setVisitType] = useState("Day Visit");
  const [visitorCategory, setVisitorCategory] = useState("Non Member");
  const [purpose, setPurpose] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Member lookup state (Privacy Restricted)
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);

  const fileRef = useRef(null);

  // Save offline queue to localStorage
  useEffect(() => {
    localStorage.setItem("JINANAM_OFFLINE_VISITORS", JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Real-time visitor stream — /visitors namespace
  const { connected } = useSocket(
    "/visitors",
    {
      "visitor:in": (evt) => {
        if (!evt || (orgId && evt.orgId && evt.orgId !== orgId)) return;
        setLive((prev) => [{ ...evt, checkInAt: evt.timestamp || new Date().toISOString() }, ...prev]);
        toast.success(`Visitor checked in: ${evt.name || evt.visitorName || evt.publicId || "guest"}`);
        setReload((k) => k + 1);
      },
      "visitor:out": (evt) => {
        if (!evt || (orgId && evt.orgId && evt.orgId !== orgId)) return;
        setLive((prev) => prev.filter((r) => r.id !== evt.entryId));
        setReload((k) => k + 1);
        toast.info(`Visitor checked out: ${evt.name || evt.visitorName || "guest"}`);
      },
    },
    { query: { organizationId: orgId }, enabled: Boolean(orgId) }
  );

  const resetForm = () => {
    setEntryType("MEMBER");
    setMemberPublicId("");
    setPassengerPublicIds("");
    setVisitorName("");
    setVisitorMobile("");
    setVisitorAddress("");
    setVisitorArea("");
    setVisitorCity("");
    setVisitorState("");
    setVisitorPincode("");
    setNumberOfVisitors(1);
    setVehicleNumber("");
    setVehicleType("Car");
    setVisitType("Day Visit");
    setVisitorCategory("Non Member");
    setPurpose("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setLookupResult(null);
  };

  const loadData = async () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    try {
      const liveRes = await api.get(`/visitors/live/${orgId}`).catch(() => ({ data: { data: [] } }));
      
      // Load history with advanced query parameters
      const params = {
        page: 1,
        pageSize: 50,
        visitorCategory: filterCategory !== "all" ? filterCategory : undefined,
        visitType: filterVisitType !== "all" ? filterVisitType : undefined,
        vehicleType: filterVehicleType !== "all" ? filterVehicleType : undefined,
        visitStatus: filterVisitStatus !== "all" ? filterVisitStatus : undefined,
        memberVerification: filterVerification !== "all" ? filterVerification : undefined,
      };

      if (filterDateRange !== "all") {
        const now = new Date();
        if (filterDateRange === "today") {
          const from = new Date(); from.setHours(0, 0, 0, 0);
          params.from = from.toISOString();
        } else if (filterDateRange === "yesterday") {
          const from = new Date(); from.setDate(from.getDate() - 1); from.setHours(0, 0, 0, 0);
          const to = new Date(); to.setDate(to.getDate() - 1); to.setHours(23, 59, 59, 999);
          params.from = from.toISOString();
          params.to = to.toISOString();
        } else if (filterDateRange === "week") {
          const from = new Date(); from.setDate(from.getDate() - 7);
          params.from = from.toISOString();
        } else if (filterDateRange === "month") {
          const from = new Date(); from.setDate(from.getDate() - 30);
          params.from = from.toISOString();
        }
      }

      const historyRes = await api.get(`/visitors/search/${orgId}`, { params }).catch(() => ({ data: { data: [] } }));
      const analyticsRes = await api.get(`/visitors/analytics/${orgId}`).catch(() => ({ data: { data: null } }));
      const memberHistoryRes = await api.get(`/visitors/my-history`).catch(() => ({ data: { data: [] } }));

      setLive(liveRes.data?.data?.items || liveRes.data?.data || []);
      setHistory(historyRes.data?.data?.items || historyRes.data?.data || []);
      setAnalytics(analyticsRes.data?.data || null);
      setMyHistory(memberHistoryRes.data?.data || []);
    } catch (e) {
      toast.error(t("Failed to load visitor records"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, reload, filterCategory, filterVisitType, filterVehicleType, filterVisitStatus, filterVerification, filterDateRange]);

  // Handle Online/Offline mode transition
  const handleOfflineToggle = async (checked) => {
    setIsOffline(checked);
    if (!checked) {
      // Reconnected! Automatically trigger background sync
      if (offlineQueue.length === 0) {
        toast.success(t("Connection restored. No offline items to sync."));
        return;
      }
      toast.loading(t("Internet restored. Synchronizing offline entries..."), { id: "sync" });
      try {
        const payload = { entries: offlineQueue };
        const res = await api.post("/visitors/sync", payload);
        const results = res.data?.data || [];
        const successCount = results.filter(r => r.success).length;
        
        toast.success(`Successfully synchronized ${successCount} offline visitor entries!`, { id: "sync" });
        setOfflineQueue([]);
        setReload(k => k + 1);
      } catch (err) {
        toast.error(t("Offline sync failed. Will retry in background."), { id: "sync" });
      }
    } else {
      toast.warning(t("Offline Mode activated. Entries will be stored locally."));
    }
  };

  const handleLookup = async () => {
    if (!memberPublicId.trim()) { toast.error(t("Please enter a Member ID.")); return; }
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await api.get(`/visitors/member-lookup`, { params: { q: memberPublicId } });
      setLookupResult(res.data?.data || null);
      toast.success("Member found: " + (res.data?.data?.fullName || ""));
    } catch (e) {
      toast.error(extractErrorMessage(e) || "No active member found for this ID");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) { toast.error(t("Please select an organization first.")); return; }
    
    // Validations
    if (!vehicleNumber.trim()) {
      toast.error(t("Vehicle Number is required. Enter Walk-In if on foot."));
      return;
    }

    setSubmitting(true);
    const idempotencyKey = "v_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    
    const payload = {
      organizationId: orgId,
      entryType,
      memberPublicId: entryType === "MEMBER" ? memberPublicId : undefined,
      visitorName: entryType !== "MEMBER" ? visitorName : undefined,
      visitorMobile: entryType !== "MEMBER" ? visitorMobile : undefined,
      visitorAddress: visitorAddress || undefined,
      visitorArea: visitorArea || undefined,
      visitorCity: visitorCity || undefined,
      visitorState: visitorState || undefined,
      visitorPincode: visitorPincode || undefined,
      numberOfVisitors: Number(numberOfVisitors) || 1,
      vehicleNumber: vehicleNumber.trim(),
      vehicleType,
      visitType,
      visitorCategory: entryType === "MEMBER" ? "Member" : visitorCategory,
      purpose: purpose || undefined,
      idempotencyKey,
      passengerMemberIds: passengerPublicIds || undefined,
      checkInAt: new Date().toISOString()
    };

    if (isOffline) {
      // Offline mode: save in local queue with temporary local entry ID
      const tempId = `TEMP-${new Date().toISOString().slice(0,10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
      const offlineEntry = {
        ...payload,
        id: tempId,
        publicId: tempId,
        syncStatus: "PENDING_SYNC",
        member: lookupResult ? { fullName: lookupResult.fullName, publicId: lookupResult.publicId } : null
      };

      setOfflineQueue(prev => [...prev, offlineEntry]);
      toast.success(t("Visitor Checked In Locally (Offline Mode Saved)"));
      setCheckInOpen(false);
      resetForm();
      setSubmitting(false);
      return;
    }

    try {
      let uploadedPhotoUrl = "";
      if (photoFile) {
        const fd = new FormData();
        fd.append("photo", photoFile);
        const uploadRes = await api.post(`/visitors/photo`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedPhotoUrl = uploadRes.data?.data?.photoUrl || "";
      }

      payload.photoUrl = uploadedPhotoUrl || undefined;

      await api.post(`/visitors/check-in`, payload);
      toast.success(t("Visitor Checked In successfully!"));
      setCheckInOpen(false);
      resetForm();
      setReload((k) => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e) || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const checkOut = async (entryId) => {
    if (isOffline && entryId.startsWith("TEMP-")) {
      // Offline Check-Out simulation: mark checkOutAt locally
      setOfflineQueue(prev => prev.map(item => {
        if (item.id === entryId) {
          const checkOutAt = new Date().toISOString();
          const duration = Math.round((new Date(checkOutAt).getTime() - new Date(item.checkInAt).getTime()) / 60000);
          return { ...item, checkOutAt, visitDuration: duration };
        }
        return item;
      }).filter(item => !item.checkOutAt)); // Remove from currently inside list
      
      toast.success(t("Visitor Checked Out Locally (Offline Saved)"));
      return;
    }

    try {
      await api.post(`/visitors/check-out/${entryId}`);
      toast.success(t("Checked out successfully."));
      setReload((k) => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const doExport = async (format) => {
    if (!orgId) { toast.error(t("Please select an organization first.")); return; }
    setExporting(true);
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const res = await fetch(`${API_BASE}/visitors/search/${orgId}/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `visitor-entries-${orgId}-${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xlsx" : "csv"}`;
      a.click();
      toast.success(t("Visitor report exported successfully."));
    } catch (e) {
      toast.error(t("Export failed"));
    } finally {
      setExporting(false);
    }
  };

  // Combine live database entries and offline pending entries for live rendering
  const combinedLive = [
    ...offlineQueue.filter(o => !o.checkOutAt),
    ...live
  ];

  const filteredLive = q
    ? combinedLive.filter((r) =>
        [r.visitorName, r.vehicleNumber, r.publicId, r.member?.fullName]
          .some((val) => val?.toLowerCase().includes(q.toLowerCase()))
      )
    : combinedLive;

  const filteredHistory = q
    ? history.filter((r) =>
        [r.visitorName, r.vehicleNumber, r.publicId, r.member?.fullName]
          .some((val) => val?.toLowerCase().includes(q.toLowerCase()))
      )
    : history;

  // Columns Definitions
  const liveColumns = [
    {
      key: "publicId",
      header: t("Entry ID"),
      render: (r) => (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="font-mono text-[9px] w-fit">{r.publicId || "—"}</Badge>
          {r.syncStatus === "PENDING_SYNC" && (
            <Badge className="bg-amber-100 text-amber-800 text-[8px] border-amber-300 w-fit">{t("Offline Saved")}</Badge>
          )}
        </div>
      )
    },
    { key: "type", header: t("Type"), render: (r) => <Badge className="text-[10px] font-bold" variant="secondary">{r.entryType || "MEMBER"}</Badge> },
    {
      key: "name",
      header: t("Name"),
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm">{r.member?.fullName || r.visitorName || "—"}</div>
          <div className="text-[10px] text-slate-400 font-mono-num">{r.member?.publicId || "Manual Visitor"}</div>
        </div>
      )
    },
    { key: "vehicle", header: t("Vehicle"), render: (r) => (
      <div>
        <div className="font-bold text-slate-700 text-xs">{r.vehicleNumber || "—"}</div>
        <div className="text-[9px] text-slate-400">{r.vehicleType || "—"}</div>
      </div>
    )},
    { key: "visitType", header: t("Stay"), render: (r) => (
      <Badge variant="outline" className={r.visitType === "Stay" ? "border-indigo-200 text-indigo-700 bg-indigo-50" : "border-slate-200 text-slate-600 bg-slate-50"}>
        {r.visitType || "Day Visit"}
      </Badge>
    )},
    {
      key: "checkIn",
      header: t("Check-In At"),
      render: (r) => (
        <div className="text-xs text-slate-500 font-medium">
          {formatDateTime(r.checkInAt)}
        </div>
      )
    },
    {
      key: "actions",
      header: t("Action"),
      render: (r) => (
        <Button
          size="sm"
          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-none font-bold h-8 text-xs"
          onClick={(e) => { e.stopPropagation(); checkOut(r.publicId || r.id); }}
          data-testid={`visitor-checkout-${r.id}`}
        >
          <LogOut className="h-3 w-3 mr-1" /> OUT
        </Button>
      )
    }
  ];

  const historyColumns = [
    { key: "publicId", header: t("Entry ID"), render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId || "—"}</Badge> },
    { key: "type", header: t("Type"), render: (r) => <Badge variant="secondary" className="text-[10px]">{r.entryType || "MEMBER"}</Badge> },
    {
      key: "name",
      header: t("Name"),
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-850 text-xs">{r.member?.fullName || r.visitorName || "—"}</div>
          <div className="text-[10px] text-slate-400 font-mono-num">{r.visitorCategory || r.entryType}</div>
        </div>
      )
    },
    { key: "vehicle", header: t("Vehicle"), render: (r) => <span className="font-bold text-slate-700 text-xs font-mono">{r.vehicleNumber || "—"}</span> },
    {
      key: "checkIn",
      header: t("Checked In"),
      render: (r) => <span className="text-xs font-medium text-slate-500">{formatDateTime(r.checkInAt)}</span>
    },
    {
      key: "checkOut",
      header: t("Checked Out"),
      render: (r) => <span className="text-xs font-medium text-slate-500">{r.checkOutAt ? formatDateTime(r.checkOutAt) : "—"}</span>
    },
    {
      key: "duration",
      header: t("Duration"),
      render: (r) => (
        <span className="font-semibold text-xs text-indigo-700 font-mono-num">
          {r.visitDuration ? `${r.visitDuration} mins` : "—"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6" data-testid="visitors-page">
      {/* polymorphic facility banner info */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-orange-600 to-amber-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-amber-200" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">{t("Visitor Management Registry")}</h1>
          </div>
          <p className="text-orange-100 text-xs mt-1 max-w-lg">
            {t("Polymorphic Visitor tracking across Temples, Dharamshalas, Jain Centres, and trust premises.")}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Offline Mode Switch */}
          <div className="flex items-center gap-2 bg-black/20 px-3.5 py-1.5 rounded-full border border-orange-500/50">
            {isOffline ? (
              <WifiOff className="h-4 w-4 text-rose-300 animate-pulse" />
            ) : (
              <Wifi className="h-4 w-4 text-emerald-300" />
            )}
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {isOffline ? t("Offline Sim Active") : t("Online Mode")}
            </span>
            <input
              type="checkbox"
              checked={isOffline}
              onChange={(e) => handleOfflineToggle(e.target.checked)}
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer ml-1"
            />
          </div>

          <LiveBadge connected={connected && !isOffline} testId="visitors-live-status" />
          
          {canDo("VISITORS", "CREATE") && (
            <Button
              onClick={() => { resetForm(); setCheckInOpen(true); }}
              data-testid="visitors-checkin-button"
              className="bg-white hover:bg-orange-50 text-orange-700 font-bold h-10 px-5 shadow-md border border-white"
            >
              <ScanLine className="h-4 w-4 mr-2" /> {t("New Check-In")}
            </Button>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <div className="max-w-xs">
          <OrgSelect value={orgId} onChange={setSelectedOrg} label={t("Select Active Facility Location")} testId="visitors-org-select" />
        </div>
      )}

      {/* Main Mode Tabs: Security Guard Console vs Temple Admin Dashboard */}
      <Tabs defaultValue="guard_console">
        <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="guard_console" className="px-5 py-2 font-bold text-xs rounded-lg">{t("🛡️ Security Guard Console")}</TabsTrigger>
          <TabsTrigger value="admin_portal" className="px-5 py-2 font-bold text-xs rounded-lg">{t("📊 Temple Admin Portal")}</TabsTrigger>
          <TabsTrigger value="member_history" className="px-5 py-2 font-bold text-xs rounded-lg">{t("👤 My Visit History")}</TabsTrigger>
        </TabsList>

        {/* Tab 1: Security Guard Console View */}
        <TabsContent value="guard_console" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label={t("Visitors Currently Inside")} value={combinedLive.reduce((acc, curr) => acc + (curr.numberOfVisitors || 1), 0).toString()} icon={Users} tone="green" />
            <StatCard label={t("Active Vehicles Inside")} value={combinedLive.filter(v => v.vehicleNumber && !['walk-in', 'no vehicle', 'none', ''].includes(v.vehicleNumber.toLowerCase().trim())).length.toString()} icon={Car} tone="primary" />
            <StatCard label={t("Today's Check-Ins")} value={analytics?.todaysCheckIns?.toString() || "0"} icon={UserCheck} tone="default" />
            <StatCard label={t("Pending Offline Sync")} value={offlineQueue.length.toString()} icon={AlertTriangle} tone={offlineQueue.length > 0 ? "warning" : "default"} />
          </div>

          <Card className="p-4 border border-slate-200 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{t("Live Active Premises Feed")}</h3>
                <p className="text-[11px] text-slate-400">{t("Scan or search visitor check-ins currently inside the gate.")}</p>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("Quick search vehicle, ID...")}
                  className="pl-8 text-xs bg-slate-50 border-slate-200 h-9 rounded-lg"
                />
              </div>
            </div>

            <DataTable
              columns={liveColumns}
              rows={filteredLive}
              loading={loading}
              testId="visitors-live-table"
              emptyTitle={t("No visitors inside")}
              emptyDescription={t("Gate is clear. Select New Check-In to record arriving visitors.")}
            />
          </Card>
        </TabsContent>

        {/* Tab 2: Temple Admin Portal Dashboard & Reports */}
        <TabsContent value="admin_portal" className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
            <div className="p-3 text-center space-y-1 border-r last:border-0 border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1"><Clock className="h-3 w-3" /> {t("Peak Visiting Hour")}</div>
              <div className="text-xl font-black text-slate-800">{analytics?.peakVisitingHour || "—"}</div>
            </div>
            <div className="p-3 text-center space-y-1 border-r last:border-0 border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1"><ArrowRightLeft className="h-3 w-3 text-indigo-500" /> {t("Avg Stays Duration")}</div>
              <div className="text-xl font-black text-indigo-700">{analytics?.avgDurationMinutes ? `${analytics.avgDurationMinutes} mins` : "—"}</div>
            </div>
            <div className="p-3 text-center space-y-1 border-r last:border-0 border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1"><UserCheck className="h-3 w-3 text-emerald-500" /> {t("Repeat Devotees")}</div>
              <div className="text-xl font-black text-emerald-700">{analytics?.repeatVisitors || "0"}</div>
            </div>
            <div className="p-3 text-center space-y-1 border-r last:border-0 border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1"><Users className="h-3 w-3 text-amber-500" /> {t("Monthly Total")}</div>
              <div className="text-xl font-black text-slate-800">{history.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Filters panel */}
            <Card className="col-span-12 md:col-span-3 p-4 border border-slate-200 bg-white rounded-xl space-y-4">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">{t("📋 Filters & Exports")}</h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <Label className="text-[10px] text-slate-400 uppercase font-bold">{t("Category")}</Label>
                  <SearchableSelect
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                    options={[{ value: "all", label: t("All Categories") }, ...toOptions(["Non Member", "VIP", "Vendor", "Contractor", "Staff", "Delivery", "Unknown Visitor", "Others"])]}
                    placeholder={t("All Categories")}
                    className="h-8 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-slate-400 uppercase font-bold">{t("Stay Visit Type")}</Label>
                  <SearchableSelect
                    value={filterVisitType}
                    onValueChange={setFilterVisitType}
                    options={[
                      { value: "all", label: t("All Types") },
                      { value: "Day Visit", label: t("Day Visit") },
                      { value: "Stay", label: t("Stay") },
                    ]}
                    placeholder={t("All Types")}
                    className="h-8 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-slate-400 uppercase font-bold">{t("Vehicle Type")}</Label>
                  <SearchableSelect
                    value={filterVehicleType}
                    onValueChange={setFilterVehicleType}
                    options={[{ value: "all", label: t("All Vehicles") }, ...toOptions(["Car", "Bike", "Auto", "Bus", "Taxi", "Other"])]}
                    placeholder={t("All Vehicles")}
                    className="h-8 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-slate-400 uppercase font-bold">{t("Status")}</Label>
                  <SearchableSelect
                    value={filterVisitStatus}
                    onValueChange={setFilterVisitStatus}
                    options={[
                      { value: "all", label: t("All Status") },
                      { value: "Inside", label: t("Currently Inside") },
                      { value: "Checked Out", label: t("Checked Out") },
                    ]}
                    placeholder={t("All Status")}
                    className="h-8 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-slate-400 uppercase font-bold">{t("Verification")}</Label>
                  <SearchableSelect
                    value={filterVerification}
                    onValueChange={setFilterVerification}
                    options={[
                      { value: "all", label: t("All Verification") },
                      { value: "Verified", label: t("Verified JiNANAM Member") },
                      { value: "Manual", label: t("Manual Visitor") },
                    ]}
                    placeholder={t("All Verification")}
                    className="h-8 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-slate-400 uppercase font-bold">{t("Date Range")}</Label>
                  <SearchableSelect
                    value={filterDateRange}
                    onValueChange={setFilterDateRange}
                    options={[
                      { value: "all", label: t("All Time") },
                      { value: "today", label: t("Today") },
                      { value: "yesterday", label: t("Yesterday") },
                      { value: "week", label: t("Past 7 Days") },
                      { value: "month", label: t("Past 30 Days") },
                    ]}
                    placeholder={t("All Time")}
                    className="h-8 text-xs mt-1"
                  />
                </div>
              </div>

              <hr className="border-slate-100" />
              
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={() => doExport("xlsx")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs w-full">
                  <Download className="h-3 w-3 mr-1.5" /> {t("Export Excel (XLSX)")}
                </Button>
                <Button onClick={() => doExport("csv")} className="bg-slate-800 hover:bg-slate-900 text-white font-bold h-8 text-xs w-full">
                  <Download className="h-3 w-3 mr-1.5" /> {t("Export CSV Report")}
                </Button>
              </div>
            </Card>

            {/* Reports database history list */}
            <Card className="col-span-12 md:col-span-9 p-4 border border-slate-200 bg-white rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{t("Historical Visitor Registry & Audits")}</h3>
                  <p className="text-[11px] text-slate-400">{t("Complete search and audit history of location check-ins.")}</p>
                </div>
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("Search history by name, vehicle...")}
                    className="pl-8 text-xs bg-slate-50 border-slate-200 h-9 rounded-lg"
                  />
                </div>
              </div>

              <DataTable
                columns={historyColumns}
                rows={filteredHistory}
                loading={loading}
                testId="visitors-history-table"
                emptyTitle={t("No past entries found")}
                emptyDescription={t("Historical records matching current filters will appear here.")}
              />
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Member Visit History View */}
        <TabsContent value="member_history" className="space-y-4">
          <Card className="p-4 border border-slate-200 bg-white rounded-xl shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t("My Facility Stays & Yatra Visits")}</h3>
              <p className="text-[11px] text-slate-400">{t("Complete history logs of your visits on JiNANAM premises.")}</p>
            </div>
            
            <DataTable
              columns={[
                { key: "organization", header: t("Location Name"), render: (r) => <span className="font-bold text-slate-800 text-xs">{r.organization?.name || "—"}</span> },
                { key: "checkIn", header: t("Check In"), render: (r) => <span className="text-slate-500 font-mono text-xs">{formatDateTime(r.checkInAt)}</span> },
                { key: "checkOut", header: t("Check Out"), render: (r) => <span className="text-slate-500 font-mono text-xs">{r.checkOutAt ? formatDateTime(r.checkOutAt) : <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300">{t("Currently Inside")}</Badge>}</span> },
                { key: "vehicle", header: t("Vehicle"), render: (r) => <span className="text-slate-600 font-bold text-xs">{r.vehicleNumber || "—"}</span> },
                { key: "duration", header: t("Stay Duration"), render: (r) => <span className="text-indigo-750 font-bold text-xs font-mono">{r.durationMinutes ? `${r.durationMinutes} mins` : "—"}</span> }
              ]}
              rows={myHistory}
              loading={loading}
              emptyTitle={t("No visits recorded")}
              emptyDescription={t("Your verified visits logged by security guards will appear here.")}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Check In Dialog */}
      <Dialog open={checkInOpen} onOpenChange={(o) => { setCheckInOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <ScanLine className="h-5 w-5 text-orange-600" /> {t("New Visitor Check In")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCheckInSubmit} className="space-y-4 pt-2 text-xs">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Visitor Identification Type *")}</Label>
              <div className="flex gap-2 mt-1 bg-slate-100 p-1 rounded-lg">
                {["MEMBER", "NON_MEMBER"].map((tItem) => (
                  <button key={tItem} type="button" onClick={() => { setEntryType(tItem); setLookupResult(null); }}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      entryType === tItem ? "bg-white text-orange-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {tItem === "MEMBER" ? t("Verified JiNANAM Member") : t("Manual Visitor Entry")}
                  </button>
                ))}
              </div>
            </div>

            {/* MEMBER FIELDS */}
            {entryType === "MEMBER" && (
              <div className="space-y-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Enter Member ID / Scan QR Code *")}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={memberPublicId} onChange={(e) => setMemberPublicId(e.target.value)} placeholder={t("e.g. JFJM101")} required className="h-9 bg-white" />
                    <Button type="button" variant="outline" onClick={handleLookup} disabled={lookupLoading} className="h-9">
                      {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Verify Identity")}
                    </Button>
                  </div>
                </div>

                {lookupResult && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <div className="h-11 w-11 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border-2 border-emerald-300">
                      {lookupResult.photoUrl ? (
                        <img src={lookupResult.photoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-slate-500">{initials(lookupResult.fullName)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] uppercase font-black tracking-widest text-emerald-800 flex items-center gap-1">
                        {t("✓ Verified Active Member")}
                      </div>
                      <div className="text-sm font-bold text-slate-800 truncate">{lookupResult.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono-num font-semibold mt-0.5">
                        {t("ID:")} {lookupResult.publicId} {t("| Address:")} {lookupResult.visitorAddress || "Verified Profile Address"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Multiple Member IDs Passenger field */}
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Additional Member IDs (Optional - Travel Companions)")}</Label>
                  <Input value={passengerPublicIds} onChange={(e) => setPassengerPublicIds(e.target.value)} placeholder={t("e.g. JFJM102, JFNJM501")} className="mt-1 h-9 bg-white" />
                </div>
              </div>
            )}

            {/* MANUAL VISITOR FIELDS */}
            {entryType === "NON_MEMBER" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Visitor Category *")}</Label>
                    <SearchableSelect
                      value={visitorCategory}
                      onValueChange={setVisitorCategory}
                      options={toOptions(["Non Member", "VIP", "Vendor", "Contractor", "Staff", "Delivery", "Unknown Visitor", "Others"])}
                      placeholder={t("Select category")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Full Visitor Name *")}</Label>
                    <Input value={visitorName} onChange={(e) => setVisitorName(e.target.value)} placeholder={t("e.g. Ramesh Shah")} required className="h-9 bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Mobile Number (Optional)")}</Label>
                    <Input value={visitorMobile} onChange={(e) => setVisitorMobile(e.target.value)} placeholder={t("e.g. 9876543210")} className="h-9 bg-white" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Street Address")}</Label>
                    <Input value={visitorAddress} onChange={(e) => setVisitorAddress(e.target.value)} placeholder={t("e.g. 101, Shanti Sadan")} className="h-9 bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Area")}</Label>
                    <Input value={visitorArea} onChange={(e) => setVisitorArea(e.target.value)} placeholder={t("e.g. Palitana Gate")} className="h-9 bg-white" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("City")}</Label>
                    <Input value={visitorCity} onChange={(e) => setVisitorCity(e.target.value)} placeholder={t("e.g. Bhavnagar")} className="h-9 bg-white" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("State")}</Label>
                    <Input value={visitorState} onChange={(e) => setVisitorState(e.target.value)} placeholder={t("Gujarat")} className="h-9 bg-white" />
                  </div>
                </div>

                {/* Optional Manual Photo Upload */}
                {["Vendor", "Contractor", "Unknown Visitor", "Others"].includes(visitorCategory) && (
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Capture Visitor Photo")}</Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="h-16 w-16 rounded-xl bg-slate-50 border flex items-center justify-center overflow-hidden">
                        {photoPreview ? (
                          <img src={photoPreview} alt={t("preview")} className="h-full w-full object-cover" />
                        ) : (
                          <Camera className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="h-8 text-[11px] font-bold">
                          {t("Select Image File")}
                        </Button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setPhotoFile(f);
                              setPhotoPreview(URL.createObjectURL(f));
                            }
                          }} />
                      </div>
                      {photoPreview && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="h-8 w-8 text-red-500 hover:bg-red-50">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COMMON VEHICLE & VISIT DATA */}
            <div className="border-t pt-3.5 space-y-3.5">
              <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <Car className="h-4 w-4 text-orange-600" /> {t("Vehicle & Stay Particulars")}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Vehicle Plate Number *")}</Label>
                  <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder={t("e.g. GJ01AB1234 or Walk-In")} required className="h-9 bg-white" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Vehicle Classification *")}</Label>
                  <SearchableSelect
                    value={vehicleType}
                    onValueChange={setVehicleType}
                    options={toOptions(["Car", "Bike", "Auto", "Bus", "Taxi", "Other"])}
                    placeholder={t("Select vehicle type")}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Visit Type *")}</Label>
                  <SearchableSelect
                    value={visitType}
                    onValueChange={setVisitType}
                    options={[
                      { value: "Day Visit", label: t("Day Visit") },
                      { value: "Stay", label: t("Stay (Overnight)") },
                    ]}
                    placeholder={t("Select visit type")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Visitor Count *")}</Label>
                  <Input type="number" min={1} value={numberOfVisitors} onChange={(e) => setNumberOfVisitors(e.target.value)} required className="h-9 bg-white" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Purpose")}</Label>
                  <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder={t("e.g. Darshan / Meeting")} className="h-9 bg-white" />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => { setCheckInOpen(false); resetForm(); }}>{t("Cancel")}</Button>
              <Button type="submit" disabled={submitting || (entryType === "MEMBER" && !lookupResult && !isOffline)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold">
                {submitting ? t("Processing Check In...") : t("Confirm Gate Entry")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
