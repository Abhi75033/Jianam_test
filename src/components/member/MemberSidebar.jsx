import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  Home, Newspaper, Gift, Search, User, ChevronRight,
  Sparkles, MapPin, Calendar, Flame, Bookmark, Heart,
  Building2, Users, BookOpen, Shield, Bell, HelpCircle,
  Settings, LogOut, Phone, CreditCard, Award, QrCode,
  Ticket, Wallet, Globe, Star, Compass
} from "lucide-react";

/**
 * MemberSidebar.jsx — Match Admin Panel Sidebar 100% Identically.
 * Uses exact dark navy theme (sidebar-navy / #06102E), golden-amber active fill pill (bg-amber-400 text-slate-950),
 * bullet points for sub-items, and exact typography.
 */
const MENU_GROUPS = [
  {
    id: "HOME",
    label: "HOME",
    icon: Home,
    route: "/member/home",
  },
  {
    id: "FEED",
    label: "FEED",
    icon: Newspaper,
    children: [
      { to: "/member/feed", label: "Community Feed" },
      { to: "/member/feed?filter=ms", label: "MS Updates" },
      { to: "/member/feed?filter=events", label: "Events & Notices" },
      { to: "/member/feed?filter=sponsored", label: "Sponsored Posts" },
    ],
  },
  {
    id: "OFFERS",
    label: "OFFERS",
    icon: Gift,
    children: [
      { to: "/member/offers", label: "Featured Offers" },
      { to: "/member/offers#categories", label: "Categories Grid" },
      { to: "/member/offers#saved", label: "Saved Offers" },
    ],
  },
  {
    id: "EXPLORE",
    label: "EXPLORE",
    icon: Search,
    children: [
      { to: "/member/explore", label: "Universal Directory" },
      { to: "/member/temples", label: "Temples & Derasars" },
      { to: "/member/explore?cat=jaincenter", label: "Jain Centres" },
      { to: "/member/ms", label: "Maharaj Saheb (MS)" },
      { to: "/member/explore?cat=dharamshala", label: "Dharamshalas" },
      { to: "/member/explore?cat=bhojanshala", label: "Bhojanshalas" },
      { to: "/member/news", label: "Today's News" },
      { to: "/member/events", label: "Events & Programs" },
      { to: "/member/tours", label: "Tours & Yatras" },
      { to: "/member/volunteers", label: "Volunteer Opportunities" },
      { to: "/member/announcements", label: "Announcements" },
      { to: "/member/community-pages", label: "Community Pages" },
      { to: "/member/spiritual", label: "Spiritual Tools" },
    ],
  },
  {
    id: "PROFILE",
    label: "PROFILE & ACCOUNT",
    icon: User,
    children: [
      { to: "/member/profile", label: "Personal Profile" },
      { to: "/member/digital-id", label: "Digital ID & QR" },
      { to: "/member/wallet", label: "My Digital Wallet" },
      { to: "/member/bookings", label: "My Bookings & Tickets" },
      { to: "/member/donations", label: "My Donations" },
      { to: "/member/visits", label: "My Temple Visits" },
      { to: "/member/following", label: "Following" },
      { to: "/member/notifications", label: "Notifications History" },
      { to: "/member/support", label: "Support & Help Desk" },
    ],
  },
];

function checkIsActive(to, location) {
  const currentPath = location.pathname;
  const currentSearch = location.search;
  const currentHash = location.hash;
  const fullCurrent = currentPath + currentSearch + currentHash;

  if (to.includes("?") || to.includes("#")) {
    return fullCurrent === to;
  }
  return currentPath === to && !currentSearch && !currentHash;
}

export default function MemberSidebar({ collapsed, onNavigate }) {
  const { t } = useLanguage();
  const { user, logout } = useMemberAuth();
  const location = useLocation();

  const [expandedState, setExpandedState] = useState({
    FEED: true,
    OFFERS: true,
    EXPLORE: true,
    PROFILE: true,
  });

  const toggleGroup = (id) => {
    setExpandedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={cn(
        "h-full bg-[#06102E] text-slate-200 flex flex-col justify-between border-r border-white/10 transition-all duration-300 select-none shadow-xl",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* ── Top Header / Brand Logo ───────────────────────────────────────── */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <Link to="/member/home" onClick={onNavigate} className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/20 shrink-0">
            J
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-black text-white text-base tracking-tight leading-tight block">
                Ji<span className="text-orange-500">NANAM</span>
              </span>
              <span className="text-[9px] font-bold text-blue-200/60 tracking-widest uppercase block -mt-0.5">
                CONNECTING JAIN LIFE
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Scrollable Navigation Items ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
        {MENU_GROUPS.map((group) => {
          const Icon = group.icon;
          const hasChildren = group.children && group.children.length > 0;
          const isExpanded = expandedState[group.id] !== false;

          // Single top-level item (e.g. HOME / Daily Dashboard)
          if (!hasChildren) {
            const active = checkIsActive(group.route, location);
            return (
              <div key={group.id} className="mb-1">
                <Link
                  to={group.route}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center rounded-lg text-sm transition-all duration-150 group relative",
                    collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5",
                    active
                      ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "text-blue-100/80 hover:text-white hover:bg-white/10"
                  )}
                  title={collapsed ? t(group.label) : undefined}
                >
                  <span
                    className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={active ? { backgroundColor: "#F59E0B", color: "#0F172A" } : { backgroundColor: "rgba(255,255,255,0.1)", color: "#FFFFFF" }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {!collapsed && (
                    <span className="truncate text-xs font-bold flex-1">{t(group.label)}</span>
                  )}
                </Link>
              </div>
            );
          }

          // Section Group with sub-items
          return (
            <div key={group.id} className="mb-2">
              {/* Group Toggle Header */}
              {!collapsed ? (
                <div
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none hover:bg-white/5 rounded-lg transition-all duration-150"
                >
                  <span className="h-5 w-5 rounded flex items-center justify-center shrink-0 text-amber-400">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200/70 flex-1">
                    {t(group.label)}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 text-blue-200/40 transition-transform duration-200",
                      isExpanded ? "rotate-90 text-amber-400" : ""
                    )}
                  />
                </div>
              ) : (
                <div className="h-px bg-white/10 mx-2 my-2" />
              )}

              {/* Sub-items List */}
              {(!collapsed && isExpanded) && (
                <ul className="mt-1 space-y-0.5">
                  {group.children.map(({ to, label }) => {
                    const active = checkIsActive(to, location);

                    return (
                      <li key={to + label} className="list-none">
                        <Link
                          to={to}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center rounded-lg text-xs font-semibold transition-all duration-150 group relative px-3 py-2 border border-transparent",
                            active
                              ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 border-amber-300"
                              : "text-blue-100/80 hover:text-white hover:bg-white/10"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full mr-2 ml-1 shrink-0 transition-colors",
                              active ? "bg-slate-950" : "bg-blue-100/40 group-hover:bg-amber-400"
                            )}
                          />
                          <span className="truncate flex-1">{t(label)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom User Profile Footer ────────────────────────────────────── */}
      <div className="p-3 border-t border-white/10 bg-[#040A1F] shrink-0">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-extrabold text-xs shrink-0">
                {user?.firstName?.[0]?.toUpperCase() || "J"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.firstName || user?.fullName || "Jain Member"}
                </div>
                <div className="text-[9px] text-blue-200/60 font-mono">
                  {user?.publicId || "Verified"}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title={t("Logout")}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            title={t("Logout")}
            className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
