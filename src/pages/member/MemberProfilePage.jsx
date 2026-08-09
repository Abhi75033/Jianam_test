import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User, Edit3, QrCode, Wallet, Settings, Bell, Shield,
  MapPin, Phone, Mail, Heart, Users, CalendarCheck,
  Star, ChevronRight, Camera, LogOut, Bookmark, Globe, Info, Sparkles,
  Award, ShieldCheck, FileText, CheckCircle2
} from "lucide-react";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { cn, initials } from "@/lib/utils";
import FamilyMembersCard from "@/components/member/FamilyMembersCard";
import { bookingsApi, donationsApi, eventsApi } from "@/lib/memberApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function StatBadge({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-slate-50/70 hover:bg-white shadow-2xs hover:shadow-xs transition-all text-center">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 shadow-2xs", bg, color)}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">{value}</span>
      <span className="text-[11px] font-bold text-slate-500 mt-0.5 leading-tight">{label}</span>
    </div>
  );
}

function SectionRow({ icon: Icon, label, value, to, iconBg = "bg-orange-100 text-orange-600" }) {
  const inner = (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-slate-100 last:border-0 group">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105", iconBg)}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-slate-400">{label}</div>
        <div className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-orange-600 transition-colors">{value || "—"}</div>
      </div>
      {to && <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" />}
    </div>
  );
  if (to) return <Link to={to} className="block active:scale-99">{inner}</Link>;
  return inner;
}

function LanguagePicker() {
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  return (
    <div className="flex items-start gap-3.5 py-3.5 border-b border-slate-100 last:border-0">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-purple-100 text-purple-600 mt-0.5">
        <Globe className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-slate-400 mb-2">{t("Preferred Language")}</div>
        <div className="flex flex-wrap gap-1.5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs",
                currentLanguage === lang.code
                  ? "bg-orange-500 border-orange-500 text-white shadow-orange-500/20"
                  : "bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50/50"
              )}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MemberProfilePage() {
  const { t } = useLanguage();
  const { user, logout } = useMemberAuth();
  const { followedIds } = useVisibilityEngine();

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.fullName || t("Member");

  const [stats, setStats] = useState({ events: null, donations: null, bookings: null });
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      eventsApi.myEvents().catch(() => []),
      donationsApi.mine().catch(() => ({ items: [] })),
      bookingsApi.mine().catch(() => []),
    ]).then(([events, donations, bookings]) => {
      if (cancelled) return;
      setStats({
        events: events?.length || 0,
        donations: donations?.items?.length || 0,
        bookings: bookings?.length || 0,
      });
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      
      {/* ── Top Hero Member Card ────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15 border border-white/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-white/40 shadow-xl shrink-0 rounded-2xl">
              {user?.photoUrl && <AvatarImage src={user.photoUrl} alt={displayName} className="rounded-2xl object-cover" />}
              <AvatarFallback className="bg-gradient-to-br from-amber-600 to-orange-700 text-white text-2xl font-black rounded-2xl">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{displayName}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {user?.publicId && (
                  <span className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-black font-mono shadow-xs">
                    {user.publicId}
                  </span>
                )}
                <span className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-extrabold flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{String(user?.primaryRoleKey || user?.role).toUpperCase() === "NON_JAIN_MEMBER" ? t("Community Member") : t("Verified Jain Member")}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/member/digital-id"
              className="px-5 py-3 rounded-2xl bg-white text-orange-600 font-black text-xs shadow-lg hover:bg-orange-50 active:scale-95 transition-all flex items-center gap-2"
            >
              <QrCode className="h-4.5 w-4.5" />
              <span>{t("Digital ID Card")}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Activity Statistics Bar ──────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <h2 className="text-sm font-black text-slate-900 mb-3">{t("My Platform Activity")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBadge label={t("Registered Events")} value={stats.events ?? "0"} icon={CalendarCheck} color="text-orange-600" bg="bg-orange-100" />
          <StatBadge label={t("Donations Done")} value={stats.donations ?? "0"} icon={Heart} color="text-rose-600" bg="bg-rose-100" />
          <StatBadge label={t("Active Bookings")} value={stats.bookings ?? "0"} icon={Bookmark} color="text-sky-600" bg="bg-sky-100" />
          <StatBadge label={t("Following Entities")} value={followedIds.length} icon={Star} color="text-amber-600" bg="bg-amber-100" />
        </div>
      </div>

      {/* ── 2-Column Responsive Layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column (Personal Info, Community & Family) */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8">
          
          {/* Personal Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-orange-500" />
              <span>{t("Personal Details")}</span>
            </h2>
            <SectionRow icon={User} label={t("Full Name")} value={displayName} />
            <SectionRow icon={Phone} label={t("Mobile Number")} value={user?.mobile} iconBg="bg-green-100 text-green-700" />
            <SectionRow icon={Mail} label={t("Email Address")} value={user?.email} iconBg="bg-sky-100 text-sky-700" />
            <LanguagePicker />
            <SectionRow icon={MapPin} label={t("City / State")} value={[user?.city, user?.state].filter(Boolean).join(", ")} iconBg="bg-amber-100 text-amber-700" />
          </div>

          {/* Community & Sect */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-500" />
              <span>{t("Community & Sect")}</span>
            </h2>
            <SectionRow icon={Info} label={t("Sect")} value={user?.sect} iconBg="bg-orange-100 text-orange-600" />
            <SectionRow icon={Users} label={t("Sub-Sect")} value={user?.subCommunity || user?.subSect} iconBg="bg-amber-100 text-amber-600" />
            <SectionRow icon={Star} label={t("Gaccha")} value={user?.gaccha} iconBg="bg-yellow-100 text-yellow-600" />
          </div>

          {/* Family Members Card */}
          <FamilyMembersCard />
        </div>

        {/* Right Column (Documents, Shortcuts & Logout) */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8">
          
          {/* Quick Shortcuts & Documents */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
              <Wallet className="h-4.5 w-4.5 text-emerald-600" />
              <span>{t("Documents & Digital Services")}</span>
            </h2>
            <SectionRow icon={QrCode} label={t("Digital ID & QR Pass")} value={t("View, print and share your verified pass")} to="/member/digital-id" iconBg="bg-violet-100 text-violet-600" />
            <SectionRow icon={Wallet} label={t("Digital Wallet")} value={t("Receipts, temple passes & certificates")} to="/member/wallet" iconBg="bg-emerald-100 text-emerald-600" />
            <SectionRow icon={Bookmark} label={t("My Bookings")} value={t("Dharamshala, Puja & Bhojanshala passes")} to="/member/bookings" iconBg="bg-sky-100 text-sky-600" />
            <SectionRow icon={Heart} label={t("My Donations")} value={t("80G receipts & seva transactions")} to="/member/donations" iconBg="bg-rose-100 text-rose-600" />
            <SectionRow icon={Bell} label={t("Notification History")} value={t("Alerts, reminders and updates")} to="/member/notifications" iconBg="bg-yellow-100 text-yellow-600" />
            <SectionRow icon={Settings} label={t("Notification Preferences")} value={t("Push, WhatsApp, SMS & Email alerts")} to="/member/notifications/preferences" iconBg="bg-slate-100 text-slate-600" />
            <SectionRow icon={Star} label={t("Following Directory")} value={`${followedIds.length} ${t("entities followed")}`} to="/member/following" iconBg="bg-amber-100 text-amber-600" />
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-2xl sm:rounded-3xl text-red-600 text-xs sm:text-sm font-black active:scale-98 transition-all shadow-xs"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("Sign Out of JiNANAM")}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
