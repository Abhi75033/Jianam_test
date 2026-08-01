import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Landmark, Hotel, Building2, Users, UsersRound, Phone, BellRing, Image as ImageIcon,
  Star, Flag, CalendarDays, ChevronRight, Sparkles, ShieldCheck, ArrowUpRight,
  HandHeart, PartyPopper, Newspaper, Route as RouteIcon, ScanLine, Briefcase,
  HeartHandshake, CalendarCheck, Megaphone, Tag, BarChart3, Bell, MapPin,
  HandshakeIcon, Sigma, Globe, LifeBuoy, BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { moduleLabel } from "@/lib/access";
import { STATIC_URL } from "@/lib/api";

/* ─── Module presentation ──────────────────────────────────────────────────────
 * Each grantable tab gets an icon, a tone and where "Open" goes. Only tabs the
 * account actually holds are ever rendered, so this table is a lookup, not a
 * list of what to show.
 * -------------------------------------------------------------------------- */
const MODULE_UI = {
  TEMPLES:        { icon: Landmark,      tone: "orange", route: "/admin/temples" },
  DHARAMSHALAS:   { icon: Hotel,         tone: "teal",   route: "/admin/dharamshalas" },
  JAIN_CENTERS:   { icon: Building2,     tone: "purple", route: "/admin/jain-centers" },
  STHANAKS:       { icon: Building2,     tone: "blue",   route: "/admin/stanaks" },
  COMMUNITY_PAGES:{ icon: Globe,         tone: "pink",   route: "/admin/community-pages" },
  MEMBERS:        { icon: Users,         tone: "blue",   route: "/admin/members" },
  MONKS:          { icon: HandHeart,     tone: "orange", route: "/admin/monks" },
  STAFF:          { icon: Briefcase,     tone: "teal",   route: "/admin/staff" },
  VOLUNTEERS:     { icon: HandshakeIcon, tone: "green",  route: "/admin/volunteers" },
  BOOKINGS:       { icon: CalendarCheck, tone: "green",  route: "/admin/bookings" },
  DONATIONS:      { icon: HeartHandshake,tone: "orange", route: "/admin/donations" },
  EVENTS:         { icon: PartyPopper,   tone: "purple", route: "/admin/events" },
  TOURS:          { icon: RouteIcon,     tone: "orange", route: "/admin/tours" },
  FEED:           { icon: Newspaper,     tone: "blue",   route: "/admin/feed" },
  NEWS:           { icon: Newspaper,     tone: "orange", route: "/admin/news" },
  ANNOUNCEMENTS:  { icon: Megaphone,     tone: "red",    route: "/admin/announcements" },
  GALLERY:        { icon: ImageIcon,     tone: "pink",   route: "/admin/gallery" },
  VISITORS:       { icon: ScanLine,      tone: "blue",   route: "/admin/visitors" },
  TRACKING:       { icon: MapPin,        tone: "blue",   route: "/admin/tracking" },
  OFFERS:         { icon: Tag,           tone: "green",  route: "/admin/offers" },
  SPONSORS:       { icon: Megaphone,     tone: "purple", route: "/admin/ads" },
  POLLS:          { icon: BarChart3,     tone: "teal",   route: "/admin/polls" },
  COUNTERS:       { icon: Sigma,         tone: "orange", route: "/admin/counters" },
  CALENDAR:       { icon: CalendarDays,  tone: "purple", route: "/admin/calendar" },
  NOTIFICATIONS:  { icon: Bell,          tone: "purple", route: "/admin/notifications" },
  COMMUNICATION:  { icon: BookOpen,      tone: "blue",   route: "/admin/communication" },
  REPORTS:        { icon: BarChart3,     tone: "green",  route: "/admin/reports" },
  SUPPORT:        { icon: LifeBuoy,      tone: "orange", route: "/admin/support-tickets" },
  SETTINGS:       { icon: ShieldCheck,   tone: "orange", route: "/admin/settings" },
};

const len = (v) => (Array.isArray(v) ? v.length : 0);

/**
 * The record-level facts a scoped admin actually cares about, read straight off
 * the organisation payload they already manage.
 */
function orgFacts(org) {
  return [
    { key: "trustees", label: "Trustees",  value: len(org?.trustees),     icon: UsersRound, tone: "purple" },
    { key: "contacts", label: "Contacts",  value: len(org?.contacts),     icon: Phone,      tone: "blue" },
    { key: "notices",  label: "Notices",   value: len(org?.notices),      icon: BellRing,   tone: "red" },
    { key: "gallery",  label: "Photos",    value: len(org?.gallery),      icon: ImageIcon,  tone: "pink" },
    { key: "reviews",  label: "Reviews",   value: len(org?.reviews),      icon: Star,       tone: "orange" },
    { key: "dhaja",    label: "Dhaja",     value: len(org?.dhajaRecords), icon: Flag,       tone: "green" },
    { key: "chaturmas",label: "Chaturmas", value: len(org?.chaturmasStays), icon: CalendarDays, tone: "teal" },
  ];
}

/**
 * How complete this organisation's public profile is. Gives a scoped admin a
 * concrete next action instead of a wall of zeroes.
 */
function completeness(org) {
  const checks = [
    { label: "Basic information", done: Boolean(org?.name && org?.city) },
    { label: "Logo uploaded",     done: Boolean(org?.logoUrl) },
    { label: "Contact added",     done: len(org?.contacts) > 0 },
    { label: "Trustee added",     done: len(org?.trustees) > 0 },
    { label: "Photos uploaded",   done: len(org?.gallery) > 0 },
    { label: "Timings set",       done: Boolean(org?.morningTiming || org?.timings) },
  ];
  const done = checks.filter((c) => c.done).length;
  return { checks, done, total: checks.length, pct: Math.round((done / checks.length) * 100) };
}

function FactTile({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-white hover:shadow-sm transition-shadow">
      <div className={`icon-chip ${tone} h-9 w-9 shrink-0`}>
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <div className="font-heading text-xl font-bold text-foreground leading-none font-mono-num">{value}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{label}</div>
      </div>
    </div>
  );
}

/**
 * PersonalizedDashboard — what a delegated admin sees on landing.
 *
 * Built entirely from two things the account already has: the tabs granted to
 * it, and the organisations assigned to it. Nothing here renders for a tab the
 * admin doesn't hold, so a Temple-only admin gets a full temple workspace
 * rather than a page of empty operational panels.
 */
export default function PersonalizedDashboard({ orgs = [], loading = false }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, allowedModules, canDo, hasNoOrgScope } = useAuth();

  const primary = orgs[0] || null;
  const facts = useMemo(() => orgFacts(primary), [primary]);
  const profile = useMemo(() => completeness(primary), [primary]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t("Good morning");
    if (h < 17) return t("Good afternoon");
    return t("Good evening");
  })();

  const tabs = allowedModules
    .filter((m) => MODULE_UI[m])
    .map((m) => ({ key: m, ...MODULE_UI[m], label: moduleLabel(m) }));

  const recentNotices = (primary?.notices || []).slice(0, 3);
  const recentReviews = (primary?.reviews || []).slice(0, 3);

  return (
    <div className="space-y-4 md:space-y-6" data-testid="personalized-dashboard">

      {/* ── Hero: who you are, what you run ─────────────────────────────── */}
      <Card className="relative overflow-hidden rounded-2xl border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 opacity-95" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/20 border-2 border-white/40 backdrop-blur-sm flex items-center justify-center shrink-0 overflow-hidden">
            {primary?.logoUrl ? (
              <img
                src={primary.logoUrl.startsWith("http") ? primary.logoUrl : `${STATIC_URL}/${primary.logoUrl}`}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <Landmark className="h-8 w-8 md:h-10 md:w-10 text-white" strokeWidth={2} />
            )}
          </div>

          <div className="min-w-0 flex-1 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
              {greeting}, {user?.firstName || t("Admin")} · {t("Jai Jinendra")}
            </div>
            <h1 className="font-heading text-xl md:text-3xl font-bold tracking-tight truncate mt-0.5">
              {primary?.name || t("Your Workspace")}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {primary?.publicId && (
                <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-mono font-bold hover:bg-white/25">
                  {primary.publicId}
                </Badge>
              )}
              {(primary?.city || primary?.state) && (
                <span className="text-[11px] text-white/90 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {[primary.city, primary.state].filter(Boolean).join(", ")}
                </span>
              )}
              <span className="text-[11px] text-white/90 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> {allowedModules.length} {t("tab(s) granted")}
              </span>
            </div>
          </div>

          {primary && (
            <Button
              onClick={() => navigate(orgs[0]._route)}
              className="bg-white text-slate-800 hover:bg-white/90 font-bold shrink-0"
            >
              {canDo(primary._module, "EDIT") ? t("Manage") : t("View")}
              <ArrowUpRight className="h-4 w-4 ml-1.5" />
            </Button>
          )}
        </div>
      </Card>

      {hasNoOrgScope && (
        <Card className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3">
          <Landmark className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <div className="font-bold">{t("No organisation assigned to your account")}</div>
            <div className="mt-0.5">
              {t("Ask your Super Admin to map you to a temple, Jain centre or dharamshala.")}
            </div>
          </div>
        </Card>
      )}

      {/* ── Record facts for the organisation you manage ─────────────────── */}
      {primary && (
        <div>
          <h2 className="font-heading text-sm font-bold text-foreground mb-2.5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-500" />
            {t("At a glance")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            {facts.map((f) => (
              <FactTile key={f.key} {...f} label={t(f.label)} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Your tabs, as a workspace ──────────────────────────────────── */}
        <Card className="p-5 rounded-xl border-border bg-white lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-semibold text-foreground">
              {t("My Workspace")}
            </h2>
            <span className="text-[11px] text-muted-foreground font-medium">
              {tabs.length} {t("tab(s)")}
            </span>
          </div>

          {tabs.length === 0 ? (
            <div className="text-xs text-muted-foreground italic text-center py-8">
              {t("No tabs have been granted to your account yet.")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => navigate(tab.route)}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-white hover:border-orange-300 hover:shadow-sm transition-all text-left"
                >
                  <div className={`icon-chip ${tab.tone} h-10 w-10 shrink-0`}>
                    <tab.icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-foreground truncate">{t(tab.label)}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex flex-wrap gap-1">
                      {canDo(tab.key, "CREATE") && <span className="text-emerald-600 font-semibold">{t("Add")}</span>}
                      {canDo(tab.key, "EDIT") && <span className="text-blue-600 font-semibold">{t("Edit")}</span>}
                      {!canDo(tab.key, "DELETE") && <span className="text-slate-400">{t("No delete")}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* ── Profile completeness: a concrete next action ────────────────── */}
        {primary && (
          <Card className="p-5 rounded-xl border-border bg-white">
            <h2 className="font-heading text-base font-semibold text-foreground mb-1">
              {t("Profile Completeness")}
            </h2>
            <p className="text-[11px] text-muted-foreground mb-4">
              {t("A complete profile ranks higher for devotees.")}
            </p>

            <div className="flex items-end gap-2 mb-2">
              <span className="font-heading text-3xl font-bold text-foreground font-mono-num leading-none">
                {profile.pct}%
              </span>
              <span className="text-[11px] text-muted-foreground mb-0.5">
                {profile.done}/{profile.total} {t("done")}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all"
                style={{ width: `${profile.pct}%` }}
              />
            </div>

            <div className="space-y-1.5">
              {profile.checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-[11px]">
                  <span
                    className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      c.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {c.done ? "✓" : "—"}
                  </span>
                  <span className={c.done ? "text-muted-foreground line-through" : "text-foreground font-medium"}>
                    {t(c.label)}
                  </span>
                </div>
              ))}
            </div>

            {profile.pct < 100 && canDo(primary._module, "EDIT") && (
              <Button
                variant="outline"
                className="w-full mt-4 h-9 text-xs font-bold"
                onClick={() => navigate(orgs[0]._route)}
              >
                {t("Complete profile")}
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* ── Recent activity on the record you manage ─────────────────────── */}
      {primary && (recentNotices.length > 0 || recentReviews.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recentNotices.length > 0 && (
            <Card className="p-5 rounded-xl border-border bg-white">
              <h2 className="font-heading text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <BellRing className="h-4 w-4 text-red-500" /> {t("Latest Notices")}
              </h2>
              <div className="space-y-2.5">
                {recentNotices.map((n, i) => (
                  <div key={n.id || i} className="p-2.5 rounded-lg border border-border bg-slate-50/60">
                    <div className="text-xs font-bold text-foreground truncate">{n.title}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {recentReviews.length > 0 && (
            <Card className="p-5 rounded-xl border-border bg-white">
              <h2 className="font-heading text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-500" /> {t("Recent Reviews")}
              </h2>
              <div className="space-y-2.5">
                {recentReviews.map((r, i) => (
                  <div key={r.id || i} className="p-2.5 rounded-lg border border-border bg-slate-50/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground truncate">
                        {r.member?.fullName || r.authorName || t("Devotee")}
                      </span>
                      {r.rating != null && (
                        <span className="text-[10px] text-orange-600 font-bold">★ {r.rating}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{r.comment || r.text}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Additional assigned organisations beyond the primary one */}
      {orgs.length > 1 && (
        <Card className="p-5 rounded-xl border-border bg-white">
          <h2 className="font-heading text-base font-semibold text-foreground mb-3">
            {t("My Assigned Organisations")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orgs.map((o) => (
              <div key={`${o._module}-${o.id}`} className="p-3 rounded-xl border border-border bg-white flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{o._label}</div>
                  <div className="text-sm font-bold text-foreground truncate">{o.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {[o.city, o.state].filter(Boolean).join(", ") || o.publicId}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold shrink-0"
                  onClick={() => navigate(o._route)}>
                  {canDo(o._module, "EDIT") ? t("Manage") : t("View")}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {loading && orgs.length === 0 && !hasNoOrgScope && (
        <Card className="p-8 rounded-xl border-border bg-white text-center text-xs text-muted-foreground">
          {t("Loading your workspace…")}
        </Card>
      )}
    </div>
  );
}
