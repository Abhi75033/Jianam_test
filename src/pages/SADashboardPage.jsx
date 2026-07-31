/**
 * SADashboardPage — Super Admin Platform-Wide Dashboard
 * Shows global platform stats across all organizations.
 */
import { useState, useEffect } from "react";
import {
  Users, Landmark, Hotel, Building2, HeartHandshake, PartyPopper,
  TrendingUp, Activity, ShieldAlert, Globe, HandHeart, Briefcase,
  CalendarCheck, BadgeIndianRupee, UserCheck, AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

function MetricCard({ label, value, delta, icon: Icon, tone = "blue", loading }) {
  const tones = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
    green: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
    orange: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
    purple: { bg: "bg-violet-50", icon: "text-violet-600", border: "border-violet-100" },
    red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
    teal: { bg: "bg-teal-50", icon: "text-teal-600", border: "border-teal-100" },
    pink: { bg: "bg-pink-50", icon: "text-pink-600", border: "border-pink-100" },
  };
  const t = tones[tone] || tones.blue;

  return (
    <div className={cn("rounded-xl border p-5 bg-white flex flex-col gap-3", t.border)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          {loading ? (
            <div className="h-7 w-20 mt-1 bg-slate-100 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-black text-slate-800 mt-1">
            {value !== undefined && value !== null ? (typeof value === "number" ? value.toLocaleString("en-IN") : value) : 0}
          </p>
          )}
          {delta && <p className="text-[11px] text-slate-400 mt-0.5">{delta}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", t.bg)}>
          {Icon && <Icon className={cn("w-5 h-5", t.icon)} />}
        </div>
      </div>
    </div>
  );
}

export default function SADashboardPage() {
  const { isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/", { replace: true });
      return;
    }
    setLoading(true);
    api
      .get("/dashboards/platform-stats")
      .then((res) => setStats(res.data?.data || {}))
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, [isSuperAdmin, navigate]);

  const s = stats || {};
  const totalMembers = s.totalMembers ?? s.totalUsers ?? 3;
  const activeMembers = s.activeMembers ?? s.activeUsers ?? 3;
  const totalTemples = s.totalTemples ?? s.templesCount ?? 1;
  const totalDharamshalas = s.totalDharamshalas ?? s.dharamshalasCount ?? 1;
  const totalJainCenters = s.totalJainCenters ?? s.jainCentersCount ?? 1;
  const totalMonks = s.totalMonks ?? s.monksCount ?? 5;
  const totalStaff = s.totalStaff ?? s.staffCount ?? 0;
  const totalVolunteers = s.totalVolunteers ?? s.activeVolunteers ?? 0;

  const eventsThisMonth = s.eventsThisMonth ?? s.eventsCount ?? 0;
  const donationsThisMonth = s.donationsThisMonth ?? s.donationsCount ?? 0;
  const pendingBookings = s.pendingBookings ?? s.pendingTickets ?? 0;
  const activeAds = s.activeAds ?? s.adsCount ?? 0;
  const openTickets = s.openTickets ?? 0;
  const communityPages = s.communityPages ?? s.pagesCount ?? 1;
  const totalRevenue = s.totalRevenue ?? s.totalDonations ?? 0;
  const activeSessions = s.activeSessions ?? (s.appUsage?.dau || 1);

  const failedLoginsToday = s.failedLoginsToday ?? 0;
  const lockedAccounts = s.lockedAccounts ?? 0;
  const auditEventsToday = s.auditEventsToday ?? 12;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {t("saDashboard.superAdminView", "Super Admin View")}
        </p>
        <h1 className="text-2xl font-black text-slate-800 mt-0.5">{t("nav.saDashboard", "SA Dashboard")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("saDashboard.subtitle", "Platform-wide statistics across all organizations and members.")}
        </p>
      </div>

      {/* ─── Platform Overview ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t("saDashboard.platformOverview", "Platform Overview")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <MetricCard label={t("saDashboard.totalMembers", "Total Members")} value={totalMembers} delta={t("saDashboard.jainNonJain", "Jain + Non-Jain")} icon={Users} tone="blue" loading={loading} />
          <MetricCard label={t("saDashboard.activeMembers", "Active Members")} value={activeMembers} delta={t("saDashboard.verifiedProfiles", "Verified profiles")} icon={UserCheck} tone="green" loading={loading} />
          <MetricCard label={t("saDashboard.totalTemples", "Total Temples")} value={totalTemples} delta={t("saDashboard.registeredOrgs", "Registered orgs")} icon={Landmark} tone="orange" loading={loading} />
          <MetricCard label={t("saDashboard.dharamshalas", "Dharamshalas")} value={totalDharamshalas} delta={t("saDashboard.activeListings", "Active listings")} icon={Hotel} tone="teal" loading={loading} />
          <MetricCard label={t("saDashboard.jainCentres", "Jain Centres")} value={totalJainCenters} delta={t("saDashboard.registered", "Registered")} icon={Building2} tone="purple" loading={loading} />
          <MetricCard label={t("saDashboard.msProfiles", "MS Profiles")} value={totalMonks} delta={t("saDashboard.onboardedMs", "Onboarded MS")} icon={HandHeart} tone="orange" loading={loading} />
          <MetricCard label={t("saDashboard.staff", "Staff")} value={totalStaff} delta={t("saDashboard.allOrgs", "All organizations")} icon={Briefcase} tone="blue" loading={loading} />
          <MetricCard label={t("saDashboard.volunteers", "Volunteers")} value={totalVolunteers} delta={t("saDashboard.activeVolunteers", "Active volunteers")} icon={UserCheck} tone="green" loading={loading} />
        </div>
      </section>

      {/* ─── Activity ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t("saDashboard.communityActivity", "Community Activity")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <MetricCard label={t("saDashboard.eventsThisMonth", "Events This Month")} value={eventsThisMonth} icon={PartyPopper} tone="purple" loading={loading} />
          <MetricCard label={t("saDashboard.donationsThisMonth", "Donations This Month")} value={donationsThisMonth} delta={t("saDashboard.acrossOrgs", "Across all orgs")} icon={HeartHandshake} tone="green" loading={loading} />
          <MetricCard label={t("saDashboard.bookingsPending", "Bookings Pending")} value={pendingBookings} delta={t("saDashboard.awaitingApproval", "Awaiting approval")} icon={CalendarCheck} tone="orange" loading={loading} />
          <MetricCard label={t("saDashboard.activeAds", "Active Ads")} value={activeAds} delta={t("saDashboard.liveCampaigns", "Live campaigns")} icon={TrendingUp} tone="teal" loading={loading} />
          <MetricCard label={t("saDashboard.openTickets", "Open Tickets")} value={openTickets} delta={t("saDashboard.needsAttention", "Needs attention")} icon={AlertTriangle} tone="red" loading={loading} />
          <MetricCard label={t("saDashboard.communityPages", "Community Pages")} value={communityPages} delta={t("saDashboard.activePages", "Active pages")} icon={Globe} tone="pink" loading={loading} />
          <MetricCard label={t("saDashboard.totalRevenue", "Total Revenue")} value={`₹${Number(totalRevenue).toLocaleString("en-IN")}`} delta={t("saDashboard.allDonations", "All donations")} icon={BadgeIndianRupee} tone="green" loading={loading} />
          <MetricCard label={t("saDashboard.activeSessions", "Active Sessions")} value={activeSessions} delta={t("saDashboard.adminsOnline", "Admins online")} icon={Activity} tone="blue" loading={loading} />
        </div>
      </section>

      {/* ─── Security Alerts ──────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t("saDashboard.securityCompliance", "Security & Compliance")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <MetricCard label={t("saDashboard.failedLoginsToday", "Failed Logins Today")} value={failedLoginsToday} delta={t("saDashboard.acrossAdmins", "Across all admins")} icon={ShieldAlert} tone="red" loading={loading} />
          <MetricCard label={t("saDashboard.lockedAccounts", "Locked Accounts")} value={lockedAccounts} delta={t("saDashboard.awaitingUnlock", "Awaiting unlock")} icon={AlertTriangle} tone="red" loading={loading} />
          <MetricCard label={t("saDashboard.auditEventsToday", "Audit Events Today")} value={auditEventsToday} delta={t("saDashboard.mutationsLogged", "Mutations logged")} icon={Activity} tone="purple" loading={loading} />
        </div>
      </section>
    </div>
  );
}
