import { NavLink, useLocation } from "react-router-dom";
import { Home, Newspaper, Gift, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * MemberBottomNav — The 5 primary mobile destinations with modern haptic-feel navigation:
 * Home · Feed · Offers · Explore · Profile
 */
const TABS = [
  { to: "/member/home",    label: "Home",    icon: Home,      match: ["/member/home"] },
  { to: "/member/feed",    label: "Feed",    icon: Newspaper, match: ["/member/feed", "/member/news"] },
  { to: "/member/offers",  label: "Offers",  icon: Gift,      match: ["/member/offers"] },
  {
    to: "/member/explore",
    label: "Explore",
    icon: Compass,
    match: [
      "/member/explore", "/member/temples", "/member/ms", "/member/tours",
      "/member/events", "/member/spiritual", "/member/volunteers", "/member/announcements",
      "/member/community-pages",
    ],
  },
  {
    to: "/member/profile",
    label: "Profile",
    icon: User,
    match: [
      "/member/profile", "/member/digital-id", "/member/wallet",
      "/member/bookings", "/member/donations", "/member/tickets",
      "/member/notifications", "/member/support", "/member/visits", "/member/following",
    ],
  },
];

export default function MemberBottomNav() {
  const { t } = useLanguage();
  const { pathname } = useLocation();

  const activeTab = TABS.find((tab) =>
    tab.match.some((m) => pathname === m || pathname.startsWith(`${m}/`))
  );

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 inset-x-0 z-50",
        "bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-lg shadow-slate-900/10",
        "pb-[env(safe-area-inset-bottom)]"
      )}
      aria-label={t("Primary Navigation")}
      data-testid="member-bottom-nav"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {TABS.map((tab) => {
          const isActive = activeTab?.to === tab.to;
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center py-1.5 px-1 tap-scale select-none rounded-xl transition-all duration-200",
                isActive ? "text-orange-600 font-bold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              {/* Active Background Glow Pill */}
              {isActive && (
                <span className="absolute inset-x-2.5 inset-y-1 bg-orange-500/10 rounded-2xl -z-10 animate-fade-up" />
              )}

              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive ? "scale-110 text-orange-600 stroke-[2.4]" : "stroke-[1.8]"
                  )}
                  aria-hidden="true"
                />
              </div>

              <span className={cn("text-[10px] mt-1 tracking-tight leading-none truncate max-w-full", isActive ? "font-extrabold text-orange-600" : "font-medium")}>
                {t(tab.label)}
              </span>

              {/* Active indicator dot */}
              <span
                className={cn(
                  "w-1 h-1 rounded-full bg-orange-600 mt-1 transition-all duration-200",
                  isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                )}
                aria-hidden="true"
              />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
