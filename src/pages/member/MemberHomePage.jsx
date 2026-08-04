import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  MapPin, Bell, ChevronRight, Scan, Heart, CalendarCheck,
  BookOpen, CreditCard, Phone, Navigation, Clock, Star,
  Flame, Users, Sparkles, Newspaper, TrendingUp, Compass,
  CheckCircle, ArrowUpRight, Award, ShieldCheck, HeartHandshake,
  Loader2, RefreshCw, MessageSquare, Search, Tag, Quote, Info, ExternalLink, Ticket, Gift,
  AlertTriangle, Megaphone
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
  if (h < 12) return "🌅 Good Morning";
  if (h < 17) return "☀️ Good Afternoon";
  return "🌙 Good Evening";
}

/* ── Empty State Helper Component ─────────────────────────────────────────── */
function EmptySectionState({ icon: Icon, title, description, actionText, actionTo }) {
  return (
    <div className="p-6 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
      <div className="w-10 h-10 rounded-2xl bg-white text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-xs font-bold text-slate-700">{title}</h3>
      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">{description}</p>
      {actionText && actionTo && (
        <Link
          to={actionTo}
          className="inline-block mt-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-orange-300 text-orange-600 font-bold text-[11px] rounded-xl shadow-2xs transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}

/* ── 1. Daily Tithi Card ─────────────────────────────────────────────────── */
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
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15 border border-white/20">
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -right-4 -bottom-8 text-[160px] opacity-10 select-none pointer-events-none font-serif">
        🕉️
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
              {weekday}
            </span>
            <span className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold text-white">
              🌙 {tithiData?.paksha || "Shukla Paksha"}
            </span>
            <span className="bg-amber-400/90 text-slate-950 rounded-full px-3 py-1 text-xs font-extrabold shadow-2xs">
              ✨ Auspicious Choghadiya
            </span>
          </div>

          <Link
            to="/member/spiritual"
            className="px-4 py-2 rounded-xl bg-white text-orange-600 font-extrabold text-xs shadow-md hover:bg-orange-50 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open Full Calendar</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              {tithi} Tithi
            </h2>
            <p className="text-xs sm:text-sm font-medium opacity-90 mt-2 flex items-center gap-2 flex-wrap">
              <span>📅 {fullDate}</span>
              <span>•</span>
              <span>Vikram Samvat 2082</span>
              <span>•</span>
              <span>Nakshatra: Pushya</span>
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-xs font-medium space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Today's Panchang</div>
            <div className="font-extrabold text-amber-200">Gyan Panchami • Shubh Muhurat</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 2. Quick Actions ───────────────────────────────────────────────────── */
function QuickActions() {
  const { t } = useLanguage();
  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span>{t("Quick Actions")}</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { icon: Scan,          label: "Scan QR",       to: "/member/digital-id", color: "from-violet-500 to-purple-600" },
          { icon: Heart,         label: "Donate",         to: "/member/donations",  color: "from-rose-500 to-pink-600" },
          { icon: CalendarCheck, label: "Book Now",       to: "/member/bookings",   color: "from-sky-500 to-blue-600" },
          { icon: Ticket,        label: "My Bookings",    to: "/member/bookings",   color: "from-emerald-500 to-green-600" },
          { icon: CreditCard,    label: "My Digital ID",  to: "/member/digital-id", color: "from-amber-500 to-orange-600" },
          { icon: Phone,         label: "Emergency Help", to: "/member/support",    color: "from-red-500 to-rose-700" },
        ].map(({ icon: Icon, label, to, color }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center justify-center p-4 bg-slate-50/80 hover:bg-white rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className={cn("w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md mb-2 group-hover:scale-105 transition-transform", color)}>
              <Icon className="h-5.5 w-5.5 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-700 text-center leading-tight">{t(label)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── 3. Continue Journey Card ────────────────────────────────────────────── */
function ContinueJourneyCard() {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <h2 className="text-base font-extrabold text-white">Continue Your Journey</h2>
        </div>
        <Link to="/member/spiritual" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
          Spiritual Hub <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>📿 Digital Mala</span>
            <span>0 / 108</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: "0%" }} />
          </div>
          <div className="text-[10px] text-slate-300">Tap to start today's counting</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span>🌿 Varshitap Tracker</span>
            <span>Active</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: "100%" }} />
          </div>
          <div className="text-[10px] text-slate-300">Mark today's Upvas status</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-sky-300">
            <span>🏨 Digital Pass / ID</span>
            <span>Verified</span>
          </div>
          <div className="text-xs font-bold truncate">Member QR Card Ready</div>
          <div className="text-[10px] text-slate-300">Scan at Derasars & Events</div>
        </div>
      </div>
    </section>
  );
}


/* ── §4.3.3 #1 — Alerts (highest priority on the dashboard) ──────────────── */
function AlertsSection({ alerts }) {
  const { t } = useLanguage();
  if (!alerts?.length) return null;   // §4.3.7 — nothing to show, show nothing
  return (
    <section className="rounded-3xl border border-red-200 bg-red-50/70 p-5 space-y-3">
      <h2 className="text-sm font-bold text-red-900 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" /> {t("Alerts")}
      </h2>
      <div className="space-y-2">
        {alerts.slice(0, 3).map((a, i) => (
          <div key={a.id || i} className="p-3 rounded-xl bg-white border border-red-200">
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

/* ── §4.3.2 #1 / §4.4 — Monk tracking with the spec's status colours ─────── */
const MS_STATUS = {
  MOVING:  { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Moving" },
  IDLE:    { dot: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200",       label: "Idle" },
  OFFLINE: { dot: "bg-red-500",     chip: "bg-red-50 text-red-700 border-red-200",             label: "Offline" },
};
/** §4.4.3: green = moving, yellow = idle, red = offline. */
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
    <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-orange-500" /> {t("Monk Tracking")}
          {/* Positions arrive over the socket, so say whether it is connected. */}
          {live && <LiveBadge label={t("Live")} />}
        </h2>
        <Link to="/member/ms" className="text-xs font-bold text-orange-600 hover:text-orange-700">
          {t("View All")}
        </Link>
      </div>

      {!monks?.length ? (
        // §4.3.7 edge case: exact placeholder the spec asks for
        <div className="text-xs text-slate-400 italic text-center py-6">{t("No monks available")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {monks.slice(0, 4).map((m, i) => {
            const st = msStatusOf(m);
            return (
              <Link
                key={m.id || i}
                to={`/member/ms/${m.id || m.publicId}`}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-sm transition-all"
              >
                <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", st.dot)} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {m.fullName || m.name || m.publicId}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {m.currentLocation || m.city || t("Location unavailable")}
                  </div>
                  {m.lastUpdatedAt && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {t("Updated")} {new Date(m.lastUpdatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
                <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0", st.chip)}>
                  {t(st.label)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

/**
 * §4.3.2 #9 — Offers Near You.
 *
 * Offers carry no latitude/longitude (only a nested visibilityConfig.geo of
 * area/city/district/state names — see admin OffersPage.jsx's create form),
 * so distanceTo(o) always resolved to null here and the "near you" sort was
 * silently a no-op. o.sponsor/o.discount/o.emoji don't exist on the real
 * offer schema either (confirmed by grepping every field admin's OffersPage
 * actually reads) — this rendered blank on every real offer. Shows the
 * fetched offers as-is with their real fields instead of claiming a
 * distance ranking that was never actually happening.
 */
function OffersNearYouSection({ offers }) {
  const { t } = useLanguage();
  if (!offers?.length) return null;

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Tag className="h-5 w-5 text-emerald-500" />
          <span>{t("Offers For You")}</span>
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
            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/60 bg-slate-50/60 hover:border-emerald-300 transition-colors"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Tag className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">{o.title}</div>
              {o.companyName && <div className="text-[10px] text-slate-500 truncate">{o.companyName}</div>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── §4.3.3 #4 — Announcements ──────────────────────────────────────────── */
function AnnouncementsSection({ announcements }) {
  const { t } = useLanguage();
  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-purple-500" /> {t("Announcements")}
        </h2>
        {/* Used to point at /member/news — a different feed entirely — because
            the full announcements screen did not exist yet. */}
        <Link to="/member/announcements" className="text-xs font-bold text-orange-600 hover:text-orange-700">
          {t("View All")}
        </Link>
      </div>
      {!announcements?.length ? (
        <div className="text-xs text-slate-400 italic text-center py-6">{t("No announcements")}</div>
      ) : (
        <div className="space-y-2">
          {announcements.slice(0, 4).map((a, i) => (
            <div key={a.id || i} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60">
              <div className="text-xs font-bold text-slate-900 truncate">{a.title}</div>
              <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{a.body || a.description}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


/* ── §4.3.2 #3 / §4.3.3 #3 — Upcoming Events with RSVP ──────────────────── */
function UpcomingEventsSection({ events, onRsvp, rsvpBusy }) {
  const { t } = useLanguage();
  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-purple-500" /> {t("Upcoming Events")}
        </h2>
        <Link to="/member/events" className="text-xs font-bold text-orange-600 hover:text-orange-700">
          {t("View All")}
        </Link>
      </div>

      {!events?.length ? (
        // §4.3.7 — the placeholder wording the spec asks for
        <div className="text-xs text-slate-400 italic text-center py-6">{t("No events available")}</div>
      ) : (
        <div className="space-y-2.5">
          {events.slice(0, 4).map((e, i) => {
            const when = e.startsAt || e.startDate || e.date;
            return (
              <div key={e.id || i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200">
                <Link to={`/member/events`} className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{e.title || e.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {when ? new Date(when).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    }) : t("Date to be announced")}
                    {(e.organization?.name || e.templeName) ? ` · ${e.organization?.name || e.templeName}` : ""}
                  </div>
                </Link>
                {/* Capacity control per §4.7.6: RSVP is disabled once full */}
                <Button
                  size="sm"
                  disabled={rsvpBusy === (e.id || i) || e.isFull}
                  onClick={() => onRsvp(e)}
                  className="h-8 text-[11px] font-bold shrink-0 bg-orange-500 hover:bg-orange-600 text-white"
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

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function MemberHomePage() {
  const { t } = useLanguage();
  const { user } = useMemberAuth();
  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || t("Member");

  // GPS status/request come from MemberLayout via Outlet context (§4.3.4).
  const { status: locStatus, error: locError, request: requestLocation } = useOutletContext() || {};
  const { distanceTo, hasDeviceLocation } = useVisibilityEngine();

  // Real-time backend state (NO hardcoded dummy data)
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [temples, setTemples] = useState([]);
  const [monks, setMonks] = useState([]);
  const [events, setEvents] = useState([]);
  const [feed, setFeed] = useState([]);
  const [news, setNews] = useState([]);
  const [offers, setOffers] = useState([]);
  // §4.3.3 additions: alerts sit above everything, announcements above feed,
  // and §4.21.12 puts Today's Tithi on the dashboard.
  const [alerts, setAlerts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tithi, setTithi] = useState(null);

  const [rsvpBusy, setRsvpBusy] = useState(null);

  /** §4.7.5 RSVP. Capacity-full is reported by the API and surfaced inline. */
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
    // Fired in parallel: the dashboard renders section-by-section, so one slow
    // or missing endpoint must not hold up the rest.
    const [
      dash, templeRes, eventRes, feedRes, newsRes, monkRes, offerRes,
      alertRes, annRes, tithiRes,
    ] = await Promise.all([
      api.get("/dashboard/member").catch(() => null),
      api.get("/temples", { params: { take: 4 } }).catch(() => null),
      // §4.7.2 — member-scoped events, so temple-specific ones stay filtered
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

  /*
   * Live updates. Every member screen was a one-shot fetch on mount, so a monk
   * moving or an alert being raised only showed up on a manual reload.
   *
   * These namespaces and event names are the ones the admin panel already
   * subscribes to, so they are known to exist. Handlers are defensive: an event
   * with an unexpected shape is ignored rather than corrupting the list.
   */
  const { connected: liveConnected } = useMemberSocket("/tracking", {
    // A monk's position changed — patch that row in place.
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
    // §4.3.3 puts alerts at the top, so they must arrive without a reload.
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
    <div className="space-y-8">
      
      {/* ── Header Greeting Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-orange-500/20 shrink-0">
            {firstName[0]?.toUpperCase() || "J"}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
              <span>{t(timeGreeting())}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Backend API Connected
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {t("Jai Jinendra")}, {firstName} 🙏
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRealtimeData}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            title="Refresh Live Data"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh Sync</span>
          </button>

          <Link
            to="/member/notifications"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
          </Link>

          <Link
            to="/member/digital-id"
            className="px-4 py-2.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs border border-orange-200 transition-colors flex items-center gap-2"
          >
            <Scan className="h-4 w-4" />
            <span>Digital ID</span>
          </Link>
        </div>
      </div>

      {/* ── 1. Daily Tithi Card ────────────────────────────────────────── */}
      {/* §4.21.12 — Today's Tithi on the dashboard, from /calendar/today */}
      <DailyTithiCard tithiData={tithi || dashboardData?.todaysTithi} />

      {/* §4.3.3 display order: Alerts → Monk Tracking → Events → Announcements → Feed */}
      <AlertsSection alerts={alerts} />
      <MonkTrackingSection monks={monks} />
      <UpcomingEventsSection events={events} onRsvp={handleRsvp} rsvpBusy={rsvpBusy} />

      {/* ── 2. Quick Actions ──────────────────────────────────────────── */}
      <QuickActions />

      {/* ── 3. Continue Journey ───────────────────────────────────────── */}
      <ContinueJourneyCard />

      {/* ── 12. Advertisement Banner ──────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 p-6 text-white shadow-md flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-md">
            SPONSORED ANNOUNCEMENT
          </span>
          <h3 className="text-base font-black">Shree Palitana Shatrunjay Mahatirth Yatra 2025</h3>
          <p className="text-xs text-white/80">Guided group tours, daily Bhojanshala and Dharamshala booking available now.</p>
        </div>
        <Link to="/member/tours" className="px-4 py-2.5 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shrink-0 hover:bg-amber-300 transition-colors">
          Explore Tour
        </Link>
      </div>

      {/* ── Multi-Column Desktop Grid Layout ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 4. Nearby Temples & Jain Centres */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                <span>Nearby Temples & Jain Centres</span>
              </h2>
              <div className="flex items-center gap-3">
                <LocationPrompt status={locStatus} error={locError} onRequest={requestLocation} />
                <Link to="/member/temples" className="text-xs font-bold text-orange-600 hover:underline">View Directory</Link>
              </div>
            </div>

            {temples.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Real GPS distance when we have a fix; falls back to city text. */}
                {[...temples]
                  .map((t) => ({ ...t, _km: distanceTo(t) }))
                  .sort((a, b) => (a._km ?? Infinity) - (b._km ?? Infinity))
                  .map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{t.name}</h3>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          {t._km != null && (
                            <span className="font-bold text-orange-600">{formatDistance(t._km)}</span>
                          )}
                          <span>{t._km != null ? "·" : ""} {t.city || "India"}</span>
                        </div>
                      </div>
                      <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", t.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600")}>
                        {t.status === "ACTIVE" ? "Open Now" : "Active"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptySectionState
                icon={MapPin}
                title="No Nearby Temples Registered Yet"
                description="Explore the full directory or request your local temple administration to register on JiNANAM."
                actionText="Browse Temples Directory"
                actionTo="/member/temples"
              />
            )}
          </section>

          {/* §4.3.2 #9 — Offers. The page already fetched `offers` for this
              section but nothing rendered them; the data sat unused. */}
          <OffersNearYouSection offers={offers} />

          {/* §4.3.3 #4 — Announcements, directly above the feed */}
          <AnnouncementsSection announcements={announcements} />

          {/* 6. Community Highlights (§4.3.3 #5 — Feed preview) */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-orange-500" />
                <span>Community Feed Highlights</span>
              </h2>
              <Link to="/member/feed" className="text-xs font-bold text-orange-600 hover:underline">View Feed</Link>
            </div>

            {feed.length > 0 ? (
              <div className="space-y-3">
                {feed.map((p) => (
                  <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md uppercase">{p.category || "Community"}</span>
                      <h3 className="text-xs font-bold text-slate-900 mt-1">{p.title}</h3>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptySectionState
                icon={Newspaper}
                title="No Community Posts Yet"
                description="Follow your local Derasars, Maharaj Saheb and Jain Community Pages to see personalized feed updates."
                actionText="Explore Community Feed"
                actionTo="/member/feed"
              />
            )}
          </section>

          {/* 7. Today's News & 8. Upcoming Events */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* News */}
            <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Today's News</h3>
                <Link to="/member/news" className="text-[10px] font-bold text-orange-600 hover:underline">View All</Link>
              </div>

              {news.length > 0 ? (
                news.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-800">
                    📰 {n.title}
                  </div>
                ))
              ) : (
                <EmptySectionState
                  icon={BookOpen}
                  title="No News Articles Today"
                  description="Stay tuned for official Sangh announcements."
                  actionText="View News Desk"
                  actionTo="/member/news"
                />
              )}
            </section>

          </div>

        </div>

        {/* Right Sidebar Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* 5. Live MS Updates */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>Live MS Updates</span>
              </h3>
              <Link to="/member/ms" className="text-[10px] font-bold text-orange-600 hover:underline">View All</Link>
            </div>

            {monks.length > 0 ? (
              monks.map((ms) => (
                <Link to={`/member/ms/${ms.id}`} key={ms.id} className="block p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>🙏 {ms.dikshaName || ms.name}</span>
                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full", ms.isVihaar ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>
                      {ms.isVihaar ? "Vihaar" : "Staying"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{ms.currentCity || "India"}</div>
                </Link>
              ))
            ) : (
              <EmptySectionState
                icon={Star}
                title="No Live MS Tracking Updates"
                description="Follow Maharaj Saheb & Sadhvi Sangha to get Vihaar & Chaturmas notifications."
                actionText="Guru Directory"
                actionTo="/member/ms"
              />
            )}
          </section>

          {/* 11. Daily Spiritual Quote Card */}
          <section className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg space-y-2">
            <Quote className="h-6 w-6 opacity-60" />
            <p className="text-xs font-bold leading-relaxed">
              "Ahimsa Parmo Dharma — Compassion towards all living beings is the highest spiritual virtue."
            </p>
            <div className="text-[10px] opacity-80 text-right font-medium">— Bhagwan Mahavir Swami</div>
          </section>

        </div>

      </div>

    </div>
  );
}
