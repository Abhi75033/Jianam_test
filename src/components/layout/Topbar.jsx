import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { Search, Bell, LogOut, User as UserIcon, Menu, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { initials } from "@/lib/utils";
import { ROLE_LABELS } from "@/constants/modules";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export default function Topbar({ onToggleSidebar }) {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeAdmins, setActiveAdmins] = useState(1);
  const [templeSearch, setTempleSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const { socket, connected } = useSocket(
    "/dashboards",
    {
      "admins:active-count": (evt) => {
        if (evt && typeof evt.count === "number") {
          setActiveAdmins(evt.count);
        }
      },
    },
    { enabled: isSuperAdmin }
  );

  useEffect(() => {
    if (connected && socket && isSuperAdmin) {
      socket.emit("subscribe:platform");
    }
  }, [connected, socket, isSuperAdmin]);

  useEffect(() => {
    if (!templeSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      api.get(`/temples?q=${templeSearch}`)
        .then((res) => {
          const list = res.data?.data?.items || res.data?.data || [];
          setSearchResults(list);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [templeSearch]);

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.mobile ||
    "Admin";

  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 h-16 md:h-20 bg-white border-b border-border flex items-center px-3 md:px-6 gap-2 md:gap-3">
      {/* Hamburger + Admin Name — Attendo-style left group */}
      <button
        className="flex items-center gap-2.5 shrink-0 group hover:opacity-80 transition-opacity"
        onClick={onToggleSidebar}
        data-testid="topbar-menu-button"
        aria-label={t("Toggle sidebar")}
      >
        <div className="h-9 w-9 rounded-lg border border-border flex items-center justify-center bg-white group-hover:bg-slate-50 transition-colors">
          <Menu className="h-4.5 w-4.5 text-slate-700" style={{ width: 18, height: 18 }} />
        </div>
        <span className="hidden sm:block text-sm font-bold text-slate-800 tracking-tight">{name}</span>
      </button>

      {/* Divider */}
      <div className="hidden sm:block h-7 w-px bg-slate-200 mx-1 shrink-0" />

      {/* Global search bar for active temples — with area/city/state filters */}
      <div className="relative flex-1 max-w-2xl hidden md:flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <Input
            value={templeSearch}
            onChange={(e) => {
              setTempleSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder={t("topbar.searchTemples", "Search temples by name…")}
            className="pl-8 pr-3 text-xs h-9 bg-slate-50 border-slate-200 rounded-lg w-full focus:bg-white transition-all focus:border-primary/40 focus:ring-0"
          />

          {showResults && searchResults.length > 0 && (
            <div className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto p-1 space-y-0.5">
              {searchResults.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    navigate(`/temples/${t.id}`);
                    setTempleSearch("");
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-md font-medium text-slate-700 flex items-start gap-2.5 group"
                >
                  <span className="w-5 h-5 rounded bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">T</span>
                  <span className="flex-1 min-w-0">
                    <span className="font-bold block truncate">{t.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {[t.area, t.city, t.state].filter(Boolean).join(", ") || "India"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter pills */}
        <TempleFilterBar onFilter={(filters) => {
          const params = new URLSearchParams(filters).toString();
          navigate(`/temples?${params}`);
        }} />
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-auto shrink-0">
        {/* Active users chip - hidden on mobile */}
        {isSuperAdmin && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-foreground">{activeAdmins} {t("Active Admin")}{activeAdmins > 1 ? 's' : ''}</span>
          </div>
        )}

        <LanguageSwitcher />

        <button
          className="relative h-9 w-9 md:h-10 md:w-10 rounded-full border border-border bg-white flex items-center justify-center hover:bg-secondary/60 transition-colors"
          onClick={() => navigate("/notifications")}
          data-testid="topbar-notifications-button"
        >
          <Bell className="h-4 w-4 text-foreground" />
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-semibold flex items-center justify-center">
            12
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 pl-1 pr-2 md:pr-3 py-1 rounded-full border border-border bg-white hover:bg-secondary/60 transition-colors"
              data-testid="topbar-user-menu"
            >
              <Avatar className="h-7 w-7 md:h-8 md:w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {ROLE_LABELS[user?.primaryRoleKey] || "Member"}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{user?.mobile}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              data-testid="topbar-menu-settings"
            >
              <UserIcon className="h-4 w-4 mr-2" /> {t("Profile & Settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              data-testid="topbar-menu-logout"
            >
              <LogOut className="h-4 w-4 mr-2" /> {t("Logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// ─── Temple filter bar ──────────────────────────────────────────────────────
const FILTER_AREAS  = ["All Areas", "Palitana", "Girnar", "Shatrunjaya", "Pawapuri", "Rajgir"];
const FILTER_CITIES = ["All Cities", "Ahmedabad", "Mumbai", "Surat", "Rajkot", "Vadodara", "Pune", "Delhi"];
const FILTER_STATES = ["All States", "Gujarat", "Maharashtra", "Rajasthan", "Karnataka", "Tamil Nadu", "Uttar Pradesh"];

function TempleFilterBar({ onFilter }) {
  const { t } = useLanguage();
  const [area,  setArea]  = useState("");
  const [city,  setCity]  = useState("");
  const [state, setState] = useState("");

  const handleChange = (key, value) => {
    const next = { area, city, state, [key]: value };
    if (key === "area")  setArea(value);
    if (key === "city")  setCity(value);
    if (key === "state") setState(value);

    const params = {};
    if (next.area  && next.area  !== "All Areas")   params.area  = next.area;
    if (next.city  && next.city  !== "All Cities")  params.city  = next.city;
    if (next.state && next.state !== "All States")  params.state = next.state;
    onFilter(params);
  };

  const selectCls =
    "h-9 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600 px-2 pr-7 appearance-none cursor-pointer hover:bg-white focus:outline-none focus:border-primary/40 transition-colors font-medium";

  const getFilterLabel = (val) => {
    if (val === "All Areas") return t("topbar.allAreas", "All Areas");
    if (val === "All Cities") return t("topbar.allCities", "All Cities");
    if (val === "All States") return t("topbar.allStates", "All States");
    return val;
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="relative">
        <select
          id="topbar-filter-area"
          value={area}
          onChange={(e) => handleChange("area", e.target.value)}
          className={selectCls}
        >
          {FILTER_AREAS.map((a) => <option key={a} value={a === "All Areas" ? "" : a}>{getFilterLabel(a)}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
      </div>

      <div className="relative">
        <select
          id="topbar-filter-city"
          value={city}
          onChange={(e) => handleChange("city", e.target.value)}
          className={selectCls}
        >
          {FILTER_CITIES.map((c) => <option key={c} value={c === "All Cities" ? "" : c}>{getFilterLabel(c)}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
      </div>

      <div className="relative">
        <select
          id="topbar-filter-state"
          value={state}
          onChange={(e) => handleChange("state", e.target.value)}
          className={selectCls}
        >
          {FILTER_STATES.map((s) => <option key={s} value={s === "All States" ? "" : s}>{getFilterLabel(s)}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
      </div>
    </div>
  );
}
