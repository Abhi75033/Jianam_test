import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const PLATFORM_MODULE_LIST = [
  { key: "MEMBERS", label: "Members & Family Directory", category: "People" },
  { key: "VOLUNTEERS", label: "Volunteer Management", category: "People" },
  { key: "MONKS", label: "MS Profiles & Chaturmas", category: "People" },
  { key: "STAFF", label: "Staff Management & Attendance", category: "People" },
  { key: "TEMPLES", label: "Temple Management", category: "Organizations" },
  { key: "DHARAMSHALAS", label: "Dharamshala & Rooms", category: "Organizations" },
  { key: "JAIN_CENTERS", label: "Jain Centre Management", category: "Organizations" },
  { key: "STHANAKS", label: "Sthanak Management", category: "Organizations" },
  { key: "COMMUNITY_PAGES", label: "Community Pages", category: "Organizations" },
  { key: "FEED", label: "Feed & Posts", category: "Community" },
  { key: "EVENTS", label: "Events & Registrations", category: "Community" },
  { key: "NEWS", label: "News & Announcements", category: "Community" },
  { key: "POLLS", label: "Polls & Voting", category: "Community" },
  { key: "TOURS", label: "Tours & Yatras", category: "Community" },
  { key: "COUNTERS", label: "Spiritual Counters", category: "Community" },
  { key: "CALENDAR", label: "Tithi Calendar", category: "Community" },
  { key: "NOTIFICATIONS", label: "Notification Center", category: "Community" },
  { key: "BOOKINGS", label: "Facility & Room Bookings", category: "Bookings" },
  { key: "DONATIONS", label: "Donations & Receipts", category: "Finance" },
  { key: "SPONSORS", label: "Sponsors & Ads", category: "Finance" },
  { key: "OFFERS", label: "Offers & Benefits", category: "Finance" },
  { key: "VISITORS", label: "Visitor Entry & Exit", category: "Operations" },
  { key: "TRACKING", label: "MS Live Tracking", category: "Operations" },
  { key: "REPORTS", label: "Reports & Analytics", category: "Reports" },
  { key: "SUPPORT", label: "Support & Feedback", category: "Support" },
  { key: "SETTINGS", label: "Organization Settings", category: "Settings" },
];

/**
 * TabPermissionSelector Component
 *
 * Props:
 * - selectedModules: string[] (array of granted module keys)
 * - onChange: (newSelectedModules: string[]) => void
 * - isSuperAdmin: boolean
 * - allowedModules?: string[] (modules granted to delegator, if non-Super-Admin)
 */
export function TabPermissionSelector({
  selectedModules = [],
  onChange,
  isSuperAdmin = false,
  allowedModules = [],
  title = "Granted Tab & Module Permissions",
}) {
  const { t } = useLanguage();
  const toggleModule = (moduleKey) => {
    if (selectedModules.includes(moduleKey)) {
      onChange(selectedModules.filter((m) => m !== moduleKey));
    } else {
      onChange([...selectedModules, moduleKey]);
    }
  };

  const selectAll = () => {
    const validKeys = PLATFORM_MODULE_LIST.filter((item) =>
      isSuperAdmin ? true : allowedModules.includes(item.key)
    ).map((item) => item.key);
    onChange(validKeys);
  };

  const clearAll = () => {
    onChange([]);
  };

  const categories = Array.from(new Set(PLATFORM_MODULE_LIST.map((m) => m.category)));

  return (
    <div className="space-y-3 border rounded-xl p-4 bg-slate-50/50">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-orange-600" />
          <h4 className="text-xs font-bold text-slate-800">{title}</h4>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-[10px] text-orange-600 hover:text-orange-800 font-bold underline"
          >
            {t("Select All Available")}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-[10px] text-slate-500 hover:text-slate-700 font-medium underline"
          >
            {t("Clear All")}
          </button>
        </div>
      </div>

      {!isSuperAdmin && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900 font-medium leading-relaxed">
          🔒 <strong>{t("Delegation Hierarchy Guard Active")}</strong>{t(": You can only assign tab access that has been granted to your own account by Super Admin.")}
        </div>
      )}

      <div className="space-y-3">
        {categories.map((cat) => {
          const items = PLATFORM_MODULE_LIST.filter((m) => m.category === cat);
          return (
            <div key={cat} className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {cat}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {items.map((item) => {
                  const isChecked = selectedModules.includes(item.key);
                  const isAllowed = isSuperAdmin || allowedModules.includes(item.key);

                  return (
                    <label
                      key={item.key}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${
                        !isAllowed
                          ? "bg-slate-100 opacity-60 cursor-not-allowed border-slate-200"
                          : isChecked
                          ? "bg-orange-50/80 border-orange-300 text-orange-950 font-bold shadow-2xs"
                          : "bg-white border-slate-200 hover:border-orange-300 text-slate-700 cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!isAllowed}
                        onChange={() => isAllowed && toggleModule(item.key)}
                        className="h-3.5 w-3.5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                      />
                      <span className="truncate">{t(item.label)}</span>
                      {!isAllowed && (
                        <Lock className="h-3 w-3 text-slate-400 ml-auto shrink-0" title={t("Not granted by Super Admin")} />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
