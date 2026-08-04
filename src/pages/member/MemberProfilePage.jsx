import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User, Edit3, QrCode, Wallet, Settings, Bell, Shield,
  MapPin, Phone, Mail, Heart, Users, CalendarCheck,
  Star, ChevronRight, Camera, LogOut, Bookmark, Globe, Info, Sparkles
} from "lucide-react";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { cn } from "@/lib/utils";
import FamilyMembersCard from "@/components/member/FamilyMembersCard";
import { bookingsApi, donationsApi, eventsApi } from "@/lib/memberApi";

function StatBadge({ label, value, icon: Icon, color }) {
  return (
    <div className={cn("flex flex-col items-center gap-1.5 p-4 rounded-2xl border border-slate-100", color)}>
      <Icon className="h-5 w-5" />
      <span className="text-xl font-black text-slate-900">{value}</span>
      <span className="text-xs font-bold text-slate-600 text-center leading-tight">{label}</span>
    </div>
  );
}

function SectionRow({ icon: Icon, label, value, to, iconBg = "bg-orange-100 text-orange-600" }) {
  const inner = (
    <div className="flex items-center gap-3.5 py-3 border-b border-slate-100 last:border-0">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs", iconBg)}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-400">{label}</div>
        <div className="text-sm font-bold text-slate-800 truncate">{value || "—"}</div>
      </div>
      {to && <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return inner;
}

/**
 * Inline language switcher. useLanguage()'s setLanguage already persists to
 * localStorage and re-renders the whole app instantly — it was simply never
 * exposed anywhere in the UI, admin or member. Purely client-side, so unlike
 * the rest of "Settings" this needed no endpoint to verify.
 */
function LanguagePicker() {
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  return (
    <div className="flex items-center gap-3.5 py-3 border-b border-slate-100 last:border-0">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-purple-100 text-purple-600">
        <Globe className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-400 mb-1.5">{t("Preferred Language")}</div>
        <div className="flex flex-wrap gap-1.5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1",
                currentLanguage === lang.code
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-orange-300"
              )}
            >
              <span>{lang.flag}</span> {lang.nativeName}
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

  // "My Platform Activity" used to show fixed numbers (8/12/5/4) with no data
  // behind them. bookingsApi.mine / donationsApi.mine / eventsApi.myEvents
  // are the same real, already-verified endpoints MyBookingsPage, My
  // Donations and the Events tab use — this just counts what they return.
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
        events: events.length,
        donations: donations.items.length,
        bookings: bookings.length,
      });
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-8">
      
      {/* ── Top Hero Banner ────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center text-4xl shadow-lg">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <span>🙏</span>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{displayName}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {user?.publicId && (
                  <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-bold font-mono">
                    {user.publicId}
                  </span>
                )}
                <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-bold">
                  {String(user?.primaryRoleKey || user?.role).toUpperCase() === "NON_JAIN_MEMBER"
                    ? t("🌐 Community Member")
                    : t("🙏 Jain Member")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/member/digital-id"
              className="px-5 py-3 rounded-2xl bg-white text-orange-600 font-bold text-xs shadow-md hover:bg-orange-50 transition-colors flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              <span>Digital ID Card</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Multi-Column Profile Content (2-Column Desktop Grid) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Personal Info & Community) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Personal Info */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4">{t("Personal Information")}</h2>
            <SectionRow icon={User} label={t("Full Name")} value={displayName} />
            <SectionRow icon={Phone} label={t("Mobile Number")} value={user?.mobile} iconBg="bg-green-100 text-green-600" />
            <SectionRow icon={Mail} label={t("Email Address")} value={user?.email} iconBg="bg-sky-100 text-sky-600" />
            <LanguagePicker />
            <SectionRow icon={MapPin} label={t("City / State")} value={[user?.city, user?.state].filter(Boolean).join(", ")} iconBg="bg-amber-100 text-amber-600" />
          </div>

          {/* Community Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4">{t("Community & Sect")}</h2>
            <SectionRow icon={Info} label={t("Sect")} value={user?.sect} iconBg="bg-orange-100 text-orange-600" />
            <SectionRow icon={Users} label={t("Sub-Sect")} value={user?.subCommunity} iconBg="bg-amber-100 text-amber-600" />
            <SectionRow icon={Star} label={t("Gaccha")} value={user?.gaccha} iconBg="bg-yellow-100 text-yellow-600" />
          </div>

          {/* §4.2.7 Family Member Addition */}
          <FamilyMembersCard />

        </div>

        {/* Right Column (Activity & Settings) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Activity Stats */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4">{t("My Platform Activity")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBadge label="Events" value={stats.events ?? "—"} icon={CalendarCheck} color="bg-orange-50/80 text-orange-600" />
              <StatBadge label="Donations" value={stats.donations ?? "—"} icon={Heart} color="bg-rose-50/80 text-rose-600" />
              <StatBadge label="Bookings" value={stats.bookings ?? "—"} icon={Bookmark} color="bg-sky-50/80 text-sky-600" />
              <StatBadge label="Following" value={followedIds.length} icon={Star} color="bg-amber-50/80 text-amber-600" />
            </div>
          </div>

          {/* Quick Shortcuts & Documents */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4">{t("Documents & Wallet")}</h2>
            <SectionRow icon={QrCode} label={t("Digital ID Card")} value="View & Share Verified ID" to="/member/digital-id" iconBg="bg-violet-100 text-violet-600" />
            <SectionRow icon={Wallet} label={t("Digital Wallet")} value="Receipts, Passes & Certificates" to="/member/wallet" iconBg="bg-emerald-100 text-emerald-600" />
            <SectionRow icon={Bell} label={t("Notifications")} value="Preferences & Alerts" to="/member/notifications" iconBg="bg-yellow-100 text-yellow-600" />
            <SectionRow icon={Settings} label={t("Notification Settings")} value="Push, WhatsApp, SMS, Email" to="/member/notifications/preferences" iconBg="bg-slate-100 text-slate-600" />
            <SectionRow icon={MapPin} label={t("My Temple Visits")} value="Check-in & check-out history" to="/member/visits" iconBg="bg-indigo-100 text-indigo-600" />
            <SectionRow icon={Star} label={t("Following")} value={`${followedIds.length} ${followedIds.length === 1 ? t("entity") : t("entities")}`} to="/member/following" iconBg="bg-amber-100 text-amber-600" />
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100/80 border border-red-200/60 rounded-2xl text-red-600 text-sm font-bold transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t("Sign Out of JiNANAM")}
          </button>

        </div>

      </div>

    </div>
  );
}
