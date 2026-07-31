import { useEffect, useState, useRef } from "react";
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
  Users,
  CheckCircle2,
  Flag,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Heart,
  Search,
  MessageSquare,
  Clock,
  ArrowRight,
  TrendingUp,
  Bookmark,
  Share2,
  ShieldAlert,
  Download,
  Upload,
  Info,
  DollarSign,
  Coffee,
  Check,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  TOUR_TYPE_OPTIONS, SPONSOR_CATEGORY_OPTIONS, BLOOD_GROUP_OPTIONS,
  ROOM_TYPE_OPTIONS, BULK_ATTENDANCE_STATUSES, toOptions,
} from "@/constants/dropdownOptions";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const SPONSOR_CATEGORIES = [
  "Accommodation", "Meals", "Transport", "Medical", "Water", "Snacks",
  "General Sponsor", "Event Sponsor", "Other"
];

const TOUR_TYPES = [
  "Palitana 99 Yatra",
  "Palitana Taleti 99 Yatra",
  "Palitana Babulnath 99 Yatra",
  "Girnar 99 Yatra",
  "Girnar Taleti 99 Yatra",
  "Sammed Shikharji 99 Yatra",
  "Sammed Shikharji Taleti 99 Yatra",
  "Other"
];

export default function ToursPage() {
  const { t } = useLanguage();
  const { canDo, user, isSuperAdmin } = useAuth();
  
  // States
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Active Tab
  const [activeTab, setActiveTab] = useState("admin_tours");

  // Selection & Dialogs
  const [createTourOpen, setCreateTourOpen] = useState(false);
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);
  const [accommodationOpen, setAccommodationOpen] = useState(false);
  const [bulkProgressOpen, setBulkProgressOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [sponsorsOpen, setSponsorsOpen] = useState(false);
  const [detailParticipant, setDetailParticipant] = useState(null);

  // Lists related to Selected Tour
  const [occupancyList, setOccupancyList] = useState([]);
  const [communications, setCommunications] = useState([]);

  // Form Fields - Create 99 Tour
  const [tourName, setTourName] = useState("");
  const [tourType, setTourType] = useState("Palitana 99 Yatra");
  const [tourTypeOther, setTourTypeOther] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [jatraTarget, setJatraTarget] = useState(99);
  const [primaryMonkId, setPrimaryMonkId] = useState("");
  const [monkGroupName, setMonkGroupName] = useState("");
  const [monkGroupLeader, setMonkGroupLeader] = useState("");
  const [supportingMonks, setSupportingMonks] = useState("");
  const [dharamshalaId, setDharamshalaId] = useState("");
  const [savingTour, setSavingTour] = useState(false);

  // Form Fields - Sponsor Onboarding
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorMemberId, setSponsorMemberId] = useState("");
  const [sponsorCategory, setSponsorCategory] = useState("Accommodation");
  const [sponsorDesc, setSponsorDesc] = useState("");
  const [sponsorAmount, setSponsorAmount] = useState("");

  // Form Fields - Participant onboarding
  const [memberPublicId, setMemberPublicId] = useState("");
  const [parentPublicId, setParentPublicId] = useState("");
  const [submittingParticipant, setSubmittingParticipant] = useState(false);

  // Form Fields - Medical Intake Form
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Form Fields - Accommodation and Room Creation
  const [locName, setLocName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("Standard");
  const [roomCapacity, setRoomCapacity] = useState(4);
  const [assignParticipant, setAssignParticipant] = useState(null);
  const [assignRoomId, setAssignRoomId] = useState("");

  // Form Fields - Bulk Progress Entry
  const [bulkJatraCounts, setBulkJatraCounts] = useState({}); // { [participantId]: count }
  const [bulkAttendance, setBulkAttendance] = useState({}); // { [participantId]: 'PRESENT' | 'ABSENT' | 'NOT_WELL' }

  // Form Fields - Daily Tour Schedule & Announcements
  const [schedDate, setSchedDate] = useState("");
  const [schedText, setSchedText] = useState("");
  const [commMsg, setCommMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const toursRes = await api.get("/tours").catch(() => ({ data: { data: [] } }));
      const items = toursRes.data?.data?.items || toursRes.data?.data || [];
      setTours(items);

      if (items.length > 0) {
        const active = selectedTour ? items.find(t => t.id === selectedTour.id) : items[0];
        setSelectedTour(active || items[0]);
      }
    } catch (e) {
      toast.error(t("Failed to load yatra tours ledger"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const loadTourSubdetails = async () => {
    if (!selectedTour) return;
    try {
      const [partsRes, occRes, commsRes] = await Promise.all([
        api.get(`/tours/${selectedTour.id}/participants`).catch(() => ({ data: { data: [] } })),
        api.get(`/tours/${selectedTour.id}/accommodation/occupancy`).catch(() => ({ data: { data: [] } })),
        api.get(`/tours/${selectedTour.id}/communications`).catch(() => ({ data: { data: [] } }))
      ]);

      const parts = partsRes.data?.data || [];
      setParticipants(parts);
      setOccupancyList(occRes.data?.data || []);
      setCommunications(commsRes.data?.data || []);

      // Initialize bulk entries
      const jatraMap = {};
      const attMap = {};
      parts.forEach(p => {
        jatraMap[p.id] = 1; // Default jatra increment
        attMap[p.id] = "PRESENT";
      });
      setBulkJatraCounts(jatraMap);
      setBulkAttendance(attMap);

    } catch (e) {
      toast.error(t("Failed to sync tour subdetails"));
    }
  };

  useEffect(() => {
    loadTourSubdetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTour, reloadKey]);

  // Create 99 Tour Campaign
  const handleCreateTour = async (e) => {
    e.preventDefault();
    setSavingTour(true);
    try {
      const selectedType = tourType === "Other" ? tourTypeOther || "Other 99 Yatra" : tourType;
      const payload = {
        name: tourName,
        categoryId: "tour_cat_default",
        category: { name: selectedType },
        tourType: selectedType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        location,
        description,
        jatraTarget: Number(jatraTarget),
        primaryMonkId: primaryMonkId || undefined,
        monkGroupName: monkGroupName || undefined,
        monkGroupLeader: monkGroupLeader || undefined,
        supportingMonks: supportingMonks ? supportingMonks.split(",").map(s => s.trim()) : undefined,
        dharamshalaId: dharamshalaId || undefined
      };

      await api.post("/tours", payload);
      toast.success(t("New 99/108 Yatra Tour published successfully!"));
      setCreateTourOpen(false);
      setReloadKey(k => k + 1);
      resetTourForm();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSavingTour(false);
    }
  };

  const resetTourForm = () => {
    setTourName(""); setStartDate(""); setEndDate(""); setLocation("");
    setDescription(""); setJatraTarget(99); setPrimaryMonkId("");
    setMonkGroupName(""); setMonkGroupLeader(""); setSupportingMonks("");
    setDharamshalaId(""); setTourTypeOther("");
  };

  // Add Sponsor details
  const handleAddSponsor = async (e) => {
    e.preventDefault();
    if (!selectedTour) return;
    try {
      await api.post(`/tours/${selectedTour.id}/sponsors`, {
        name: sponsorName,
        memberPublicId: sponsorMemberId || undefined,
        categoryId: sponsorCategory,
        description: sponsorDesc,
        amount: sponsorAmount ? Number(sponsorAmount) : undefined
      });
      toast.success(t("Sponsor onboarded for the tour."));
      setSponsorsOpen(false);
      setSponsorName(""); setSponsorMemberId(""); setSponsorAmount(""); setSponsorDesc("");
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Add Participant Member
  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!selectedTour || !memberPublicId) return;
    setSubmittingParticipant(true);
    try {
      await api.post(`/tours/${selectedTour.id}/participants`, {
        memberPublicId,
        parentMemberPublicId: parentPublicId || undefined
      });
      toast.success(t("Participant enrolled in yatra group."));
      setAddParticipantOpen(false);
      setMemberPublicId("");
      setParentPublicId("");
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmittingParticipant(false);
    }
  };

  // Submit Medical Intake Form
  const handleMedicalForm = async (e) => {
    e.preventDefault();
    if (!detailParticipant) return;
    try {
      await api.put(`/tours/participants/${detailParticipant.id}/medical-form`, {
        bloodGroup,
        allergies,
        conditions,
        medications,
        emergencyContact: { phone: emergencyPhone },
        specialInstructions
      });
      toast.success(t("Medical profile updated successfully."));
      setMedicalOpen(false);
      setDetailParticipant(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Onboard Rooms and Accommodation
  const handleAddAccommodation = async (e) => {
    e.preventDefault();
    if (!selectedTour || !locName) return;
    try {
      // 1. Create location
      const locRes = await api.post(`/tours/${selectedTour.id}/accommodation/locations`, { name: locName });
      const loc = locRes.data?.data;
      
      // 2. Create room
      if (roomName) {
        await api.post(`/tours/accommodation/locations/${loc.id}/rooms`, {
          name: roomName,
          type: roomType,
          capacity: Number(roomCapacity)
        });
      }

      toast.success(t("Accommodation building location configured."));
      setAccommodationOpen(false);
      setLocName(""); setRoomName("");
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Assign Room allocation
  const handleAssignRoom = async (e) => {
    e.preventDefault();
    if (!assignParticipant || !assignRoomId) return;
    try {
      await api.post(`/tours/participants/${assignParticipant.id}/room`, {
        tourRoomId: assignRoomId
      });
      toast.success(t("Room assigned successfully!"));
      setAssignParticipant(null);
      setAssignRoomId("");
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Submit Bulk Jatra Daily counts
  const handleBulkDailyProgress = async (e) => {
    e.preventDefault();
    if (!selectedTour) return;
    try {
      const todayDate = new Date().toISOString();
      await Promise.all(
        participants.map((p) => {
          const count = bulkJatraCounts[p.id] ?? 0;
          const status = bulkAttendance[p.id] ?? "PRESENT";
          return Promise.all([
            api.post(`/tours/participants/${p.id}/jatra-counts`, { date: todayDate, count }),
            api.post(`/tours/participants/${p.id}/attendance`, { date: todayDate, status })
          ]);
        })
      );
      toast.success(t("Bulk progress and attendance checks saved!"));
      setBulkProgressOpen(false);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Publish Announcement message
  const handlePublishMessage = async (e) => {
    e.preventDefault();
    if (!selectedTour || !commMsg) return;
    try {
      await api.post(`/tours/${selectedTour.id}/communications`, { message: commMsg });
      toast.success(t("Yatra announcement broadcasted to members and parents."));
      setMessageOpen(false);
      setCommMsg("");
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Publish Daily Schedule Text
  const handlePublishSchedule = async (e) => {
    e.preventDefault();
    if (!selectedTour || !schedText || !schedDate) return;
    try {
      await api.put(`/tours/${selectedTour.id}/daily-schedule`, {
        date: new Date(schedDate).toISOString(),
        scheduleText: schedText
      });
      toast.success(t("Daily itinerary schedule published."));
      setScheduleOpen(false);
      setSchedText("");
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleExportReports = async (format) => {
    if (!selectedTour) return;
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const res = await fetch(`${API_BASE}/tours/${selectedTour.id}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Report generation failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `tour-registry-${selectedTour.name}-${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xlsx" : "csv"}`;
      a.click();
      toast.success(t("Report downloaded."));
    } catch (e) {
      toast.error(t("Export failed"));
    }
  };

  return (
    <div className="space-y-6" data-testid="tours-page">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-amber-600 to-orange-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-amber-200" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">{t("99 Tour Management")}</h1>
          </div>
          <p className="text-orange-100 text-xs mt-1 max-w-lg">
            {t("Track daily Jatra milestones (99/108 targets), allocate roommates, schedule check-ins, and broadcast communications.")}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {canDo("TOURS", "CREATE") && (
            <Button
              onClick={() => { resetTourForm(); setCreateTourOpen(true); }}
              className="bg-white hover:bg-orange-50 text-orange-700 font-bold h-10 px-5 shadow-md border border-white"
            >
              <Plus className="h-4 w-4 mr-2" /> {t("Create 99 Tour")}
            </Button>
          )}
        </div>
      </div>

      {/* Select active tour selector */}
      <div className="flex justify-between items-center bg-slate-50 p-4 border rounded-xl flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <Label className="font-bold text-slate-800 text-xs uppercase tracking-wider">{t("Active 99 Tour Yatra:")}</Label>
          <select
            value={selectedTour?.id || ""}
            onChange={(e) => setSelectedTour(tours.find(t => t.id === e.target.value))}
            className="h-9 rounded border text-xs px-2 bg-white focus:outline-none font-bold text-slate-700"
          >
            {tours.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.category?.name || "Yatra"})</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setSponsorsOpen(true)} className="h-8 text-[11px] font-bold">
            <DollarSign className="h-3.5 w-3.5 mr-1" /> {t("Onboard Sponsors")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAccommodationOpen(true)} className="h-8 text-[11px] font-bold">
            <Building className="h-3.5 w-3.5 mr-1" /> {t("Accommodation Setup")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setBulkProgressOpen(true)} className="h-8 text-[11px] font-bold">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {t("Bulk Daily Jatra")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setScheduleOpen(true)} className="h-8 text-[11px] font-bold">
            <Calendar className="h-3.5 w-3.5 mr-1" /> {t("Daily Schedule")}
          </Button>
        </div>
      </div>

      {/* Monk Guidance Banner (§2) */}
      {selectedTour && (
        <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-amber-900 font-bold text-xs flex items-center gap-2.5 shadow-sm">
          <span className="text-base">🪔</span>
          <div>
            <span>{t("This 99 Yatra is being organized under the guidance of:")} </span>
            <span className="text-orange-850 font-black">{selectedTour.primaryMonk?.dikshaName || selectedTour.monkGroupName || "Pujya Gurudev"}</span>
            {selectedTour.monkGroupName && <span className="text-slate-600 font-semibold"> ({selectedTour.monkGroupName})</span>}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl flex-wrap">
          <TabsTrigger value="admin_tours" className="px-4 py-2 font-bold text-xs rounded-lg">{t("🛡️ Tour Control Ledger")}</TabsTrigger>
          <TabsTrigger value="accommodation_control" className="px-4 py-2 font-bold text-xs rounded-lg">{t("🏨 Accommodation & Rooms")}</TabsTrigger>
          <TabsTrigger value="bulk_jatra" className="px-4 py-2 font-bold text-xs rounded-lg">{t("✍️ Bulk Daily Jatra Entry")}</TabsTrigger>
          <TabsTrigger value="announcements_timeline" className="px-4 py-2 font-bold text-xs rounded-lg">{t("📢 Communications & Schedule")}</TabsTrigger>
          <TabsTrigger value="reports" className="px-4 py-2 font-bold text-xs rounded-lg">{t("📊 Reports & Exports")}</TabsTrigger>
        </TabsList>

        {/* Tab 1: Tour Dashboard */}
        <TabsContent value="admin_tours" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-orange-50 text-orange-700 rounded-lg"><Users className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Total Members Enrolled")}</div>
                <div className="text-xl font-black text-slate-805">{participants.length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg"><CheckCircle2 className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Completed 100% Target")}</div>
                <div className="text-xl font-black text-slate-805">
                  {participants.filter(p => (p.cumulativeCount ?? 0) >= (selectedTour?.jatraTarget ?? 99)).length}
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-lg"><Heart className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Medical Pending Forms")}</div>
                <div className="text-xl font-black text-rose-750">
                  {participants.filter(p => !p.medicalComplete).length}
                </div>
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
                <h3 className="font-bold text-sm text-slate-800">{t("Yatra Participants Progress")}</h3>
                <p className="text-[11px] text-slate-400">{t("Add members using Member ID, link parents, track daily Jatra milestones, and print completion certificates.")}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 text-xs" onClick={() => setAddParticipantOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> {t("Add Member")}
                </Button>
              </div>
            </div>

            <DataTable
              columns={[
                {
                  key: "member",
                  header: t("Participant Name"),
                  render: (r) => (
                    <div>
                      <div className="font-bold text-slate-805 text-xs">{r.member?.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{r.member?.publicId}</div>
                    </div>
                  )
                },
                { key: "gender", header: t("Gender"), render: (r) => <span className="text-slate-600 text-xs font-semibold capitalize">{r.member?.gender?.toLowerCase() || "—"}</span> },
                {
                  key: "progress",
                  header: t("Progress Target"),
                  render: (r) => (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-700 font-mono-num">{r.cumulativeCount ?? 0} / {selectedTour?.jatraTarget ?? 99} {t("Jatras")}</div>
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(Math.round(((r.cumulativeCount ?? 0) / (selectedTour?.jatraTarget ?? 99)) * 100), 100)}%` }}></div>
                      </div>
                    </div>
                  )
                },
                { key: "room", header: t("Assigned Room"), render: (r) => <Badge variant="secondary" className="text-[10px]">{r.room?.name || "Unallocated"}</Badge> },
                {
                  key: "med",
                  header: t("Medical Form"),
                  render: (r) => (
                    <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => { setDetailParticipant(r); setMedicalOpen(true); }}>
                      {r.medicalComplete ? t("✅ Complete (Update)") : t("⚠️ Pending")}
                    </Button>
                  )
                },
                {
                  key: "actions",
                  header: t("Actions"),
                  render: (r) => (
                    <div className="flex gap-1">
                      {r.cumulativeCount >= (selectedTour?.jatraTarget ?? 99) && (
                        <a href={`${API_BASE}/tours/${selectedTour.id}/participants/${r.id}/certificate?token=${localStorage.getItem("jinanam_access_token")}`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" className="h-7 text-[10px] bg-amber-50 text-amber-700 font-bold border-amber-200">
                            {t("🎓 Certificate")}
                          </Button>
                        </a>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { setAssignParticipant(r); setActiveTab("accommodation_control"); }}>
                        {t("Room Assign")}
                      </Button>
                    </div>
                  )
                }
              ]}
              rows={participants}
              loading={loading}
              emptyTitle={t("No participants enrolled")}
              emptyDescription={t("Select Add Member above to register JiNANAM devotees.")}
            />
          </Card>
        </TabsContent>

        {/* Tab 2: Accommodation Control */}
        <TabsContent value="accommodation_control" className="space-y-4">
          <div className="grid grid-cols-12 gap-5">
            <Card className="col-span-12 md:col-span-4 p-4 bg-white border rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">{t("Rooms & Buildings Occupancy")}</h3>
              <div className="space-y-2">
                {occupancyList.length === 0 ? (
                  <div className="text-slate-400 text-center py-4 text-xs">{t("No rooms configured. Select Accommodation Setup above to onboard rooms.")}</div>
                ) : (
                  occupancyList.map((loc, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-slate-50/50 space-y-2 text-xs">
                      <div className="font-bold text-slate-800 flex justify-between items-center">
                        <span>🏢 {loc.location}</span>
                        <Badge variant="outline" className="text-[9px] font-mono-num">{loc.rooms?.length ?? 0} {t("Rooms")}</Badge>
                      </div>
                      <div className="space-y-1 pt-1.5 border-t">
                        {(loc.rooms || []).map((room, rIdx) => (
                          <div key={rIdx} className="flex justify-between items-center text-[11px] text-slate-650">
                            <span>{t("Room")} {room.name}</span>
                            <span className="font-bold font-mono-num">{room.occupied ?? 0} / {room.capacity} {t("beds")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="col-span-12 md:col-span-8 p-4 bg-white border rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">{t("Active Room Assignments")}</h3>
              {assignParticipant && (
                <form onSubmit={handleAssignRoom} className="p-3 bg-amber-50/40 border border-amber-200 rounded-lg space-y-3 text-xs">
                  <div className="font-bold text-slate-800">{t("Assign Room to:")} {assignParticipant.member?.fullName}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Select Room *")}</Label>
                      <SearchableSelect
                        value={assignRoomId}
                        onValueChange={setAssignRoomId}
                        options={occupancyList.flatMap(loc => (loc.rooms || []).map(r => ({
                          value: r.id,
                          label: `${loc.location} — Room ${r.name} (${r.occupied}/${r.capacity} beds)`
                        })))}
                        placeholder={t("Choose Room")}
                        searchPlaceholder={t("Search rooms…")}
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9">
                        {t("Confirm Room Assignment")}
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              <DataTable
                columns={[
                  { key: "member", header: t("Member"), render: (r) => <span className="font-semibold text-slate-700">{r.member?.fullName}</span> },
                  { key: "room", header: t("Current Assigned Room"), render: (r) => <Badge variant="secondary">{r.room?.name || "Unallocated"}</Badge> },
                  { key: "building", header: t("Building Location"), render: (r) => <span className="text-slate-500 font-medium">{r.room?.location?.name || "—"}</span> },
                  {
                    key: "capacity",
                    header: t("Room capacity"),
                    render: (r) => r.room ? <span className="font-mono-num">{r.room.occupancy ?? 0} / {r.room.capacity} {t("beds")}</span> : "—"
                  }
                ]}
                rows={participants}
                loading={loading}
                emptyTitle={t("No room layout list found")}
                emptyDescription={t("Assign rooms to yatra participants.")}
              />
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Announcements Timeline */}
        <TabsContent value="announcements_timeline" className="space-y-4">
          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">{t("Sangh Announcements & Schedule timeline")}</h3>
            <div className="space-y-4 max-w-xl">
              {communications.length === 0 ? (
                <div className="text-slate-400 text-center py-8 text-xs">{t("No announcements broadcasted. Select Broadcast Announcement above to publish.")}</div>
              ) : (
                communications.map((comm, idx) => (
                  <div key={idx} className="flex gap-3 text-xs border-l-2 border-orange-500 pl-4 py-1.5 relative">
                    <div className="absolute h-3 w-3 rounded-full bg-orange-600 -left-[7px] top-2"></div>
                    <div>
                      <div className="text-slate-400 font-semibold font-mono-num">{formatDateTime(comm.createdAt)}</div>
                      <p className="font-bold text-slate-805 mt-1">{comm.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Bulk Daily Jatra Entry (§23) */}
        <TabsContent value="bulk_jatra" className="space-y-4">
          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{t("✍️ Single-Screen Bulk Daily Jatra Entry")}</h3>
                <p className="text-[11px] text-slate-400">{t("Enter today's count for each participant. Cumulative totals recalculate automatically.")}</p>
              </div>
              <Button onClick={handleBulkDailyProgress} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 text-xs">
                {t("Save All Daily Entries")}
              </Button>
            </div>

            <div className="space-y-3">
              {participants.length === 0 ? (
                <div className="text-slate-400 text-center py-8 text-xs">{t("No participants enrolled in this tour.")}</div>
              ) : (
                participants.map((p) => {
                  const currentCount = bulkJatraCounts[p.id] ?? 0;
                  const currentTotal = p.cumulativeCount ?? 0;
                  const newTotal = currentTotal + currentCount;
                  const target = selectedTour?.jatraTarget ?? 99;
                  const progressPct = Math.min(Math.round((newTotal / target) * 100), 100);

                  return (
                    <div key={p.id} className="p-3 border rounded-xl bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                          <span>{p.member?.fullName}</span>
                          <Badge variant="outline" className="text-[9px]">{p.member?.publicId}</Badge>
                          <Badge variant="secondary" className="text-[9px]">{p.room?.name || "Unallocated Room"}</Badge>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>{t("Previous Total:")} <b>{currentTotal}</b></span>
                          <span>→</span>
                          <span>{t("Today:")} <b>+{currentCount}</b></span>
                          <span>→</span>
                          <span className="text-emerald-700 font-black">{t("New Total:")} {newTotal} / {target} ({progressPct}%)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => setBulkJatraCounts(prev => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] ?? 0) - 1) }))}
                            className="h-7 w-7 rounded bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={currentCount}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              setBulkJatraCounts(prev => ({ ...prev, [p.id]: val }));
                              setBulkAttendance(prev => ({ ...prev, [p.id]: val > 0 ? "PRESENT" : "ABSENT" }));
                            }}
                            className="w-14 text-center font-bold text-xs h-7 border-0 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = (bulkJatraCounts[p.id] ?? 0) + 1;
                              setBulkJatraCounts(prev => ({ ...prev, [p.id]: val }));
                              setBulkAttendance(prev => ({ ...prev, [p.id]: "PRESENT" }));
                            }}
                            className="h-7 w-7 rounded bg-orange-600 hover:bg-orange-700 text-white font-black flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>

                        <SearchableSelect
                          value={bulkAttendance[p.id] ?? "PRESENT"}
                          onValueChange={(val) => setBulkAttendance(prev => ({ ...prev, [p.id]: val }))}
                          options={[
                            { value: "PRESENT", label: t("Present") },
                            { value: "ABSENT", label: t("Absent") },
                            { value: "NOT_WELL", label: t("Not Well") },
                          ]}
                          placeholder={t("Status")}
                          className="w-28 text-xs"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 5: 9 Downloadable Reports (§32) */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t("📊 99 Yatra Tour Reports & Export Engine")}</h3>
              <p className="text-[11px] text-slate-400">{t("Download formatted PDF, Excel (XLSX), and CSV reports with JiNANAM branding. Reports remain available permanently.")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: t("1. Tour Summary Report"), desc: t("Overview of dates, monk guidance, duration, and target counts."), type: "summary" },
                { title: t("2. Member Participant Report"), desc: t("Enrolled devotees, age, gender, emergency contacts, parent links."), type: "member" },
                { title: t("3. Parent Contact Report"), desc: t("Linked parents, mobile numbers, relationship, read-only status."), type: "parent" },
                { title: t("4. Accommodation Report"), desc: t("Buildings, rooms, capacity, occupancy, room change audit log."), type: "accommodation" },
                { title: t("5. Daily Jatra Report"), desc: t("Day-wise daily counts, cumulative totals, attendance status."), type: "jatra" },
                { title: t("6. Communication Report"), desc: t("Chronological log of all broadcasted yatra announcements."), type: "communication" },
                { title: t("7. Sponsor Ledger Report"), desc: t("Sponsors list, categories (Meals, Water, Medical, etc.), amounts."), type: "sponsor" },
                { title: t("8. Medical Intake Report"), desc: t("Blood group, allergies, medications (Admin Restricted)."), type: "medical" },
                { title: t("9. Certificate Audit Report"), desc: t("100% target achievers, completion dates, QR verification tokens."), type: "certificate" },
              ].map((rep, idx) => (
                <Card key={idx} className="p-3.5 rounded-xl border bg-slate-50/50 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{rep.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{rep.desc}</p>
                  </div>
                  <div className="flex gap-1.5 pt-2 border-t">
                    <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1" onClick={() => handleExportTourReport(rep.type, "pdf")}>PDF</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1" onClick={() => handleExportTourReport(rep.type, "xlsx")}>{t("Excel")}</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1" onClick={() => handleExportTourReport(rep.type, "csv")}>CSV</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* dialog 1: Create 99 Tour */}
      <Dialog open={createTourOpen} onOpenChange={setCreateTourOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-white text-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading font-black text-slate-850">
              <Plus className="h-5 w-5 text-orange-655" /> {t("Configure 99 Yatra Campaign")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTour} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Yatra Tour Name *")}</Label>
                <Input value={tourName} onChange={(e) => setTourName(e.target.value)} placeholder={t("e.g. Palitana 99 Kartik Tour")} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Tour Type *")}</Label>
                <SearchableSelect
                  value={tourType}
                  onValueChange={setTourType}
                  options={TOUR_TYPES.map(t => ({ value: t, label: t }))}
                  placeholder={t("Select Tour Type")}
                  className="mt-1"
                />
              </div>
            </div>

            {tourType === "Other" && (
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Specify Other Tour Type *")}</Label>
                <Input value={tourTypeOther} onChange={(e) => setTourTypeOther(e.target.value)} placeholder={t("e.g. Custom 99 Yatra")} required className="h-9 mt-1" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Start Date *")}</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("End Date *")}</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="h-9 mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Jatra Target *")}</Label>
                <Input type="number" min={1} value={jatraTarget} onChange={(e) => setJatraTarget(e.target.value)} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Primary Monk ID *")}</Label>
                <Input value={primaryMonkId} onChange={(e) => setPrimaryMonkId(e.target.value)} placeholder={t("Search MS ID")} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Monk Group Name")}</Label>
                <Input value={monkGroupName} onChange={(e) => setMonkGroupName(e.target.value)} placeholder={t("e.g. Acharya Shri Group")} className="h-9 mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Group Leader")}</Label>
                <Input value={monkGroupLeader} onChange={(e) => setMonkGroupLeader(e.target.value)} placeholder={t("Leader Name")} className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Supporting Monks (comma separated)")}</Label>
                <Input value={supportingMonks} onChange={(e) => setSupportingMonks(e.target.value)} placeholder={t("MS 1, MS 2...")} className="h-9 mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Tour Location *")}</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("e.g. Palitana, Gujarat")} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Dharamshala ID Link")}</Label>
                <Input value={dharamshalaId} onChange={(e) => setDharamshalaId(e.target.value)} placeholder={t("Dharamshala ID")} className="h-9 mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Tour Description")}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("Provide yatra details...")} className="mt-1" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setCreateTourOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9">{t("Publish Tour Campaign")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 2: Onboard Sponsors */}
      <Dialog open={sponsorsOpen} onOpenChange={setSponsorsOpen}>
        <DialogContent className="sm:max-w-md text-xs bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-655" /> {t("Add Yatra Sponsor Entry")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSponsor} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Sponsor Name *")}</Label>
                <Input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Sponsor Category *")}</Label>
                <SearchableSelect
                  value={sponsorCategory}
                  onValueChange={setSponsorCategory}
                  options={SPONSOR_CATEGORY_OPTIONS}
                  placeholder={t("Select Sponsor Category")}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("JiNANAM Member ID")}</Label>
                <Input value={sponsorMemberId} onChange={(e) => setSponsorMemberId(e.target.value)} className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Amount Sponsored (INR)")}</Label>
                <Input type="number" value={sponsorAmount} onChange={(e) => setSponsorAmount(e.target.value)} className="h-9 mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Sponsorship Description")}</Label>
              <Input value={sponsorDesc} onChange={(e) => setSponsorDesc(e.target.value)} className="h-9 mt-1" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setSponsorsOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9">{t("Save Sponsor Entry")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 3: Add Participant */}
      <Dialog open={addParticipantOpen} onOpenChange={setAddParticipantOpen}>
        <DialogContent className="sm:max-w-md text-xs bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-655" /> {t("Onboard Participant")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddParticipant} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Devotee Member Public ID *")}</Label>
              <Input value={memberPublicId} onChange={(e) => setMemberPublicId(e.target.value)} required className="h-9 mt-1" />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Parent Member Public ID (Optional)")}</Label>
              <Input value={parentPublicId} onChange={(e) => setParentPublicId(e.target.value)} className="h-9 mt-1" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setAddParticipantOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={submittingParticipant} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9">
                {submittingParticipant ? t("Enrolling Devotee...") : t("Onboard Participant")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 4: Medical Form Intake */}
      <Dialog open={medicalOpen} onOpenChange={setMedicalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-white text-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-600" /> {t("Participant Medical Intake Form")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMedicalForm} className="space-y-4 pt-2">
            {detailParticipant && (
              <div className="p-3 bg-slate-50 border rounded-lg">
                <div className="font-bold text-slate-800">{t("Devotee:")} {detailParticipant.member?.fullName}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Blood Group *")}</Label>
                <SearchableSelect
                  value={bloodGroup}
                  onValueChange={setBloodGroup}
                  options={BLOOD_GROUP_OPTIONS}
                  placeholder={t("Select Blood Group")}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Emergency Phone contact *")}</Label>
                <Input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} required className="h-9 mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Known Allergies")}</Label>
              <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder={t("e.g. Dust, Penicillin")} className="h-9 mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Existing Medical Conditions")}</Label>
                <Input value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder={t("e.g. Hypertension")} className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Current Medications")}</Label>
                <Input value={medications} onChange={(e) => setMedications(e.target.value)} className="h-9 mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Special Medical Instructions")}</Label>
              <Textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder={t("Doctor details, instructions, etc.")} className="mt-1" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => { setMedicalOpen(false); setDetailParticipant(null); }}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-9">{t("Save Medical Intake")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 5: Accommodation Setup */}
      <Dialog open={accommodationOpen} onOpenChange={setAccommodationOpen}>
        <DialogContent className="sm:max-w-md text-xs bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-orange-655" /> {t("Onboard Room / Building")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAccommodation} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Building / Location Name *")}</Label>
              <Input value={locName} onChange={(e) => setLocName(e.target.value)} placeholder={t("e.g. Sangh Ashram Block A")} required className="h-9 mt-1" />
            </div>

            <div className="grid grid-cols-3 gap-2 border-t pt-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Room Number *")}</Label>
                <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder={t("Room 108")} required className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Room Type")}</Label>
                <SearchableSelect
                  value={roomType}
                  onValueChange={setRoomType}
                  options={toOptions(["Standard", "Hall", "VIP"])}
                  placeholder={t("Select Room Type")}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Bed Capacity *")}</Label>
                <Input type="number" min={1} value={roomCapacity} onChange={(e) => setRoomCapacity(e.target.value)} required className="h-9 mt-1" />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setAccommodationOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9">{t("Publish Room Details")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 6: Bulk Daily Jatra Updates */}
      <Dialog open={bulkProgressOpen} onOpenChange={setBulkProgressOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-white text-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-orange-655" /> {t("Bulk Daily Jatra Counts")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkDailyProgress} className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 border rounded-lg leading-normal">
              {t("Enter the daily count completed by each devotee. The system automatically recalculates cumulative totals.")}
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {participants.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-2 border rounded bg-white">
                  <div>
                    <span className="font-bold text-slate-800">{p.member?.fullName}</span>
                    <div className="text-[9px] text-slate-400 font-semibold font-mono-num">{t("Current Total:")} {p.cumulativeCount ?? 0} {t("Jatras")}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div>
                      <Label className="text-[9px] text-slate-450 uppercase font-black">{t("Daily Jatra")}</Label>
                      <Input type="number" min={0} value={bulkJatraCounts[p.id] ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBulkJatraCounts(prev => ({ ...prev, [p.id]: val }));
                          // derives attendance status
                          setBulkAttendance(prev => ({ ...prev, [p.id]: val > 0 ? "PRESENT" : "ABSENT" }));
                        }}
                        className="h-8 w-20 text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[9px] text-slate-455 uppercase font-black">{t("Attendance")}</Label>
                      <SearchableSelect
                        value={bulkAttendance[p.id] ?? "PRESENT"}
                        onValueChange={(val) => setBulkAttendance(prev => ({ ...prev, [p.id]: val }))}
                        options={[
                          { value: "PRESENT", label: t("Present") },
                          { value: "ABSENT", label: t("Absent") },
                          { value: "NOT_WELL", label: t("Not Well") },
                        ]}
                        placeholder={t("Select")}
                        className="w-24 text-[10px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setBulkProgressOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9">{t("Save Progress Entry")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 7: Daily Tour Schedule */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-md text-xs bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-655" /> {t("Publish Daily Schedule")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePublishSchedule} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Schedule Date *")}</Label>
              <Input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} required className="h-9 mt-1" />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Daily Itinerary Details *")}</Label>
              <Textarea value={schedText} onChange={(e) => setSchedText(e.target.value)} placeholder={t("Wake-up: 5AM, Yatra Start: 6AM...")} required className="mt-1" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setScheduleOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9">{t("Publish Itinerary")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 8: Broadcast Communication */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="sm:max-w-md text-xs bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-655" /> {t("Broadcast Sangh Announcement")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePublishMessage} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Announcement message *")}</Label>
              <Textarea value={commMsg} onChange={(e) => setCommMsg(e.target.value)} placeholder={t("Text messages only. Provide safety updates, schedule changes, reporting times...")} required className="mt-1" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setMessageOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9">{t("Broadcast Message")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
