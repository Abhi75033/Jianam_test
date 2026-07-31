import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, extractErrorMessage, STATIC_URL } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, MapPin, Trash2, X, CheckCircle, Coffee, Shield, Building2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  INDIAN_STATE_OPTIONS, ORG_TYPE_OPTIONS, ALL_COUNTRIES,
  toOptions,
} from "@/constants/dropdownOptions";
import TimePicker, { TimeRangePicker } from "@/components/common/TimePicker";
import MemberLinkSelect from "@/components/common/MemberLinkSelect";
import { useLanguage } from "@/contexts/LanguageContext";

const FACILITY_OPTIONS = [
  "Parking", "CCTV", "Lift", "AC", "Cafeteria", "Medical", "Library", "Ramp", "Wheelchair Access",
  "Fire Safety", "Solar Power", "Dharamshala", "Bhojanshala", "Upashray", "Event Hall"
];
const ROOM_AMENITIES_LIST = [
  "Heater",
  "Extra Mattress Available upon Availability",
  "Common Bathroom",
  "Western Toilet",
  "Indian Toilet",
  "Hot Water (Geyser)",
  "Solar Hot Water",
  "Generator Backup",
  "Free Wi-Fi",
  "Drinking Water",
  "Wheelchair Accessible",
  "Lift Access",
  "Senior Citizen Friendly",
  "CCTV on Floor",
  "First Aid Available",
  "Parking",
  "Pet Friendly",
  "Other"
];
const TRUSTEE_DESIGNATIONS = [
  "President",
  "Vice President",
  "Secretary",
  "Joint Secretary",
  "Treasurer",
  "Trustee",
  "Committee Member",
  "Other"
];
const TEMPLE_TYPES = ["SHIKHAR_BADDHA", "GHAR_DERASAR", "JAIN_CENTRE"];

const REGIONS_CURRENCIES = {
  "India": "INR (₹)",
  "United Kingdom": "GBP (£)",
  "United States": "USD ($)",
  "Canada": "CAD (C$)",
  "Australia": "AUD (A$)",
  "United Arab Emirates": "AED (د.إ)",
  "Singapore": "SGD (S$)",
  "Kenya": "KES (KSh)",
  "South Africa": "ZAR (R)",
};

const SHWETAMBAR_SUB = ["Murtipujak", "Sthanakvasi", "Terapanth", "Other"];
const DIGAMBAR_SUB = ["Bisapantha", "Terapantha", "Taranapantha", "Gumanapantha", "Totapantha", "Kanjipantha", "Other Digambar Traditions"];

const MURTIPUJAK_GACCHAS = [
  "Upkeśa Gaccha", "Achal Gaccha", "Jiravala Gaccha", "Kharatara Gaccha", "Lonka (Richmati) Gaccha",
  "Tapa Gaccha", "Gangeshvara Gaccha", "Korantavala Gaccha", "Anandapura Gaccha", "Bharavali Gaccha",
  "Udhaviya Gaccha", "Gudava Gaccha", "Dekawa Gaccha", "Bhinmala Gaccha", "Mahudiya Gaccha",
  "Gachhapala Gaccha", "Goshavala Gaccha", "Magatragada Gaccha", "Vrihmaniya Gaccha", "Talara Gaccha",
  "Vikadiya Gaccha", "Munjhiya Gaccha", "Chitroda Gaccha", "Sachora Gaccha", "Jachandiya Gaccha",
  "Sidhalava Gaccha", "Miyanniya Gaccha", "Agamiya Gaccha", "Maladhari Gaccha", "Bhavariya Gaccha",
  "Paliwala Gaccha", "Nagadigeshvara Gaccha", "Dharmaghosha Gaccha", "Nagapura Gaccha", "Uchatavala Gaccha",
  "Nannavala Gaccha", "Sadera Gaccha", "Mandovara Gaccha", "Surani Gaccha", "Khambhavati Gaccha",
  "Panchanda Gaccha", "Sopariya Gaccha", "Mandaliya Gaccha", "Kochhipana Gaccha", "Jaganna Gaccha",
  "Laparavala Gaccha", "Vosarada Gaccha", "Duivandaniya Gaccha", "Chitravala Gaccha", "Vegada Gaccha",
  "Vapada Gaccha", "Vijahara Gaccha", "Kapuri Gaccha", "Kachala Gaccha", "Handaliya Gaccha",
  "Mahukara Gaccha", "Putaliya Gaccha", "Kannariseya Gaccha", "Revardiya Gaccha", "Dhandhuka Gaccha",
  "Thambhanipana Gaccha", "Panchivala Gaccha", "Palanpura Gaccha", "Gandhariya Gaccha", "Veliya Gaccha",
  "Sadhapunamiya Gaccha", "Nagarakotiya Gaccha", "Hasora Gaccha", "Bhatanera Gaccha", "Janahara Gaccha",
  "Jagayana Gaccha", "Bhimasena Gaccha", "Takadiya Gaccha", "Kamboja Gaccha", "Senata Gaccha",
  "Vaghera Gaccha", "Vahediya Gaccha", "Siddhapura Gaccha", "Ghoghari Gaccha", "Nigamiya Gaccha"
];
const MemberSelect = ({ label, value, onChange, placeholder = "Select Member..." }) => {
  return (
    <div>
      <Label className="text-xs font-semibold text-slate-600 mb-1 block">{label}</Label>
      <MemberLinkSelect
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        returnValueType="id"
      />
    </div>
  );
};

export default function OrgListPage({
  endpoint,
  entity,
  label,
  pluralLabel,
  moduleKey,
  testId,
}) {
  const { canDo, isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Wizard tab
  const [tab, setTab] = useState("basic");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [bhagwans, setBhagwans] = useState([]);

  // Custom deity creation states
  const [createDeityOpen, setCreateDeityOpen] = useState(false);
  const [deityName, setDeityName] = useState("");
  const [deityCategory, setDeityCategory] = useState("24 Tirthankars");
  const [deitySaving, setDeitySaving] = useState(false);

  const [form, setForm] = useState({
    name: "", shortName: "", trustName: "", trustRegistrationNumber: "", history: "",
    addressLine: "", city: "", state: "", country: "India", pincode: "",
    phone: "", website: "", googleMapsLink: "", establishedDate: "",
    templeType: "SHIKHAR_BADDHA", sect: "Shwetambar", subSect: "Murtipujak",
    gacchaName: "", mulNayakBhagwanId: "", muritCount: "", tithiCalendar: "Gujarati",
    upiId: "", bankAccount: "", bankIfsc: "", hasBhojanshala: false,
    hasUpashray: false, hasEventHall: false, hasDharamshala: false, hasPathshala: false,
    upashrayLocation: "Within Property", eventHallPurpose: "Available for Booking",
    eventHallBookingLink: "", bhojanshalaBreakfast: "07:00 AM - 08:30 AM",
    bhojanshalaLunch: "11:30 AM - 01:00 PM", bhojanshalaDinner: "05:00 PM - 06:00 PM",
    bhojanshalaMealType: "Free", bhojanshalaAvailability: "Daily", bhojanshalaContact: "",
    dharamshalaRooms: "Both", dharamshalaOffice: "09:00 AM - 08:00 PM", dharamshalaPhone: "",
    dharamshalaContact: "", dharamshalaOnline: "No", pathshalaTimings: "04:30 PM - 06:00 PM",
    pathshalaDays: "Sat, Sun", pathshalaTeacher: "", morningStart: "06:00 AM",
    morningEnd: "12:00 PM", eveningStart: "05:30 PM", eveningEnd: "09:00 PM",
    pakshalStart: "06:30 AM", pakshalEnd: "08:00 AM", poojaStart: "07:00 AM",
    poojaEnd: "08:30 AM", aartiMorning: "08:30 AM", aartiEvening: "07:30 PM",
    is80gEligible: false, csrEligible: false, facilities: [], preferredCurrency: "INR (₹)",
    // Dharamshala properties
    landmark: "", railwayStation: "", district: "", hasTempleInside: false,
    templeMulNayakName: "", templeMulNayakImageUrl: "", templeTithiCalendar: "Gujarati",
    templeOpeningHours: "", templePakshalStart: "", templePoojaStart: "", templeAartiEvening: "",
    buildings: [], checkInTime: "12:00 PM", checkOutTime: "11:00 AM",
    advanceBookingRequired: false, onlineBookingAvailable: false,
    dharamshalaStatus: "High Availability", adminBlockedRooms: "",
    emergencyContact: "", caretakerDetails: "", rulesText: "",
    primaryContactMemberId: "", secondaryContactNumber: "",
    contactMobileVerified: false, contactWhatsAppVerified: false, contactEmailVerified: false,
    primaryContactPreference: "Mobile", trusteesList: [], volunteersList: [],
    instaLink: "", facebookLink: "", youtubeLink: "", donationQrCodeUrl: "", bankName: "", bankBranch: ""
  });

  useEffect(() => {
    api.get("/master-data/bhagwans").then((r) => setBhagwans(r.data?.data || [])).catch(() => {});
  }, [open]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(endpoint)
      .then((res) => {
        const list = res.data?.data?.items || res.data?.data || [];
        if (mounted) setRows(list);
      })
      .catch(() => mounted && setRows([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [endpoint, reloadKey]);

  // Sync currency automatically on country change
  useEffect(() => {
    if (form.country) {
      const defaultCur = REGIONS_CURRENCIES[form.country] || "USD ($)";
      setForm((f) => ({ ...f, preferredCurrency: defaultCur }));
    }
  }, [form.country]);

  const handleCreateDeitySubmit = async (e) => {
    e.preventDefault();
    if (!deityName.trim()) { toast.error(t("Deity name is required.")); return; }
    setDeitySaving(true);
    try {
      const res = await api.post("/master-data/bhagwans", { name: deityName.trim(), category: deityCategory });
      toast.success(t("Deity created successfully!"));
      const r = await api.get("/master-data/bhagwans");
      const updatedBhagwans = r.data?.data || [];
      setBhagwans(updatedBhagwans);
      const newDeity = updatedBhagwans.find(b => b.name === deityName.trim());
      if (newDeity) {
        setForm(prev => ({ ...prev, mulNayakBhagwanId: newDeity.id }));
      }
      setDeityName("");
      setCreateDeityOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeitySaving(false);
    }
  };

  const ORG_TYPE = { temple: "TEMPLE", dharamshala: "DHARAMSHALA", "jain-center": "JAIN_CENTER" };

  const create = async () => {
    setCreating(true);
    try {
      const payload = { ...form };
      if (!payload.mulNayakBhagwanId) delete payload.mulNayakBhagwanId;
      if (payload.buildings && Array.isArray(payload.buildings)) {
        payload.buildings = payload.buildings.map((b) => ({
          ...b,
          roomTypes: (b.roomTypes || []).map((r) => ({
            ...r,
            roomCount: String(r.roomCount || r.totalCount || "0"),
            bedCapacity: String(r.bedCapacity || r.maxOccupancy || "2"),
            extraMattressCount: r.extraMattressCount ? Number(r.extraMattressCount) : 0,
            extraMattressCharge: r.extraMattressCharge ? Number(r.extraMattressCharge) : undefined,
            roomNumber: typeof r.roomNumbers === "string" ? r.roomNumbers : String(r.roomNumbers || ""),
            roomNumbers: typeof r.roomNumbers === "string" ? r.roomNumbers.split(",").map(x => x.trim()).filter(Boolean) : (r.roomNumbers || []),
            images: (r.images || []).slice(0, 6),
          })),
        }));
      }
      await api.post(endpoint, { 
        ...payload, 
        type: ORG_TYPE[entity] || "TEMPLE",
        muritCount: payload.muritCount ? Number(payload.muritCount) : undefined,
        establishedDate: payload.establishedDate ? new Date(payload.establishedDate).toISOString() : undefined
      });
      toast.success(`${label} created successfully.`);
      setOpen(false);
      setForm({
        name: "", shortName: "", trustName: "", trustRegistrationNumber: "", history: "",
        addressLine: "", city: "", state: "", country: "India", pincode: "",
        phone: "", website: "", googleMapsLink: "", establishedDate: "",
        templeType: "SHIKHAR_BADDHA", sect: "Shwetambar", subSect: "Murtipujak",
        gacchaName: "", mulNayakBhagwanId: "", muritCount: "", tithiCalendar: "Gujarati",
        upiId: "", bankAccount: "", bankIfsc: "", hasBhojanshala: false,
        hasUpashray: false, hasEventHall: false, hasDharamshala: false, hasPathshala: false,
        upashrayLocation: "Within Property", eventHallPurpose: "Available for Booking",
        eventHallBookingLink: "", bhojanshalaBreakfast: "07:00 AM - 08:30 AM",
        bhojanshalaLunch: "11:30 AM - 01:00 PM", bhojanshalaDinner: "05:00 PM - 06:00 PM",
        bhojanshalaMealType: "Free", bhojanshalaAvailability: "Daily", bhojanshalaContact: "",
        dharamshalaRooms: "Both", dharamshalaOffice: "09:00 AM - 08:00 PM", dharamshalaPhone: "",
        dharamshalaContact: "", dharamshalaOnline: "No", pathshalaTimings: "04:30 PM - 06:00 PM",
        pathshalaDays: "Sat, Sun", pathshalaTeacher: "", morningStart: "06:00 AM",
        morningEnd: "12:00 PM", eveningStart: "05:30 PM", eveningEnd: "09:00 PM",
        pakshalStart: "06:30 AM", pakshalEnd: "08:00 AM", poojaStart: "07:00 AM",
        poojaEnd: "08:30 AM", aartiMorning: "08:30 AM", aartiEvening: "07:30 PM",
        is80gEligible: false, csrEligible: false, facilities: [], preferredCurrency: "INR (₹)",
        // Dharamshala properties
        landmark: "", railwayStation: "", district: "", hasTempleInside: false,
        templeMulNayakName: "", templeMulNayakImageUrl: "", templeTithiCalendar: "Gujarati",
        templeOpeningHours: "", templePakshalStart: "", templePoojaStart: "", templeAartiEvening: "",
        buildings: [], checkInTime: "12:00 PM", checkOutTime: "11:00 AM",
        advanceBookingRequired: false, onlineBookingAvailable: false,
        dharamshalaStatus: "High Availability", adminBlockedRooms: "",
        emergencyContact: "", caretakerDetails: "", rulesText: "",
        primaryContactMemberId: "", secondaryContactNumber: "",
        contactMobileVerified: false, contactWhatsAppVerified: false, contactEmailVerified: false,
        primaryContactPreference: "Mobile", trusteesList: [], volunteersList: [],
        instaLink: "", facebookLink: "", youtubeLink: "", donationQrCodeUrl: "", bankName: "", bankBranch: ""
      });
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setCreating(false);
    }
  };

  const toggleFacility = (f) => setForm((prev) => ({
    ...prev,
    facilities: prev.facilities.includes(f)
      ? prev.facilities.filter((x) => x !== f)
      : [...prev.facilities, f],
  }));

  const addBuilding = () => {
    const newB = {
      id: Date.now().toString(),
      name: `Building ${String.fromCharCode(65 + (form.buildings?.length || 0))}`,
      imageUrl: "",
      roomTypes: []
    };
    setForm(prev => ({ ...prev, buildings: [...(prev.buildings || []), newB] }));
  };

  const removeBuilding = (bid) => {
    setForm(prev => ({ ...prev, buildings: (prev.buildings || []).filter(b => b.id !== bid) }));
  };

  const updateBuildingName = (bid, name) => {
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? { ...b, name } : b)
    }));
  };

  const addRoomType = (bid) => {
    const newRoom = {
      id: Date.now().toString(),
      name: "Standard AC Room",
      category: "AC",
      type: "Private",
      roomCount: "10",
      bedCapacity: "2",
      charges: "1200",
      chargesType: "Per Room",
      deposit: "500",
      attachedBathroom: "Yes",
      amenities: ["Fan", "AC", "Geyser"]
    };
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? { ...b, roomTypes: [...(b.roomTypes || []), newRoom] } : b)
    }));
  };

  const updateRoomType = (bid, rid, key, value) => {
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? {
        ...b,
        roomTypes: (b.roomTypes || []).map(r => r.id === rid ? { ...r, [key]: value } : r)
      } : b)
    }));
  };

  const removeRoomType = (bid, rid) => {
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? {
        ...b,
        roomTypes: (b.roomTypes || []).filter(r => r.id !== rid)
      } : b)
    }));
  };

  const addTrusteeRow = () => {
    const newT = { id: Date.now().toString(), memberId: "", designation: "Trustee" };
    setForm(prev => ({ ...prev, trusteesList: [...(prev.trusteesList || []), newT] }));
  };
  const removeTrusteeRow = (id) => {
    setForm(prev => ({ ...prev, trusteesList: (prev.trusteesList || []).filter(t => t.id !== id) }));
  };
  const updateTrusteeRow = (id, key, value) => {
    setForm(prev => ({
      ...prev,
      trusteesList: (prev.trusteesList || []).map(t => t.id === id ? { ...t, [key]: value } : t)
    }));
  };

  const addVolunteerRow = () => {
    const newV = { id: Date.now().toString(), memberId: "" };
    setForm(prev => ({ ...prev, volunteersList: [...(prev.volunteersList || []), newV] }));
  };
  const removeVolunteerRow = (id) => {
    setForm(prev => ({ ...prev, volunteersList: (prev.volunteersList || []).filter(v => v.id !== id) }));
  };
  const updateVolunteerRow = (id, value) => {
    setForm(prev => ({
      ...prev,
      volunteersList: (prev.volunteersList || []).map(v => v.id === id ? { ...v, memberId: value } : v)
    }));
  };

  const field = (lbl, key, type = "text", placeholder = "") => (
    <div>
      <Label className="text-xs font-semibold text-slate-655">{lbl}</Label>
      <Input className="mt-1 bg-white h-9" type={type} value={form[key] || ""} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  const toggle = (lbl, key) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" className="h-4.5 w-4.5 text-orange-500 rounded border-slate-350" checked={!!form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
      <span className="text-sm font-bold text-slate-700">{lbl}</span>
    </label>
  );

  const columns = [
    {
      key: "logoUrl", header: t("Logo"), width: 70,
      render: (r) => (
        <div className="h-10 w-10 rounded-lg bg-orange-50 border border-orange-200/60 overflow-hidden flex items-center justify-center shadow-xs">
          {r.logoUrl || r.coverImageUrl ? (
            <img
              src={r.logoUrl?.startsWith("http") ? r.logoUrl : r.coverImageUrl?.startsWith("http") ? r.coverImageUrl : `${STATIC_URL}${r.logoUrl || r.coverImageUrl}`}
              alt="" className="h-full w-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <Building2 className="h-5 w-5 text-orange-600/70" />
          )}
        </div>
      ),
    },
    {
      key: "publicId", header: t("ID"), width: 110,
      render: (r) => (
        <Badge variant="outline" className="font-mono text-[10px] tracking-wider">{r.publicId || "—"}</Badge>
      ),
    },
    {
      key: "name", header: t("Name"),
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.name || "—"}</div>
          {r.trustName && <div className="text-xs text-slate-400">{r.trustName}</div>}
        </div>
      ),
    },
    {
      key: "location", header: t("Location"),
      render: (r) => (
        <span className="text-slate-600 text-xs font-semibold">
          {[r.city, r.state].filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    { key: "templeType", header: t("Type"), render: (r) => <span className="text-xs font-bold text-slate-655 bg-slate-50 border px-2 py-0.5 rounded">{r.templeType || r.type || "—"}</span> },
    {
      key: "status",
      header: t("Status & Access Control"),
      render: (r) => {
        const hasAdminAccess = Boolean(
          r.adminUserId ||
          (r.userOrganizations && r.userOrganizations.length > 0) ||
          r.hasAdminAccess ||
          r.status === "ACTIVE"
        );
        return (
          <div className="flex flex-col gap-0.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold w-max ${
                hasAdminAccess
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-rose-100 text-rose-800 border border-rose-300"
              }`}
            >
              {hasAdminAccess ? "ACTIVE" : "INACTIVE"}
            </span>
            <span className="text-[9px] text-slate-400 font-medium leading-tight">
              {hasAdminAccess ? t("Admin Access Assigned") : t("No Admin Access")}
            </span>
          </div>
        );
      },
    },
  ];

  const filtered = q
    ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()))
    : rows;

  const isDharamshala = entity === "dharamshala";

  const configTabs = isDharamshala ? [
    { id: "basic", label: t("🏨 Basic Info") },
    { id: "temple", label: t("🛕 Inside Temple") },
    { id: "location", label: t("📍 Location & Contact") },
    { id: "accommodations", label: t("🏢 Accommodations") },
    { id: "facilities", label: t("✨ Facilities") },
    { id: "food", label: t("🥗 Bhojanalay") },
    { id: "contacts", label: t("👥 Contacts & Management") },
    { id: "trustees", label: t("📜 Trustees & Committee") },
    { id: "volunteers", label: t("🤝 Volunteers") },
    { id: "rules", label: t("📋 Rules & Safety") },
    { id: "bank", label: t("💰 Banking Details") },
    { id: "links", label: t("🔗 Social & UX Links") }
  ] : [
    { id: "basic", label: t("🛕 Basic & Trust") },
    { id: "location", label: t("📍 Location & Maps") },
    { id: "facilities", label: t("🏢 Facilities & Units") },
    { id: "timings", label: t("🕒 Slot Timings") },
    { id: "finance", label: t("💰 Banking Details") }
  ];

  return (
    <div data-testid={testId} className="space-y-4">
      <PageHeader
        title={pluralLabel}
        subtitle={`Centralized directory of all ${pluralLabel.toLowerCase()} managed across the network platform.`}
        actions={
          isSuperAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button data-testid={`${testId}-add-button`} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                  <Plus className="h-4 w-4 mr-2" /> {t("New")} {label}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl md:max-w-5xl w-full p-0 overflow-hidden rounded-2xl shadow-2xl bg-white border border-slate-100 h-[88vh] max-h-[92vh] flex flex-col">
                <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
                  
                  {/* Left panel selector */}
                  <div className="w-full md:w-60 bg-slate-900 text-slate-350 p-5 flex flex-col gap-1 shrink-0 border-r border-slate-800 h-full">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-2">{t("Setup Sections")}</div>
                    {configTabs.map((tItem) => (
                      <button
                        key={tItem.id}
                        onClick={() => setTab(tItem.id)}
                        className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                          tab === tItem.id
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"
                        }`}
                      >
                        {t(tItem.label)}
                      </button>
                    ))}
                  </div>

                  {/* Form Content */}
                  <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
                      
                      {tab === "basic" && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">
                            {isDharamshala ? t("🏨 Create New Dharamshala") : `🛕 Create New ${label}`}
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">{field(isDharamshala ? t("Dharamshala Name *") : t("Name *"), "name")}</div>
                            {field("Short Name", "shortName")}
                            {field("Established Date", "establishedDate", "date")}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">{t("Community")}</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                value={form.sect || ""} onChange={(e) => setForm({ ...form, sect: e.target.value, subSect: e.target.value === "Digambar" ? "Bisapantha" : "Murtipujak" })}>
                                <option value="Shwetambar">{t("Shwetambar")}</option>
                                <option value="Digambar">{t("Digambar")}</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">{t("Sub-Sect / Tradition")}</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                value={form.subSect || ""} onChange={(e) => setForm({ ...form, subSect: e.target.value })}>
                                {form.sect === "Digambar" ? (
                                  DIGAMBAR_SUB.map(s => <option key={s} value={s}>{t(s)}</option>)
                                ) : (
                                  SHWETAMBAR_SUB.map(s => <option key={s} value={s}>{t(s)}</option>)
                                )}
                              </select>
                            </div>
                          </div>

                          {form.sect === "Shwetambar" && form.subSect === "Murtipujak" && (
                            <div>
                              <Label className="text-xs">{t("Gaccha")}</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                value={form.gacchaName || ""} onChange={(e) => setForm({ ...form, gacchaName: e.target.value })}>
                                <option value="">{t("Select Gaccha...")}</option>
                                {MURTIPUJAK_GACCHAS.map(g => <option key={g} value={g}>{t(g)}</option>)}
                              </select>
                            </div>
                          )}

                          {!isDharamshala && label !== "Stanak" && entity !== "STANAK" && form.subSect !== "Sthanakvasi" && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">{t("Mul Nayak Bhagwan")}</Label>
                                  {isSuperAdmin && (
                                    <button type="button" onClick={() => setCreateDeityOpen(true)}
                                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold transition-all">
                                      {t("+ Create Deity")}
                                    </button>
                                  )}
                                </div>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={form.mulNayakBhagwanId || ""} onChange={(e) => setForm({ ...form, mulNayakBhagwanId: e.target.value })}>
                                  <option value="">{t("Select Bhagwan...")}</option>
                                  {bhagwans.filter(b => b.category === "24 Tirthankars").length > 0 && (
                                    <optgroup label={t("24 Tirthankars")}>
                                      {bhagwans.filter(b => b.category === "24 Tirthankars").map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                      ))}
                                    </optgroup>
                                  )}
                                  {bhagwans.filter(b => b.category !== "24 Tirthankars").length > 0 && (
                                    <optgroup label={t("Others")}>
                                      {bhagwans.filter(b => b.category !== "24 Tirthankars").map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                      ))}
                                    </optgroup>
                                  )}
                                </select>
                              {field("Murti Count", "muritCount", "number")}
                            </div>
                          )}

                          {!isDharamshala && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">{t("Temple / JC Type")}</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={form.templeType || ""} onChange={(e) => setForm({ ...form, templeType: e.target.value })}>
                                  {TEMPLE_TYPES.map((tItem) => <option key={tItem} value={tItem}>{t(tItem.replace(/_/g, " "))}</option>)}
                                </select>
                              </div>
                              <div>
                                <Label className="text-xs">{t("Tithi Calendar Type")}</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={form.tithiCalendar || ""} onChange={(e) => setForm({ ...form, tithiCalendar: e.target.value })}>
                                  {["Gujarati", "Hindi", "Kutchi", "Marathi", "Marwari", "Other"].map(m => (
                                    <option key={m} value={m}>{t(m)}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            {field("Trust Name", "trustName")}
                            {field("Trust Registration Number", "trustRegistrationNumber")}
                          </div>

                          <div>
                            <Label className="text-xs">{t("History / Background Details")}</Label>
                            <textarea rows={2} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none"
                              value={form.history || ""} onChange={(e) => setForm({ ...form, history: e.target.value })} placeholder={t("Historical background...")} />
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "temple" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🛕 Temple Inside Dharamshala Premises")}</h3>
                          {toggle("Temple Available Inside?", "hasTempleInside")}
                          {form.hasTempleInside && (
                            <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                              <div>
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs font-semibold text-slate-700">{t("Mul Nayak Bhagwan")}</Label>
                                  {isSuperAdmin && (
                                    <button type="button" onClick={() => setCreateDeityOpen(true)}
                                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold transition-all">
                                      {t("+ Create Deity")}
                                    </button>
                                  )}
                                </div>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                  value={form.templeMulNayakName || ""} onChange={(e) => setForm({ ...form, templeMulNayakName: e.target.value })}>
                                  <option value="">{t("Select Bhagwan...")}</option>
                                  {bhagwans.filter(b => b.category === "24 Tirthankars").length > 0 && (
                                    <optgroup label={t("24 Tirthankars")}>
                                      {bhagwans.filter(b => b.category === "24 Tirthankars").map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                      ))}
                                    </optgroup>
                                  )}
                                  {bhagwans.filter(b => b.category !== "24 Tirthankars").length > 0 && (
                                    <optgroup label={t("Others")}>
                                      {bhagwans.filter(b => b.category !== "24 Tirthankars").map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                      ))}
                                    </optgroup>
                                  )}
                                </select>
                              </div>
                              {field("Mul Nayak Image URL", "templeMulNayakImageUrl", "text", "https://...")}
                              <div>
                                <Label className="text-xs">{t("Temple Type")}</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                  value={form.templeType || "Griha Chaityalaya"} onChange={(e) => setForm({ ...form, templeType: e.target.value })}>
                                  <option value="Shikhar-baddha">{t("Shikhar-baddha")}</option>
                                  <option value="Griha Chaityalaya">{t("Griha Chaityalaya")}</option>
                                </select>
                              </div>
                              <div>
                                <Label className="text-xs">{t("Select Tithi Calendar")}</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                  value={form.templeTithiCalendar || "Gujarati"} onChange={(e) => setForm({ ...form, templeTithiCalendar: e.target.value })}>
                                  <option value="Gujarati">{t("Gujarati")}</option>
                                  <option value="Hindi">{t("Hindi")}</option>
                                  <option value="Marwari">{t("Marwari")}</option>
                                  <option value="Other">{t("Other")}</option>
                                </select>
                              </div>

                              {/* Opening Timings: Morning & Evening Clock Time Pickers */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Morning Opening Timings")}</Label>
                                  <TimeRangePicker
                                    fromValue={form.morningStart || "06:00 AM"}
                                    toValue={form.morningEnd || "12:00 PM"}
                                    onFromChange={(val) => setForm(prev => ({ ...prev, morningStart: val }))}
                                    onToChange={(val) => setForm(prev => ({ ...prev, morningEnd: val }))}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Evening Opening Timings")}</Label>
                                  <TimeRangePicker
                                    fromValue={form.eveningStart || "05:30 PM"}
                                    toValue={form.eveningEnd || "09:00 PM"}
                                    onFromChange={(val) => setForm(prev => ({ ...prev, eveningStart: val }))}
                                    onToChange={(val) => setForm(prev => ({ ...prev, eveningEnd: val }))}
                                  />
                                </div>
                              </div>

                              {/* Pakshal, Pooja & Aarti Clock Pickers */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Pakshal Timings")}</Label>
                                  <TimePicker
                                    value={form.templePakshalStart || form.pakshalStart || "06:30 AM"}
                                    onChange={(t) => setForm(prev => ({ ...prev, templePakshalStart: t, pakshalStart: t }))}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Morning Pooja Timings")}</Label>
                                  <TimePicker
                                    value={form.templePoojaStart || form.poojaStart || "07:30 AM"}
                                    onChange={(t) => setForm(prev => ({ ...prev, templePoojaStart: t, poojaStart: t }))}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Morning Aarti Timings")}</Label>
                                  <TimePicker
                                    value={form.aartiMorning || "08:30 AM"}
                                    onChange={(t) => setForm(prev => ({ ...prev, aartiMorning: t }))}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Evening Aarti Timings")}</Label>
                                  <TimePicker
                                    value={form.templeAartiEvening || form.aartiEvening || "07:15 PM"}
                                    onChange={(t) => setForm(prev => ({ ...prev, templeAartiEvening: t, aartiEvening: t }))}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {tab === "location" && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("📍 Address & Contact Details")}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">{field("Full Address", "addressLine")}</div>
                            {isDharamshala && field("Nearest Landmark", "landmark")}
                            {isDharamshala && field("Nearest Railway Station / Bus Stop", "railwayStation")}
                            {isDharamshala && field("District", "district")}
                            {field("City", "city")}
                            {field("State", "state")}
                            <div>
                               <Label className="text-xs font-semibold text-slate-655">{t("Country")}</Label>
                               <select
                                 className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                 value={form.country || "India"}
                                 onChange={(e) => setForm({ ...form, country: e.target.value })}
                               >
                                 {ALL_COUNTRIES.map((c) => (
                                   <option key={c} value={c}>{t(c)}</option>
                                 ))}
                               </select>
                             </div>
                            {field("Pin Code", "pincode")}
                            <div className="col-span-2">{field("Google Maps Link", "googleMapsLink")}</div>
                            <div className="col-span-2 space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-655">{t("Contact Number")}</Label>
                              <Input className="bg-white h-9" type="tel" value={form.phone || ""} placeholder="+91..."
                                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                              <div className="pt-1">
                                <Label className="text-[10px] font-bold text-slate-500 block mb-0.5">{t("Link Member for Contact Number")}</Label>
                                <MemberLinkSelect
                                  value={form.primaryContactMemberId}
                                  onChange={(v) => setForm({ ...form, primaryContactMemberId: v })}
                                  placeholder={t("Search member by ID or name to link...")}
                                  showPhone
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "accommodations" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🏢 Accommodations & Building Management")}</h3>
                          
                          {/* Building List */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-105 p-3 rounded-xl border">
                              <span className="text-xs font-bold text-slate-700">{t("🏢 Buildings:")} {form.buildings?.length || 0}</span>
                              <Button type="button" size="sm" onClick={addBuilding} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-7 text-xs">
                                {t("+ Add Building")}
                              </Button>
                            </div>

                            {(form.buildings || []).map((b, bIdx) => (
                              <div key={b.id || bIdx} className="border p-4 rounded-xl bg-white space-y-3 relative shadow-sm">
                                <button type="button" onClick={() => removeBuilding(b.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                
                                <div className="grid grid-cols-2 gap-3 pr-8">
                                  <div>
                                    <Label className="text-xs font-bold">{t("Building Name / Identifier")}</Label>
                                    <Input value={b.name} onChange={(e) => updateBuildingName(b.id, e.target.value)} className="mt-1 h-9" placeholder={t("e.g. Building A")} />
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold">{t("Building Image URL (Optional)")}</Label>
                                    <Input value={b.imageUrl} onChange={(e) => {
                                      setForm(prev => ({
                                        ...prev,
                                        buildings: prev.buildings.map(x => x.id === b.id ? { ...x, imageUrl: e.target.value } : x)
                                      }));
                                    }} className="mt-1 h-9" placeholder="https://..." />
                                  </div>
                                </div>

                                {/* Room Types in this Building */}
                                <div className="mt-3 space-y-2">
                                  <div className="flex justify-between items-center border-t pt-2">
                                    <span className="text-xs font-bold text-slate-600">{t("🛏 Room Types inside")} {b.name}</span>
                                    <Button type="button" size="sm" variant="outline" onClick={() => addRoomType(b.id)} className="h-6 text-[10px] font-bold">
                                      {t("+ Add Room Type")}
                                    </Button>
                                  </div>

                                  {(b.roomTypes || []).map((r, rIdx) => (
                                    <div key={r.id || rIdx} className="bg-slate-50 border p-3 rounded-lg space-y-2.5 relative">
                                      <button type="button" onClick={() => removeRoomType(b.id, r.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                        <X className="h-3.5 w-3.5" />
                                      </button>

                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Room Type Name")}</Label>
                                          <Input value={r.name} onChange={(e) => updateRoomType(b.id, r.id, "name", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" placeholder={t("e.g. Standard AC Room")} />
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Category")}</Label>
                                          <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                            value={r.category} onChange={(e) => updateRoomType(b.id, r.id, "category", e.target.value)}>
                                            <option value="AC Room">{t("AC Room")}</option>
                                            <option value="Non-AC Room">{t("Non-AC Room")}</option>
                                            <option value="Deluxe Room">{t("Deluxe Room")}</option>
                                            <option value="Suite">{t("Suite")}</option>
                                            <option value="Dormitory">{t("Dormitory")}</option>
                                          </select>
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Category Type")}</Label>
                                          <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                            value={r.type} onChange={(e) => updateRoomType(b.id, r.id, "type", e.target.value)}>
                                            <option value="Private">{t("Private")}</option>
                                            <option value="Shared">{t("Shared")}</option>
                                            <option value="Dormitory">{t("Dormitory")}</option>
                                          </select>
                                        </div>
                                      </div>

                                      {/* Room Numbers setup & auto room count */}
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Room Numbers Setup (e.g. 101, 102, 103)")}</Label>
                                          <Input
                                            value={r.roomNumbers || ""}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              const count = val.split(",").filter(x => x.trim().length > 0).length;
                                              updateRoomType(b.id, r.id, "roomNumbers", val);
                                              if (count > 0) updateRoomType(b.id, r.id, "roomCount", count);
                                            }}
                                            className="h-8 text-xs mt-0.5 bg-white"
                                            placeholder="101, 102, 103, 104"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("No. of Rooms")}</Label>
                                          <Input type="number" value={r.roomCount || r.totalCount} onChange={(e) => updateRoomType(b.id, r.id, "roomCount", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" placeholder="4" />
                                        </div>
                                      </div>

                                      {/* Occupancy & Bed Type */}
                                      <div className="grid grid-cols-4 gap-2">
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Maximum Occupancy")}</Label>
                                          <Input type="number" value={r.maxOccupancy || 2} onChange={(e) => updateRoomType(b.id, r.id, "maxOccupancy", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" placeholder="2" />
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Bed Type")}</Label>
                                          <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                            value={r.bedType || "Double Occupancy"} onChange={(e) => updateRoomType(b.id, r.id, "bedType", e.target.value)}>
                                            <option value="Single Occupancy">{t("Single Occupancy")}</option>
                                            <option value="Double Occupancy">{t("Double Occupancy")}</option>
                                          </select>
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Extra Mattress?")}</Label>
                                          <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                            value={r.hasExtraMattress || "No"} onChange={(e) => updateRoomType(b.id, r.id, "hasExtraMattress", e.target.value)}>
                                            <option value="No">{t("No")}</option>
                                            <option value="Yes">{t("Yes")}</option>
                                          </select>
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Extra Mattress Count")}</Label>
                                          <Input type="number" disabled={r.hasExtraMattress !== "Yes"} value={r.extraMattressCount || (r.hasExtraMattress === "Yes" ? 1 : 0)} onChange={(e) => updateRoomType(b.id, r.id, "extraMattressCount", e.target.value)} className="h-8 text-xs mt-0.5 bg-white disabled:bg-slate-100" placeholder="1" />
                                        </div>
                                      </div>

                                      {/* Charges with Currency, Basis & Extra Mattress Charge */}
                                      <div className="grid grid-cols-4 gap-2">
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Charges (")}{form.preferredCurrency || "INR (₹)"})</Label>
                                          <Input type="number" value={r.charges} onChange={(e) => updateRoomType(b.id, r.id, "charges", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" placeholder="1200" />
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Charge Basis")}</Label>
                                          <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                            value={r.chargesType} onChange={(e) => updateRoomType(b.id, r.id, "chargesType", e.target.value)}>
                                            <option value="Per Room">{t("Per Room")}</option>
                                            <option value="Per Bed">{t("Per Bed")}</option>
                                            <option value="Per Person">{t("Per Person")}</option>
                                          </select>
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Extra Mattress Charge (Rs/Mattress)")}</Label>
                                          <Input type="number" disabled={r.hasExtraMattress !== "Yes"} value={r.extraMattressCharge || ""} onChange={(e) => updateRoomType(b.id, r.id, "extraMattressCharge", e.target.value)} className="h-8 text-xs mt-0.5 bg-white disabled:bg-slate-100" placeholder={t("e.g. 200")} />
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Security Deposit")}</Label>
                                          <Input type="number" value={r.deposit} onChange={(e) => updateRoomType(b.id, r.id, "deposit", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" placeholder="500" />
                                        </div>
                                      </div>

                                      {/* Bathroom & Room View */}
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Attached Bathroom?")}</Label>
                                          <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                            value={r.attachedBathroom} onChange={(e) => updateRoomType(b.id, r.id, "attachedBathroom", e.target.value)}>
                                            <option value="Yes">{t("Yes")}</option>
                                            <option value="No">{t("No")}</option>
                                          </select>
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">{t("Bathroom Type")}</Label>
                                          <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                            value={r.bathroomType || "Western"} onChange={(e) => updateRoomType(b.id, r.id, "bathroomType", e.target.value)}>
                                            <option value="Western">{t("Western")}</option>
                                            <option value="Indian">{t("Indian")}</option>
                                            <option value="Both">{t("Both (Western & Indian)")}</option>
                                          </select>
                                        </div>
                                        <div>
                                           <Label className="text-[10px] font-bold text-slate-500">{t("Room View")}</Label>
                                           <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                             value={r.viewType || "Garden View"} onChange={(e) => updateRoomType(b.id, r.id, "viewType", e.target.value)}>
                                             <option value="Garden View">{t("Garden View")}</option>
                                             <option value="Temple View">{t("Temple View")}</option>
                                             <option value="Road View">{t("Road View")}</option>
                                             <option value="Inside View">{t("Inside View")}</option>
                                             <option value="Other">{t("Other")}</option>
                                           </select>
                                         </div>
                                      </div>

                                       {/* Multi-Select Amenities Badges */}
                                       <div>
                                         <div className="flex items-center justify-between mb-1">
                                           <Label className="text-[10px] font-bold text-slate-500">{t("Amenities (Multi-Select)")}</Label>
                                           <span className="text-[9px] text-slate-400 font-medium">{t("Click badges to select/deselect")}</span>
                                         </div>
                                         <div className="flex flex-wrap gap-1.5 p-2 bg-white border rounded-lg max-h-32 overflow-y-auto">
                                           {ROOM_AMENITIES_LIST.map((amenity) => {
                                             const selected = (r.amenities || []).includes(amenity);
                                             return (
                                               <button
                                                 key={amenity}
                                                 type="button"
                                                 onClick={() => {
                                                   const current = r.amenities || [];
                                                   const next = selected ? current.filter((x) => x !== amenity) : [...current, amenity];
                                                   updateRoomType(b.id, r.id, "amenities", next);
                                                 }}
                                                 className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                                                   selected
                                                     ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                                                     : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                                 }`}
                                               >
                                                 {selected ? "✓ " : "+ "}{amenity}
                                               </button>
                                             );
                                           })}
                                         </div>
                                       </div>

                                      {/* Image Upload Option (up to 5-6 images) */}
                                      <div className="mt-2 pt-2 border-t space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <Label className="text-[10px] font-bold text-slate-600">{t("Room Type Images (Up to 6 images)")}</Label>
                                          <span className="text-[9px] text-slate-400 font-semibold">{(r.images || []).length}{t("/6 images uploaded")}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                          {(r.images || []).map((img, imgIdx) => (
                                            <div key={imgIdx} className="relative group w-11 h-11 rounded border bg-white overflow-hidden shrink-0 shadow-xs">
                                              <img src={img} alt={`Room ${imgIdx}`} className="w-full h-full object-cover" />
                                              <button type="button" onClick={() => {
                                                const updated = (r.images || []).filter((_, i) => i !== imgIdx);
                                                updateRoomType(b.id, r.id, "images", updated);
                                              }} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="h-3 w-3" />
                                              </button>
                                            </div>
                                          ))}
                                          {(r.images || []).length < 6 && (
                                            <label className="w-11 h-11 rounded border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 text-slate-400 hover:text-orange-500 transition-colors">
                                              <Plus className="h-3.5 w-3.5" />
                                              <span className="text-[7px] font-bold mt-0.5">{t("Upload")}</span>
                                              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                const available = 6 - (r.images || []).length;
                                                files.slice(0, available).forEach(file => {
                                                  const reader = new FileReader();
                                                  reader.onload = (evt) => {
                                                    if (evt.target?.result) {
                                                      const currentImages = r.images || [];
                                                      updateRoomType(b.id, r.id, "images", [...currentImages, evt.target.result]);
                                                    }
                                                  };
                                                  reader.readAsDataURL(file);
                                                });
                                                e.target.value = "";
                                              }} />
                                            </label>
                                          )}
                                        </div>
                                      </div>

                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Stay details */}
                          <div className="border p-4 rounded-xl bg-white space-y-3">
                            <h4 className="text-xs font-bold text-slate-700 border-b pb-1">{t("⏱ Stay & Booking Configuration")}</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {field("Check-in Time", "checkInTime", "text", "12:00 PM")}
                              {field("Check-out Time", "checkOutTime", "text", "11:00 AM")}
                            </div>
                            <div className="flex gap-4 mt-2">
                              {toggle("Advance Booking Required?", "advanceBookingRequired")}
                              {toggle("Online Booking Available?", "onlineBookingAvailable")}
                            </div>
                          </div>

                          {/* Feature Status */}
                          <div className="border p-4 rounded-xl bg-white space-y-3">
                            <h4 className="text-xs font-bold text-slate-700 border-b pb-1">{t("📊 Availability & Block Control")}</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">{t("Live Availability Status")}</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={form.dharamshalaStatus || "High Availability"} onChange={(e) => setForm({ ...form, dharamshalaStatus: e.target.value })}>
                                  <option value="High Availability">{t("High Availability")}</option>
                                  <option value="Limited">{t("Limited Availability")}</option>
                                  <option value="Full">{t("Full (Sold Out)")}</option>
                                </select>
                              </div>
                              {field("Admin Hold / Block Rooms Count", "adminBlockedRooms", "number", "0")}
                            </div>
                          </div>

                        </div>
                      )}

                      {tab === "facilities" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🏢 Facilities & Units")}</h3>
                          
                          {/* General Amenities */}
                          <div>
                            <Label className="text-xs block mb-2 font-semibold">{t("Select Additional Facilities Available")}</Label>
                            <div className="flex flex-wrap gap-2">
                              {FACILITY_OPTIONS.map((f) => (
                                <button key={f} type="button" onClick={() => toggleFacility(f)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                    form.facilities?.includes(f)
                                      ? "bg-orange-500 text-white border-orange-500"
                                      : "bg-white text-slate-700 border-slate-200 hover:border-orange-400"
                                  }`}>
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Upashray Unit */}
                          <div className="border p-4 rounded-xl bg-white space-y-3">
                            {toggle("Upashray Available", "hasUpashray")}
                            {form.hasUpashray && (
                              <div className="grid grid-cols-2 gap-3 pl-6 border-l-2 border-l-orange-500">
                                <div>
                                  <Label className="text-xs">{t("Upashray Location")}</Label>
                                  <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                    value={form.upashrayLocation || "Within Property"} onChange={(e) => setForm({ ...form, upashrayLocation: e.target.value })}>
                                    <option value="Within Property">{t("Within Property")}</option>
                                    <option value="Nearby Location">{t("Nearby Location")}</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>

                          {!isDharamshala && (
                            /* Event Hall Unit */
                            <div className="border p-4 rounded-xl bg-white space-y-3">
                              {toggle("Event Hall Available", "hasEventHall")}
                              {form.hasEventHall && (
                                <div className="grid grid-cols-2 gap-3 pl-6 border-l-2 border-l-orange-500">
                                  <div>
                                    <Label className="text-xs">{t("Event Hall Purpose")}</Label>
                                    <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                      value={form.eventHallPurpose || "Available for Booking"} onChange={(e) => setForm({ ...form, eventHallPurpose: e.target.value })}>
                                      <option value="Available for Booking">{t("Available for Booking")}</option>
                                      <option value="Temple Use Only">{t("Temple Use Only")}</option>
                                    </select>
                                  </div>
                                  {form.eventHallPurpose === "Available for Booking" && (
                                    field("Event Hall Booking Link", "eventHallBookingLink", "url", "https://...")
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {!isDharamshala && (
                            /* Bhojanshala (Food) Unit */
                            <div className="border p-4 rounded-xl bg-white space-y-3">
                              {toggle("Bhojanshala (Food) Available", "hasBhojanshala")}
                              {form.hasBhojanshala && (
                                <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                                  <div className="grid grid-cols-3 gap-3">
                                    {field("Navkarsi Timing", "bhojanshalaBreakfast", "text", "07:00 AM - 08:30 AM")}
                                    {field("Lunch Timing", "bhojanshalaLunch", "text", "11:30 AM - 01:00 PM")}
                                    {field("Choviyar Timing", "bhojanshalaDinner", "text", "05:00 PM - 06:00 PM")}
                                  </div>
                                  <div className="grid grid-cols-3 gap-3">
                                    <div>
                                      <Label className="text-xs">{t("Meal Type")}</Label>
                                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                        value={form.bhojanshalaMealType || "Free"} onChange={(e) => setForm({ ...form, bhojanshalaMealType: e.target.value })}>
                                        <option value="Free">{t("Free (Gochari / Sadharmik)")}</option>
                                        <option value="Paid">{t("Paid (Token System)")}</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("Availability")}</Label>
                                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                        value={form.bhojanshalaAvailability || "Daily"} onChange={(e) => setForm({ ...form, bhojanshalaAvailability: e.target.value })}>
                                        <option value="Daily">{t("Daily")}</option>
                                        <option value="Available on Request">{t("Available on Request")}</option>
                                      </select>
                                    </div>
                                    {field("Contact Person", "bhojanshalaContact", "text", "Manager Name")}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {!isDharamshala && (
                            /* Dharamshala Unit */
                            <div className="border p-4 rounded-xl bg-white space-y-3">
                              {toggle("Dharamshala Available", "hasDharamshala")}
                              {form.hasDharamshala && (
                                <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div>
                                      <Label className="text-xs">{t("Room Configuration")}</Label>
                                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                        value={form.dharamshalaRooms || "Both"} onChange={(e) => setForm({ ...form, dharamshalaRooms: e.target.value })}>
                                        <option value="AC">{t("AC Rooms only")}</option>
                                        <option value="Non-AC">{t("Non-AC Rooms only")}</option>
                                        <option value="Both">{t("Both AC and Non-AC")}</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs mb-1 block">{t("Office Timings")}</Label>
                                      {(() => {
                                        const parts = (form.dharamshalaOffice || "").split("-").map(s => s.trim());
                                        return (
                                          <TimeRangePicker
                                            fromValue={parts[0] || ""}
                                            toValue={parts[1] || ""}
                                            onFromChange={(val) => setForm({ ...form, dharamshalaOffice: `${val} - ${parts[1] || ""}` })}
                                            onToChange={(val) => setForm({ ...form, dharamshalaOffice: `${parts[0] || ""} - ${val}` })}
                                          />
                                        );
                                      })()}
                                    </div>
                                    {field("Contact Phone", "dharamshalaPhone", "tel", "+91...")}
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs font-semibold">{t("Contact Person / Manager (Link Member)")}</Label>
                                      <MemberLinkSelect
                                        value={form.dharamshalaContact}
                                        onChange={(v) => setForm({ ...form, dharamshalaContact: v })}
                                        placeholder={t("Search manager by ID or name...")}
                                        showPhone
                                        className="mt-1"
                                      />
                                      <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">{t("Mobile number will be visible to members")}</span>
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("Online Booking Available?")}</Label>
                                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                        value={form.dharamshalaOnline || "No"} onChange={(e) => setForm({ ...form, dharamshalaOnline: e.target.value })}>
                                        <option value="Yes">{t("Yes")}</option>
                                        <option value="No">{t("No")}</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {!isDharamshala && (
                            /* Pathshala Unit */
                            <div className="border p-4 rounded-xl bg-white space-y-3">
                              {toggle("Pathshala Available", "hasPathshala")}
                              {form.hasPathshala && (
                                <div className="grid grid-cols-3 gap-3 pl-6 border-l-2 border-l-orange-500">
                                  <div>
                                    <Label className="text-xs mb-1 block">{t("Pathshala Timings")}</Label>
                                    {(() => {
                                      const parts = (form.pathshalaTimings || "").split("-").map(s => s.trim());
                                      return (
                                        <TimeRangePicker
                                          fromValue={parts[0] || ""}
                                          toValue={parts[1] || ""}
                                          onFromChange={(val) => setForm({ ...form, pathshalaTimings: `${val} - ${parts[1] || ""}` })}
                                          onToChange={(val) => setForm({ ...form, pathshalaTimings: `${parts[0] || ""} - ${val}` })}
                                        />
                                      );
                                    })()}
                                  </div>
                                  {field("Pathshala Days", "pathshalaDays", "text", "Sat, Sun")}
                                  <div>
                                    <Label className="text-xs font-semibold">{t("Teacher Name (Link Member)")}</Label>
                                    <MemberLinkSelect
                                      value={form.pathshalaTeacher}
                                      onChange={(v) => setForm({ ...form, pathshalaTeacher: v })}
                                      placeholder={t("Search teacher by ID or name...")}
                                      showPhone
                                      className="mt-1"
                                    />
                                    <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">{t("Teacher mobile number will be visible to members")}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      )}

                      {isDharamshala && tab === "food" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🥗 Bhojanalay / Food Facility")}</h3>
                          {toggle("Bhojanalay Available Inside?", "hasBhojanshala")}
                          {form.hasBhojanshala && (
                            <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                {/* Breakfast */}
                                <div className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-3.5 space-y-2.5 shadow-2xs hover:border-amber-300 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">{t("🥣 Navkarsi")}</span>
                                  </div>
                                  <div>
                                    <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Charges (₹)")}</Label>
                                    <Input
                                      type="number"
                                      className="h-8.5 text-xs bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500 font-medium"
                                      value={form.bhojanshalaBreakfastCharge || ""}
                                      onChange={(e) => setForm({ ...form, bhojanshalaBreakfastCharge: e.target.value })}
                                      placeholder={t("e.g. 50")}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Timings (From – To)")}</Label>
                                    {(() => {
                                      const parts = (form.bhojanshalaBreakfastTiming || "07:00 AM - 08:30 AM").split("-").map(s => s.trim());
                                      return (
                                        <TimeRangePicker
                                          fromValue={parts[0] || "07:00 AM"}
                                          toValue={parts[1] || "08:30 AM"}
                                          onFromChange={(val) => setForm(prev => ({ ...prev, bhojanshalaBreakfastTiming: `${val} - ${parts[1] || "08:30 AM"}` }))}
                                          onToChange={(val) => setForm(prev => ({ ...prev, bhojanshalaBreakfastTiming: `${parts[0] || "07:00 AM"} - ${val}` }))}
                                        />
                                      );
                                    })()}
                                  </div>
                                </div>

                                {/* Lunch */}
                                <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-xl p-3.5 space-y-2.5 shadow-2xs hover:border-emerald-300 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">{t("🍱 Lunch")}</span>
                                  </div>
                                  <div>
                                    <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Charges (₹)")}</Label>
                                    <Input
                                      type="number"
                                      className="h-8.5 text-xs bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-medium"
                                      value={form.bhojanshalaLunchCharge || ""}
                                      onChange={(e) => setForm({ ...form, bhojanshalaLunchCharge: e.target.value })}
                                      placeholder={t("e.g. 100")}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Timings (From – To)")}</Label>
                                    {(() => {
                                      const parts = (form.bhojanshalaLunchTiming || "11:30 AM - 01:00 PM").split("-").map(s => s.trim());
                                      return (
                                        <TimeRangePicker
                                          fromValue={parts[0] || "11:30 AM"}
                                          toValue={parts[1] || "01:00 PM"}
                                          onFromChange={(val) => setForm(prev => ({ ...prev, bhojanshalaLunchTiming: `${val} - ${parts[1] || "01:00 PM"}` }))}
                                          onToChange={(val) => setForm(prev => ({ ...prev, bhojanshalaLunchTiming: `${parts[0] || "11:30 AM"} - ${val}` }))}
                                        />
                                      );
                                    })()}
                                  </div>
                                </div>

                                {/* Choviyar / Dinner */}
                                <div className="bg-purple-50/40 border border-purple-200/70 rounded-xl p-3.5 space-y-2.5 shadow-2xs hover:border-purple-300 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">{t("🌇 Choviyar")}</span>
                                  </div>
                                  <div>
                                    <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Charges (₹)")}</Label>
                                    <Input
                                      type="number"
                                      className="h-8.5 text-xs bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500 font-medium"
                                      value={form.bhojanshalaDinnerCharge || ""}
                                      onChange={(e) => setForm({ ...form, bhojanshalaDinnerCharge: e.target.value })}
                                      placeholder={t("e.g. 80")}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Timings (From – To)")}</Label>
                                    {(() => {
                                      const parts = (form.bhojanshalaDinnerTiming || "05:00 PM - 06:00 PM").split("-").map(s => s.trim());
                                      return (
                                        <TimeRangePicker
                                          fromValue={parts[0] || "05:00 PM"}
                                          toValue={parts[1] || "06:00 PM"}
                                          onFromChange={(val) => setForm(prev => ({ ...prev, bhojanshalaDinnerTiming: `${val} - ${parts[1] || "06:00 PM"}` }))}
                                          onToChange={(val) => setForm(prev => ({ ...prev, bhojanshalaDinnerTiming: `${parts[0] || "05:00 PM"} - ${val}` }))}
                                        />
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                <div>
                                  <Label className="text-xs font-semibold">{t("Contact Person / Manager (Link Member: Jain, Non-Jain or Staff)")}</Label>
                                  <MemberLinkSelect
                                    value={form.bhojanshalaContactMemberId || form.bhojanshalaContact}
                                    onChange={(v) => setForm({ ...form, bhojanshalaContactMemberId: v, bhojanshalaContact: v })}
                                    placeholder={t("Search Jain, Non-Jain or staff member...")}
                                    showPhone
                                    className="mt-1"
                                  />
                                  <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">{t("Mobile number will be visible to members")}</span>
                                </div>
                                <div>
                                  <Label className="text-xs">{t("Availability")}</Label>
                                  <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                    value={form.bhojanshalaAvailability || "Daily"} onChange={(e) => setForm({ ...form, bhojanshalaAvailability: e.target.value })}>
                                    <option value="Daily">{t("Available Daily")}</option>
                                    <option value="Available on Request">{t("Available on Request")}</option>
                                  </select>
                                </div>
                              </div>
                              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mt-2 text-xs text-orange-850 font-semibold italic">
                                {t("📢 Auto-Message Warning Rule: \"Please call and confirm one day prior.\"")}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {isDharamshala && tab === "contacts" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("👥 Contacts & Verification")}</h3>
                          <div className="space-y-3">
                            <MemberSelect label={t("Primary Contact Person (Jain / Non-Jain)")} value={form.primaryContactMemberId} onChange={(val) => setForm({ ...form, primaryContactMemberId: val })} placeholder={t("Link primary member...")} />
                            <div>
                              <Label className="text-xs font-semibold">{t("Secondary Contact Person (Link Member: Jain or Non-Jain)")}</Label>
                              <MemberLinkSelect
                                value={form.secondaryContactMemberId || form.secondaryContactNumber}
                                onChange={(v) => setForm({ ...form, secondaryContactMemberId: v, secondaryContactNumber: v })}
                                placeholder={t("Search member by ID or name to link...")}
                                showPhone
                                className="mt-1"
                              />
                            </div>
                            
                            <div className="border-t pt-3 space-y-2">
                              <Label className="text-xs block font-semibold mb-1">{t("Contact Details Verification Flags")}</Label>
                              <div className="flex flex-wrap gap-4 bg-white p-3 rounded-xl border">
                                {toggle("Primary Mobile Number OTP Verified (Mandatory)", "contactMobileVerified")}
                                {toggle("WhatsApp Number OTP Verified (Optional)", "contactWhatsAppVerified")}
                                {toggle("Email ID OTP Verified (Optional)", "contactEmailVerified")}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <Label className="text-xs font-semibold">{t("Primary Contact Preference")}</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                  value={form.primaryContactPreference || "Mobile"} onChange={(e) => setForm({ ...form, primaryContactPreference: e.target.value })}>
                                  <option value="Mobile">{t("Mobile")}</option>
                                  <option value="WhatsApp">{t("WhatsApp")}</option>
                                  <option value="Email">{t("Email")}</option>
                                </select>
                              </div>

                              {form.primaryContactPreference === "Email" && (
                                <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-200 space-y-1">
                                  <Label className="text-xs font-bold text-orange-900">{t("Primary Contact Email ID *")}</Label>
                                  <Input
                                    type="email"
                                    value={form.email || form.primaryContactEmail || ""}
                                    onChange={(e) => setForm({ ...form, email: e.target.value, primaryContactEmail: e.target.value })}
                                    placeholder={t("e.g. contact@dharamshala.org")}
                                    className="h-9 bg-white text-sm"
                                  />
                                </div>
                              )}

                              {form.primaryContactPreference === "WhatsApp" && (
                                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 space-y-1">
                                  <Label className="text-xs font-bold text-emerald-900">{t("Primary Contact WhatsApp Number *")}</Label>
                                  <Input
                                    type="tel"
                                    value={form.whatsapp || form.primaryContactWhatsapp || ""}
                                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value, primaryContactWhatsapp: e.target.value })}
                                    placeholder={t("e.g. +91 9876543210")}
                                    className="h-9 bg-white text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "trustees" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b pb-1.5">
                            <h3 className="text-sm font-bold text-slate-800">{t("👥 Trustees & Committee Members (Max 20)")}</h3>
                            <Button type="button" size="sm" onClick={addTrusteeRow} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-7 text-xs" disabled={(form.trusteesList || []).length >= 20}>
                              {t("+ Link Trustee")}
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {(form.trusteesList || []).map((tItem, idx) => (
                              <div key={tItem.id || idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border relative">
                                <button type="button" onClick={() => removeTrusteeRow(tItem.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                  <X className="h-4 w-4" />
                                </button>
                                <div className="flex-1">
                                  <MemberSelect label={`Trustee #${idx+1} Member`} value={tItem.memberId} onChange={(val) => updateTrusteeRow(tItem.id, "memberId", val)} placeholder={t("Link trustee member...")} />
                                </div>
                                <div className="w-56">
                                  <Label className="text-xs font-semibold text-slate-700">{t("Designation *")}</Label>
                                  <select
                                    className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium focus:outline-none focus:border-orange-500"
                                    value={
                                      TRUSTEE_DESIGNATIONS.includes(tItem.designation)
                                        ? tItem.designation
                                        : tItem.designation
                                        ? "Other"
                                        : "Trustee"
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "Other") {
                                        updateTrusteeRow(tItem.id, "designation", "Other");
                                      } else {
                                        updateTrusteeRow(tItem.id, "designation", val);
                                      }
                                    }}
                                  >
                                    {TRUSTEE_DESIGNATIONS.map((d) => (
                                      <option key={d} value={d}>{t(d)}</option>
                                    ))}
                                  </select>
                                  {(!TRUSTEE_DESIGNATIONS.includes(tItem.designation) || tItem.designation === "Other") && (
                                    <Input
                                      className="h-8 text-xs mt-1.5 bg-white"
                                      value={tItem.customDesignation || (tItem.designation === "Other" ? "" : tItem.designation)}
                                      onChange={(e) => updateTrusteeRow(tItem.id, "designation", e.target.value)}
                                      placeholder={t("Specify custom designation...")}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "volunteers" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b pb-1.5">
                            <h3 className="text-sm font-bold text-slate-800">{t("🤝 Volunteer Members")}</h3>
                            <Button type="button" size="sm" onClick={addVolunteerRow} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-7 text-xs">
                              {t("+ Link Volunteer")}
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {(form.volunteersList || []).map((v, idx) => (
                              <div key={v.id || idx} className="flex items-end gap-3 bg-white p-3 rounded-xl border relative">
                                <button type="button" onClick={() => removeVolunteerRow(v.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                  <X className="h-4 w-4" />
                                </button>
                                <div className="flex-1">
                                  <MemberSelect label={`Volunteer #${idx+1} Member`} value={v.memberId} onChange={(val) => updateVolunteerRow(v.id, val)} placeholder={t("Link volunteer member...")} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "rules" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("📜 Guidelines & Safety Controls")}</h3>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs font-bold">{t("Rules & Guidelines Section")}</Label>
                              <textarea rows={6} className="w-full mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                                value={form.rulesText} onChange={(e) => setForm({ ...form, rulesText: e.target.value })}
                                placeholder={t("Define Dharamshala rules, ID requirements, stay limits, cleanliness instructions, and discipline guidelines...")} />
                            </div>
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "bank" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("💰 Bank & Donation Details")}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {field("Bank Account Name", "bankAccountName", "text", "e.g. Shree Jain Sangh Trust")}
                            {field("Bank Account Number", "bankAccount", "text", "Account Number")}
                            {field("IFSC Code", "bankIfsc", "text", "e.g. SBIN0001234")}
                            {field("Bank Name", "bankName", "text", "e.g. State Bank of India")}
                            <div className="col-span-2">{field("Branch Address", "bankBranch", "text", "Branch Name / Address")}</div>
                            {field("UPI ID", "upiId", "text", "name@upi")}
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Preferred Display Currency")}</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:border-orange-500"
                                value={form.preferredCurrency || "INR (₹)"}
                                onChange={(e) => setForm({ ...form, preferredCurrency: e.target.value })}>
                                <option value="INR (₹)">{t("INR (₹)")}</option>
                                <option value="USD ($)">{t("USD ($)")}</option>
                                <option value="EUR (€)">{t("EUR (€)")}</option>
                                <option value="GBP (£)">{t("GBP (£)")}</option>
                                <option value="AED (AED)">{t("AED (AED)")}</option>
                                <option value="CAD ($)">{t("CAD ($)")}</option>
                                <option value="AUD ($)">{t("AUD ($)")}</option>
                                <option value="SGD ($)">{t("SGD ($)")}</option>
                                <option value="Other">{t("Other")}</option>
                              </select>
                            </div>
                            <div className="col-span-2">{field("QR Code upload / Image URL", "donationQrCodeUrl", "text", "https://...")}</div>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2 bg-white p-3.5 border rounded-xl">
                            {toggle("Eligible for 80G Tax Deductions", "is80gEligible")}
                            {toggle("Eligible for CSR Charity Funding", "csrEligible")}
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "links" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🔗 Social Media & UX Links")}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {field("Instagram Link", "instaLink", "url", "https://instagram.com/...")}
                            {field("Facebook Link", "facebookLink", "url", "https://facebook.com/...")}
                            {field("YouTube Link", "youtubeLink", "url", "https://youtube.com/...")}
                            {field("Website Link", "website", "url", "https://...")}
                          </div>
                          <div className="border-t pt-3">
                            <Label className="text-xs font-bold block mb-1">{t("Live Availability Indicator Option")}</Label>
                            {toggle("Activate Live Bookings Dashboard?", "onlineBookingAvailable")}
                          </div>
                        </div>
                      )}

                      {!isDharamshala && tab === "timings" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🕒 Slot & Ritual Timings")}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Morning Darshan From *")}</Label>
                              <TimePicker
                                value={form.morningStart || "08:00 AM"}
                                onChange={(t) => setForm({ ...form, morningStart: t })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Morning Darshan To *")}</Label>
                              <TimePicker
                                value={form.morningEnd || "12:00 PM"}
                                onChange={(t) => setForm({ ...form, morningEnd: t })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Evening Darshan From")}</Label>
                              <TimePicker
                                value={form.eveningStart || "05:30 PM"}
                                onChange={(t) => setForm({ ...form, eveningStart: t })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Evening Darshan To")}</Label>
                              <TimePicker
                                value={form.eveningEnd || "09:00 PM"}
                                onChange={(t) => setForm({ ...form, eveningEnd: t })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 border-t pt-3">
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Pakshal Timing From")}</Label>
                              <TimePicker
                                value={form.pakshalStart || "06:30 AM"}
                                onChange={(t) => setForm({ ...form, pakshalStart: t })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Pakshal Timing To")}</Label>
                              <TimePicker
                                value={form.pakshalEnd || "08:00 AM"}
                                onChange={(t) => setForm({ ...form, pakshalEnd: t })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Morning Pooja From")}</Label>
                              <TimePicker
                                value={form.poojaStart || "07:00 AM"}
                                onChange={(t) => setForm({ ...form, poojaStart: t })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Morning Pooja To")}</Label>
                              <TimePicker
                                value={form.poojaEnd || "08:30 AM"}
                                onChange={(t) => setForm({ ...form, poojaEnd: t })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 border-t pt-3">
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Morning Aarti From")}</Label>
                              <TimePicker
                                value={form.aartiMorning || "08:30 AM"}
                                onChange={(t) => setForm({ ...form, aartiMorning: t })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Evening Aarti To")}</Label>
                              <TimePicker
                                value={form.aartiEvening || "07:30 PM"}
                                onChange={(t) => setForm({ ...form, aartiEvening: t })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {!isDharamshala && tab === "finance" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("💰 Bank & Donation Details")}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {field("Bank Account Name", "bankAccountName", "text", "e.g. Shree Jain Sangh Trust")}
                            {field("Bank Account Number", "bankAccount", "text", "Account Number")}
                            {field("IFSC Code", "bankIfsc", "text", "e.g. SBIN0001234")}
                            {field("Bank Name", "bankName", "text", "e.g. State Bank of India")}
                            <div className="col-span-2">{field("Branch Address", "bankBranch", "text", "Branch Name / Address")}</div>
                            {field("UPI ID", "upiId", "text", "name@upi")}
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">{t("Currency")}</Label>
                              <Input className="mt-1 bg-white h-9" value={form.preferredCurrency || "INR (₹)"}
                                onChange={(e) => setForm({ ...form, preferredCurrency: e.target.value })} placeholder={t("INR (₹)")} />
                            </div>
                            <div className="col-span-2">{field("QR Code upload / Image URL", "donationQrCodeUrl", "text", "https://...")}</div>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2 bg-white p-3.5 border rounded-xl">
                            {toggle("Eligible for 80G Tax Deductions", "is80gEligible")}
                            {toggle("Eligible for CSR Charity Funding", "csrEligible")}
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0">
                      <Button variant="outline" onClick={() => setOpen(false)}>{t("Cancel")}</Button>
                      <Button onClick={create} disabled={creating || !form.name} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                        {creating ? t("Creating...") : t("Create")}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("action.search", `Search ${pluralLabel.toLowerCase()}…`)}
            className="pl-9 bg-white"
            data-testid={`${testId}-search`}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        testId={`${testId}-table`}
        onRowClick={(r) => navigate(`/${entity}s/${r.id || r.publicId}`)}
        emptyTitle={`No ${pluralLabel.toLowerCase()} yet`}
        emptyDescription={
          canDo(moduleKey, "CREATE") || isSuperAdmin
            ? `Add your first ${label.toLowerCase()} to begin managing it.`
            : t("No records available.")
        }
      />
      {/* Inline Deity Creation Dialog */}
      <Dialog open={createDeityOpen} onOpenChange={setCreateDeityOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateDeitySubmit}>
            <DialogHeader>
              <DialogTitle className="text-slate-800 flex items-center gap-2">
                {t("🪷 Create Deity (Bhagwan / Deva)")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 text-xs">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Deity Name *")}</Label>
                <Input value={deityName} onChange={(e) => setDeityName(e.target.value)} placeholder={t("e.g. Shri Nakoda Parshvanath")} className="mt-1 h-9 bg-white" required />
              </div>
              <div>
                <SearchableSelect
                  value={deityCategory}
                  onValueChange={setDeityCategory}
                  options={[
                    { value: "24 Tirthankars", label: t("24 Tirthankars") },
                    { value: "Others", label: t("Others") },
                  ]}
                  placeholder={t("Select Category")}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setCreateDeityOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={deitySaving} className="bg-purple-700 hover:bg-purple-800 text-white font-bold">
                {deitySaving ? t("Creating...") : t("Create Deity")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
