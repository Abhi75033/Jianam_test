import { useState } from "react";
import { Wallet, Receipt, Ticket, Award, Download, ChevronRight, Filter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const TABS = ["All", "Receipts", "Tickets", "Certificates", "Passes"];

const DEMO_ITEMS = [
  { id: 1, type: "Receipt", label: "Donation Receipt", org: "Shree Ajitnath Derasar", date: "25 Jul 2025", amount: "₹5,000", emoji: "🧾", color: "bg-rose-50 border-rose-100" },
  { id: 2, type: "Ticket", label: "Paryushan Event Ticket", org: "JiNANAM Events", date: "22 Aug 2025", amount: "Free", emoji: "🎟️", color: "bg-sky-50 border-sky-100" },
  { id: 3, type: "Receipt", label: "Dharamshala Booking Receipt", org: "Palitana Board", date: "10 Jul 2025", amount: "₹2,400", emoji: "🧾", color: "bg-rose-50 border-rose-100" },
  { id: 4, type: "Certificate", label: "80G Donation Certificate", org: "Mahavir Seva Trust", date: "01 Apr 2025", amount: "FY 2024–25", emoji: "🏆", color: "bg-amber-50 border-amber-100" },
  { id: 5, type: "Certificate", label: "99 Jatra Completion Certificate", org: "JiNANAM 99 Management", date: "15 Mar 2025", amount: "Certificate", emoji: "🏅", color: "bg-amber-50 border-amber-100" },
  { id: 6, type: "Ticket", label: "Ranakpur Yatra Registration", org: "JiNANAM Tours", date: "05 Sep 2025", amount: "₹8,500", emoji: "🗺️", color: "bg-sky-50 border-sky-100" },
];

export default function MemberWalletPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("All");

  const filtered = DEMO_ITEMS.filter((i) => activeTab === "All" || i.type === activeTab.slice(0, -1));

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-lg font-bold text-slate-800 pt-1">{t("My Digital Wallet")}</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Receipts", count: 3, emoji: "🧾", color: "from-rose-400 to-pink-500" },
          { label: "Tickets", count: 2, emoji: "🎟️", color: "from-sky-400 to-blue-500" },
          { label: "Certificates", count: 2, emoji: "🏅", color: "from-amber-400 to-orange-500" },
        ].map(({ label, count, emoji, color }) => (
          <div key={label} className={cn("rounded-2xl p-3 text-white bg-gradient-to-br shadow-sm", color)}>
            <div className="text-2xl">{emoji}</div>
            <div className="text-xl font-black mt-1">{count}</div>
            <div className="text-[9px] font-bold opacity-90">{t(label)}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all",
              activeTab === tab
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-white border-slate-200 text-slate-600"
            )}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={item.id} className={cn("rounded-2xl border p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow", item.color)}>
            <div className="text-3xl">{item.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">{item.label}</div>
              <div className="text-[10px] text-slate-500 truncate">{item.org}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-slate-400">{item.date}</span>
                <span className="text-[9px] font-bold text-slate-700">{item.amount}</span>
              </div>
            </div>
            <button className="shrink-0 p-2 rounded-xl bg-white/70 hover:bg-white transition-colors">
              <Download className="h-3.5 w-3.5 text-slate-600" />
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <Wallet className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">{t("No items in this category")}</p>
        </div>
      )}
    </div>
  );
}
