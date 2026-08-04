import { NavLink, useLocation } from "react-router-dom";
import { Home, Newspaper, Gift, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * MemberBottomNav — the five primary destinations from the spec:
 * Home · Feed · Offers · Explore · Profile.
 *
 * The panel previously had only a 25-link desktop sidebar, which is the wrong
 * shape for a mobile-first product: the five things a member actually does were
 * buried among twenty others. The sidebar remains on desktop, where there is
 * room for the full directory; on phones this is the primary navigation.
 *
 * Each tab owns a section of the app, so a tab stays lit for any route beneath
 * it — Explore is still current when you are three levels into a temple.
 */
const TABS = [
  { to: "/member/home",    label: "Home",    icon: Home,      match: ["/member/home"] },
  { to: "/member/feed",    label: "Feed",    icon: Newspaper, match: ["/member/feed", "/member/news"] },
  { to: "/member/offers",  label: "Offers",  icon: Gift,      match: ["/member/offers"] },
  {
    to: "/member/explore",
    label: "Explore",
    icon: Search,
    // Explore is the directory, so every browsable entity lives under it.
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
        "bg-white/95 backdrop-blur border-t border-slate-200",
        // Keeps the bar clear of the iOS home indicator.
        "pb-[env(safe-area-inset-bottom)]"
      )}
      aria-label={t("Primary")}
      data-testid="member-bottom-nav"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const isActive = activeTab?.to === tab.to;
          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 px-1",
                  "transition-colors focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset",
                  isActive ? "text-orange-600" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <tab.icon
                  className="h-5 w-5 shrink-0"
                  strokeWidth={isActive ? 2.4 : 1.9}
                  aria-hidden="true"
                />
                <span className={cn("text-[10px] leading-none", isActive ? "font-bold" : "font-medium")}>
                  {t(tab.label)}
                </span>
                {/* A lit tab needs to read at a glance, not only by colour. */}
                <span
                  className={cn(
                    "h-0.5 w-6 rounded-full transition-opacity",
                    isActive ? "bg-orange-500 opacity-100" : "opacity-0"
                  )}
                  aria-hidden="true"
                />
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
