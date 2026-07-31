import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, UtensilsCrossed, HandHeart, BedDouble, HeartHandshake,
  MapPin, Sparkles, Coffee, Sun, Moon, CalendarPlus, Bell,
  Megaphone, ChevronRight, Send, Route as RouteIcon, ClipboardList,
  Landmark, PlusCircle, BarChart3, TrendingUp,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { formatCurrency, formatDate, initials, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { LiveBadge } from "@/components/common/LiveBadge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Rich mock data used to demonstrate the design at full fidelity.
// Real data will drop-in from the backend calls below.
const MOCK_MONKS = [
  { id: 1, name: "Pujya Gurudev Shree", currently: "Bhavnagar", eta: "2:30 PM", status: "Moving", tone: "blue" },
  { id: 2, name: "Pujya Muni Shree Pranam Sagar", currently: "Botad", eta: "1:10 PM", status: "Arrived", tone: "green" },
  { id: 3, name: "Pujya Muni Shree Suvir Sagar", currently: "Vadech", eta: "3:45 PM", status: "Moving", tone: "blue" },
  { id: 4, name: "Pujya Muni Shree Aditya Sagar", currently: "Rajkot", eta: "5:20 PM", status: "Resting", tone: "orange" },
  { id: 5, name: "Pujya Muni Shree Shubh Sagar", currently: "Amreli", eta: "6:15 PM", status: "Moving", tone: "blue" },
];

const MOCK_YATRA = [
  { name: "Shree Vardhaman Sangh", participants: 120, completed: "3 / 4", progress: 45 },
  { name: "Shree Mahavir Yuva Sangh", participants: 85, completed: "2 / 4", progress: 30 },
  { name: "Shree Jin Shasan Vrudh Sangh", participants: 60, completed: "4 / 4", progress: 60 },
  { name: "Shree Shwetambar Sangh", participants: 95, completed: "3 / 4", progress: 50 },
  { name: "Shree Digambar Yatra Sangh", participants: 20, completed: "1 / 4", progress: 15 },
];

const MOCK_EVENTS = [
  { day: 28, month: "May", title: "Paryushan Mahaparva", time: "05:30 AM - 08:30 PM", tone: "orange" },
  { day: 30, month: "May", title: "Pravachan by Muni Shree", time: "07:00 PM - 08:30 PM", tone: "purple" },
  { day: 2, month: "Jun", title: "Sangh Yatra", time: "06:00 AM - 05:00 PM", tone: "green" },
];

const MOCK_VOLUNTEERS = [
  { name: "Mahesh Shah", duty: "Dharamshala Desk", time: "06:00 AM - 02:00 PM" },
  { name: "Pratibha Jain", duty: "Bhojanshala", time: "10:00 AM - 02:00 PM" },
  { name: "Dhiren Mehta", duty: "Pujya Aagaman Seva", time: "08:00 AM - 12:00 PM" },
  { name: "Jigna Shah", duty: "Yatra Assistance", time: "02:00 PM - 08:00 PM" },
  { name: "Kirit Mehta", duty: "Parking & Crowd", time: "06:00 AM - 06:00 PM" },
];

const MOCK_DONATIONS_TREND = [
  { t: "12 AM", v: 40000 }, { t: "6 AM", v: 60000 }, { t: "12 PM", v: 120000 },
  { t: "6 PM", v: 180000 }, { t: "12 AM", v: 245000 },
];

const MOCK_RECENT_DONORS = [
  { name: "Mahesh Shah", amount: 21000, time: "10:15 AM" },
  { name: "Pratibha Jain", amount: 11000, time: "09:40 AM" },
  { name: "Shree Vardhaman Sangh", amount: 51000, time: "09:15 AM" },
  { name: "Dhiren Mehta", amount: 5100, time: "08:30 AM" },
  { name: "Anonymous", amount: 31000, time: "07:45 AM" },
];

const MOCK_ANNOUNCEMENTS = [
  { icon: Megaphone, tone: "blue", title: "Bhojanshala Timing Update", desc: "From tomorrow, lunch timing will be 11:15 AM to 01:15 PM.", when: "Today, 09:00 AM" },
  { icon: RouteIcon, tone: "green", title: "Yatra Route Update", desc: "Girnar yatra route is open. Please follow updated guidelines.", when: "Today, 08:30 AM" },
  { icon: ClipboardList, tone: "purple", title: "Temple Notice", desc: "All devotees are requested to maintain silence in the temple premises.", when: "Today, 08:00 AM" },
];

const MOCK_ROOM_FLOORS = [
  { name: "Ground Floor", occupied: 20, total: 24, cleaning: 4 },
  { name: "First Floor", occupied: 22, total: 24, cleaning: 1 },
  { name: "Second Floor", occupied: 22, total: 24, cleaning: 1 },
  { name: "Third Floor", occupied: 20, total: 24, cleaning: 0 },
  { name: "VIP Rooms", occupied: 8, total: 8, cleaning: 0 },
];

function SendReminderDialog({ open, onClose }) {
  const { t } = useLanguage();
  const [audience, setAudience] = useState("ALL");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!message.trim()) { toast.error(t("Please enter a message.")); return; }
    setLoading(true);
    try {
      await api.post("/notifications/broadcast", { audience, body: message, category: "SERVICE" });
      toast.success(t("Reminder sent successfully!"));
      setMessage("");
      onClose();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t("Send Reminder")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs">{t("Target Audience")}</Label>
            <select
              className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option value="ALL">{t("All Members")}</option>
              <option value="VOLUNTEERS">{t("Volunteers Only")}</option>
              <option value="REGISTERED">{t("Event Registrants")}</option>
            </select>
          </div>
          <div>
            <Label className="text-xs">{t("Message *")}</Label>
            <Textarea
              className="mt-1"
              rows={4}
              placeholder={t("Type your reminder message here…")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("Cancel")}</Button>
          <Button onClick={send} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? t("Sending…") : t("Send Reminder")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionCard({ number, title, viewAll, viewAllTo, children, testId, className = "" }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <Card className={`p-5 rounded-xl border-border bg-white ${className}`} data-testid={testId}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-base md:text-lg font-semibold text-foreground">
          <span className="text-primary">{number}.</span> {title}
        </h2>
        {viewAll && (
          <button
            onClick={() => viewAllTo && navigate(viewAllTo)}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5 font-bold"
          >
            {t("action.viewAll", "View All")} <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
      {children}
    </Card>
  );
}

const STATUS_TONE = {
  Moving: "bg-blue-100 text-blue-700",
  Arrived: "bg-emerald-100 text-emerald-700",
  Resting: "bg-orange-100 text-orange-700",
  Upcoming: "bg-orange-100 text-orange-700",
  Active: "bg-emerald-100 text-emerald-700",
};

const STATUS_BADGES = {
  Moving: "bg-blue-100 text-blue-700",
  Arrived: "bg-emerald-100 text-emerald-700",
  Resting: "bg-orange-100 text-orange-700",
  Active: "bg-emerald-100 text-emerald-700",
};

const ORG_TYPES = [
  { key: "TEMPLE", label: "Temples" },
  { key: "DHARAMSHALA", label: "Dharamshalas" },
  { key: "JAIN_CENTER", label: "Jain Centers" },
  { key: "STHANAK", label: "Sthanaks" },
  { key: "COMMUNITY_PAGE", label: "Community Pages" },
  { key: "ADMIN", label: "Admins (System & Org)" },
];

export default function DashboardPage() {
  const { user, isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState(user?.organizationIds?.[0] || "");
  const [selectedType, setSelectedType] = useState("TEMPLE");
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [data, setData] = useState(null);
  const [orgName, setOrgName] = useState("Shree Palitana Jain Derasar");
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Super Admin Platform Dashboard states
  const [activeDashboardTab, setActiveDashboardTab] = useState("ADMIN");
  const [platformData, setPlatformData] = useState(null);
  const [loadingPlatform, setLoadingPlatform] = useState(false);

  useEffect(() => {
    if (isSuperAdmin && activeDashboardTab === "SA_DASHBOARD") {
      setLoadingPlatform(true);
      api.get("/dashboard/platform")
        .then((res) => setPlatformData(res.data?.data || null))
        .catch(() => { })
        .finally(() => setLoadingPlatform(false));
    }
  }, [isSuperAdmin, activeDashboardTab, reloadKey]);

  // Dynamic Data Lists
  const [monksList, setMonksList] = useState([]);
  const [toursList, setToursList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [volunteersList, setVolunteersList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [donationsList, setDonationsList] = useState([]);

  useEffect(() => {
    if (isSuperAdmin) {
      if (selectedType === "ADMIN") {
        api.get("/auth/admins")
          .then((res) => {
            const list = res.data?.data || [];
            const formatted = list.map(admin => {
              const roleLabel = admin.primaryRoleKey?.replace("_", " ");
              return {
                id: admin.id,
                name: `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || admin.mobile || "Unnamed Admin",
                role: roleLabel,
                organizationIds: admin.userOrganizations?.map(uo => uo.organizationId) || [],
                organizationName: admin.userOrganizations?.[0]?.organization?.name || "No Organization Scope",
              };
            });
            setOrgs(formatted);
            if (formatted[0]) {
              setSelectedAdminId(formatted[0].id);
              const targetOrgId = formatted[0].organizationIds[0];
              if (targetOrgId) {
                setOrgId(targetOrgId);
                setOrgName(`${formatted[0].name} · ${formatted[0].organizationName}`);
              } else {
                setOrgId("");
                setOrgName(`${formatted[0].name} (${formatted[0].role || "No Org Scope"})`);
              }
            } else {
              setSelectedAdminId("");
              setOrgId("");
              setOrgName("No admins found");
            }
          })
          .catch(() => {
            setOrgs([]);
            setSelectedAdminId("");
            setOrgId("");
            setOrgName("No admins found");
          });
      } else {
        let endpoint = "/temples";
        if (selectedType === "DHARAMSHALA") endpoint = "/dharamshalas";
        else if (selectedType === "JAIN_CENTER") endpoint = "/jain-centers";

        api.get(endpoint)
          .then((res) => {
            const list = res.data?.data?.items || res.data?.data || [];
            setOrgs(list);
            if (list[0]?.id) {
              setOrgId(list[0].id);
              setOrgName(list[0].name);
            } else {
              setOrgId("");
              setOrgName("No organization selected");
            }
          })
          .catch(() => {
            setOrgs([]);
            setOrgId("");
            setOrgName("No organization selected");
          });
      }
    } else if (orgId) {
      // Scoped Admin: fetch their specific organization name
      api.get(`/temples/${orgId}`)
        .then((res) => {
          const org = res.data?.data;
          if (org) setOrgName(org.name);
        })
        .catch(() => {
          api.get(`/dharamshalas/${orgId}`)
            .then((res) => {
              const org = res.data?.data;
              if (org) setOrgName(org.name);
            })
            .catch(() => { });
        });
    }
    // eslint-disable-next-line
  }, [isSuperAdmin, selectedType]);

  useEffect(() => {
    if (!orgId) return;
    api.get(`/dashboard/admin/${orgId}`)
      .then((res) => setData(res.data?.data || null))
      .catch(() => { });

    // Fetch dynamic monks
    api.get("/monks").then((res) => {
      setMonksList(res.data?.data || []);
    }).catch(() => { });

    // Fetch dynamic tours
    api.get("/tours").then((res) => {
      setToursList(res.data?.data || []);
    }).catch(() => { });

    // Fetch dynamic events
    api.get("/events").then((res) => {
      setEventsList(res.data?.data || []);
    }).catch(() => { });

    // Fetch dynamic volunteers
    api.get("/volunteers").then((res) => {
      setVolunteersList(res.data?.data || []);
    }).catch(() => { });

    // Fetch dynamic announcements
    api.get("/announcements").then((res) => {
      setAnnouncementsList(res.data?.data || []);
    }).catch(() => { });

    // Fetch dynamic donations
    api.get("/donations").then((res) => {
      setDonationsList(res.data?.data || []);
    }).catch(() => { });

  }, [orgId, reloadKey]);

  // Real-time dashboard stat updates
  const { connected: liveConnected, socket } = useSocket("/dashboards", {
    "stats:update": (evt) => {
      if (!evt || (orgId && evt.organizationId && evt.organizationId !== orgId)) return;
      setData((prev) => ({ ...(prev || {}), statCards: { ...(prev?.statCards || {}), ...(evt.statCards || {}) } }));
    },
    "booking:new": (evt) => {
      toast.success(`New booking ${evt.publicId || ""} · ${formatCurrency(evt.amount || 0)}`);
      setReloadKey(k => k + 1);
    },
    "donation:new": (evt) => {
      toast.success(`Donation received: ${formatCurrency(evt.amount || 0)} by ${evt.donorName || "Donor"}`);
      setReloadKey(k => k + 1);
    },
  }, { enabled: Boolean(orgId), query: { organizationId: orgId } });

  useEffect(() => {
    if (liveConnected && socket) {
      if (isSuperAdmin) {
        socket.emit("subscribe:platform");
      }
      if (orgId) {
        socket.emit("subscribe:org", orgId);
      }
    }
  }, [liveConnected, socket, orgId, isSuperAdmin]);

  const stats = data?.statCards || {};

  // Mappers and fallbacks
  const activeMonks = monksList.length > 0
    ? monksList.slice(0, 5).map(m => ({
      id: m.id,
      name: m.dikshaName || "Maharaj Saheb",
      currently: m.currentLocationName || m.currentTemple?.name || "En Route",
      eta: "ETA: On time",
      status: m.trackingStatus || "Moving",
      tone: m.trackingStatus === "RESTING" ? "orange" : "blue"
    }))
    : [];

  const activeYatras = toursList.length > 0
    ? toursList.slice(0, 5).map(t => {
      const total = t.jatraTarget || 99;
      return {
        name: t.name,
        participants: t.participantsCount || 0,
        completed: `${t.completedCount || 0} / ${total}`,
        progress: Math.min(Math.round(((t.completedCount || 0) / total) * 100), 100)
      };
    })
    : [];

  const activeEvents = eventsList.length > 0
    ? eventsList.slice(0, 3).map(ev => {
      const date = new Date(ev.startAt);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return {
        day: date.getDate() || 1,
        month: months[date.getMonth()] || "May",
        title: ev.title,
        time: ev.timeDetails || "09:00 AM - 12:00 PM",
        tone: ev.isPaid ? "purple" : "green"
      };
    })
    : [];

  const activeVolunteers = volunteersList.length > 0
    ? volunteersList.slice(0, 5).map(v => ({
      name: v.member?.fullName || v.name || "Jain Volunteer",
      duty: v.assignedDuty || "Seva Duty",
      time: v.shiftHours || "08:00 AM - 04:00 PM"
    }))
    : [];

  const recentDonorsList = donationsList.length > 0
    ? donationsList.slice(0, 4).map(d => ({
      name: d.donorName || "Anonymous",
      amount: d.totalAmount,
      time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"
    }))
    : [];

  const activeAnnouncements = announcementsList.length > 0
    ? announcementsList.slice(0, 3).map(a => ({
      icon: Megaphone,
      tone: a.isHighPriority ? "red" : "blue",
      title: a.title,
      desc: a.body,
      when: a.createdAt ? formatDate(a.createdAt) : "Today"
    }))
    : [];

  const getDonationsTrend = () => {
    if (donationsList.length === 0) return [];
    return donationsList.slice(-5).map((d, i) => ({
      t: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit' }) : `${i * 4} hrs`,
      v: d.totalAmount
    }));
  };

  return (
    <div data-testid="dashboard-page">
      {isSuperAdmin && (
        <div className="flex border-b border-slate-200 mb-6 gap-2 bg-slate-50 p-1.5 rounded-lg border">
          <button
            onClick={() => setActiveDashboardTab("ADMIN")}
            className={`py-2 px-4 text-xs font-bold rounded-md transition-all ${activeDashboardTab === "ADMIN"
                ? "bg-white text-orange-500 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
              }`}
          >
            {t("dashboard.aDashboard", "A Dashboard")}
          </button>
          <button
            onClick={() => setActiveDashboardTab("SA_DASHBOARD")}
            className={`py-2 px-4 text-xs font-bold rounded-md transition-all ${activeDashboardTab === "SA_DASHBOARD"
                ? "bg-white text-orange-500 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
              }`}
          >
            {t("dashboard.saDashboard", "SA Dashboard")}
          </button>
        </div>
      )}

      {isSuperAdmin && activeDashboardTab === "SA_DASHBOARD" ? (
        <div className="space-y-6" data-testid="sa-dashboard-view">
          {/* SA Dashboard Title */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
              <BarChart3 className="h-6 w-6 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                {t("SA Dashboard")}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("Global platform metrics, user analytics, and centralized configuration scope.")}
              </p>
            </div>
          </div>

          {/* SA Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label={t("Total Members")} value={(platformData?.totalMembers ?? 0).toLocaleString()} delta={t("Active on platform")} icon={Users} tone="green" />
            <StatCard label={t("Registered Orgs")} value={(platformData?.totalOrgs ?? 0).toLocaleString()} delta={t("Temples & centers")} icon={Landmark} tone="blue" />
            <StatCard label={t("Total Donations")} value={formatCurrency(platformData?.totalDonations ?? 0)} delta={t("Platform-wide ledger")} icon={HeartHandshake} tone="green" />
            <StatCard label={t("Active Volunteers")} value={(platformData?.activeVolunteers ?? 0).toLocaleString()} delta={t("Assigned today")} icon={HandHeart} tone="orange" />
            <StatCard label={t("Ticket Sales")} value={(platformData?.pendingTickets ?? 0).toLocaleString()} delta={t("Event tickets sold")} icon={ClipboardList} tone="purple" />
          </div>

          {/* SA Charts & Lists Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard number="1" title={t("Newest Organizations")}>
              <div className="space-y-3">
                {(!platformData?.recentOrgs || platformData.recentOrgs.length === 0) ? (
                  <div className="text-center py-12 text-xs text-muted-foreground font-medium">{t("No recent organizations registered.")}</div>
                ) : (
                  platformData.recentOrgs.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{o.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 capitalize">{o.type.replace('_', ' ')} · {o.city || 'India'}</div>
                      </div>
                      <span className="text-[9px] text-muted-foreground shrink-0">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard number="2" title={t("Newest Members")}>
              <div className="space-y-3">
                {(!platformData?.recentMembers || platformData.recentMembers.length === 0) ? (
                  <div className="text-center py-12 text-xs text-muted-foreground font-medium">{t("No recent member signups.")}</div>
                ) : (
                  platformData.recentMembers.map((m) => (
                    <div key={m.publicId} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{m.fullName}</div>
                        <div className="text-[10px] font-mono text-orange-600 mt-0.5">{m.publicId}</div>
                      </div>
                      <Badge variant="outline" className="text-[9px] shrink-0">{m.category}</Badge>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard number="3" title={t("App Engagement Stats")}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 border rounded-lg bg-slate-50/40 text-center">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{t("Active Users (DAU)")}</div>
                  <div className="text-2xl font-black mt-1 font-mono-num text-slate-800">{platformData?.appUsage?.dau ?? 12}</div>
                </div>
                <div className="p-3 border rounded-lg bg-slate-50/40 text-center">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{t("API Latency")}</div>
                  <div className="text-2xl font-black mt-1 font-mono-num text-slate-800">{platformData?.appUsage?.apiLatencyMs ?? 42}ms</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">{t("Platform Actions")}</div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="xs" variant="outline" className="text-[10px] h-8 justify-start" onClick={() => navigate("/master-data")}>{t("⚙ Master Data Config")}</Button>
                <Button size="xs" variant="outline" className="text-[10px] h-8 justify-start" onClick={() => navigate("/staff")}>{t("👥 Platform Staff")}</Button>
              </div>
            </SectionCard>
          </div>
        </div>
      ) : (
        <>
          {/* Temple header banner */}
          <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md shrink-0">
                <Landmark className="h-6 w-6 md:h-7 md:w-7 text-white" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight truncate">
                  {orgName}
                </h1>
                <div className="text-xs text-primary mt-1 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> {t("Jai Jinendra")}
                  {liveConnected ? (
                    <LiveBadge label={t("Live Live")} />
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border">{t("Reconnecting")}</span>
                  )}
                </div>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="flex gap-2 w-full md:w-auto shrink-0 flex-wrap">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-36 h-10 text-xs font-semibold bg-white border border-border">
                    <SelectValue placeholder={t("Select Type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {ORG_TYPES.map((tItem) => (
                      <SelectItem key={tItem.key} value={tItem.key} className="text-xs font-medium">
                        {t(tItem.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedType === "ADMIN" ? selectedAdminId : orgId}
                  onValueChange={(val) => {
                    if (selectedType === "ADMIN") {
                      setSelectedAdminId(val);
                      const selectedAdmin = orgs.find((o) => o.id === val);
                      if (selectedAdmin) {
                        const targetOrgId = selectedAdmin.organizationIds[0];
                        if (targetOrgId) {
                          setOrgId(targetOrgId);
                          setOrgName(`${selectedAdmin.name} · ${selectedAdmin.organizationName}`);
                        } else {
                          setOrgId("");
                          setOrgName(`${selectedAdmin.name} (${selectedAdmin.role || "No Org Scope"})`);
                        }
                      }
                    } else {
                      setOrgId(val);
                      const found = orgs.find((o) => o.id === val);
                      if (found) setOrgName(found.name);
                    }
                  }}
                  disabled={orgs.length === 0}
                >
                  <SelectTrigger className="w-52 h-10 text-xs font-semibold bg-white border border-border">
                    <SelectValue placeholder={orgName || "Select Option"} />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="text-xs font-medium">
                        {o.name} {selectedType === "ADMIN" && o.role ? `(${o.role})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Metric stats row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 md:mb-6">
            <StatCard label={t("dashboard.todaysVisitors", "Today's Visitors")} value={(stats.todaysVisitors ?? 0).toLocaleString()} delta={t("Devotees checked-in")} icon={Users} tone="green" testId="stat-visitors" />
            <StatCard label={t("dashboard.bhojanshalaMeals", "Bhojanshala Meals")} value={(stats.bhojanshalaMeals ?? 0).toLocaleString()} delta={t("Meals served today")} icon={UtensilsCrossed} tone="orange" testId="stat-meals" />
            <StatCard label={t("dashboard.activeVolunteers", "Active Volunteers")} value={(stats.activeVolunteers ?? 0).toLocaleString()} delta={t("On-duty volunteers")} icon={HandHeart} tone="blue" testId="stat-volunteers" />
            <StatCard label={t("dashboard.roomOccupancy", "Room Occupancy")} value={`${stats.occupiedRooms ?? 0}`} delta={t("Occupied / 200 Rooms")} icon={BedDouble} tone="purple" testId="stat-rooms" />
            <StatCard label={t("dashboard.donationsToday", "Donations Today")} value={formatCurrency(stats.totalDonations ?? 0)} delta={t("{0} transaction logs", [stats.donationCount ?? 0])} icon={HeartHandshake} tone="green" testId="stat-donations" />
          </div>

          {/* Row 1: Monk arrivals · Room status · 99 Yatra */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <SectionCard number="1" title={t("dashboard.monkArrivalTracking", "Monk Arrival & Tracking")} viewAll viewAllTo="/tracking" testId="section-monks">
              <div className="space-y-3">
                {activeMonks.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground font-medium">
                    {t("dashboard.noMonkData", "No active monk tracking data available.")}
                  </div>
                ) : (
                  activeMonks.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/40 transition-colors">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-semibold">
                          {initials(m.name.replace("Pujya ", ""))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{m.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{m.currently}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-muted-foreground">{m.eta}</div>
                        <span className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1 ${STATUS_BADGES[m.status] || "bg-slate-100"}`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard number="2" title={t("dashboard.roomStatusInventory", "Room Status & Inventory")} viewAll viewAllTo="/bookings" testId="section-rooms">
              {(() => {
                const roomStats = stats.roomStats || { available: 0, occupied: 0, cleaning: 0, total: 0, floors: [] };
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="rounded-lg border border-border p-3 text-center">
                        <BedDouble className="h-5 w-5 mx-auto text-primary mb-1" />
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t("dashboard.available", "Available")}</div>
                        <div className="font-heading font-bold text-xl text-foreground mt-0.5">{roomStats.available}</div>
                        <div className="text-[10px] text-muted-foreground">{roomStats.total > 0 ? Math.round((roomStats.available / roomStats.total) * 100) : 0}%</div>
                      </div>
                      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-center">
                        <Users className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                        <div className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold">{t("dashboard.occupied", "Occupied")}</div>
                        <div className="font-heading font-bold text-xl text-blue-800 mt-1">{roomStats.occupied}</div>
                        <div className="text-[10px] text-blue-600">{roomStats.total > 0 ? Math.round((roomStats.occupied / roomStats.total) * 100) : 0}%</div>
                      </div>
                      <div className="rounded-lg border border-orange-100 bg-orange-50 p-3 text-center">
                        <Sparkles className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                        <div className="text-[10px] uppercase tracking-wider text-orange-700 font-semibold">{t("dashboard.cleaning", "Cleaning")}</div>
                        <div className="font-heading font-bold text-xl text-orange-800 mt-1">{roomStats.cleaning}</div>
                        <div className="text-[10px] text-orange-600">{roomStats.total > 0 ? Math.round((roomStats.cleaning / roomStats.total) * 100) : 0}%</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {roomStats.floors.length === 0 ? (
                        <div className="text-center py-6 text-xs text-muted-foreground">
                          {t("dashboard.noRooms", "No rooms registered for this organization.")}
                        </div>
                      ) : (
                        roomStats.floors.map((f) => (
                          <div key={f.name} className="grid grid-cols-6 items-center text-xs gap-2">
                            <div className="col-span-2 text-foreground">{f.name}</div>
                            <div className="col-span-2">
                              <Progress value={f.total > 0 ? (f.occupied / f.total) * 100 : 0} className="h-1.5" />
                            </div>
                            <div className="col-span-1 text-right font-mono-num text-muted-foreground">{f.occupied} / {f.total}</div>
                            <div className="col-span-1 text-right text-orange-600 font-medium">{f.cleaning}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                );
              })()}
            </SectionCard>

            <SectionCard number="3" title={t("dashboard.yatraGroupManagement", "99 Yatra Group Management")} viewAll viewAllTo="/tours" testId="section-yatra">
              {activeYatras.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground font-medium">
                  {t("dashboard.noYatra", "No active Yatra groups registered.")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[380px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                        <th className="text-left font-semibold py-2">{t("col.name", "Sangh / Group")}</th>
                        <th className="text-center font-semibold">{t("nav.members", "People")}</th>
                        <th className="text-center font-semibold">{t("status.completed", "Done")}</th>
                        <th className="text-right font-semibold">{t("Progress")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeYatras.map((y, i) => (
                        <tr key={i} className="border-b border-border/60 last:border-0">
                          <td className="py-2.5 pr-2 truncate max-w-[140px] font-semibold text-slate-800">{y.name}</td>
                          <td className="text-center font-mono-num text-xs">{y.participants}</td>
                          <td className="text-center text-xs">{y.completed}</td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-mono-num text-xs font-semibold text-slate-700">{y.progress}%</span>
                              <div className="w-12 hidden sm:block">
                                <Progress value={y.progress} className="h-1.5" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Row 2: Bhojanshala · Events · Volunteers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <SectionCard number="4" title={t("dashboard.bhojanshalaManagement", "Bhojanshala Management")} testId="section-bhojanshala">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { labelKey: "dashboard.breakfastCount", label: t("Navkarsi Count"), value: Math.round((stats.todaysVisitors ?? 0) * 0.3), time: "07:00 AM - 08:30 AM", icon: Coffee, tone: "green" },
                  { labelKey: "dashboard.lunchCount", label: t("Lunch Count"), value: Math.round((stats.todaysVisitors ?? 0) * 0.8), time: "11:30 AM - 01:30 PM", icon: UtensilsCrossed, tone: "orange" },
                  { labelKey: "dashboard.dinnerCount", label: t("Choviyar Count"), value: Math.round((stats.todaysVisitors ?? 0) * 0.4), time: "07:00 PM - 08:30 PM", icon: Moon, tone: "purple" },
                  { labelKey: "dashboard.passesIssued", label: t("Passes Issued"), value: stats.todaysVisitors ?? 0, time: t("Today"), icon: ClipboardList, tone: "blue" },
                ].map((c) => (
                  <div key={c.label} className="rounded-lg border border-border p-3">
                    <div className={`icon-chip ${c.tone} h-9 w-9 mb-2`}>
                      <c.icon className="h-4 w-4" />
                    </div>
                    <div className="text-[11px] text-muted-foreground font-semibold">{t(c.labelKey, c.label)}</div>
                    <div className="font-heading font-bold text-2xl mt-0.5 font-mono-num">{c.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{c.time}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard number="5" title={t("dashboard.eventManagement", "Event Management")} viewAll viewAllTo="/events" testId="section-events">
              <div className="space-y-3">
                {activeEvents.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    {t("dashboard.noEvents", "No upcoming events scheduled.")}
                  </div>
                ) : (
                  activeEvents.map((e, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                      <div className={`icon-chip ${e.tone} h-12 w-12 flex-col text-center`}>
                        <div className="text-lg font-bold font-heading leading-none">{e.day}</div>
                        <div className="text-[9px] uppercase font-semibold mt-0.5">{e.month}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{e.title}</div>
                        <div className="text-[11px] text-muted-foreground">{e.time}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-700 shrink-0">
                        {t("Upcoming")}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => navigate("/events")} data-testid="events-create-btn">
                  <PlusCircle className="h-4 w-4 mr-1.5" /> {t("action.add", "Create Event")}
                </Button>
                <Button size="sm" variant="outline" className="flex-1 font-bold" onClick={() => setShowReminderDialog(true)} data-testid="send-reminder-btn">
                  <Send className="h-4 w-4 mr-1.5" /> {t("dashboard.sendReminder", "Send Reminder")}
                </Button>
              </div>
            </SectionCard>

            <SectionCard number="6" title={t("dashboard.volunteerAssignment", "Volunteer Assignment")} viewAll viewAllTo="/volunteers" testId="section-volunteers">
              {activeVolunteers.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground font-sans">
                  {t("dashboard.noVolunteers", "No volunteers assigned today.")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[320px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                        <th className="text-left font-semibold py-2">{t("volunteers.volunteerRole", "Volunteer")}</th>
                        <th className="text-left font-semibold">{t("field.role", "Duty")}</th>
                        <th className="text-right font-semibold">{t("field.status", "Status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeVolunteers.map((v, i) => (
                        <tr key={i} className="border-b border-border/60 last:border-0">
                          <td className="py-2 pr-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                                  {initials(v.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium truncate">{v.name}</span>
                            </div>
                          </td>
                          <td className="text-xs text-muted-foreground truncate max-w-[100px]">{v.duty}</td>
                          <td className="text-right font-mono-num text-[10px] text-muted-foreground">{v.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Row 3: Live Donations · Announcements · Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard number="7" title={t("dashboard.liveDonationsLedger", "Live Donations Ledger")} viewAll viewAllTo="/donations" testId="section-donations">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{t("dashboard.todaysTotal", "Today's Total")}</div>
                  <div className="font-heading font-bold text-3xl text-foreground font-mono-num">{formatCurrency(stats.totalDonations ?? 0)}</div>
                  <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    {stats.donationCount ?? 0} {t("dashboard.donationTransactions", "donation transactions")}
                  </div>
                </div>
              </div>
              <div className="h-32 -mx-2 mb-3">
                {getDonationsTrend().length === 0 ? (
                  <div className="h-full flex items-center justify-center border border-dashed rounded text-xs text-muted-foreground">
                    {t("dashboard.noDonationStats", "No verified donation stats available.")}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getDonationsTrend()} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="donGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(152 65% 42%)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(152 65% 42%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(30, 10%, 92%)" />
                      <XAxis dataKey="t" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E5E5", fontSize: 11 }} />
                      <Area type="monotone" dataKey="v" stroke="hsl(152 65% 42%)" strokeWidth={2.5} fill="url(#donGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{t("dashboard.recentDonations", "Recent Donations")}</div>
              <div className="space-y-1.5">
                {recentDonorsList.length === 0 ? (
                  <div className="text-center py-4 text-xs text-muted-foreground">
                    {t("dashboard.noRecentDonations", "No recent donations verified.")}
                  </div>
                ) : (
                  recentDonorsList.slice(0, 4).map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <span className="text-foreground truncate">{d.name}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono-num font-semibold text-emerald-700">₹{d.amount.toLocaleString()}</span>
                        <span className="text-muted-foreground text-[10px] w-14 text-right">{d.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard number="8" title={t("dashboard.announcements", "Announcements")} viewAll viewAllTo="/announcements" testId="section-announcements">
              <div className="space-y-3">
                {activeAnnouncements.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    {t("dashboard.noAnnouncements", "No active announcements found.")}
                  </div>
                ) : (
                  activeAnnouncements.map((a, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`icon-chip ${a.tone} h-10 w-10 shrink-0`}>
                        <a.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">{a.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.desc}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{a.when}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard number="9" title={t("dashboard.quickActions", "Quick Actions")} testId="section-quick-actions">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: CalendarPlus, labelKey: "dashboard.addNewBooking", label: t("Add New Booking"), tone: "green", to: "/bookings" },
                  { icon: HeartHandshake, labelKey: "dashboard.addDonation", label: t("Add Donation"), tone: "orange", to: "/donations" },
                  { icon: Megaphone, labelKey: "dashboard.sendAnnouncement", label: t("Send Announcement"), tone: "purple", to: "/announcements" },
                  { icon: Sun, labelKey: "dashboard.addEvent", label: t("Add Event"), tone: "blue", to: "/events" },
                  { icon: Landmark, labelKey: "dashboard.bookDoliService", label: t("Book Doli Service"), tone: "orange", to: "/bookings" },
                  { icon: BarChart3, labelKey: "dashboard.viewReports", label: t("View Reports"), tone: "purple", to: "/reports" },
                ].map((q) => (
                  <button
                    key={q.label}
                    onClick={() => navigate(q.to)}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary/40 transition-all text-center"
                    data-testid={`quick-${q.label.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <div className={`icon-chip ${q.tone} h-10 w-10`}>
                      <q.icon className="h-4 w-4" />
                    </div>
                    <div className="text-[11px] font-medium text-foreground leading-tight">{t(q.labelKey, q.label)}</div>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        </>
      )}

      {/* Send Reminder Dialog */}
      <SendReminderDialog open={showReminderDialog} onClose={() => setShowReminderDialog(false)} />
    </div>
  );
}
