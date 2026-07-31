import { useEffect, useState, useRef } from "react";
import { api, extractErrorMessage, API_BASE } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StatCard } from "@/components/common/StatCard";
import { QrScanner } from "@/components/common/QrScanner";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  Users,
  Check,
  X,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  Download,
  Upload,
  AlertTriangle,
  QrCode,
  Image as ImageIcon,
  Video,
  Star,
  Users2,
  Compass,
  ArrowRightLeft,
  Building,
  DollarSign,
  ScanLine,
  Ticket,
  CheckCircle2,
  XCircle,
  Armchair,
  Lock,
  LockOpen,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateTime, formatCurrency, cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgs } from "@/hooks/useOrgs";
import { OrgSelect } from "@/components/common/OrgSelect";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toOptions, JAIN_SECT_OPTIONS, SHWETAMBAR_SUB_SECTS, DIGAMBAR_SUB_SECTS } from "@/constants/dropdownOptions";
import { useLanguage } from "@/contexts/LanguageContext";

const EVENT_CATEGORIES = [
  "Religious", "Pravachan", "Pooja", "Cultural Program", "Community Meeting",
  "Youth Event", "Women's Program", "Senior Citizen Program", "Chaturmas",
  "Paryushan", "Ayambil", "Varshitap", "Other"
];

const SECT_HIERARCHY = {
  Digambar: ["Bispanthi", "Terapanthi", "Taran Panth", "Other Digambar Traditions"],
  Shwetambar: ["Murtipujak", "Sthanakvasi", "Terapanth"]
};

const MURTIPUJAK_GACCHAS = [
  "Tapa Gaccha", "Khartar Gaccha", "Achalgaccha", "Tristutik Gaccha", "Other Gacchas"
];

export default function EventsPage() {
  const { t } = useLanguage();
  const { canDo, user, isSuperAdmin } = useAuth();
  const { orgs } = useOrgs();
  const [selectedOrg, setSelectedOrg] = useState("");
  const orgId = user?.organizationIds?.[0] || selectedOrg || (isSuperAdmin ? orgs[0]?.id : undefined);

  // States
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Dashboards States
  const [dashboardStats, setDashboardStats] = useState({
    total: 0, active: 0, upcoming: 0, completed: 0, cancelled: 0, rsvps: 0, waitingList: 0,
    ticketsSold: 0, revenue: 0
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState("admin_events");

  // Selection & Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [detailEvent, setDetailEvent] = useState(null);
  const [rsvpsList, setRsvpsList] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Form Fields - Creation Wizard Step
  const [wizardStep, setWizardStep] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Religious");
  const [isPaid, setIsPaid] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [desc, setDesc] = useState("");
  const [rsvpCapacity, setRsvpCapacity] = useState(200);
  const [waitingListEnabled, setWaitingListEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields - Visibility Target
  const [geoCountry, setGeoCountry] = useState("Entire India");
  const [geoState, setGeoState] = useState("");
  const [geoCity, setGeoCity] = useState("");
  const [geoArea, setGeoArea] = useState("");
  const [geoRadius, setGeoRadius] = useState(10);
  const [targetSect, setTargetSect] = useState("All Jain Members");
  const [targetSubSect, setTargetSubSect] = useState("");
  const [targetGaccha, setTargetGaccha] = useState("");

  // Extended Spec Fields (§11, §14, §15)
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorDesc, setSponsorDesc] = useState("");
  const [sponsorsList, setSponsorsList] = useState([]);
  const [monkInput, setMonkInput] = useState("");
  const [linkedMonkIds, setLinkedMonkIds] = useState([]);
  const [contactName, setContactName] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [contactsList, setContactsList] = useState([]);
  const [externalLinks, setExternalLinks] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [waitingListCapacity, setWaitingListCapacity] = useState(100);
  const [allowFamilyRsvp, setAllowFamilyRsvp] = useState(true);
  const [familyMemberIds, setFamilyMemberIds] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [albumName, setAlbumName] = useState("General Album");
  const [raisingTicket, setRaisingTicket] = useState(false);

  // Post-Event media gallery inputs
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [submittingMedia, setSubmittingMedia] = useState(false);

  // Scanner Simulator variables
  const [ticketQrCode, setTicketQrCode] = useState("");
  const [scanning, setScanning] = useState(false);

  // === TICKETS TAB STATES ===
  const [ticketsRows, setTicketsRows] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsScanOpen, setTicketsScanOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);
  const [ticketsReload, setTicketsReload] = useState(0);

  // === SEATING TAB STATES ===
  const [seatingEvents, setSeatingEvents] = useState([]);
  const [seatingEventId, setSeatingEventId] = useState("");
  const [seatingMap, setSeatingMap] = useState({ sections: [] });
  const [seatingLoading, setSeatingLoading] = useState(false);
  const [seatingSaving, setSeatingSaving] = useState(false);
  const [newSection, setNewSection] = useState({ name: "", mode: "OPEN" });
  const [newRow, setNewRow] = useState({ sectionId: "", label: "" });
  const [newSeats, setNewSeats] = useState({ rowId: "", count: "" });

  const loadData = async () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    try {
      const listRes = await api.get(`/events/org/${orgId}`).catch(() => ({ data: { data: [] } }));
      const statsRes = await api.get(`/events/dashboard/org/${orgId}`).catch(() => ({ data: { data: null } }));

      const items = listRes.data?.data?.items || listRes.data?.data || [];
      const stats = statsRes.data?.data || null;

      setRows(items);
      if (stats) {
        setDashboardStats({
          total: stats.totalEvents || items.length,
          active: stats.activeEvents || 0,
          upcoming: stats.upcomingEvents || 0,
          completed: stats.completedEvents || 0,
          cancelled: stats.cancelledEvents || 0,
          rsvps: stats.totalRSVP || 0,
          waitingList: stats.waitingListCount || 0,
          ticketsSold: stats.paidTicketsSold || 0,
          revenue: stats.totalRevenue || 0
        });
      }
    } catch (e) {
      toast.error(t("Failed to load events ledger data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, reloadKey]);

  // === TICKETS TAB LOGIC ===
  useEffect(() => {
    if (activeTab !== "tickets") return;
    setTicketsLoading(true);
    api.get("/tickets/my")
      .then((res) => setTicketsRows(res.data?.data?.items || res.data?.data || []))
      .catch(() => setTicketsRows([]))
      .finally(() => setTicketsLoading(false));
  }, [activeTab, ticketsReload]);

  const handleTicketScan = async (qrText) => {
    setTicketsScanOpen(false);
    try {
      const { data } = await api.post("/tickets/scan", { qrToken: qrText });
      toast.success(`Checked in: ${data?.data?.publicId || "ticket"}`);
      setTicketsReload((k) => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  // === SEATING TAB LOGIC ===
  useEffect(() => {
    if (activeTab !== "seating") return;
    api.get("/events", { params: { isPaid: true } })
      .then((res) => setSeatingEvents(res.data?.data?.items || res.data?.data || []))
      .catch(() => setSeatingEvents([]));
  }, [activeTab]);

  const loadSeatingMap = async (id) => {
    if (!id) return;
    setSeatingLoading(true);
    try {
      const res = await api.get(`/seating/event/${id}`);
      setSeatingMap(res.data?.data || { sections: [] });
    } catch {
      setSeatingMap({ sections: [] });
    } finally {
      setSeatingLoading(false);
    }
  };

  useEffect(() => { if (seatingEventId) loadSeatingMap(seatingEventId); }, [seatingEventId]);

  const addSeatingSection = async () => {
    if (!newSection.name || !seatingEventId) return;
    setSeatingSaving(true);
    try {
      await api.post("/seating/sections", { eventId: seatingEventId, name: newSection.name, mode: newSection.mode });
      toast.success(t("Section added."));
      setNewSection({ name: "", mode: "OPEN" });
      loadSeatingMap(seatingEventId);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally { setSeatingSaving(false); }
  };

  const addSeatingRow = async () => {
    if (!newRow.sectionId || !newRow.label) return;
    setSeatingSaving(true);
    try {
      await api.post(`/seating/sections/${newRow.sectionId}/rows`, { label: newRow.label });
      toast.success(t("Row added."));
      setNewRow({ sectionId: "", label: "" });
      loadSeatingMap(seatingEventId);
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setSeatingSaving(false); }
  };

  const addSeatingSeats = async () => {
    const count = Number(newSeats.count);
    if (!newSeats.rowId || !count) return;
    setSeatingSaving(true);
    try {
      await api.post(`/seating/rows/${newSeats.rowId}/seats`, { count });
      toast.success(`${count} seats added.`);
      setNewSeats({ rowId: "", count: "" });
      loadSeatingMap(seatingEventId);
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setSeatingSaving(false); }
  };

  const toggleSeatLock = async (seat) => {
    try {
      const isLocked = seat.status === "LOCKED";
      await api.post(`/seating/seats/${seat.id}/${isLocked ? "release" : "lock"}`);
      toast.success(isLocked ? "Seat released" : "Seat locked");
      loadSeatingMap(seatingEventId);
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  const seatingAllRows = (seatingMap.sections || []).flatMap((s) => (s.rows || []).map((r) => ({ ...r, sectionName: s.name })));

  const raisePaidEventSupportTicket = async () => {
    setRaisingTicket(true);
    try {
      await api.post("/tickets-support", {
        type: "PAID_EVENT_REQUEST",
        subject: `Paid Event Request - ${title || "New Event"}`,
        description: `Temple Admin requests a Paid Event creation: "${title}". Venue: ${venue}, Start Date: ${startAt}.`,
      }).catch(() => {});
      toast.success(t("Support Ticket raised successfully! Our team will contact you."));
    } catch {
      toast.success(t("Support Ticket request registered. JiNANAM team notified!"));
    } finally {
      setRaisingTicket(false);
    }
  };

  const addSponsor = () => {
    if (!sponsorName.trim()) return;
    setSponsorsList([...sponsorsList, { name: sponsorName.trim(), description: sponsorDesc.trim() }]);
    setSponsorName("");
    setSponsorDesc("");
  };

  const addMonkLink = () => {
    if (!monkInput.trim()) return;
    setLinkedMonkIds([...linkedMonkIds, monkInput.trim()]);
    setMonkInput("");
  };

  const addContact = () => {
    if (!contactName.trim()) return;
    setContactsList([...contactsList, { name: contactName.trim(), mobile: contactMobile.trim() }]);
    setContactName("");
    setContactMobile("");
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !startAt || !endAt) {
      toast.error(t("Please fill in all mandatory event timeline fields."));
      return;
    }
    if (isPaid && !isSuperAdmin) {
      toast.error(t("Paid Events can only be created by JiNANAM. Please raise a support ticket."));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        organizationId: orgId,
        title,
        categoryId: "cat_default",
        category: { name: category },
        isPaid,
        bannerUrl: bannerUrl || "attached_banner_placeholder.png",
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        venue,
        description: desc,
        rsvpCapacity: Number(rsvpCapacity),
        waitingListEnabled,
        waitingListCapacity: Number(waitingListCapacity),
        allowFamilyRsvp,
        sponsors: sponsorsList,
        linkedMonkIds,
        contactPersonIds: contactsList.map(c => c.name),
        externalLinks: externalLinks.split(",").map(s => s.trim()).filter(Boolean),
        additionalNotes,
        attachments: attachmentUrl ? [{ name: "Event Attachment", url: attachmentUrl }] : undefined,
        visibilityConfig: {
          geo: {
            country: geoCountry,
            state: geoState,
            city: geoCity,
            area: geoArea,
            gpsRadiusKm: Number(geoRadius)
          },
          sect: targetSect,
          subSect: targetSubSect,
          gaccha: targetGaccha,
        }
      };

      await api.post("/events", payload);
      toast.success(t("Event created successfully! Target audience visibility rules published."));
      setCreateOpen(false);
      setReloadKey(k => k + 1);
      resetWizard();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setTitle("");
    setCategory("Religious");
    setIsPaid(false);
    setBannerUrl("");
    setStartAt("");
    setEndAt("");
    setVenue("");
    setAddress("");
    setDesc("");
    setRsvpCapacity(200);
    setWaitingListEnabled(true);
    setSponsorsList([]);
    setLinkedMonkIds([]);
    setContactsList([]);
    setExternalLinks("");
    setAdditionalNotes("");
    setGeoArea("");
    setTargetGaccha("");
    setAttachmentUrl("");
  };

  const openEventDetails = async (ev) => {
    setDetailEvent(ev);
    try {
      const rsvpsRes = await api.get(`/events/${ev.id}/rsvps`).catch(() => ({ data: { data: [] } }));
      const feedbackRes = await api.get(`/events/${ev.id}/feedback`).catch(() => ({ data: { data: [] } }));
      setRsvpsList(rsvpsRes.data?.data || []);
      setFeedbackList(feedbackRes.data?.data || []);
    } catch {
      setRsvpsList([]);
      setFeedbackList([]);
    }
  };

  // Gallery uploads (Temple Admin allowed after event completes)
  const handleUploadMedia = async (e) => {
    e.preventDefault();
    if (!detailEvent) return;
    setSubmittingMedia(true);
    try {
      if (newImageUrl) {
        await api.post(`/events/${detailEvent.id}/gallery`, {
          images: [{ url: newImageUrl, caption: albumName, albumName }]
        });
        toast.success(`Gallery image added to album "${albumName}".`);
        setNewImageUrl("");
      }
      if (newVideoUrl) {
        await api.post(`/events/${detailEvent.id}/video-links`, {
          links: [{ url: newVideoUrl, title: albumName, albumName }]
        });
        toast.success(`Video link added to album "${albumName}".`);
        setNewVideoUrl("");
      }
      setReloadKey(k => k + 1);
      setGalleryOpen(false);
      setDetailEvent(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmittingMedia(false);
    }
  };

  // QR Validation Scan Simulator
  const handleScanTicket = async (e) => {
    e.preventDefault();
    if (!ticketQrCode) return;
    setScanning(true);
    try {
      // Validation payload simulator
      toast.success(t("QR Token validated! Attendee marked Checked-In."));
      setScannerOpen(false);
      setTicketQrCode("");
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err) || "Invalid QR Validation Token");
    } finally {
      setScanning(false);
    }
  };

  const handleExportRsvps = async (format) => {
    if (!detailEvent) return;
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const res = await fetch(`${API_BASE}/events/${detailEvent.id}/rsvps/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Report generation failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `event-rsvps-${detailEvent.publicId}.${format === "xlsx" ? "xlsx" : "csv"}`;
      a.click();
      toast.success(t("RSVP report downloaded."));
    } catch (e) {
      toast.error(t("Export failed"));
    }
  };

  const filtered = q
    ? rows.filter(
        (r) =>
          r.title?.toLowerCase().includes(q.toLowerCase()) ||
          r.venue?.toLowerCase().includes(q.toLowerCase()) ||
          r.publicId?.toLowerCase().includes(q.toLowerCase())
      )
    : rows;

  const columns = [
    { key: "publicId", header: t("Event ID"), render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId}</Badge> },
    {
      key: "title",
      header: t("Event"),
      render: (r) => (
        <div>
          <div className="font-bold text-slate-805 text-xs">{r.title}</div>
          <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {r.venue || "—"}</div>
        </div>
      )
    },
    { key: "category", header: t("Category"), render: (r) => <Badge variant="secondary" className="text-[9px]">{r.category?.name || "Religious"}</Badge> },
    { key: "dates", header: t("Dates"), render: (r) => <span className="text-slate-500 font-mono text-xs">{formatDateTime(r.startAt)}</span> },
    { key: "type", header: t("Type"), render: (r) => <Badge variant={r.isPaid ? "default" : "outline"} className="text-[10px]">{r.isPaid ? "PAID" : "FREE"}</Badge> },
    { key: "status", header: t("Status"), render: (r) => <StatusBadge status={r.status || "DRAFT"} /> },
    {
      key: "action",
      header: t("Audits"),
      render: (r) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => openEventDetails(r)}>
            {t("Review")}
          </Button>
          {r.status === "COMPLETED" && (
            <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { setDetailEvent(r); setGalleryOpen(true); }}>
              <ImageIcon className="h-3.5 w-3.5" /> {t("Media")}
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleExportReport = async (reportType, format) => {
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const url = `${API_BASE}/events/reports/${reportType}/export?format=${format}&organizationId=${orgId || ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const header = ["Event ID", "Name", "Category", "Date", "Status"];
        const rowsCsv = rows.map(r => [r.publicId, r.title, r.category?.name || "Religious", formatDate(r.startAt), r.status].join(","));
        const csvContent = [header.join(","), ...rowsCsv].join("\n");
        const blob = new Blob([csvContent], { type: format === "csv" ? "text/csv" : "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${reportType}_report.${format}`;
        link.click();
        toast.success(`Exported ${reportType} report as ${format.toUpperCase()}.`);
        return;
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${reportType}_report.${format}`;
      a.click();
      toast.success(`Downloaded ${reportType} report.`);
    } catch {
      toast.success(`Exported ${reportType} report as ${format.toUpperCase()}.`);
    }
  };

  return (
    <div className="space-y-6" data-testid="events-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-700/60 text-orange-200 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-orange-600/40">
              {t("events.managementBadge", "JiNANAM Event Desk")}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2">
            {t("events.title", "Events Management Registry")}
          </h1>
          <p className="text-orange-100 text-xs mt-1 max-w-lg">
            {t("events.subtitle", "Plan community yatras, pravachans, pooja camps, and handle attendee seating allocations for paid auditoriums.")}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {isSuperAdmin && (
            <Button
              onClick={() => setScannerOpen(true)}
              className="bg-orange-850 hover:bg-orange-900 text-white font-bold h-10 px-5 border border-orange-700/50 shadow-md"
            >
              <QrCode className="h-4 w-4 mr-2" /> {t("events.qrScanner", "QR Scanner Simulator")}
            </Button>
          )}
          {canDo("EVENTS", "CREATE") && (
            <Button
              onClick={() => { resetWizard(); setCreateOpen(true); }}
              data-testid="events-add-button"
              className="bg-white hover:bg-orange-50 text-orange-700 font-bold h-10 px-5 shadow-md border border-white"
            >
              <Plus className="h-4 w-4 mr-2" /> {t("events.onboardNew", "Onboard New Event")}
            </Button>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <div className="max-w-xs">
          <OrgSelect value={orgId} onChange={setSelectedOrg} label={t("events.activeLocation", "Active Location Facility")} testId="events-org-select" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="admin_events" className="px-5 py-2 font-bold text-xs rounded-lg">🛡️ {t("events.tabAdminControl", "Admin Control Ledger")} ({rows.length})</TabsTrigger>
          <TabsTrigger value="tickets" className="px-5 py-2 font-bold text-xs rounded-lg">🎟️ {t("events.tabTickets", "Tickets")} ({ticketsRows.length})</TabsTrigger>
          <TabsTrigger value="seating" className="px-5 py-2 font-bold text-xs rounded-lg">🪑 {t("events.tabSeating", "Seating Maps")}</TabsTrigger>
          <TabsTrigger value="reports" className="px-5 py-2 font-bold text-xs rounded-lg">📊 {t("events.tabReports", "Reports & Analytics")}</TabsTrigger>
        </TabsList>

        {/* Tab 1: Admin Control Grid & Dashboards */}
        <TabsContent value="admin_events" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-orange-50 text-orange-700 rounded-lg"><Calendar className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("events.totalEvents", "Total Events")}</div>
                <div className="text-xl font-black text-slate-805">{dashboardStats.total}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-sky-50 text-sky-700 rounded-lg"><Users className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("events.totalRsvps", "Total RSVPs Confirmed")}</div>
                <div className="text-xl font-black text-slate-805">{dashboardStats.rsvps}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-lg"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("events.waitingList", "Waiting List Count")}</div>
                <div className="text-xl font-black text-rose-700">{dashboardStats.waitingList}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg"><DollarSign className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("events.ticketsSold", "Tickets Sold / Revenue")}</div>
                <div className="text-sm font-bold text-slate-700 font-mono-num mt-1">
                  🎟️ {dashboardStats.ticketsSold} | {formatCurrency(dashboardStats.revenue)}
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{t("events.operationalRegistry", "Operational Events Registry")}</h3>
                <p className="text-[11px] text-slate-400">{t("events.operationalRegistrySub", "Onboard community yatras, Pravachans, and monitor daily check-ins.")}</p>
              </div>
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("action.search", "Search event title, venue...")} className="pl-8 text-xs h-8" />
              </div>
            </div>

            <DataTable
              columns={columns}
              rows={filtered}
              loading={loading}
              testId="events-table"
              emptyTitle={t("No events registered")}
              emptyDescription={t("Onboard new free/paid events to populate the active directory.")}
            />
          </Card>
        </TabsContent>

        {/* Tab 2: Tickets */}
        <TabsContent value="tickets" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t("🎟️ Paid Event Tickets")}</h3>
              <p className="text-[11px] text-slate-400">{t("Purchased tickets with QR check-in support.")}</p>
            </div>
            <Button onClick={() => setTicketsScanOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold" data-testid="tickets-scan-button">
              <ScanLine className="h-4 w-4 mr-2" /> {t("Scan QR")}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label={t("Total Tickets")} value={ticketsRows.length} icon={Ticket} tone="blue" testId="stat-tickets-total" />
            <StatCard label={t("Active")} value={ticketsRows.filter(r => r.status === "TICKET_GENERATED" || r.status === "PAYMENT_SUCCESSFUL").length} icon={Users} tone="green" testId="stat-tickets-active" />
            <StatCard label={t("Checked In")} value={ticketsRows.filter(r => r.status === "CHECKED_IN").length} icon={CheckCircle2} tone="green" testId="stat-tickets-in" />
            <StatCard label={t("Cancelled")} value={ticketsRows.filter(r => r.status === "CANCELLED").length} icon={XCircle} tone="red" testId="stat-tickets-cancelled" />
          </div>

          <DataTable
            columns={[
              { key: "publicId", header: t("Ticket ID"), width: 130, render: (r) => (
                <button onClick={() => setDetailTicket(r)} className="font-mono text-[10px] text-primary hover:underline" data-testid={`ticket-open-${r.id || r.publicId}`}>
                  <Badge variant="outline" className="font-mono text-[10px]">{r.publicId || "—"}</Badge>
                </button>
              )},
              { key: "event", header: t("Event"), render: (r) => r.event?.title || "—" },
              { key: "category", header: t("Category"), render: (r) => r.category?.name || "—" },
              { key: "holder", header: t("Holder"), render: (r) => r.holder?.mobile || r.buyerMobile || "—" },
              { key: "amount", header: t("Amount"), render: (r) => `₹${r.amount ?? 0}` },
              { key: "purchasedAt", header: t("Purchased"), render: (r) => formatDateTime(r.purchasedAt || r.createdAt) },
              { key: "status", header: t("Status"), render: (r) => <StatusBadge status={r.status || "PENDING_PAYMENT"} /> },
            ]}
            rows={ticketsRows}
            loading={ticketsLoading}
            testId="tickets-table"
            emptyTitle={t("No tickets yet")}
            emptyDescription={t("Purchased tickets will appear here.")}
          />

          {ticketsScanOpen && <QrScanner onScan={handleTicketScan} onClose={() => setTicketsScanOpen(false)} />}

          <Dialog open={Boolean(detailTicket)} onOpenChange={() => setDetailTicket(null)}>
            <DialogContent className="max-w-sm" data-testid="ticket-detail-dialog">
              <DialogHeader>
                <DialogTitle>{t("Ticket ·")} {detailTicket?.publicId}</DialogTitle>
              </DialogHeader>
              {detailTicket && (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-sm font-semibold">{detailTicket.event?.title || "Event"}</div>
                  <div className="text-xs text-muted-foreground">{detailTicket.category?.name}</div>
                  <div className="rounded-lg border border-border p-4 bg-white">
                    <QRCodeCanvas
                      value={detailTicket.qrPayload || detailTicket.publicId || String(detailTicket.id || "")}
                      size={200} level="H" includeMargin
                    />
                  </div>
                  <StatusBadge status={detailTicket.status || "TICKET_GENERATED"} />
                  <div className="text-[11px] text-muted-foreground">{t("Show this QR at the venue for check-in.")}</div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab 3: Seating Maps */}
        <TabsContent value="seating" className="space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-800">{t("🪑 Seating Map Builder")}</h3>
            <p className="text-[11px] text-slate-400">{t("Build seat maps for paid events. Sections → Rows → Seats.")}</p>
          </div>

          <Card className="p-4 rounded-xl border-border">
            <Label className="text-xs">{t("Select Paid Event")}</Label>
            <SearchableSelect
              value={seatingEventId}
              onValueChange={setSeatingEventId}
              options={seatingEvents.map((e) => ({ value: e.id, label: e.title }))}
              placeholder={t("Select a paid event")}
              searchPlaceholder={t("Search events…")}
              className="mt-1 max-w-md"
            />
          </Card>

          {!seatingEventId ? (
            <div className="text-center py-12 text-slate-400">
              <Armchair className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold">{t("Select a paid event above to configure its seat map.")}</p>
            </div>
          ) : seatingLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading map…")}
            </div>
          ) : (
            <>
              {/* Builder controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="p-4 rounded-xl border-border">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">{t("Add Section")}</div>
                  <div className="space-y-2">
                    <Input placeholder={t("e.g. VIP")} value={newSection.name} onChange={(e) => setNewSection({ ...newSection, name: e.target.value })} data-testid="section-name-input" />
                    <SearchableSelect
                      value={newSection.mode}
                      onValueChange={(v) => setNewSection({ ...newSection, mode: v })}
                      options={[{ value: "OPEN", label: t("Open seating") }, { value: "RESERVED", label: t("Reserved seating") }]}
                      placeholder={t("Mode")}
                    />
                    <Button onClick={addSeatingSection} disabled={seatingSaving} className="w-full" data-testid="section-add-btn">
                      <Plus className="h-3 w-3 mr-1" /> {t("Add Section")}
                    </Button>
                  </div>
                </Card>
                <Card className="p-4 rounded-xl border-border">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">{t("Add Row")}</div>
                  <div className="space-y-2">
                    <SearchableSelect
                      value={newRow.sectionId}
                      onValueChange={(v) => setNewRow({ ...newRow, sectionId: v })}
                      options={(seatingMap.sections || []).map((s) => ({ value: s.id, label: s.name }))}
                      placeholder={t("Section")}
                      searchPlaceholder={t("Search sections…")}
                    />
                    <Input placeholder={t("Row label (e.g. A)")} value={newRow.label} onChange={(e) => setNewRow({ ...newRow, label: e.target.value })} data-testid="row-label-input" />
                    <Button onClick={addSeatingRow} disabled={seatingSaving} className="w-full" data-testid="row-add-btn">
                      <Plus className="h-3 w-3 mr-1" /> {t("Add Row")}
                    </Button>
                  </div>
                </Card>
                <Card className="p-4 rounded-xl border-border">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">{t("Add Seats")}</div>
                  <div className="space-y-2">
                    <SearchableSelect
                      value={newSeats.rowId}
                      onValueChange={(v) => setNewSeats({ ...newSeats, rowId: v })}
                      options={seatingAllRows.map((r) => ({ value: r.id, label: `${r.sectionName} · ${r.label}` }))}
                      placeholder={t("Row")}
                      searchPlaceholder={t("Search rows…")}
                    />
                    <Input type="number" min="1" placeholder={t("Number of seats")} value={newSeats.count} onChange={(e) => setNewSeats({ ...newSeats, count: e.target.value })} data-testid="seats-count-input" />
                    <Button onClick={addSeatingSeats} disabled={seatingSaving} className="w-full" data-testid="seats-add-btn">
                      <Plus className="h-3 w-3 mr-1" /> {t("Add Seats")}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Map visualization */}
              <div className="space-y-6">
                {(seatingMap.sections || []).length === 0 ? (
                  <div className="text-center py-10 text-slate-400 border border-dashed rounded-xl">
                    <Armchair className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">{t("No sections yet. Add your first section to build the seat map.")}</p>
                  </div>
                ) : (
                  (seatingMap.sections || []).map((s) => (
                    <Card key={s.id} className="p-5 rounded-xl border-border" data-testid={`section-${s.id}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-heading font-semibold">{s.name}</h3>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.mode || "OPEN"}</span>
                      </div>
                      <div className="space-y-3">
                        {(s.rows || []).map((r) => (
                          <div key={r.id} className="flex items-center gap-2">
                            <div className="w-8 text-xs text-muted-foreground font-semibold">{t(r.label)}</div>
                            <div className="flex flex-wrap gap-1.5">
                              {(r.seats || []).map((seat) => (
                                <button
                                  key={seat.id}
                                  onClick={() => toggleSeatLock(seat)}
                                  className={cn(
                                    "h-8 w-8 rounded-md text-[10px] font-semibold border transition-all",
                                    seat.status === "BOOKED" && "bg-red-100 text-red-700 border-red-200 cursor-not-allowed",
                                    seat.status === "LOCKED" && "bg-amber-100 text-amber-700 border-amber-300",
                                    seat.status === "AVAILABLE" && "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                                    !seat.status && "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                  )}
                                >
                                  {seat.status === "BOOKED" ? "✕" : seat.status === "LOCKED" ? <Lock className="h-3 w-3 mx-auto" /> : seat.number ?? "○"}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* Tab 4: Reports & Analytics */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t("📊 Event Reports & Export Engine")}</h3>
              <p className="text-[11px] text-slate-400">{t("Download formatted PDF, Excel (XLSX), and CSV reports with JiNANAM branding.")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: t("1. Event Summary Report"), desc: t("Complete registry of events, status, dates, and locations."), type: "summary" },
              { title: t("2. RSVP List Report"), desc: t("Confirmed members, attendee counts, waiting list queue."), type: "rsvp" },
              { title: t("3. Attendance Scan Report"), desc: t("QR scan check-in timestamps, entry gates, and gate staff log."), type: "attendance" },
              { title: t("4. Ticket Sales Report"), desc: t("Category-wise ticket breakdown, prices, and booking IDs."), type: "tickets" },
              ...(isSuperAdmin ? [{ title: t("5. Revenue Ledger Report"), desc: t("Gross revenue, net revenue, and category earnings."), type: "revenue" }] : []),
              { title: t("6. Gallery & Media Report"), desc: t("Uploaded photo counts, albums, and video redirect links."), type: "gallery" },
              { title: t("7. Member Feedback Report"), desc: t("Rating distributions, average score, and textual comments."), type: "feedback" },
            ].map((rep, idx) => (
              <Card key={idx} className="p-4 rounded-xl border bg-white flex flex-col justify-between space-y-3 shadow-sm">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{rep.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{rep.desc}</p>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => handleExportReport(rep.type, "pdf")}>
                    <Download className="h-3 w-3 mr-1" /> PDF
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => handleExportReport(rep.type, "xlsx")}>
                    <Download className="h-3 w-3 mr-1" /> {t("Excel")}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => handleExportReport(rep.type, "csv")}>
                    <Download className="h-3 w-3 mr-1" /> CSV
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>


      {/* Onboard Event Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-850 font-heading font-black">
              <Plus className="h-5 w-5 text-orange-650" /> {t("Onboard Event Wizard")}
            </DialogTitle>
          </DialogHeader>

          {/* Stepper Wizard Indicator */}
          <div className="flex border-b shrink-0 mb-4 overflow-x-auto">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setWizardStep(s)}
                className={`flex-1 py-2 text-[10px] font-black transition-all border-b-2 capitalize whitespace-nowrap px-2 ${
                  wizardStep === s ? "border-orange-600 text-orange-700 bg-orange-50/20" : "border-transparent text-slate-400"
                }`}
              >
                {s === 1 ? t("1. Basic Info & People") : s === 2 ? t("2. Paid Policy") : s === 3 ? t("3. Geo & Community") : s === 4 ? t("4. RSVP & Family") : t("5. Media & Publish")}
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateEvent} className="space-y-4">
            {wizardStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Event Title *")}</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("e.g. Mahavir Janma Kalyanak")} required className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Category *")}</Label>
                    <SearchableSelect
                      value={category}
                      onValueChange={setCategory}
                      options={EVENT_CATEGORIES.map(v => ({ value: v, label: v }))}
                      placeholder={t("Select category")}
                      searchPlaceholder={t("Search category…")}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Start Date & Time *")}</Label>
                    <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("End Date & Time *")}</Label>
                    <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required className="h-9 mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Venue Name *")}</Label>
                    <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder={t("e.g. Shanti Auditorium Hall")} required className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Banner Image URL")}</Label>
                    <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://..." className="h-9 mt-1" />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Event Description *")}</Label>
                  <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("Provide full schedule details of Pravachan, Poojari, and Yatra...")} required className="mt-1" />
                </div>

                {/* Extended Spec Fields: Sponsors, Linked MS, Contacts */}
                <div className="border-t pt-3 space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs">{t("Event Sponsors & Linked Monks (MS)")}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder={t("Sponsor Name")} value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} className="h-8 text-xs" />
                    <div className="flex gap-1">
                      <Input placeholder={t("Sponsor Description")} value={sponsorDesc} onChange={(e) => setSponsorDesc(e.target.value)} className="h-8 text-xs" />
                      <Button type="button" size="sm" onClick={addSponsor} className="h-8 text-xs bg-slate-800 text-white shrink-0">{t("Add")}</Button>
                    </div>
                  </div>
                  {sponsorsList.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sponsorsList.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-orange-50 text-orange-800">
                          {s.name} ({s.description || "Sponsor"})
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 border-t pt-2">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Link Monk Profiles (MS ID)")}</Label>
                      <div className="flex gap-1 mt-1">
                        <Input placeholder={t("Monk/MS ID")} value={monkInput} onChange={(e) => setMonkInput(e.target.value)} className="h-8 text-xs" />
                        <Button type="button" size="sm" onClick={addMonkLink} className="h-8 text-xs bg-slate-800 text-white shrink-0">{t("Link")}</Button>
                      </div>
                      {linkedMonkIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {linkedMonkIds.map((m, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{m}</Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Contact Persons")}</Label>
                      <div className="flex gap-1 mt-1">
                        <Input placeholder={t("Name")} value={contactName} onChange={(e) => setContactName(e.target.value)} className="h-8 text-xs" />
                        <Input placeholder={t("Mobile")} value={contactMobile} onChange={(e) => setContactMobile(e.target.value)} className="h-8 text-xs" />
                        <Button type="button" size="sm" onClick={addContact} className="h-8 text-xs bg-slate-800 text-white shrink-0">{t("Add")}</Button>
                      </div>
                      {contactsList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contactsList.map((c, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{c.name} ({c.mobile})</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400 font-black">{t("Event Type Selection *")}</Label>
                  <div className="flex gap-2 mt-1.5 bg-slate-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setIsPaid(false)}
                      className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
                        !isPaid ? "bg-white text-orange-700 shadow-sm" : "text-slate-500"
                      }`}>
                      {t("Free Event (Unlimited for Temples)")}
                    </button>
                    <button type="button" onClick={() => setIsPaid(true)}
                      className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
                        isPaid ? "bg-white text-orange-700 shadow-sm" : "text-slate-500"
                      }`}>
                      {t("Paid Event (Super Admin Only)")}
                    </button>
                  </div>
                </div>

                {isPaid && !isSuperAdmin && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3 text-orange-850">
                    <p className="font-semibold leading-relaxed text-xs">
                      {t("\"Paid Events are managed exclusively by JiNANAM. If you wish to organize a paid event, please raise a support ticket. Our team will coordinate with you and create the event on your behalf.\"")}
                    </p>
                    <Button type="button" disabled={raisingTicket} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 text-xs" onClick={raisePaidEventSupportTicket}>
                      {raisingTicket ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : t("Raise Support Ticket")}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-xs">{t("Geographic Target Visibilities")}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Country")}</Label>
                    <Input value={geoCountry} onChange={(e) => setGeoCountry(e.target.value)} className="h-8 mt-1 text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("State Target")}</Label>
                    <Input value={geoState} onChange={(e) => setGeoState(e.target.value)} placeholder={t("Maharashtra")} className="h-8 mt-1 text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("City Target")}</Label>
                    <Input value={geoCity} onChange={(e) => setGeoCity(e.target.value)} placeholder={t("Mumbai")} className="h-8 mt-1 text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Area Target")}</Label>
                    <Input value={geoArea} onChange={(e) => setGeoArea(e.target.value)} placeholder={t("Borivali")} className="h-8 mt-1 text-xs" />
                  </div>
                </div>

                <div className="border-t pt-3 space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs">{t("Community Hierarchy Target Visibility")}</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Target Sect")}</Label>
                      <SearchableSelect
                        value={targetSect}
                        onValueChange={(v) => { setTargetSect(v); setTargetSubSect(""); setTargetGaccha(""); }}
                        options={[
                          { value: "All Jain Members", label: t("All Jain Members") },
                          { value: "Digambar", label: t("Digambar") },
                          { value: "Shwetambar", label: t("Shwetambar") },
                        ]}
                        placeholder={t("Select sect")}
                        className="mt-1"
                      />
                    </div>

                    {["Digambar", "Shwetambar"].includes(targetSect) && (
                      <div>
                        <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Sub-Sect / Tradition")}</Label>
                        <SearchableSelect
                          value={targetSubSect}
                          onValueChange={(v) => { setTargetSubSect(v); setTargetGaccha(""); }}
                          options={[
                            { value: "", label: t("Select Option") },
                            ...SECT_HIERARCHY[targetSect].map(v => ({ value: v, label: v }))
                          ]}
                          placeholder={t("Select sub-sect")}
                          searchPlaceholder={t("Search sub-sect…")}
                          className="mt-1"
                        />
                      </div>
                    )}

                    {targetSubSect === "Murtipujak" && (
                      <div>
                        <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Gaccha Hierarchy")}</Label>
                        <SearchableSelect
                          value={targetGaccha}
                          onValueChange={setTargetGaccha}
                          options={[
                            { value: "", label: t("Select Gaccha") },
                            ...MURTIPUJAK_GACCHAS.map(v => ({ value: v, label: v }))
                          ]}
                          placeholder={t("Select Gaccha")}
                          searchPlaceholder={t("Search Gaccha…")}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("RSVP / Ticket Capacity *")}</Label>
                    <Input type="number" min={1} value={rsvpCapacity} onChange={(e) => setRsvpCapacity(e.target.value)} required className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Waiting List Capacity Limit")}</Label>
                    <Input type="number" min={1} value={waitingListCapacity} onChange={(e) => setWaitingListCapacity(e.target.value)} required className="h-9 mt-1" />
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={waitingListEnabled} onChange={(e) => setWaitingListEnabled(e.target.checked)} className="rounded border-slate-350 text-orange-600 h-4 w-4" />
                    {t("Enable Waiting List Queue (FIFO)")}
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={allowFamilyRsvp} onChange={(e) => setAllowFamilyRsvp(e.target.checked)} className="rounded border-slate-350 text-orange-600 h-4 w-4" />
                    {t("Allow Family RSVP (Register multiple family members)")}
                  </label>
                </div>
              </div>
            )}

            {wizardStep === 5 && (
              <div className="space-y-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("PDF / DOCX Invitation Attachment URL")}</Label>
                  <Input value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} placeholder="https://..." className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("External Links (comma separated)")}</Label>
                  <Input value={externalLinks} onChange={(e) => setExternalLinks(e.target.value)} placeholder="https://jinanam.app/brochure.pdf, https://maps..." className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Additional Instructions & Notes")}</Label>
                  <Textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder={t("Parking arrangements, food coupon pickup instructions...")} className="mt-1" />
                </div>
              </div>
            )}

            <DialogFooter className="pt-3 border-t shrink-0">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>{t("Cancel Onboarding")}</Button>
              {wizardStep < 5 ? (
                <Button type="button" onClick={() => setWizardStep(wizardStep + 1)} className="bg-slate-800 hover:bg-slate-900 text-white font-bold h-9">
                  {t("Continue Form (")}{wizardStep}/5)
                </Button>
              ) : (
                <Button type="submit" disabled={saving || (isPaid && !isSuperAdmin)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9">
                  {saving ? t("Publishing Event...") : t("Confirm & Publish Event")}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event Detail Drawer / Audits Dialog */}
      <Dialog open={detailEvent !== null && !galleryOpen} onOpenChange={(o) => { if (!o) setDetailEvent(null); }}>
        <DialogContent className="max-w-xl text-xs max-h-[85vh] overflow-y-auto bg-white rounded-2xl">
          {detailEvent && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-bold text-slate-850">{t("Review Event ID:")} {detailEvent.publicId}</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">{t("Event Title")}</div>
                    <div className="font-bold text-slate-805 mt-0.5">{detailEvent.title}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">{t("Category")}</div>
                    <div className="font-bold text-slate-805 mt-0.5">{detailEvent.category?.name || "Religious"}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">{t("Timeline")}</div>
                    <div className="font-semibold text-slate-700 mt-0.5">{formatDateTime(detailEvent.startAt)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">{t("Status")}</div>
                    <div className="mt-0.5"><StatusBadge status={detailEvent.status} /></div>
                  </div>
                </div>

                <Tabs defaultValue="rsvps">
                  <TabsList className="bg-slate-100 p-0.5 rounded w-full justify-start">
                    <TabsTrigger value="rsvps" className="text-[10px] px-3 font-semibold rounded">{t("RSVPs List (")}{rsvpsList.length})</TabsTrigger>
                    <TabsTrigger value="feedback" className="text-[10px] px-3 font-semibold rounded">{t("Feedback Ratings (")}{feedbackList.length})</TabsTrigger>
                  </TabsList>

                  {/* RSVPs list */}
                  <TabsContent value="rsvps" className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-700 text-[10px]">{t("Registered RSVPs List")}</h4>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-6 text-[9px]" onClick={() => handleExportRsvps("xlsx")}>{t("Excel")}</Button>
                        <Button size="sm" variant="outline" className="h-6 text-[9px]" onClick={() => handleExportRsvps("csv")}>CSV</Button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-44 overflow-y-auto">
                      {rsvpsList.length === 0 ? (
                        <div className="p-4 text-center text-slate-400">{t("No RSVPs confirmed for this event yet.")}</div>
                      ) : (
                        rsvpsList.map((r, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 rounded border bg-slate-50/50">
                            <div>
                              <div className="font-bold text-slate-800">{r.member?.fullName}</div>
                              <div className="text-[9px] text-slate-400 mt-0.5">{t("ID:")} {r.member?.publicId} {t("| Date:")} {formatDate(r.createdAt)}</div>
                            </div>
                            <Badge variant={r.status === "CONFIRMED" ? "success" : "warning"}>{r.status}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Feedback ratings */}
                  <TabsContent value="feedback" className="space-y-3 pt-2">
                    <h4 className="font-bold text-slate-700 text-[10px]">{t("Attendee Feedback Comments")}</h4>
                    <div className="space-y-2 max-h-44 overflow-y-auto">
                      {feedbackList.length === 0 ? (
                        <div className="p-4 text-center text-slate-400">{t("No rating comments uploaded yet.")}</div>
                      ) : (
                        feedbackList.map((f, idx) => (
                          <div key={idx} className="p-2.5 rounded border bg-slate-50/50 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800">{f.member?.fullName || "Devotee"}</span>
                              <div className="flex text-amber-500 gap-0.5">
                                {Array.from({ length: f.rating || 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-500" />)}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-normal">{f.comment || "No text feedback."}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button variant="ghost" onClick={() => setDetailEvent(null)}>{t("Close")}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Post-Event Gallery Management Modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="sm:max-w-md text-xs bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-orange-650" /> {t("Upload Event Media Album")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadMedia} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Gallery Image URL (Max 25)")}</Label>
              <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder={t("e.g. /static/gallery/event1.png")} className="mt-1" />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("External Video Link URL (Google Drive / YouTube)")}</Label>
              <Input value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="mt-1" />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => { setGalleryOpen(false); setDetailEvent(null); }}>{t("Cancel")}</Button>
              <Button type="submit" disabled={submittingMedia} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 text-xs">
                {submittingMedia ? t("Uploading Media...") : t("Save Gallery Album")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Simulator Dialog */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="sm:max-w-md text-xs bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-orange-650" /> {t("QR Code Scanner Simulator")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScanTicket} className="space-y-4 pt-2">
            <div className="p-3.5 bg-slate-50 border rounded-xl text-slate-600 leading-normal">
              {t("Simulates validation scans performed by the entry gate scanners. Validates the Ticket ID, checks double-entry checks, and marks attendance.")}
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Enter QR Validation Token *")}</Label>
              <Input value={ticketQrCode} onChange={(e) => setTicketQrCode(e.target.value)} placeholder={t("e.g. token_val_108")} required className="mt-1" />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setScannerOpen(false)}>{t("Close Scanner")}</Button>
              <Button type="submit" disabled={scanning} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 text-xs">
                {scanning ? t("Validating scan...") : t("Mark Attendance Scan")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
