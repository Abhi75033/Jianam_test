import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowRight, Sparkles, Landmark, HeartHandshake, Users, Route as RouteIcon,
  Bell, Calendar, ShieldCheck, Zap, Globe, BedDouble, HandHeart, ChevronRight,
  Rocket, Star, PhoneCall, Mail, MapPin,
} from "lucide-react";

/**
 * JiNANAM Public Landing Page — Vihaar-style navy #00004d + yellow #FFC107.
 * Route: `/welcome` (public, no auth required).
 */
export default function LandingPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white text-slate-900" data-testid="landing-page">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#00004d]/95 text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-[#FFC107] flex items-center justify-center shadow-md overflow-hidden p-1">
              <img src="/logo.png" alt={t("JiNANAM Logo")} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-brand text-xl leading-none tracking-tight">{t("JiNANAM")}</div>
              <div className="text-[10px] tracking-[0.28em] uppercase text-white/70 mt-0.5">{t("Admin Panel")}</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/80">
            <a href="#features" className="hover:text-[#FFC107] transition-colors" data-testid="nav-features">{t("Features")}</a>
            <a href="#modules" className="hover:text-[#FFC107] transition-colors" data-testid="nav-modules">{t("Modules")}</a>
            <a href="#realtime" className="hover:text-[#FFC107] transition-colors" data-testid="nav-realtime">{t("Real-time")}</a>
            <a href="#contact" className="hover:text-[#FFC107] transition-colors" data-testid="nav-contact">{t("Contact")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFC107] text-[#00004d] font-semibold text-sm hover:brightness-95 transition"
              data-testid="landing-cta-signin"
            >
              {t("Admin Sign In")} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#00004d] text-white">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 10%, rgba(255,193,7,0.35), transparent 40%), radial-gradient(circle at 80% 90%, rgba(255,193,7,0.25), transparent 40%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs tracking-wider uppercase mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[#FFC107]" />
              {t("Serving the Jain community since 2026")}
            </div>
            <h1 className="font-brand text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              {t("One platform.")}<br />
              <span className="text-[#FFC107]">{t("Every temple, monk & seva")}</span> {t("— beautifully organised.")}
            </h1>
            <p className="mt-6 text-white/80 text-base md:text-lg leading-relaxed max-w-2xl">
              {t("Bookings, donations, events, monk tracking, tour management, dharamshalas and 30+ more modules — real-time, role-scoped, and built for the way Jain organisations actually operate.")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => window.location.assign("/admin/login")}
                className="bg-[#FFC107] hover:bg-[#FFB300] text-[#00004d] font-semibold h-12 px-6 rounded-full"
                data-testid="landing-hero-primary"
              >
                {t("Open Admin Panel")} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <a
                href="#modules"
                className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-white/20 text-white hover:bg-white/10 transition"
                data-testid="landing-hero-secondary"
              >
                {t("Explore Modules")}
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { n: "38+", l: t("Modules") },
                { n: "83", l: t("Gacchas") },
                { n: "23", l: t("Tirthankaras") },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-mono-num font-bold text-3xl text-[#FFC107]">{s.n}</div>
                  <div className="text-xs uppercase tracking-widest text-white/60 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card visual */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#FFC107]/20 blur-3xl rounded-full" />
              <div className="relative bg-white text-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="bg-[#00004d] text-white p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] tracking-widest uppercase text-[#FFC107]">{t("Live Now")}</div>
                    <div className="text-sm font-semibold">{t("Palitana · Ahmedabad · Mumbai")}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs">{t("3 sockets")}</span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[
                    { label: t("Today's Visitors"), value: "1,250", tone: "text-emerald-600" },
                    { label: t("Donations"), value: "₹2.45L", tone: "text-orange-600" },
                    { label: t("Active Journeys"), value: "12", tone: "text-blue-600" },
                    { label: t("Room Occupancy"), value: "92%", tone: "text-purple-600" },
                  ].map((c) => (
                    <div key={c.label} className="border border-slate-200 rounded-lg p-3">
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">{t(c.label)}</div>
                      <div className={`font-heading font-bold text-2xl mt-1 font-mono-num ${c.tone}`}>{c.value}</div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 p-4">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">{t("Incoming Monks")}</div>
                  {[
                    { n: "Muni Shree Pranam Sagar", eta: "1:10 PM", tag: "Arrived" },
                    { n: "Muni Shree Suvir Sagar", eta: "3:45 PM", tag: "Moving" },
                  ].map((m) => (
                    <div key={m.n} className="flex items-center justify-between py-2">
                      <div className="text-sm truncate">{m.n}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500">ETA {m.eta}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.tag === "Arrived" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                          {m.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section id="features" className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center mb-14">
          <div className="text-xs tracking-[0.3em] uppercase text-[#00004d]/60 font-semibold">{t("Everything included")}</div>
          <h2 className="font-brand text-3xl md:text-5xl mt-3 tracking-tight text-[#00004d]">
            {t("One admin panel. Endless devotion.")}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Landmark, title: t("Temples & Dharamshalas"), desc: t("Manage profiles, galleries, trustees, notices, reviews, dhaja records and building→wing→room hierarchies."), tone: "bg-[#00004d]" },
            { icon: HeartHandshake, title: t("Donations & 80G"), desc: t("Manual and online flows with category splits, verify/reject workflow, and downloadable 80G PDFs."), tone: "bg-[#FFC107] text-[#00004d]" },
            { icon: Users, title: t("Members & Family"), desc: t("Jain/Non-Jain registration, family trees, bulk Excel import, QR identity cards."), tone: "bg-[#00004d]" },
            { icon: RouteIcon, title: t("Monk Tracking"), desc: t("GPS journeys, route planning, SOS/offline/low-battery alerts, real-time map — all live over Socket.IO."), tone: "bg-[#FFC107] text-[#00004d]" },
            { icon: Calendar, title: t("Events & Tickets"), desc: t("Free & paid events, seating layouts, QR ticket check-in, RSVP with waiting lists."), tone: "bg-[#00004d]" },
            { icon: BedDouble, title: t("Bookings"), desc: t("Room / hall / pooja bookings with approval, payment verification, and blackout dates."), tone: "bg-[#FFC107] text-[#00004d]" },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-slate-200 hover:border-[#00004d]/30 hover:shadow-md transition-all group" data-testid={`landing-feature-${f.title.replace(/[^a-z]/gi, "-").toLowerCase()}`}>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${f.tone} text-white mb-4 group-hover:scale-105 transition`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#00004d]">{f.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules grid */}
      <section id="modules" className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4">
              <div className="text-xs tracking-[0.3em] uppercase text-[#00004d]/60 font-semibold">{t("38+ Modules")}</div>
              <h2 className="font-brand text-3xl md:text-4xl mt-3 tracking-tight text-[#00004d] leading-tight">
                {t("Built for the full breadth of Jain organisation life.")}
              </h2>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                {t("Every module respects role-based permissions. Super Admins get everything; temple / dharamshala / jain-center admins see only their scope.")}
              </p>
              <a
                href="/admin/login"
                className="inline-flex items-center gap-1.5 mt-6 text-[#00004d] font-semibold hover:text-[#FFC107] transition"
                data-testid="landing-modules-cta"
              >
                {t("Sign in to explore")} <ChevronRight className="h-4 w-4" />
              </a>
            </div>
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  "Members","Family","Monks","Temples","Dharamshalas","Jain Centers","Staff","Visitors",
                  "Bookings","Donations","Events","Tickets","Seating","Tours","Feed","Offers",
                  "Ads","News","Community Pages","Polls","Calendar","Counters","Tracking","Devices",
                  "Alerts","Communication","Announcements","Gallery","Volunteers","Support","Notifications","Reports",
                  "Settings","Audit Logs","Master Data","Search",
                ].map((m) => (
                  <div key={m} className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:border-[#FFC107] hover:text-[#00004d] hover:shadow-sm transition-all cursor-default text-center">
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time strip */}
      <section id="realtime" className="bg-[#00004d] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-[#FFC107] font-semibold">{t("Real-time everywhere")}</div>
            <h2 className="font-brand text-3xl md:text-5xl mt-3 tracking-tight">
              {t("Live monk tracking. Live visitor counts. Live dashboards.")}
            </h2>
            <p className="mt-4 text-white/80 leading-relaxed">
              {t("Every meaningful screen listens to Socket.IO. When a monk moves, a visitor checks in, or a donation is verified — everyone with permission sees it within a heartbeat.")}
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: Zap, label: t("Sub-second updates") },
                { icon: ShieldCheck, label: t("RBAC-secured events") },
                { icon: Globe, label: t("3 socket namespaces") },
              ].map((r) => (
                <div key={r.label} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <r.icon className="h-5 w-5 text-[#FFC107] mb-2" />
                  <div className="text-xs">{t(r.label)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-[#FFC107]/10 blur-3xl rounded-full" />
            <div className="relative rounded-2xl border border-white/10 p-6 bg-white/[0.03]">
              <div className="text-[10px] uppercase tracking-widest text-[#FFC107] mb-3">{t("Socket.IO stream")}</div>
              <div className="space-y-2 font-mono text-[12px]">
                {[
                  { ev: "monk:location", data: "{ monkId: 'JFMS108', lat: 22.11, lng: 71.42 }" },
                  { ev: "visitor:in", data: "{ entryType: 'MEMBER', publicId: 'JFVE221' }" },
                  { ev: "booking:new", data: "{ publicId: 'JFBK112', amount: 3500 }" },
                  { ev: "alert:new", data: "{ type: 'OFFLINE', severity: 'WARNING' }" },
                  { ev: "donation:new", data: "{ publicId: 'JFDN088', amount: 21000 }" },
                ].map((e) => (
                  <div key={e.ev} className="flex items-start gap-3 py-1 border-b border-white/5 last:border-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFC107] mt-2 animate-pulse shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[#FFC107]">{e.ev}</div>
                      <div className="text-white/60 truncate">{e.data}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / partners */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { quote: "We moved off spreadsheets in a week. Bookings, receipts, and 80G — all clean.", who: "Trustee, Palitana Dharamshala" },
            { quote: "The monk tracking dashboard has changed how we plan yatras entirely.", who: "Sangh Coordinator, Ahmedabad" },
            { quote: "Every module respects our roles. Staff sees exactly what they should.", who: "Temple Admin, Mumbai" },
          ].map((t) => (
            <div key={t.who} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Star className="h-4 w-4 text-[#FFC107] mb-3" />
              <p className="text-sm text-slate-700 leading-relaxed">"{t.quote}"</p>
              <div className="mt-4 text-xs text-slate-500">— {t.who}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-gradient-to-br from-[#00004d] via-[#000066] to-[#00004d] text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <Rocket className="h-8 w-8 mx-auto text-[#FFC107] mb-4" />
          <h2 className="font-brand text-3xl md:text-5xl tracking-tight">{t("Ready to bring order to your seva?")}</h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            {t("Sign in with your admin credentials. The Super Admin demo account is pre-seeded in your backend — try it now.")}
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              onClick={() => window.location.assign("/admin/login")}
              className="bg-[#FFC107] hover:bg-[#FFB300] text-[#00004d] font-semibold h-12 px-8 rounded-full"
              data-testid="landing-footer-cta"
            >
              {t("Open Admin Panel")} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#00004d] text-white/80 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-md bg-[#FFC107] flex items-center justify-center overflow-hidden p-1">
                <img src="/logo.png" alt={t("JiNANAM Logo")} className="w-full h-full object-contain" />
              </div>
              <div className="font-brand text-xl text-white">{t("JiNANAM")}</div>
            </div>
            <p className="text-xs mt-4 leading-relaxed">
              {t("A unified admin panel for the modern Jain community — temples, dharamshalas, monks, and members, together at last.")}
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-[#FFC107] mb-3">{t("Platform")}</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-[#FFC107]">{t("Features")}</a></li>
              <li><a href="#modules" className="hover:text-[#FFC107]">{t("Modules")}</a></li>
              <li><a href="#realtime" className="hover:text-[#FFC107]">{t("Real-time")}</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-[#FFC107] mb-3">{t("Access")}</div>
            <ul className="space-y-2 text-sm">
              <li><a href="/admin/login" className="hover:text-[#FFC107]">{t("Admin Sign In")}</a></li>
              <li><a href="mailto:support@jinanam.example" className="hover:text-[#FFC107]">{t("Request Access")}</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-[#FFC107] mb-3">{t("Contact")}</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><PhoneCall className="h-3.5 w-3.5 text-[#FFC107]" /> +91 99999 00000</li>
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-[#FFC107]" /> support@jinanam.example</li>
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#FFC107]" /> {t("Ahmedabad, India")}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
          {t("© 2026 JiNANAM. Made with devotion.")} <span className="text-[#FFC107]">{t("Jai Jinendra")}</span>
        </div>
      </footer>
    </div>
  );
}
