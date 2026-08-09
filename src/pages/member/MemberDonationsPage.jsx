import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { HeartHandshake, Receipt, ShieldCheck, Download, Heart, Building2, Calendar } from "lucide-react";
import { donationsApi, formatMinor } from "@/lib/memberApi";
import { extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import ListState from "@/components/member/ListState";
import { cn } from "@/lib/utils";

const STATUS_TONE = {
  VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING_VERIFICATION: "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const pretty = (s) =>
  String(s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function currentFinancialYear(now = new Date()) {
  const y = now.getFullYear();
  return now.getMonth() >= 3 ? y : y - 1;
}

export default function MemberDonationsPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fy, setFy] = useState(String(currentFinancialYear()));
  const [status, setStatus] = useState("");

  const loadData = () => {
    setLoading(true);
    donationsApi
      .mine({ financial_year: fy, ...(status ? { status } : {}) })
      .then(({ items, totals: tt }) => {
        setRows(items || []);
        setTotals(tt);
      })
      .catch((e) => {
        setRows([]); setTotals(null);
        toast.error(extractErrorMessage(e));
      })
      .finally(() => { setLoading(false); });
  };

  useEffect(() => {
    loadData();
  }, [fy, status]);

  const fyOptions = useMemo(() => {
    const cur = currentFinancialYear();
    return Array.from({ length: 6 }, (_, i) => cur - i).map((y) => ({
      value: String(y),
      label: `FY ${y}–${String(y + 1).slice(2)}`,
    }));
  }, []);

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("All Statuses") },
      { value: "PENDING_VERIFICATION", label: t("Pending Verification") },
      { value: "VERIFIED", label: t("Verified") },
      { value: "REJECTED", label: t("Rejected") },
    ],
    [t]
  );

  const downloadReceipt = async (uid) => {
    try {
      const res = await donationsApi.receiptUrl(uid);
      const url = res?.url || res;
      if (url) window.open(url, "_blank", "noopener");
      else toast.error(t("Receipt not available yet."));
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" data-testid="member-donations-page">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <HeartHandshake className="h-4.5 w-4.5" />
          </div>
          <span>{t("My Donations & Seva History")}</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {t("Your permanent tax-exempt donation records, 80G certificates and official sangh receipts.")}
        </p>
      </div>

      {/* Financial Year Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            <span>{t("Total Donations (Selected FY)")}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
            {formatMinor(totals?.total_minor ?? 0, totals?.currency || "INR")}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200/80 shadow-xs space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-emerald-800 font-extrabold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>{t("80G Tax Exemption Eligible")}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono mt-1">
            {formatMinor(totals?.eligible_80g_minor ?? 0, totals?.currency || "INR")}
          </div>
        </div>
      </div>

      {/* 10BE Certificate Download */}
      {totals?.certificate_10be_url && (
        <a
          href={totals.certificate_10be_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs font-bold text-orange-600 hover:underline p-3 bg-orange-50/60 rounded-2xl border border-orange-200/80 w-fit"
        >
          <Receipt className="h-4 w-4" />
          <span>{t("Download Annual 10BE Tax Exemption Certificate")}</span>
        </a>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SearchableSelect value={fy} onValueChange={setFy} options={fyOptions} placeholder={t("Financial Year")} />
        <SearchableSelect value={status} onValueChange={setStatus} options={statusOptions} placeholder={t("All Statuses")} />
      </div>

      {/* Donations List */}
      <ListState
        loading={loading}
        count={rows.length}
        onRetry={loadData}
        emptyTitle={t("No donation records found")}
        emptyHint={t("Donations made through JiNANAM will automatically appear here with receipts.")}
      >
        <div className="space-y-3.5">
          {rows.map((d) => {
            const stTone = STATUS_TONE[d.status] || "bg-slate-100 text-slate-700 border-slate-200";
            return (
              <div
                key={d.id || d.uid}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-2xs">
                    <HeartHandshake className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                        {d.purpose || d.category || t("General Donation")}
                      </h3>
                      <span className={cn("text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0", stTone)}>
                        {t(pretty(d.status))}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap">
                      {d.organization?.name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>{d.organization.name}</span>
                        </span>
                      )}
                      {d.createdAt && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(d.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-semibold">{t("Amount")}</div>
                    <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                      {formatMinor(d.amount_minor || (d.amount ? d.amount * 100 : 0), d.currency || "INR")}
                    </div>
                  </div>

                  <button
                    onClick={() => downloadReceipt(d.uid || d.id)}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 active:scale-95 transition-all shadow-2xs"
                    title={t("Download 80G Receipt")}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </ListState>

    </div>
  );
}
