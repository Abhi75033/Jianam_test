import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
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
import {
  Search,
  Calendar,
  Check,
  X,
  FileText,
  CreditCard,
  Building,
  QrCode,
  Download,
  Info,
  CalendarDays,
  Plus,
  AlertTriangle,
  Upload,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  ShieldCheck,
  Ban,
  FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgs } from "@/hooks/useOrgs";
import { OrgSelect } from "@/components/common/OrgSelect";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toOptions } from "@/constants/dropdownOptions";
import { useLanguage } from "@/contexts/LanguageContext";

const BOOKING_CATEGORIES = [
  "Dharamshala Room", "Event Hall", "Temple Hall", "Temple Space", "Pooja Booking",
  "Pooja Materials", "Bhojanshala Booking", "Pathshala Hall", "Seminar Hall",
  "Conference Room", "Meeting Room", "Locker", "Parking", "Other"
];

export default function BookingsPage() {
  const { t } = useLanguage();
  const { canDo, user, isSuperAdmin } = useAuth();
  const { orgs } = useOrgs();
  const [selectedOrg, setSelectedOrg] = useState("");
  const orgId = user?.organizationIds?.[0] || selectedOrg || (isSuperAdmin ? orgs[0]?.id : undefined);

  // Lists & States
  const [bookingItems, setBookingItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // URL Query Parameters Sync for distinct tabs (Requests, Reservations, Calendar, Stay Operations)
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") || "admin_bookings";
  const activeTab = urlTab;

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Advanced Filters for Bookings Search
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterScope, setFilterScope] = useState("all");

  // Selection & Dialog States
  const [itemSetupOpen, setItemSetupOpen] = useState(false);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState(null);
  const [paymentProofOpen, setPaymentProofOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [blackoutOpen, setBlackoutOpen] = useState(false);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);

  // Front-Desk Stay Operations States
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [idProofType, setIdProofType] = useState("Aadhaar Card");
  const [idProofNumber, setIdProofNumber] = useState("");
  const [additionalGuests, setAdditionalGuests] = useState(0);
  const [stayNotes, setStayNotes] = useState("");
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [splitCash, setSplitCash] = useState(0);
  const [splitUpi, setSplitUpi] = useState(0);
  const [newRoomId, setNewRoomId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [extendDays, setExtendDays] = useState(1);

  // Selected Booking Item & Availability Calendar State
  const [selectedCalendarItem, setSelectedCalendarItem] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [itemCalendarDays, setItemCalendarDays] = useState([]);

  // Date Click Options State
  const [dateOptionsOpen, setDateOptionsOpen] = useState(false);
  const [selectedClickedDate, setSelectedClickedDate] = useState(null);

  const handleDateClick = (dateNum, status) => {
    const formattedMonth = String(calendarMonth + 1).padStart(2, '0');
    const formattedDay = String(dateNum).padStart(2, '0');
    const dateStr = `${calendarYear}-${formattedMonth}-${formattedDay}`;
    setSelectedClickedDate({
      dateNum,
      dateStr,
      status,
      formattedDate: `${dateNum} ${new Date(calendarYear, calendarMonth).toLocaleString("default", { month: "short" })} ${calendarYear}`
    });
    setDateOptionsOpen(true);
  };

  // Form Fields - Setup Booking Item
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Dharamshala Room");
  const [itemDesc, setItemDesc] = useState("");
  const [itemTerms, setItemTerms] = useState("");
  const [itemGuidelines, setItemGuidelines] = useState("");
  const [itemCancelPolicy, setItemCancelPolicy] = useState("");
  const [itemType, setItemType] = useState("PAID"); // FREE | PAID
  const [itemDuration, setItemDuration] = useState("Hourly"); // Hourly | Half Day | Full Day | Multiple Days
  const [itemCapacityMax, setItemCapacityMax] = useState(10);
  const [itemCapacityPeople, setItemCapacityPeople] = useState(4);
  const [itemCharge, setItemCharge] = useState(500);
  const [itemPaymentHours, setItemPaymentHours] = useState(24);
  const [itemBankName, setItemBankName] = useState("");
  const [itemBankAccount, setItemBankAccount] = useState("");
  const [itemBankIfsc, setItemBankIfsc] = useState("");
  const [itemUpiId, setItemUpiId] = useState("");

  // Form Fields - Member Booking Submission
  const [selectedBookingItem, setSelectedBookingItem] = useState(null);
  const [bookDateFrom, setBookDateFrom] = useState("");
  const [bookDateTo, setBookDateTo] = useState("");
  const [bookPeople, setBookPeople] = useState(1);
  const [bookSlot, setBookSlot] = useState("09:00 - 10:00");

  // Form Fields - Offline Payment Proof
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Form Fields - Admin Internal Reservation & Blackouts
  const [reserveDate, setReserveDate] = useState("");
  const [reserveReason, setReserveReason] = useState("");
  const [blackoutDate, setBlackoutDate] = useState("");
  const [blackoutReason, setBlackoutReason] = useState("");

  // Form Fields - Request Information Reason
  const [requestInfoReason, setRequestInfoReason] = useState("");

  const loadData = async () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    try {
      // 1. Fetch configured Booking Items
      const itemsRes = await api.get(`/bookings/org/${orgId}`).catch(() => ({ data: { data: [] } }));
      // 2. Fetch admin bookings list
      const bookingsRes = await api.get(isSuperAdmin ? "/bookings" : `/bookings/org/${orgId}`).catch(() => ({ data: { data: [] } }));
      // 3. Fetch current member's bookings
      const myBookingsRes = await api.get("/bookings/my", { params: { scope: filterScope === "all" ? "all" : filterScope } }).catch(() => ({ data: { data: [] } }));

      // Format arrays safely
      const items = itemsRes.data?.data?.items || itemsRes.data?.data || [];
      const adminBookings = bookingsRes.data?.data?.items || bookingsRes.data?.data || [];
      const userBookings = myBookingsRes.data?.data?.items || myBookingsRes.data?.data || [];

      setBookingItems(items);
      setBookings(adminBookings);
      setMyBookings(userBookings);

      if (items.length > 0 && !selectedCalendarItem) {
        setSelectedCalendarItem(items[0]);
      }
    } catch (e) {
      toast.error(t("Failed to load booking ledger data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, reloadKey, filterScope]);

  // Fetch Live Calendar Availability
  const loadCalendarAvailability = async () => {
    if (!selectedCalendarItem) return;
    try {
      const from = new Date(calendarYear, calendarMonth, 1);
      const to = new Date(calendarYear, calendarMonth + 1, 0); // End of month
      const res = await api.get(`/bookings/items/${selectedCalendarItem.id}/availability`, {
        params: {
          from: from.toISOString(),
          to: to.toISOString()
        }
      });
      setItemCalendarDays(res.data?.data?.days || []);
    } catch (e) {
      toast.error(t("Failed to compile availability calendar"));
    }
  };

  useEffect(() => {
    loadCalendarAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCalendarItem, calendarMonth, calendarYear, reloadKey]);

  // Booking Item Registration Setup
  const handleSetupItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        organizationId: orgId,
        name: itemName,
        categoryId: "default_cat", // Configurable category placeholders
        category: itemCategory,
        description: itemDesc,
        termsAndConditions: itemTerms,
        guidelines: itemGuidelines,
        cancellationPolicy: itemCancelPolicy,
        type: itemType,
        durationType: itemDuration.toUpperCase().replace(" ", "_"),
        capacityMaxBookings: Number(itemCapacityMax),
        capacityMaxPeople: Number(itemCapacityPeople),
        chargeAmount: Number(itemCharge),
        paymentWindowHours: Number(itemPaymentHours),
        paymentType: "BANK_TRANSFER",
        bankDetails: {
          bankName: itemBankName,
          accountNumber: itemBankAccount,
          ifscCode: itemBankIfsc,
          upiId: itemUpiId
        },
        availabilityConfig: { availableDays: [0, 1, 2, 3, 4, 5, 6] }
      };

      await api.post("/bookings/items", payload);
      toast.success(t("Booking item configured successfully!"));
      setItemSetupOpen(false);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Submit Member Booking
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedBookingItem) return;
    try {
      await api.post("/bookings", {
        bookingItemId: selectedBookingItem.id,
        dateFrom: new Date(bookDateFrom).toISOString(),
        dateTo: bookDateTo ? new Date(bookDateTo).toISOString() : undefined,
        slot: bookSlot,
        peopleCount: Number(bookPeople)
      });
      toast.success(t("Booking request submitted! Awaiting administrator approval."));
      setNewBookingOpen(false);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Submit Payment Proof Upload
  const handleUploadPayment = async (e) => {
    e.preventDefault();
    if (!detailBooking || !paymentRef) return;
    try {
      const idempotencyKey = "pay_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      await api.post(`/bookings/${detailBooking.id}/payment-proof`, {
        paymentReference: paymentRef,
        paymentProofUrl: paymentProofUrl || "screenshot_placeholder.png",
        paymentNotes,
        idempotencyKey
      });
      toast.success(t("Payment proof submitted successfully! Verification pending."));
      setPaymentProofOpen(false);
      setDetailBooking(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Reserve slot internally
  const handleAddReservation = async (e) => {
    e.preventDefault();
    if (!selectedCalendarItem || !reserveDate) return;
    try {
      await api.post(`/bookings/items/${selectedCalendarItem.id}/internal-reservations`, {
        date: new Date(reserveDate).toISOString(),
        reason: reserveReason
      });
      toast.success(t("Slot reserved internally. Member view blocked."));
      setReserveOpen(false);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Add Blackout Maintenance dates
  const handleAddBlackout = async (e) => {
    e.preventDefault();
    if (!selectedCalendarItem || !blackoutDate) return;
    try {
      await api.post(`/bookings/items/${selectedCalendarItem.id}/blackout-dates`, {
        date: new Date(blackoutDate).toISOString(),
        reason: blackoutReason
      });
      toast.success(t("Maintenance dates added successfully."));
      setBlackoutOpen(false);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Admin decision on Booking Requests
  const handleBookingDecision = async (bookingId, decision, reason) => {
    try {
      await api.post(`/bookings/${bookingId}/decision`, { decision, reason });
      toast.success(`Booking request decided: ${decision}`);
      setDetailBooking(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Admin decision on Payment verification
  const handlePaymentVerification = async (bookingId, decision, reason) => {
    try {
      await api.post(`/bookings/${bookingId}/payment-verification`, { decision, reason });
      toast.success(`Payment verified status: ${decision}`);
      setDetailBooking(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Front Desk Stay Operations Handlers
  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!detailBooking) return;
    try {
      await api.post(`/bookings/${detailBooking.id}/check-in`, {
        vehicleNumber,
        idProofType,
        idProofNumber,
        additionalGuests: Number(additionalGuests),
        stayNotes,
      });
      toast.success(t("Guest checked in successfully!"));
      setCheckInOpen(false);
      setDetailBooking(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    if (!detailBooking) return;
    try {
      const splitPayments = [];
      if (Number(splitCash) > 0) splitPayments.push({ mode: "CASH", amount: Number(splitCash) });
      if (Number(splitUpi) > 0) splitPayments.push({ mode: "UPI", amount: Number(splitUpi) });

      await api.post(`/bookings/${detailBooking.id}/check-out`, {
        additionalCharges: Number(additionalCharges),
        splitPayments,
        notes: stayNotes,
      });
      toast.success(t("Check-out complete! Final stay receipt generated."));
      setCheckOutOpen(false);
      setDetailBooking(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleTransferRoom = async (e) => {
    e.preventDefault();
    if (!detailBooking || !newRoomId) return;
    try {
      await api.post(`/bookings/${detailBooking.id}/transfer-room`, {
        newRoomId,
        reason: transferReason || "Front desk room transfer request",
      });
      toast.success(t("Room transferred successfully."));
      setTransferOpen(false);
      setDetailBooking(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleExtendStay = async (e) => {
    e.preventDefault();
    if (!detailBooking) return;
    try {
      await api.post(`/bookings/${detailBooking.id}/extend-stay`, {
        additionalDays: Number(extendDays),
      });
      toast.success(`Stay extended by ${extendDays} day(s). Booking dates updated.`);
      setExtendOpen(false);
      setDetailBooking(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleExportReports = async (type, format) => {
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const res = await fetch(`${API_BASE}/bookings/org/${orgId}/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `booking-registry-${orgId}-${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xlsx" : "csv"}`;
      a.click();
      toast.success(t("Booking registry exported."));
    } catch (e) {
      toast.error(t("Export failed"));
    }
  };

  // Filters mapping
  const filteredBookings = bookings.filter((r) => {
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (q && !JSON.stringify(r).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const columns = [
    { key: "publicId", header: t("Booking ID"), render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId || "—"}</Badge> },
    {
      key: "item",
      header: t("Booking Item"),
      render: (r) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{r.bookingItem?.name || "—"}</div>
          <div className="text-[10px] text-slate-400 font-semibold">{r.bookingItem?.category || "—"}</div>
        </div>
      )
    },
    {
      key: "member",
      header: t("Devotee Member"),
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-850 text-xs">{r.member?.fullName || "Guest Booker"}</div>
          <div className="text-[10px] text-slate-400 font-mono-num">{r.member?.publicId}</div>
        </div>
      )
    },
    {
      key: "dates",
      header: t("Booking Dates"),
      render: (r) => (
        <span className="text-slate-500 font-mono text-xs">
          {formatDate(r.dateFrom)} {r.dateTo ? `→ ${formatDate(r.dateTo)}` : ""}
        </span>
      )
    },
    { key: "amount", header: t("Charges"), render: (r) => <span className="font-bold text-slate-700 text-xs font-mono-num">{formatCurrency(r.amount)}</span> },
    {
      key: "status",
      header: t("Current Status"),
      render: (r) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={r.status} />
          {r.status === "PAYMENT_PENDING" && r.paymentWindowExpiresAt && (
            <Badge className="bg-rose-50 text-rose-800 border-rose-200 text-[8px] flex items-center gap-0.5 w-fit">
              <Clock className="h-2 w-2" /> {t("Expires:")} {formatDateTime(r.paymentWindowExpiresAt).slice(11, 16)}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: "action",
      header: t("Audit / Verify"),
      render: (r) => (
        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setDetailBooking(r)}>
          {t("Review Details")}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6" data-testid="bookings-page">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-orange-600 to-amber-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-amber-200" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">{t("Booking & Reservations")}</h1>
          </div>
          <p className="text-orange-100 text-xs mt-1 max-w-lg">
            {t("Polymorphic reservation engine for Dharamshala rooms, halls, space events, and bhojanshala packages.")}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {canDo("BOOKINGS", "CREATE") && (
            <Button
              onClick={() => setItemSetupOpen(true)}
              className="bg-white hover:bg-orange-50 text-orange-700 font-bold h-10 px-5 shadow-md border border-white"
            >
              <Plus className="h-4 w-4 mr-2" /> {t("Configure Booking Item")}
            </Button>
          )}
          <Button
            onClick={() => { setSelectedBookingItem(bookingItems[0]); setNewBookingOpen(true); }}
            className="bg-orange-850 hover:bg-orange-900 text-white font-bold h-10 px-5 border border-orange-700/50 shadow-md"
          >
            <Calendar className="h-4 w-4 mr-2" /> {t("Submit Booking Request")}
          </Button>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="max-w-xs">
          <OrgSelect value={orgId} onChange={setSelectedOrg} label={t("Active Location Facility")} testId="bookings-org-select" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl flex-wrap">
          <TabsTrigger value="admin_bookings" className="px-5 py-2 font-bold text-xs rounded-lg">{t("🛡️ Booking Requests (")}{bookings.filter(b => b.status === "SUBMITTED" || b.status === "PENDING_APPROVAL" || b.status === "PAYMENT_PENDING" || b.status === "PAYMENT_VERIFICATION").length})</TabsTrigger>
          <TabsTrigger value="reservations" className="px-5 py-2 font-bold text-xs rounded-lg">{t("📋 Confirmed Reservations (")}{bookings.filter(b => b.status === "CONFIRMED" || b.status === "APPROVED").length})</TabsTrigger>
          <TabsTrigger value="availability_calendar" className="px-5 py-2 font-bold text-xs rounded-lg">{t("📅 Live Availability Grid")}</TabsTrigger>
          <TabsTrigger value="stay_management" className="px-5 py-2 font-bold text-xs rounded-lg">{t("🏨 Front Desk Stay Operations (")}{bookings.filter(b => b.status === "CHECKED_IN").length})</TabsTrigger>
          <TabsTrigger value="my_bookings" className="px-5 py-2 font-bold text-xs rounded-lg">{t("👤 My Bookings (")}{myBookings.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Admin Bookings Ledger */}
        <TabsContent value="admin_bookings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-lg"><CalendarDays className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Submitted Requests")}</div>
                <div className="text-xl font-black text-slate-800">{bookings.filter(b => b.status === "SUBMITTED" || b.status === "PENDING_APPROVAL").length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-sky-50 text-sky-700 rounded-lg"><Clock className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Payment Verification")}</div>
                <div className="text-xl font-black text-slate-800">{bookings.filter(b => b.status === "PAYMENT_VERIFICATION").length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Confirmed Stays")}</div>
                <div className="text-xl font-black text-slate-800">{bookings.filter(b => b.status === "CONFIRMED").length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg"><FileSpreadsheet className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Reports Exports")}</div>
                <div className="flex gap-1.5 mt-1">
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleExportReports("bookings", "xlsx")}>{t("Excel")}</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleExportReports("bookings", "csv")}>CSV</Button>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{t("Platform Bookings Ledger")}</h3>
                <p className="text-[11px] text-slate-400">{t("Audit stay timelines, verify payment receipts, and issue confirmations.")}</p>
              </div>
              <div className="flex gap-2">
                <select className="h-8 rounded border text-xs px-2 bg-slate-50 focus:outline-none"
                  value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="ALL">{t("All Status")}</option>
                  {["SUBMITTED", "PENDING_APPROVAL", "APPROVED", "PAYMENT_PENDING", "PAYMENT_VERIFICATION", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED", "EXPIRED"].map(st => (
                    <option key={st} value={st}>{t(st.replace("_", " "))}</option>
                  ))}
                </select>
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("action.search", "Search...")} className="pl-8 text-xs h-8" />
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              rows={filteredBookings}
              loading={loading}
              testId="bookings-table"
              emptyTitle={t("No bookings registered")}
              emptyDescription={t("Booking requests submitted by members will appear here.")}
            />
          </Card>
        </TabsContent>

        {/* Tab 2: Availability Calendar Grid */}
        <TabsContent value="availability_calendar" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-lg"><CalendarDays className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Total Bookings This Month")}</div>
                <div className="text-xl font-black text-slate-800">{bookings.length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg"><Building className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Dharamshala Rooms")}</div>
                <div className="text-xl font-black text-slate-800">{bookings.filter(b => b.bookingItem?.category?.includes("Room") || b.bookingItem?.type === "ROOM").length} {t("Rooms")}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-sky-50 text-sky-700 rounded-lg"><Check className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Halls Confirmed")}</div>
                <div className="text-xl font-black text-slate-800">{bookings.filter(b => b.status === "CONFIRMED" || b.status === "APPROVED").length} {t("Reservation(s)")}</div>
              </div>
            </Card>
          </div>

          <Card className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                  <CalendarDays className="h-5 w-5 text-orange-500" />
                  {new Date(calendarYear, calendarMonth).toLocaleString("default", { month: "long", year: "numeric" })}
                </h3>
                {bookingItems.length > 0 && (
                  <select
                    value={selectedCalendarItem?.id || ""}
                    onChange={(e) => setSelectedCalendarItem(bookingItems.find(i => i.id === e.target.value))}
                    className="h-8 rounded-lg border text-xs font-semibold text-slate-700 px-2 bg-slate-50 focus:outline-none"
                  >
                    <option value="">{t("All Service Units")}</option>
                    {bookingItems.map(item => (
                      <option key={item.id} value={item.id}>{item.name} ({item.category})</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex gap-1.5 items-center">
                <Button size="sm" variant="outline" onClick={() => setReserveOpen(true)} className="h-8 text-[11px] font-bold text-slate-700">
                  <Plus className="h-3.5 w-3.5 mr-1" /> {t("Add Block")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
                  else setCalendarMonth(m => m - 1);
                }} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
                  else setCalendarMonth(m => m + 1);
                }} className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: new Date(calendarYear, calendarMonth, 1).getDay() }).map((_, pad) => (
                <div key={`pad-${pad}`} className="h-24 bg-slate-50/50 rounded-lg border border-dashed border-slate-100"></div>
              ))}

              {Array.from({ length: new Date(calendarYear, calendarMonth + 1, 0).getDate() }, (_, i) => i + 1).map((dateNum) => {
                const dayData = itemCalendarDays.find(d => {
                  const dt = new Date(d.date);
                  return dt.getDate() === dateNum && dt.getMonth() === calendarMonth && dt.getFullYear() === calendarYear;
                });
                const status = dayData?.status || "AVAILABLE";

                const isToday = new Date().getDate() === dateNum && new Date().getMonth() === calendarMonth && new Date().getFullYear() === calendarYear;

                // Find bookings on this day
                const dayBookings = bookings.filter(b => {
                  const bFrom = new Date(b.dateFrom);
                  const bTo = b.dateTo ? new Date(b.dateTo) : bFrom;
                  const currentDay = new Date(calendarYear, calendarMonth, dateNum);
                  return currentDay >= new Date(bFrom.getFullYear(), bFrom.getMonth(), bFrom.getDate()) &&
                         currentDay <= new Date(bTo.getFullYear(), bTo.getMonth(), bTo.getDate());
                });

                const isAvailable = status === "AVAILABLE" && dayBookings.length === 0;
                const isBooked = dayBookings.length > 0 || status === "BOOKED";
                const isMaintenance = status === "MAINTENANCE";

                return (
                  <div
                    key={dateNum}
                    onClick={() => handleDateClick(dateNum, isBooked ? "BOOKED" : status)}
                    className={`h-24 p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
                      isToday ? "border-orange-500 bg-orange-50/30" :
                      isAvailable ? "border-slate-200 hover:border-orange-400 bg-white" :
                      isBooked ? "border-rose-200 bg-rose-50/40 text-rose-800" :
                      isMaintenance ? "border-amber-200 bg-amber-50/40 text-amber-800" :
                      "border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center ${
                        isToday ? "bg-orange-600 text-white shadow-sm" : "text-slate-700 bg-slate-100"
                      }`}>
                        {dateNum}
                      </span>
                      <Plus className="h-3 w-3 text-slate-400 hover:text-orange-600" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 my-1">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div key={b.id} className="text-[8px] px-1 rounded py-0.5 truncate font-bold bg-orange-100 text-orange-900 border border-orange-200/60" title={`${b.member?.fullName} (${b.bookingItem?.name})`}>
                          {b.member?.fullName || "Booked"} ({b.bookingItem?.name || "Unit"})
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-[8px] font-bold text-orange-700">+{dayBookings.length - 2} {t("more")}</div>
                      )}
                    </div>

                    <span className={`text-[8px] uppercase tracking-wider font-extrabold w-fit px-1.5 py-0.5 rounded ${
                      isAvailable ? "bg-emerald-100 text-emerald-800" :
                      isBooked ? "bg-rose-100 text-rose-800" :
                      isMaintenance ? "bg-amber-100 text-amber-800" :
                      "bg-slate-200 text-slate-700"
                    }`}>
                      {isBooked ? `BOOKED (${dayBookings.length})` : status}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Dedicated Confirmed & Internal Reservations View */}
        <TabsContent value="reservations" className="space-y-4">
          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{t("Confirmed Reservations & Internal Blocks")}</h3>
                <p className="text-[11px] text-slate-400">{t("All confirmed room reservations, VIP blocks, and internal allocations.")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setReserveOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-8 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" /> {t("Add Internal Block")}
                </Button>
              </div>
            </div>

            <DataTable
              columns={[
                { key: "publicId", header: t("Reservation ID"), render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId}</Badge> },
                { key: "item", header: t("Resource Unit"), render: (r) => <span className="font-bold text-slate-800 text-xs">{r.bookingItem?.name || "—"}</span> },
                { key: "devotee", header: t("Devotee / Blocked For"), render: (r) => <span className="font-semibold text-slate-700 text-xs">{r.member?.fullName || "Internal Block"}</span> },
                { key: "dates", header: t("Reserved Dates"), render: (r) => <span className="font-mono text-xs text-slate-500">{formatDate(r.dateFrom)} {r.dateTo ? `→ ${formatDate(r.dateTo)}` : ""}</span> },
                { key: "amount", header: t("Charges"), render: (r) => <span className="font-bold text-xs font-mono-num">{formatCurrency(r.amount)}</span> },
                { key: "status", header: t("Status"), render: (r) => <StatusBadge status={r.status} /> },
                {
                  key: "action",
                  header: t("Manage"),
                  render: (r) => (
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setDetailBooking(r)}>
                      {t("Review / Action")}
                    </Button>
                  )
                }
              ]}
              rows={bookings.filter(b => b.status === "CONFIRMED" || b.status === "APPROVED" || b.status === "CHECKED_IN")}
              loading={loading}
              emptyTitle={t("No active confirmed reservations")}
              emptyDescription={t("New confirmed bookings and internal blocks will appear in this registry.")}
            />
          </Card>
        </TabsContent>

        {/* Tab 4: Front Desk Stay Management */}
        <TabsContent value="stay_management" className="space-y-4">
          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{t("Front Desk Live Stay Management")}</h3>
                <p className="text-[11px] text-slate-400">{t("Front desk operations for active checked-in guests, extensions, room transfers, and check-outs.")}</p>
              </div>
            </div>

            <DataTable
              columns={[
                { key: "publicId", header: t("Stay Booking ID"), render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId}</Badge> },
                { key: "item", header: t("Unit Allocated"), render: (r) => <span className="font-bold text-slate-800 text-xs">{r.allocatedRoomId || r.bookingItem?.name || "Unit 101"}</span> },
                { key: "devotee", header: t("Guest Name"), render: (r) => <span className="font-semibold text-slate-700 text-xs">{r.member?.fullName || "Guest"}</span> },
                { key: "dates", header: t("Stay Duration"), render: (r) => <span className="font-mono text-xs text-slate-500">{formatDate(r.dateFrom)} {r.dateTo ? `→ ${formatDate(r.dateTo)}` : ""}</span> },
                { key: "status", header: t("Stay Status"), render: (r) => <StatusBadge status={r.status} /> },
                {
                  key: "action",
                  header: t("Front Desk Actions"),
                  render: (r) => (
                    <div className="flex gap-1">
                      {r.status === "CONFIRMED" && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-7 text-[10px]" onClick={() => { setDetailBooking(r); setCheckInOpen(true); }}>
                          {t("Check-In")}
                        </Button>
                      )}
                      {r.status === "CHECKED_IN" && (
                        <>
                          <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-7 text-[10px]" onClick={() => { setDetailBooking(r); setCheckOutOpen(true); }}>
                            {t("Check-Out")}
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { setDetailBooking(r); setExtendOpen(true); }}>
                            {t("Extend")}
                          </Button>
                        </>
                      )}
                    </div>
                  )
                }
              ]}
              rows={bookings.filter(b => b.status === "CONFIRMED" || b.status === "CHECKED_IN")}
              loading={loading}
              emptyTitle={t("No active stays at front desk")}
              emptyDescription={t("Checked-in guests and upcoming arrivals will appear here.")}
            />
          </Card>
        </TabsContent>

        {/* Tab 5: Unified Member Bookings */}
        <TabsContent value="my_bookings" className="space-y-4">
          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{t("My Platform Bookings Ledger")}</h3>
                <p className="text-[11px] text-slate-400">{t("View current, historical and future stays in one unified dashboard.")}</p>
              </div>
              <div className="flex gap-2">
                <select className="h-8 rounded border text-xs px-2 bg-slate-50 focus:outline-none"
                  value={filterScope} onChange={(e) => setFilterScope(e.target.value)}>
                  <option value="all">{t("All Bookings")}</option>
                  <option value="upcoming">{t("Upcoming Bookings")}</option>
                  <option value="past">{t("Past Bookings History")}</option>
                </select>
              </div>
            </div>

            <DataTable
              columns={[
                { key: "publicId", header: t("Booking ID"), render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId}</Badge> },
                {
                  key: "item",
                  header: t("Service Details"),
                  render: (r) => (
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{r.bookingItem?.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{r.organization?.name}</div>
                    </div>
                  )
                },
                {
                  key: "dates",
                  header: t("Dates"),
                  render: (r) => (
                    <span className="text-slate-500 font-mono text-xs">
                      {formatDate(r.dateFrom)} {r.dateTo ? `→ ${formatDate(r.dateTo)}` : ""}
                    </span>
                  )
                },
                { key: "amount", header: t("Charges Paid"), render: (r) => <span className="font-bold text-slate-700 text-xs font-mono-num">{formatCurrency(r.amount)}</span> },
                { key: "status", header: t("Status"), render: (r) => <StatusBadge status={r.status} /> },
                {
                  key: "actions",
                  header: t("Actions"),
                  render: (r) => (
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {r.status === "PAYMENT_PENDING" && (
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-7 text-[10px]" onClick={() => { setDetailBooking(r); setPaymentProofOpen(true); }}>
                          <Upload className="h-3 w-3 mr-1" /> {t("Upload Screenshot")}
                        </Button>
                      )}
                      {r.status === "CONFIRMED" && r.receipt?.pdfUrl && (
                        <a href={r.receipt.pdfUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" className="h-7 text-[10px]">
                            <Download className="h-3 w-3 mr-1" /> {t("Receipt")}
                          </Button>
                        </a>
                      )}
                    </div>
                  )
                }
              ]}
              rows={myBookings}
              loading={loading}
              emptyTitle={t("No bookings found")}
              emptyDescription={t("Submit booking request triggers above to create a booking.")}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* dialog 1: Configure Booking Item */}
      <Dialog open={itemSetupOpen} onOpenChange={setItemSetupOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Plus className="h-5 w-5 text-orange-600" /> {t("Configure Booking Item")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetupItem} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Booking Item Name *")}</Label>
                <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder={t("e.g. Deluxe Room 302")} required className="h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Booking Category *")}</Label>
                <SearchableSelect
                  value={itemCategory}
                  onValueChange={setItemCategory}
                  options={toOptions(BOOKING_CATEGORIES)}
                  placeholder={t("Select Category")}
                />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Description")}</Label>
              <Textarea value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder={t("Describe the room, hall facilities, beds, etc.")} className="mt-1" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Item Booking Type *")}</Label>
                <SearchableSelect
                  value={itemType}
                  onValueChange={setItemType}
                  options={[
                    { value: "PAID", label: t("Paid Booking") },
                    { value: "FREE", label: t("Free / Complementary") },
                  ]}
                  placeholder={t("Select Type")}
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Booking Duration *")}</Label>
                <SearchableSelect
                  value={itemDuration}
                  onValueChange={setItemDuration}
                  options={toOptions(["Hourly basis", "Half Day basis", "Full Day basis", "Multiple Days stay"])}
                  placeholder={t("Select Duration")}
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Max Capacity bookings *")}</Label>
                <Input type="number" min={1} value={itemCapacityMax} onChange={(e) => setItemCapacityMax(e.target.value)} required className="h-9" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Max People Allowed")}</Label>
                <Input type="number" min={1} value={itemCapacityPeople} onChange={(e) => setItemCapacityPeople(e.target.value)} required className="h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Charges Amount (INR)")}</Label>
                <Input type="number" min={0} value={itemCharge} onChange={(e) => setItemCharge(e.target.value)} required className="h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Payment window (Hours)")}</Label>
                <Input type="number" min={1} value={itemPaymentHours} onChange={(e) => setItemPaymentHours(e.target.value)} required className="h-9" />
              </div>
            </div>

            <div className="border-t pt-3 space-y-3">
              <h4 className="font-bold text-slate-700 text-xs">{t("Offline Bank & UPI Details")}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Bank Name")}</Label>
                  <Input value={itemBankName} onChange={(e) => setItemBankName(e.target.value)} placeholder={t("e.g. State Bank of India")} className="h-9" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Account Number")}</Label>
                  <Input value={itemBankAccount} onChange={(e) => setItemBankAccount(e.target.value)} placeholder={t("e.g. 1002345564")} className="h-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("IFSC Code")}</Label>
                  <Input value={itemBankIfsc} onChange={(e) => setItemBankIfsc(e.target.value)} placeholder={t("e.g. SBIN000123")} className="h-9" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">{t("UPI Pay ID")}</Label>
                  <Input value={itemUpiId} onChange={(e) => setItemUpiId(e.target.value)} placeholder={t("e.g. jinanam@sbi")} className="h-9" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Terms & Conditions")}</Label>
                <Input value={itemTerms} onChange={(e) => setItemTerms(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Booking Guidelines")}</Label>
                <Input value={itemGuidelines} onChange={(e) => setItemGuidelines(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Cancellation Policy")}</Label>
                <Input value={itemCancelPolicy} onChange={(e) => setItemCancelPolicy(e.target.value)} className="h-9" />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setItemSetupOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">{t("Save Configuration")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 2: Submit Booking Request */}
      <Dialog open={newBookingOpen} onOpenChange={setNewBookingOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="h-5 w-5 text-orange-600" /> {t("New Booking Request")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBooking} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Select Booking Item *")}</Label>
              <select className="w-full mt-1 h-9 rounded border px-2 focus:outline-none"
                value={selectedBookingItem?.id} onChange={(e) => setSelectedBookingItem(bookingItems.find(i => i.id === e.target.value))}>
                {bookingItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.category})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Date From *")}</Label>
                <Input type="date" value={bookDateFrom} onChange={(e) => setBookDateFrom(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Date To (Optional)")}</Label>
                <Input type="date" value={bookDateTo} onChange={(e) => setBookDateTo(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Slot Time / Hours")}</Label>
                <Input value={bookSlot} onChange={(e) => setBookSlot(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Devotees Count *")}</Label>
                <Input type="number" min={1} value={bookPeople} onChange={(e) => setBookPeople(e.target.value)} required className="mt-1" />
              </div>
            </div>

            {selectedBookingItem && (
              <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                <div className="font-bold text-slate-800">{t("Charges Detail:")}</div>
                <div className="flex justify-between text-slate-600">
                  <span>{t("Standard charges:")}</span>
                  <span className="font-bold">{formatCurrency(selectedBookingItem.chargeAmount)} ({selectedBookingItem.type})</span>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setNewBookingOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">{t("Submit Booking Request")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 3: Upload Offline Payment Screenshot */}
      <Dialog open={paymentProofOpen} onOpenChange={setPaymentProofOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" /> {t("Upload Payment Screenshot")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadPayment} className="space-y-4 pt-2">
            {detailBooking && (
              <div className="p-3 bg-slate-50 border rounded-lg space-y-2">
                <div className="font-bold text-slate-800">{t("Offline Payment Bank/UPI Details:")}</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>{t("Bank Name:")} {detailBooking.bookingItem?.bankDetails?.bankName || "—"}</div>
                  <div>{t("Account:")} {detailBooking.bookingItem?.bankDetails?.accountNumber || "—"}</div>
                  <div>{t("IFSC:")} {detailBooking.bookingItem?.bankDetails?.ifscCode || "—"}</div>
                  <div>{t("UPI ID:")} {detailBooking.bookingItem?.bankDetails?.upiId || "—"}</div>
                </div>
              </div>
            )}

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Payment Reference Number / UPI UTR *")}</Label>
              <Input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder={t("e.g. UTR102345564")} required className="mt-1" />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Payment Screenshot image url (Optional)")}</Label>
              <Input value={paymentProofUrl} onChange={(e) => setPaymentProofUrl(e.target.value)} placeholder={t("e.g. /static/payments/proof1.png")} className="mt-1" />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Payment Notes")}</Label>
              <Textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder={t("e.g. Paid via mobile GPay")} className="mt-1" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setPaymentProofOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">{t("Confirm Payment Submitted")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 4: View / Action Booking Detail Drawer */}
      <Dialog open={detailBooking !== null && !paymentProofOpen} onOpenChange={(o) => { if (!o) setDetailBooking(null); }}>
        <DialogContent className="sm:max-w-md text-xs">
          {detailBooking && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-bold text-slate-805">{t("Review Booking ID:")} {detailBooking.publicId}</DialogTitle>
              </DialogHeader>

              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">{t("Service Item")}</div>
                    <div className="font-bold text-slate-800 mt-0.5">{detailBooking.bookingItem?.name}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">{t("Devotee")}</div>
                    <div className="font-bold text-slate-805 mt-0.5">{detailBooking.member?.fullName || "Guest"}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">{t("Dates Timeline")}</div>
                    <div className="font-semibold text-slate-700 mt-0.5">{formatDate(detailBooking.dateFrom)} {detailBooking.dateTo ? `→ ${formatDate(detailBooking.dateTo)}` : ""}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">{t("Status")}</div>
                    <div className="mt-0.5"><StatusBadge status={detailBooking.status} /></div>
                  </div>
                </div>

                {detailBooking.paymentReference && (
                  <div className="p-3 border rounded bg-indigo-50/50">
                    <div className="font-bold text-indigo-900">{t("Submitted Payment Details:")}</div>
                    <div className="mt-1 font-semibold text-slate-700">{t("Reference / UTR:")} {detailBooking.paymentReference}</div>
                    {detailBooking.paymentNotes && <div className="text-slate-500 mt-0.5">{t("Notes:")} {detailBooking.paymentNotes}</div>}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-1.5 pt-2 flex flex-wrap">
                <Button variant="ghost" onClick={() => setDetailBooking(null)}>{t("Close")}</Button>
                
                {/* Admin flow for PENDING_APPROVAL */}
                {detailBooking.status === "PENDING_APPROVAL" && canDo("BOOKINGS", "APPROVE") && (
                  <>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs"
                      onClick={() => handleBookingDecision(detailBooking.id, "APPROVE")}>
                      {t("Approve Booking")}
                    </Button>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 text-xs"
                      onClick={() => handleBookingDecision(detailBooking.id, "REJECT")}>
                      {t("Reject Request")}
                    </Button>
                    <Button className="bg-slate-800 hover:bg-slate-900 text-white font-bold h-9 text-xs"
                      onClick={() => setRequestInfoOpen(true)}>
                      {t("Request Info")}
                    </Button>
                  </>
                )}

                {/* Admin flow for PAYMENT_VERIFICATION */}
                {detailBooking.status === "PAYMENT_VERIFICATION" && canDo("BOOKINGS", "APPROVE") && (
                  <>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs"
                      onClick={() => handlePaymentVerification(detailBooking.id, "APPROVE")}>
                      {t("Approve Payment (Confirm Booking)")}
                    </Button>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 text-xs"
                      onClick={() => handlePaymentVerification(detailBooking.id, "REJECT")}>
                      {t("Reject Proof")}
                    </Button>
                  </>
                )}

                {/* Admin flow for CONFIRMED → Check-In */}
                {detailBooking.status === "CONFIRMED" && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs"
                    onClick={() => setCheckInOpen(true)}>
                    {t("Front Desk Check-In")}
                  </Button>
                )}

                {/* Front Desk flow for CHECKED_IN → Check-Out, Extend, Transfer */}
                {detailBooking.status === "CHECKED_IN" && (
                  <>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 text-xs"
                      onClick={() => setCheckOutOpen(true)}>
                      {t("Front Desk Check-Out")}
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 text-xs"
                      onClick={() => setExtendOpen(true)}>
                      {t("Extend Stay")}
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 text-xs"
                      onClick={() => setTransferOpen(true)}>
                      {t("Transfer Room")}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* dialog 5: Internal Reservation Block */}
      <Dialog open={reserveOpen} onOpenChange={setReserveOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-orange-600" /> {t("Internal Reservation Block")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddReservation} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Blocked Date *")}</Label>
              <Input type="date" value={reserveDate} onChange={(e) => setReserveDate(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Block Reason / Usage *")}</Label>
              <Input value={reserveReason} onChange={(e) => setReserveReason(e.target.value)} placeholder={t("e.g. Temple Function / Private Event")} required className="mt-1" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setReserveOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">{t("Apply Block")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 6: Maintenance Dates Block */}
      <Dialog open={blackoutOpen} onOpenChange={setBlackoutOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" /> {t("Add Maintenance Blackout Date")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBlackout} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Maintenance Date *")}</Label>
              <Input type="date" value={blackoutDate} onChange={(e) => setBlackoutDate(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Reason Details")}</Label>
              <Input value={blackoutReason} onChange={(e) => setBlackoutReason(e.target.value)} placeholder={t("e.g. Painting / Electrical Repairs")} className="mt-1" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setBlackoutOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">{t("Confirm Blackout")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 7: Request Information Input */}
      <Dialog open={requestInfoOpen} onOpenChange={setRequestInfoOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle>{t("Request Additional Information")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Information Needed Reason *")}</Label>
              <Textarea value={requestInfoReason} onChange={(e) => setRequestInfoReason(e.target.value)} placeholder={t("Describe what details the devotee must supply")} required className="mt-1" />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setRequestInfoOpen(false)}>{t("Cancel")}</Button>
              <Button className="bg-slate-800 hover:bg-slate-900 text-white font-bold"
                onClick={() => { handleBookingDecision(detailBooking.id, "REQUEST_INFO", requestInfoReason); setRequestInfoOpen(false); }}>
                {t("Submit Info Request")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* dialog 8: Front Desk Check-In Modal */}
      <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-600" /> {t("Front Desk Check-In")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCheckIn} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Vehicle Number (Optional)")}</Label>
                <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder={t("e.g. GJ 01 AB 1234")} className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Additional Guests Count")}</Label>
                <Input type="number" min={0} value={additionalGuests} onChange={(e) => setAdditionalGuests(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("ID Proof Type")}</Label>
                <select value={idProofType} onChange={(e) => setIdProofType(e.target.value)} className="w-full mt-1 h-9 rounded border text-xs px-2">
                  <option value="Aadhaar Card">{t("Aadhaar Card")}</option>
                  <option value="PAN Card">{t("PAN Card")}</option>
                  <option value="Passport">{t("Passport")}</option>
                  <option value="Voter ID">{t("Voter ID")}</option>
                </select>
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("ID Proof Number")}</Label>
                <Input value={idProofNumber} onChange={(e) => setIdProofNumber(e.target.value)} placeholder={t("e.g. 1234-5678-9012")} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Check-In Stay Remarks")}</Label>
              <Textarea value={stayNotes} onChange={(e) => setStayNotes(e.target.value)} placeholder={t("Front desk notes...")} className="mt-1" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setCheckInOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">{t("Complete Check-In (Set Occupied)")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 9: Front Desk Check-Out Modal */}
      <Dialog open={checkOutOpen} onOpenChange={setCheckOutOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-600" /> {t("Front Desk Check-Out & Final Bill")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCheckOut} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Additional Charges (INR)")}</Label>
              <Input type="number" min={0} value={additionalCharges} onChange={(e) => setAdditionalCharges(e.target.value)} placeholder="0" className="mt-1" />
            </div>

            <div className="border-t pt-3 space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Split Payment Collection")}</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] text-slate-500">{t("Cash (INR)")}</Label>
                  <Input type="number" min={0} value={splitCash} onChange={(e) => setSplitCash(e.target.value)} placeholder="0" className="mt-1" />
                </div>
                <div>
                  <Label className="text-[10px] text-slate-500">{t("UPI / Card (INR)")}</Label>
                  <Input type="number" min={0} value={splitUpi} onChange={(e) => setSplitUpi(e.target.value)} placeholder="0" className="mt-1" />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setCheckOutOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold">{t("Confirm Check-Out & Issue Receipt")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 10: Room Transfer Modal */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle>{t("Transfer Room / Unit")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransferRoom} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("New Room / Unit ID *")}</Label>
              <Input value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)} placeholder={t("e.g. Room 202")} required className="mt-1" />
            </div>
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Transfer Reason")}</Label>
              <Input value={transferReason} onChange={(e) => setTransferReason(e.target.value)} placeholder={t("e.g. AC malfunction in 101")} className="mt-1" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setTransferOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">{t("Transfer Room")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 11: Extend Stay Modal */}
      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle>{t("Extend Stay Duration")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExtendStay} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Additional Days *")}</Label>
              <Input type="number" min={1} value={extendDays} onChange={(e) => setExtendDays(e.target.value)} required className="mt-1" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setExtendOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">{t("Extend Stay & Update Booking")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 12: Date Click Action Options Modal */}
      <Dialog open={dateOptionsOpen} onOpenChange={setDateOptionsOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between font-bold text-slate-850">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                {t("Actions for")} {selectedClickedDate?.formattedDate}
              </span>
              <StatusBadge status={selectedClickedDate?.status || "AVAILABLE"} />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <p className="text-slate-500 text-[11px]">
              {t("Select an operational action to perform for")} <strong className="text-slate-800">{selectedCalendarItem?.name || "this facility"}</strong> on <strong className="text-slate-800">{selectedClickedDate?.formattedDate}</strong>:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDateOptionsOpen(false);
                  setBookDateFrom(selectedClickedDate.dateStr);
                  setBookDateTo(selectedClickedDate.dateStr);
                  setNewBookingOpen(true);
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-700 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{t("Submit New Booking Request")}</div>
                    <div className="text-[10px] text-slate-400">{t("Pre-fill booking start date for")} {selectedClickedDate?.formattedDate}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateOptionsOpen(false);
                  setReserveDate(selectedClickedDate.dateStr);
                  setReserveOpen(true);
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Ban className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{t("Add Internal Reservation / Block")}</div>
                    <div className="text-[10px] text-slate-400">{t("Reserve unit for VIP, Monk, Trust, or Private event")}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateOptionsOpen(false);
                  setBlackoutDate(selectedClickedDate.dateStr);
                  setBlackoutOpen(true);
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{t("Mark Maintenance / Blackout Date")}</div>
                    <div className="text-[10px] text-slate-400">{t("Block facility for repairs or cleaning blackout")}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-rose-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateOptionsOpen(false);
                  setQ(selectedClickedDate.dateStr);
                  handleTabChange("admin_bookings");
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{t("View Ledger Requests on This Date")}</div>
                    <div className="text-[10px] text-slate-400">{t("Filter and audit bookings for")} {selectedClickedDate?.formattedDate}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setDateOptionsOpen(false)}>{t("Close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
