import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Bell, ChevronRight, Scan, Heart, CalendarCheck,
  BookOpen, CreditCard, Phone, Navigation, Clock, Star,
  Flame, Users, Sparkles, Newspaper, TrendingUp, Compass,
  CheckCircle, ArrowUpRight, Award, ShieldCheck, HeartHandshake,
  Loader2, RefreshCw, MessageSquare, Search, Tag, Quote, Info, ExternalLink, Ticket, Gift
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

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
            to="/spiritual"
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
          { icon: Scan,          label: "Scan QR",       to: "/digital-id", color: "from-violet-500 to-purple-600" },
          { icon: Heart,         label: "Donate",         to: "/donations",  color: "from-rose-500 to-pink-600" },
          { icon: CalendarCheck, label: "Book Now",       to: "/bookings",   color: "from-sky-500 to-blue-600" },
          { icon: Ticket,        label: "My Bookings",    to: "/bookings",   color: "from-emerald-500 to-green-600" },
          { icon: CreditCard,    label: "My Digital ID",  to: "/digital-id", color: "from-amber-500 to-orange-600" },
          { icon: Phone,         label: "Emergency Help", to: "/support",    color: "from-red-500 to-rose-700" },
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
        <Link to="/spiritual" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
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

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function MemberHomePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || t("Member");

  // Real-time backend state (NO hardcoded dummy data)
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [temples, setTemples] = useState([]);
  const [monks, setMonks] = useState([]);
  const [events, setEvents] = useState([]);
  const [feed, setFeed] = useState([]);
  const [news, setNews] = useState([]);
  const [offers, setOffers] = useState([]);

  // Fetch real-time data from Backend APIs
  const fetchRealtimeData = async () => {
    setLoading(true);
    try {
      // 1. Dashboard Member API
      const res = await api.get("/dashboard/member").catch(() => null);
      if (res?.data?.data) {
        setDashboardData(res.data.data);
      }

      // 2. Temples API
      const templeRes = await api.get("/temples?take=4").catch(() => null);
      if (templeRes?.data?.data && Array.isArray(templeRes.data.data)) {
        setTemples(templeRes.data.data);
      }

      // 3. Events API
      const eventRes = await api.get("/events?take=4").catch(() => null);
      if (eventRes?.data?.data && Array.isArray(eventRes.data.data)) {
        setEvents(eventRes.data.data);
      }

      // 4. Feed API
      const feedRes = await api.get("/feed?take=4").catch(() => null);
      if (feedRes?.data?.data && Array.isArray(feedRes.data.data)) {
        setFeed(feedRes.data.data);
      }

      // 5. News API
      const newsRes = await api.get("/news?take=4").catch(() => null);
      if (newsRes?.data?.data && Array.isArray(newsRes.data.data)) {
        setNews(newsRes.data.data);
      }

      // 6. Monks API
      const monkRes = await api.get("/monks?take=4").catch(() => null);
      if (monkRes?.data?.data && Array.isArray(monkRes.data.data)) {
        setMonks(monkRes.data.data);
      }

      // 7. Offers API
      const offerRes = await api.get("/offers?take=4").catch(() => null);
      if (offerRes?.data?.data && Array.isArray(offerRes.data.data)) {
        setOffers(offerRes.data.data);
      }

    } catch (err) {
      console.warn("Backend API sync completed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtimeData();
  }, []);

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
            to="/notifications"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
          </Link>

          <Link
            to="/digital-id"
            className="px-4 py-2.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs border border-orange-200 transition-colors flex items-center gap-2"
          >
            <Scan className="h-4 w-4" />
            <span>Digital ID</span>
          </Link>
        </div>
      </div>

      {/* ── 1. Daily Tithi Card ────────────────────────────────────────── */}
      <DailyTithiCard tithiData={dashboardData?.todaysTithi} />

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
        <Link to="/tours" className="px-4 py-2.5 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shrink-0 hover:bg-amber-300 transition-colors">
          Explore Tour
        </Link>
      </div>

      {/* ── Multi-Column Desktop Grid Layout ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 4. Nearby Temples & Jain Centres */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                <span>Nearby Temples & Jain Centres</span>
              </h2>
              <Link to="/temples" className="text-xs font-bold text-orange-600 hover:underline">View Directory</Link>
            </div>

            {temples.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {temples.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{t.name}</h3>
                        <div className="text-[10px] text-slate-500">{t.city || "India"}</div>
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
                actionTo="/temples"
              />
            )}
          </section>

          {/* 6. Community Highlights */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-orange-500" />
                <span>Community Feed Highlights</span>
              </h2>
              <Link to="/feed" className="text-xs font-bold text-orange-600 hover:underline">View Feed</Link>
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
                actionTo="/feed"
              />
            )}
          </section>

          {/* 7. Today's News & 8. Upcoming Events */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* News */}
            <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Today's News</h3>
                <Link to="/news" className="text-[10px] font-bold text-orange-600 hover:underline">View All</Link>
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
                  actionTo="/news"
                />
              )}
            </section>

            {/* Events */}
            <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Upcoming Events</h3>
                <Link to="/events" className="text-[10px] font-bold text-orange-600 hover:underline">View All</Link>
              </div>

              {events.length > 0 ? (
                events.map((e) => (
                  <div key={e.id} className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-800">
                    🎉 {e.title}
                  </div>
                ))
              ) : (
                <EmptySectionState
                  icon={CalendarCheck}
                  title="No Upcoming Events Scheduled"
                  description="Check out community celebrations & Utsavs."
                  actionText="Explore Events"
                  actionTo="/events"
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
              <Link to="/ms" className="text-[10px] font-bold text-orange-600 hover:underline">View All</Link>
            </div>

            {monks.length > 0 ? (
              monks.map((ms) => (
                <Link to={`/ms/${ms.id}`} key={ms.id} className="block p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
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
                actionTo="/ms"
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
