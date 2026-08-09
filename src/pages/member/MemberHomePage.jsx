import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  MapPin, Bell, ChevronRight, Scan, Heart, CalendarCheck,
  BookOpen, CreditCard, Phone, Navigation, Clock, Star,
  Flame, Users, Sparkles, Newspaper, TrendingUp, Compass,
  CheckCircle, ArrowUpRight, Award, ShieldCheck, HeartHandshake,
  Loader2, RefreshCw, MessageSquare, Search, Tag, Quote, Info, ExternalLink, Ticket, Gift,
  AlertTriangle, Megaphone, Sun, Moon, Map, ArrowRight, Share2
} from "lucide-react";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { memberClient as api } from "@/lib/memberClient";
import { cn } from "@/lib/utils";
import { useMemberSocket } from "@/hooks/useMemberSocket";
import { LiveBadge } from "@/components/common/LiveBadge";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { formatDistance } from "@/lib/geo";
import LocationPrompt from "@/components/member/LocationPrompt";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/api";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

/* ── Empty State Helper Component ─────────────────────────────────────────── */
function EmptySectionState({ icon: Icon, title, description, actionText, actionTo }) {
  return (
    <div className="p-6 bg-slate-50/70 rounded-3xl border border-dashed border-slate-200/80 text-center space-y-2.5">
      <div className="w-11 h-11 rounded-2xl bg-white text-slate-400 flex items-center justify-center mx-auto shadow-xs border border-slate-100">
        <Icon className="h-5 w-5 text-orange-500/80" />
      </div>
      <h3 className="text-xs font-bold text-slate-800">{title}</h3>
      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">{description}</p>
      {actionText && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-1 mt-1 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-orange-300 text-orange-600 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
        >
          <span>{actionText}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/* ── 1. Daily Tithi Hero Card ────────────────────────────────────────────── */
function DailyTithiCard({ tithiData }) {
  const { t } = useLanguage();
  const today = new Date();
  const tithiNames = [
    "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Purnima / Amavasya"
  ];
  const tithi = tithiData?.name || tithiNames[today.getDate() % 15];
  const weekday = today.toLocaleDateString("en-IN", { weekday: "long" });
  const fullDate = today.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 p-6 sm:p-8 text-white shadow-xl shadow-orange-600/15 border border-white/25 group">
      {/* Glow Backdrops & Sacred Motifs */}
      <div className="absolute right-0 top-0 bottom-0 w-3/5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/25 via-white/5 to-transparent pointer-events-none" />
      <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
              {weekday}
            </span>
            <span className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-bold text-white flex items-center gap-1">
              <Moon className="h-3 w-3" />
              <span>{tithiData?.paksha || "Shukla Paksha"}</span>
            </span>
            <span className="bg-amber-300 text-slate-950 rounded-full px-3 py-1 text-[11px] font-extrabold shadow-xs flex items-center gap-1">
              <Sun className="h-3 w-3" />
              <span>{t("Auspicious Choghadiya")}</span>
            </span>
          </div>

          <Link
            to="/member/spiritual"
            className="px-3.5 py-1.5 rounded-full bg-white text-orange-600 font-extrabold text-xs shadow-md hover:bg-orange-50 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{t("Spiritual Calendar")}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div>
            <div className="text-xs font-bold text-amber-100 uppercase tracking-widest">
              {t("Today's Sacred Tithi")}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none mt-1 text-white">
              {tithi}
            </h2>
            <p className="text-xs sm:text-sm font-medium opacity-90 mt-2 flex items-center gap-2 flex-wrap text-orange-50">
              <span>📅 {fullDate}</span>
              <span>•</span>
              <span>Vikram Samvat 2082</span>
              <span>•</span>
              <span>Nakshatra: Pushya</span>
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-xs font-medium space-y-1 sm:max-w-xs shadow-inner">
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-amber-200">
              {t("Daily Panchang Muhurat")}
            </div>
            <div className="font-extrabold text-white text-xs">
              Shubh Muhurat • Navkarsi: 07:12 AM • Choghadiya: Amrit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 2. Quick Actions Grid (Mobile Touch Carousel & Desktop Grid) ────────── */
function QuickActions() {
  const { t } = useLanguage();
  const actions = [
    { icon: Scan,          label: "Scan QR",        to: "/member/digital-id", color: "from-violet-500 to-purple-600", desc: "Digital Entry Pass" },
    { icon: Heart,         label: "Donate Seva",    to: "/member/donations",  color: "from-rose-500 to-pink-600",     desc: "80G Tax Benefit" },
    { icon: CalendarCheck, label: "Book Stay",      to: "/member/bookings",   color: "from-sky-500 to-blue-600",      desc: "Dharamshala & Hall" },
    { icon: Ticket,        label: "My Bookings",    to: "/member/bookings",   color: "from-emerald-500 to-green-600", desc: "Passes & Tickets" },
    { icon: CreditCard,    label: "Digital ID",     to: "/member/digital-id", color: "from-amber-500 to-orange-600", desc: "Member QR Card" },
    { icon: Phone,         label: "Emergency",      to: "/member/support",    color: "from-red-500 to-rose-700",      desc: "24x7 Help Desk" },
  ];

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Flame className="h-4 w-4" />
          </div>
          <span>{t("Quick Actions")}</span>
        </h2>
      </div>

      {/* Touch horizontal scroll on mobile, responsive grid on desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
        {actions.map(({ icon: Icon, label, to, color, desc }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50/90 hover:bg-white rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all group select-none text-center"
          >
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md mb-2 group-hover:scale-105 transition-transform", color)}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors">
              {t(label)}
            </span>
            <span className="text-[9px] text-slate-400 font-medium hidden sm:block mt-0.5 truncate max-w-full">
              {desc}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── 3. Continue Spiritual Journey Hub ──────────────────────────────────── */
function ContinueJourneyCard() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-[#06102E] via-[#0B132B] to-[#1C2541] rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">{t("Continue Your Spiritual Journey")}</h2>
            <p className="text-[10px] text-slate-300 font-medium">{t("Daily sadhana, tapasya and digital seva")}</p>
          </div>
        </div>
        <Link
          to="/member/spiritual"
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>{t("Spiritual Hub")}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Digital Mala */}
        <Link
          to="/member/spiritual"
          className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2.5 transition-all group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span className="flex items-center gap-1.5">
              <Compass className="h-4 w-4" />
              <span>{t("Digital Mala")}</span>
            </span>
            <span className="font-mono text-white text-[11px] bg-white/10 px-2 py-0.5 rounded-full">0 / 108</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full" style={{ width: "15%" }} />
          </div>
          <div className="text-[10px] text-slate-300 flex items-center justify-between">
            <span>{t("Tap to count Navkar")}</span>
            <ArrowRight className="h-3 w-3 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Varshitap Tracker */}
        <Link
          to="/member/spiritual"
          className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2.5 transition-all group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              <span>{t("Tapasya Tracker")}</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Active</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: "100%" }} />
          </div>
          <div className="text-[10px] text-slate-300 flex items-center justify-between">
            <span>{t("Mark today's Upvas / Ayambil")}</span>
            <ArrowRight className="h-3 w-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Digital ID Pass */}
        <Link
          to="/member/digital-id"
          className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2.5 transition-all group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-sky-300">
            <span className="flex items-center gap-1.5">
              <Scan className="h-4 w-4" />
              <span>{t("Digital Member ID")}</span>
            </span>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">Ready</span>
          </div>
          <div className="text-xs font-bold text-white truncate">{t("Verified QR Pass Active")}</div>
          <div className="text-[10px] text-slate-300 flex items-center justify-between">
            <span>{t("Tap to view & share")}</span>
            <ArrowRight className="h-3 w-3 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </section>
  );
}

/* ── Alerts Banner ───────────────────────────────────────────────────────── */
function AlertsSection({ alerts }) {
  const { t } = useLanguage();
  if (!alerts?.length) return null;
  return (
    <section className="rounded-3xl border border-red-200/90 bg-red-50/80 p-5 space-y-3 shadow-xs">
      <h2 className="text-sm font-bold text-red-900 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <span>{t("Important Alerts")}</span>
      </h2>
      <div className="space-y-2">
        {alerts.slice(0, 3).map((a, i) => (
          <div key={a.id || i} className="p-3.5 rounded-2xl bg-white border border-red-200 shadow-2xs">
            <div className="text-xs font-bold text-slate-900">{a.title || a.type || t("Alert")}</div>
            {(a.message || a.description) && (
              <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{a.message || a.description}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Monk Tracking with Live Indicators ──────────────────────────────────── */
const MS_STATUS = {
  MOVING:  { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Moving" },
  IDLE:    { dot: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200",       label: "Idle" },
  OFFLINE: { dot: "bg-slate-400",   chip: "bg-slate-50 text-slate-600 border-slate-200",       label: "Offline" },
};

function msStatusOf(m) {
  const raw = String(m?.trackingStatus || m?.status || "").toUpperCase();
  if (raw.includes("MOV") || raw === "ACTIVE") return MS_STATUS.MOVING;
  if (raw.includes("OFF")) return MS_STATUS.OFFLINE;
  if (raw.includes("IDLE") || raw.includes("REST")) return MS_STATUS.IDLE;
  return MS_STATUS.OFFLINE;
}

function MonkTrackingSection({ monks, live }) {
  const { t } = useLanguage();
  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <MapPin className="h-4 w-4" />
          </div>
          <span>{t("Maharaj Saheb (MS) Tracking")}</span>
          {live && <LiveBadge label={t("Live")} />}
        </h2>
        <Link to="/member/ms" className="text-xs font-bold text-orange-600 hover:text-orange-700">
          {t("View All")}
        </Link>
      </div>

      {!monks?.length ? (
        <div className="text-xs text-slate-400 italic text-center py-6">{t("No monks available")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {monks.slice(0, 4).map((m, i) => {
            const st = msStatusOf(m);
            return (
              <Link
                key={m.id || i}
                to={`/member/ms/${m.id || m.publicId}`}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 hover:border-orange-300 hover:shadow-md bg-slate-50/50 hover:bg-white active:scale-98 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-100 to-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border border-orange-200/60">
                  🙏
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                    {m.fullName || m.name || m.dikshaName || m.publicId}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{m.currentLocation || m.currentCity || m.city || t("Location unavailable")}</span>
                  </div>
                </div>
                <span className={cn("text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border shrink-0 flex items-center gap-1.5", st.chip)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", st.dot)} />
                  <span>{t(st.label)}</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ── Offers Section ──────────────────────────────────────────────────────── */
function OffersNearYouSection({ offers }) {
  const { t } = useLanguage();
  if (!offers?.length) return null;

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Tag className="h-4 w-4" />
          </div>
          <span>{t("Community Offers & Deals")}</span>
        </h2>
        <Link to="/member/offers" className="text-xs font-bold text-orange-600 hover:underline">
          {t("View All")}
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {offers.slice(0, 4).map((o, i) => (
          <Link
            key={o.id || i}
            to="/member/offers"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-xs active:scale-98 transition-all"
          >
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <Gift className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">{o.title}</div>
              {o.companyName && <div className="text-[10px] text-slate-500 truncate mt-0.5">{o.companyName}</div>}
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── Announcements Section ───────────────────────────────────────────────── */
function AnnouncementsSection({ announcements }) {
  const { t } = useLanguage();
  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Megaphone className="h-4 w-4" />
          </div>
          <span>{t("Announcements")}</span>
        </h2>
        <Link to="/member/announcements" className="text-xs font-bold text-orange-600 hover:text-orange-700">
          {t("View All")}
        </Link>
      </div>
      {!announcements?.length ? (
        <div className="text-xs text-slate-400 italic text-center py-6">{t("No announcements")}</div>
      ) : (
        <div className="space-y-2.5">
          {announcements.slice(0, 4).map((a, i) => (
            <div key={a.id || i} className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60">
              <div className="text-xs font-bold text-slate-900 truncate">{a.title}</div>
              <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">{a.body || a.description}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Upcoming Events Section ─────────────────────────────────────────────── */
function UpcomingEventsSection({ events, onRsvp, rsvpBusy }) {
  const { t } = useLanguage();
  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <span>{t("Upcoming Events & Programs")}</span>
        </h2>
        <Link to="/member/events" className="text-xs font-bold text-orange-600 hover:text-orange-700">
          {t("View All")}
        </Link>
      </div>

      {!events?.length ? (
        <div className="text-xs text-slate-400 italic text-center py-6">{t("No events available")}</div>
      ) : (
        <div className="space-y-2.5">
          {events.slice(0, 4).map((e, i) => {
            const when = e.startsAt || e.startDate || e.date;
            return (
              <div key={e.id || i} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 hover:border-orange-300 hover:shadow-xs transition-all">
                <Link to="/member/events" className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 hover:text-orange-600 transition-colors truncate">
                    {e.title || e.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {when ? new Date(when).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    }) : t("Date to be announced")}
                    {(e.organization?.name || e.templeName) ? ` · ${e.organization?.name || e.templeName}` : ""}
                  </div>
                </Link>
                <Button
                  size="sm"
                  disabled={rsvpBusy === (e.id || i) || e.isFull}
                  onClick={() => onRsvp(e)}
                  className="h-8 text-[11px] font-bold shrink-0 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-xs"
                >
                  {e.isFull ? t("Full") : rsvpBusy === (e.id || i) ? t("…") : t("RSVP")}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ── Main Member Home Page ────────────────────────────────────────────────── */
export default function MemberHomePage() {
  const { t } = useLanguage();
  const { user } = useMemberAuth();
  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || t("Member");

  const { status: locStatus, error: locError, request: requestLocation } = useOutletContext() || {};
  const { distanceTo } = useVisibilityEngine();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [temples, setTemples] = useState([]);
  const [monks, setMonks] = useState([]);
  const [events, setEvents] = useState([]);
  const [feed, setFeed] = useState([]);
  const [news, setNews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tithi, setTithi] = useState(null);

  const [rsvpBusy, setRsvpBusy] = useState(null);

  const handleRsvp = async (e) => {
    const id = e.id || e.publicId;
    setRsvpBusy(id);
    try {
      await api.post(`/events/${id}/rsvp`, { attendees: 1 });
      toast.success(t("RSVP confirmed. See you there!"));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setRsvpBusy(null);
    }
  };

  const unwrap = (res) => {
    const d = res?.data?.data;
    return Array.isArray(d) ? d : d?.items || [];
  };

  const fetchRealtimeData = async () => {
    setLoading(true);
    const [
      dash, templeRes, eventRes, feedRes, newsRes, monkRes, offerRes,
      alertRes, annRes, tithiRes,
    ] = await Promise.all([
      api.get("/dashboard/member").catch(() => null),
      api.get("/temples", { params: { take: 4 } }).catch(() => null),
      api.get("/events/member").catch(() => null),
      api.get("/feed/", { params: { take: 4 } }).catch(() => null),
      api.get("/news", { params: { take: 4 } }).catch(() => null),
      api.get("/monks/", { params: { take: 4 } }).catch(() => null),
      api.get("/offers", { params: { take: 4 } }).catch(() => null),
      api.get("/alerts/", { params: { take: 3 } }).catch(() => null),
      api.get("/announcements/", { params: { take: 4 } }).catch(() => null),
      api.get("/calendar/today").catch(() => null),
    ]);

    if (dash?.data?.data) setDashboardData(dash.data.data);
    setTemples(unwrap(templeRes));
    setEvents(unwrap(eventRes).slice(0, 4));
    setFeed(unwrap(feedRes));
    setNews(unwrap(newsRes));
    setMonks(unwrap(monkRes));
    setOffers(unwrap(offerRes));
    setAlerts(unwrap(alertRes));
    setAnnouncements(unwrap(annRes));
    setTithi(tithiRes?.data?.data || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchRealtimeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { connected: liveConnected } = useMemberSocket("/tracking", {
    "monk:location": (evt) => {
      if (!evt?.monkId) return;
      setMonks((prev) => prev.map((m) =>
        (m.id === evt.monkId || m.publicId === evt.monkId)
          ? { ...m, currentLocation: evt.location ?? m.currentLocation,
              trackingStatus: evt.status ?? m.trackingStatus,
              lastUpdatedAt: evt.timestamp || new Date().toISOString() }
          : m
      ));
    },
    "journey:advanced": (evt) => {
      if (!evt?.monkId) return;
      setMonks((prev) => prev.map((m) =>
        (m.id === evt.monkId) ? { ...m, currentLocation: evt.location ?? m.currentLocation } : m
      ));
    },
  });

  useMemberSocket("/dashboards", {
    "alert:new": (evt) => {
      if (!evt) return;
      setAlerts((prev) => [evt, ...prev].slice(0, 3));
    },
    "alert:resolved": (evt) => {
      if (!evt?.alertId) return;
      setAlerts((prev) => prev.filter((a) => a.id !== evt.alertId));
    },
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      
      {/* ── Top Welcome & Header Greeting Bar ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-md shadow-orange-500/20 shrink-0">
            {firstName[0]?.toUpperCase() || "J"}
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-2 flex-wrap">
              <span>{t(timeGreeting())}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                {t("JiNANAM Connected")}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {t("Jai Jinendra")}, {firstName} 🙏
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
          <button
            onClick={fetchRealtimeData}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
            title={t("Refresh Live Data")}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin text-orange-600")} />
            <span className="hidden sm:inline">{t("Sync")}</span>
          </button>

          <Link
            to="/member/digital-id"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
          >
            <Scan className="h-4 w-4" />
            <span>{t("Digital ID")}</span>
          </Link>
        </div>
      </div>

      {/* ── 1. Daily Tithi Card ────────────────────────────────────────── */}
      <DailyTithiCard tithiData={tithi || dashboardData?.todaysTithi} />

      {/* ── High Priority Alerts & Live Updates ────────────────────────── */}
      <AlertsSection alerts={alerts} />
      <MonkTrackingSection monks={monks} live={liveConnected} />
      <UpcomingEventsSection events={events} onRsvp={handleRsvp} rsvpBusy={rsvpBusy} />

      {/* ── 2. Quick Actions Grid ──────────────────────────────────────── */}
      <QuickActions />

      {/* ── 3. Continue Spiritual Journey ──────────────────────────────── */}
      <ContinueJourneyCard />

      {/* ── Tour / Yatra Announcement Banner ───────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 text-white shadow-lg border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-md">
            {t("SACRED YATRA PROGRAM")}
          </span>
          <h3 className="text-base font-black text-white">{t("Shree Palitana Shatrunjay Mahatirth Yatra")}</h3>
          <p className="text-xs text-slate-300 max-w-xl">{t("Guided group tours, daily Bhojanshala and Dharamshala booking available now for community members.")}</p>
        </div>
        <Link
          to="/member/tours"
          className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shrink-0 hover:opacity-95 active:scale-95 transition-all text-center"
        >
          {t("Explore Yatra")}
        </Link>
      </div>

      {/* ── Multi-Column Responsive Grid Layout ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          
          {/* Nearby Temples & Derasars */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>{t("Nearby Temples & Jain Centres")}</span>
              </h2>
              <div className="flex items-center gap-3">
                <LocationPrompt status={locStatus} error={locError} onRequest={requestLocation} />
                <Link to="/member/temples" className="text-xs font-bold text-orange-600 hover:underline">
                  {t("View Directory")}
                </Link>
              </div>
            </div>

            {temples.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[...temples]
                  .map((tp) => ({ ...tp, _km: distanceTo(tp) }))
                  .sort((a, b) => (a._km ?? Infinity) - (b._km ?? Infinity))
                  .map((tp) => (
                  <Link
                    key={tp.id}
                    to={`/member/temples/${tp.id}`}
                    className="p-4 bg-slate-50/80 hover:bg-white rounded-2xl border border-slate-200/70 hover:border-orange-300 hover:shadow-md active:scale-98 transition-all space-y-2 block group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                          {tp.name}
                        </h3>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          {tp._km != null && (
                            <span className="font-bold text-orange-600">{formatDistance(tp._km)}</span>
                          )}
                          <span>{tp._km != null ? "·" : ""} {tp.city || "India"}</span>
                        </div>
                      </div>
                      <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0", tp.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                        {tp.status === "ACTIVE" ? t("Open") : t("Active")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptySectionState
                icon={MapPin}
                title={t("No Nearby Temples Registered Yet")}
                description={t("Explore the full directory or register your local temple on JiNANAM.")}
                actionText={t("Browse Temples Directory")}
                actionTo="/member/temples"
              />
            )}
          </section>

          {/* Offers */}
          <OffersNearYouSection offers={offers} />

          {/* Announcements */}
          <AnnouncementsSection announcements={announcements} />

          {/* Community Highlights / Feed Preview */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Newspaper className="h-4 w-4" />
                </div>
                <span>{t("Community Feed Highlights")}</span>
              </h2>
              <Link to="/member/feed" className="text-xs font-bold text-orange-600 hover:underline">
                {t("View Feed")}
              </Link>
            </div>

            {feed.length > 0 ? (
              <div className="space-y-2.5">
                {feed.map((p) => (
                  <Link
                    key={p.id}
                    to="/member/feed"
                    className="p-3.5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/70 hover:border-orange-300 hover:shadow-xs active:scale-98 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-extrabold text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-md uppercase tracking-wide">
                        {p.category || "Community"}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors mt-1 truncate">
                        {p.title}
                      </h3>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptySectionState
                icon={Newspaper}
                title={t("No Community Posts Yet")}
                description={t("Follow your local Derasars, Maharaj Saheb and Jain Community Pages.")}
                actionText={t("Explore Community Feed")}
                actionTo="/member/feed"
              />
            )}
          </section>

        </div>

        {/* Right Sidebar Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          
          {/* Live MS Updates */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>{t("Live MS Updates")}</span>
              </h3>
              <Link to="/member/ms" className="text-[11px] font-bold text-orange-600 hover:underline">
                {t("View All")}
              </Link>
            </div>

            {monks.length > 0 ? (
              monks.slice(0, 3).map((ms) => (
                <Link
                  to={`/member/ms/${ms.id}`}
                  key={ms.id}
                  className="block p-3.5 bg-slate-50/80 hover:bg-white rounded-2xl border border-slate-200/70 hover:border-amber-300 hover:shadow-xs active:scale-98 transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    <span className="truncate">🙏 {ms.dikshaName || ms.name}</span>
                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0", ms.isVihaar ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>
                      {ms.isVihaar ? "Vihaar" : "Staying"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{ms.currentCity || ms.currentLocation || "India"}</span>
                  </div>
                </Link>
              ))
            ) : (
              <EmptySectionState
                icon={Star}
                title={t("No Live MS Tracking Updates")}
                description={t("Follow Maharaj Saheb & Sadhvi Sangha to get Vihaar notifications.")}
                actionText={t("Guru Directory")}
                actionTo="/member/ms"
              />
            )}
          </section>

          {/* Today's News */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <span>{t("Today's News")}</span>
              </h3>
              <Link to="/member/news" className="text-[11px] font-bold text-orange-600 hover:underline">
                {t("View All")}
              </Link>
            </div>

            {news.length > 0 ? (
              news.slice(0, 3).map((n) => (
                <Link
                  key={n.id}
                  to="/member/news"
                  className="block p-3 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/60 hover:border-orange-300 text-xs font-bold text-slate-800 hover:text-orange-600 transition-all truncate"
                >
                  📰 {n.title}
                </Link>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic text-center py-4">{t("No news articles today")}</div>
            )}
          </section>

          {/* Daily Spiritual Quote Card */}
          <section className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg space-y-2.5 border border-white/20">
            <Quote className="h-6 w-6 text-white/70" />
            <p className="text-xs font-bold leading-relaxed text-white">
              "Ahimsa Parmo Dharma — Compassion towards all living beings is the highest spiritual virtue."
            </p>
            <div className="text-[10px] text-amber-100 text-right font-bold tracking-wide">
              — Bhagwan Mahavir Swami
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
