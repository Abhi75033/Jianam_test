import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, PartyPopper, HeartHandshake, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

// Mobile bottom navigation matching Vihaar app style.
// Shown only on small screens (< md).
const ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/members", label: "Members", icon: Users },
  { to: "/events", label: "Events", icon: PartyPopper },
  { to: "/donations", label: "Donations", icon: HeartHandshake },
  { to: "/settings", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border h-16 grid grid-cols-5"
      data-testid="mobile-bottom-nav"
    >
      {ITEMS.map((it) => {
        const active =
          it.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(it.to);
        const Icon = it.icon;
        return (
          <button
            key={it.to}
            onClick={() => navigate(it.to)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
            data-testid={`mobile-nav-${it.label.toLowerCase()}`}
          >
            <Icon className={cn("h-5 w-5", active && "text-primary")} />
            <span className="text-[10px] font-medium">{t(it.label)}</span>
            {active && (
              <span className="absolute top-0 h-1 w-8 rounded-b-md bg-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
