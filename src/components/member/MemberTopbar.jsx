import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu, Search, Bell, MessageSquare, Wallet, Globe, LogOut, User, QrCode
} from "lucide-react";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

export default function MemberTopbar({ onToggleSidebar }) {
  const { t } = useLanguage();
  const { user, logout } = useMemberAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/member/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.fullName || t("Member");

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
      
      {/* ── Left Side: Hamburger / Sidebar Toggle + Universal Search Bar ────── */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title={t("Toggle Sidebar Menu")}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Universal Search: Temples, MS, Events, News, Offers…")}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
          />
        </form>
      </div>

      {/* ── Right Side Action Icons ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Messages Icon */}
        <button
          onClick={() => navigate("/member/notifications")}
          className="relative p-2.5 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          title={t("Messages")}
        >
          <MessageSquare className="h-4.5 w-4.5" />
        </button>

        {/* Notifications Bell */}
        <Link
          to="/member/notifications"
          className="relative p-2.5 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          title={t("Notifications")}
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </Link>

        {/* Wallet Quick Button */}
        <Link
          to="/member/wallet"
          className="p-2.5 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-bold"
          title={t("Digital Wallet")}
        >
          <Wallet className="h-4.5 w-4.5" />
        </Link>

        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        {/* User Profile Pill */}
        <Link
          to="/member/profile"
          className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/40 transition-all group"
        >
          <Avatar className="h-7 w-7 ring-2 ring-orange-400/30 shrink-0">
            {user?.photoUrl && <AvatarImage src={user.photoUrl} />}
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white text-[11px] font-extrabold">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors truncate max-w-[120px]">
              {displayName}
            </div>
            <div className="text-[9px] font-semibold text-slate-400 font-mono">
              {user?.publicId || "Verified"}
            </div>
          </div>
        </Link>

      </div>
    </header>
  );
}
