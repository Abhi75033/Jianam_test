import { useState } from "react";
import { Wallet, Receipt, Ticket, Award, Download, ChevronRight, Filter, FileText, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ListState from "@/components/member/ListState";
import { useMemberList, longDate } from "@/hooks/useMemberList";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = ["All", "Receipts", "Tickets", "Certificates", "Passes"];

function mapReceipt(r, i) {
  return {
    id: r.id || i,
    type: "Receipt",
    title: r.purpose || r.category || "Donation Receipt",
    subtitle: r.organization?.name || "Sangh Trust",
    amount: r.amount ? `₹${Number(r.amount).toLocaleString("en-IN")}` : "",
    date: longDate(r.createdAt),
    icon: Receipt,
    ref: r.receiptNumber || r.publicId,
    color: "bg-rose-50 text-rose-600 border-rose-100",
  };
}

function mapTicket(t_, i) {
  return {
    id: t_.id || i,
    type: "Ticket",
    title: t_.event?.title || "Event Ticket Pass",
    subtitle: t_.event?.location || "Main Sabha Mandap",
    amount: t_.price ? `₹${Number(t_.price).toLocaleString("en-IN")}` : "Free Pass",
    date: longDate(t_.event?.startsAt || t_.createdAt),
    icon: Ticket,
    ref: t_.publicId,
    color: "bg-sky-50 text-sky-600 border-sky-100",
  };
}

export default function MemberWalletPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("All");

  const receipts = useMemberList("/receipts/my", { map: mapReceipt });
  const tickets  = useMemberList("/tickets/my",  { map: mapTicket });
  const loading = receipts.loading || tickets.loading;
  const error   = receipts.error || tickets.error;
  const items   = [...receipts.items, ...tickets.items];

  const filtered = items.filter((i) => {
    if (activeTab === "All") return true;
    if (activeTab === "Receipts") return i.type === "Receipt";
    if (activeTab === "Tickets") return i.type === "Ticket";
    return true;
  });

  const handleDownload = (item) => {
    toast.success(t("Document download started!"));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Wallet className="h-4.5 w-4.5" />
          </div>
          <span>{t("My Digital Wallet")}</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          {t("Secure storage for your tax-exempt donation receipts, temple entry passes, and event tickets.")}
        </p>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Tax Receipts", count: receipts.items.length || 0, icon: Receipt, color: "from-rose-500 to-pink-600" },
          { label: "Event Tickets", count: tickets.items.length || 0, icon: Ticket, color: "from-sky-500 to-blue-600" },
          { label: "Sangh Passes", count: 1, icon: Award, color: "from-amber-500 to-orange-600" },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className={cn("rounded-3xl p-4 sm:p-5 text-white bg-gradient-to-br shadow-md space-y-1", color)}>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-2">{count}</div>
            <div className="text-[11px] font-bold opacity-90 truncate">{t(label)}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "shrink-0 text-xs font-bold px-4 py-2 rounded-2xl border transition-all active:scale-95 shadow-xs",
              activeTab === tab
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-transparent text-white shadow-emerald-600/20"
                : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
            )}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      {/* Items List */}
      <ListState
        loading={loading}
        error={error}
        count={filtered.length}
        emptyTitle={t("No documents in this category")}
        emptyHint={t("Donation receipts and event registrations will automatically appear in your digital wallet.")}
        onRetry={() => { receipts.reload(); tickets.reload(); }}
      >
        <div className="space-y-3">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs", item.color)}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h3>
                      {item.ref && (
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md hidden sm:inline">
                          {item.ref}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{item.subtitle}</div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-bold">
                      <span>{item.date}</span>
                      {item.amount && <span className="text-slate-800 font-black">{item.amount}</span>}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(item)}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 active:scale-95 transition-all shrink-0"
                  title={t("Download Receipt / Pass")}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </ListState>

    </div>
  );
}
