import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu, Search, Bell, MessageSquare, Wallet, Globe, LogOut, User, QrCode,
  MapPin, Sparkles, X, ChevronRight, Compass, Building2, Flame, Heart
} from "lucide-react";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMemberLocation } from "@/hooks/useMemberLocation";

const QUICK_SEARCH_CHIPS = [
  { label: "Temples", icon: Building2, to: "/member/temples" },
  { label: "Maharaj Saheb", icon: Sparkles, to: "/member/ms" },
  { label: "Events & Programs", icon: Flame, to: "/member/events" },
  { label: "Today's Tithi", icon: Compass, to: "/member/spiritual" },
  { label: "Donations & Seva", icon: Heart, to: "/member/donations" },
];

export default function MemberTopbar({ onToggleSidebar }) {
  const { t } = useLanguage();
  const { user } = useMemberAuth();
  const navigate = useNavigate();
  const location = useMemberLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/member/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchModalOpen(false);
      setSearchQuery("");
    }
  };

  const handleChipClick = (to) => {
    setSearchModalOpen(false);
    navigate(to);
  };

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.fullName || t("Member");

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-xs transition-all">
        
        {/* ── Left: Hamburger Toggle + Search Bar ────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 sm:p-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:scale-95 transition-all shrink-0"
            title={t("Toggle Sidebar Menu")}
            aria-label={t("Toggle Sidebar")}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop/Tablet Direct Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search Temples, MS, Events, Offers, Dharamshalas…")}
              className="w-full pl-10 pr-12 py-2 text-xs font-medium rounded-full border border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold shadow-xs hover:opacity-95 transition-opacity"
            >
              {t("Search")}
            </button>
          </form>

          {/* Mobile Search Button that triggers instant overlay */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="md:hidden flex items-center gap-2 flex-1 min-w-0 px-3 py-2 rounded-full border border-slate-200/80 bg-slate-50/80 text-slate-400 text-xs font-medium"
          >
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">{t("Search JiNANAM…")}</span>
          </button>
        </div>

        {/* ── Right Action Controls ────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Location Chip (if GPS or City available) */}
          <button
            type="button"
            onClick={() => location.requestFix && location.requestFix()}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200/60 text-orange-700 text-xs font-semibold hover:bg-orange-100/70 transition-colors"
            title={location.coords ? t("GPS Location Active") : t("Click to detect GPS location")}
          >
            <MapPin className="h-3.5 w-3.5 text-orange-500" />
            <span className="truncate max-w-[100px]">
              {location.city || (location.coords ? t("Nearby") : t("Set Location"))}
            </span>
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notifications Bell */}
          <Link
            to="/member/notifications"
            className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50/80 active:scale-95 transition-all"
            title={t("Notifications")}
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white animate-pulse" />
          </Link>

          {/* Digital Wallet Shortcut */}
          <Link
            to="/member/wallet"
            className="p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50/80 active:scale-95 transition-all hidden sm:flex items-center gap-1.5"
            title={t("Digital Wallet")}
          >
            <Wallet className="h-4.5 w-4.5" />
          </Link>

          {/* Digital ID Quick Button */}
          <Link
            to="/member/digital-id"
            className="p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50/80 active:scale-95 transition-all hidden sm:flex items-center gap-1.5"
            title={t("Digital ID")}
          >
            <QrCode className="h-4.5 w-4.5" />
          </Link>

          <div className="w-px h-6 bg-slate-200 hidden sm:block mx-0.5" />

          {/* Member Profile Avatar Card */}
          <Link
            to="/member/profile"
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl border border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/40 active:scale-98 transition-all group"
          >
            <Avatar className="h-7 w-7 ring-2 ring-orange-400/40 shrink-0 shadow-xs">
              {user?.photoUrl && <AvatarImage src={user.photoUrl} alt={displayName} />}
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-[11px] font-black">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors truncate max-w-[110px]">
                {displayName}
              </div>
              <div className="text-[9px] font-semibold text-slate-400 font-mono tracking-tight">
                {user?.publicId || "Verified"}
              </div>
            </div>
          </Link>

        </div>
      </header>

      {/* ── Mobile Search Overlay Dialog ─────────────────────────────────── */}
      <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-2xl shadow-2xl overflow-hidden top-[25%] sm:top-[35%]">
          <form onSubmit={handleSearchSubmit} className="p-4 border-b border-slate-100 flex items-center gap-3">
            <Search className="h-5 w-5 text-orange-500 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search Temples, MS, Events, News…")}
              className="w-full text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          <div className="p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t("Explore Categories")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_SEARCH_CHIPS.map(({ label, icon: Icon, to }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleChipClick(to)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 hover:bg-orange-50/80 border border-slate-100 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white text-orange-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-orange-700">{t(label)}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
