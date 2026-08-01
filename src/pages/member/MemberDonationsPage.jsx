import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { HeartHandshake, Receipt, ShieldCheck } from "lucide-react";
import { donationsApi, formatMinor } from "@/lib/memberApi";
import { extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

/**
 * My Donations — §B18.9.
 * "A permanent, filterable history: date range, institution, category, status,
 *  mode, currency. Shows totals per financial year, an 80G-eligible subtotal,
 *  and one-tap download of any receipt or the annual 10BE certificate."
 */
const STATUS_TONE = {
  VERIFIED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING_VERIFICATION: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
};

const pretty = (s) =>
  String(s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** India defaults to 1 April – 31 March (§B18.6, configurable). */
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    donationsApi
      .mine({ financial_year: fy, ...(status ? { status } : {}) })
      .then(({ items, totals: tt }) => {
        if (cancelled) return;
        setRows(items);
        setTotals(tt);
      })
      .catch((e) => {
        if (cancelled) return;
        setRows([]); setTotals(null);
        toast.error(extractErrorMessage(e));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fy, status]);

  const fyOptions = useMemo(() => {
    const cur = currentFinancialYear();
    return Array.from({ length: 6 }, (_, i) => cur - i).map((y) => ({
      value: String(y),
      label: `${y}–${String(y + 1).slice(2)}`,
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
    <div data-testid="member-donations-page">
      <h1 className="font-heading text-xl font-bold text-slate-900">{t("My Donations")}</h1>
      <p className="text-xs text-slate-500 mt-1">
        {t("Your permanent donation history with receipts and 80G totals.")}
      </p>

      {/* Financial-year totals — §B18.9 */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card className="p-3.5 rounded-xl">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            {t("Total Donations")}
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {loading ? <Skeleton className="h-6 w-20" /> : formatMinor(totals?.total_minor ?? 0, totals?.currency || "INR")}
          </div>
        </Card>
        <Card className="p-3.5 rounded-xl border-emerald-100 bg-emerald-50/50">
          <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> {t("80G Eligible")}
          </div>
          <div className="text-lg font-bold text-emerald-800 mt-1">
            {loading ? <Skeleton className="h-6 w-20" /> : formatMinor(totals?.eligible_80g_minor ?? 0, totals?.currency || "INR")}
          </div>
        </Card>
      </div>

      {/* 10BE certificate — §B18.6 */}
      {totals?.certificate_10be_url && (
        <a
          href={totals.certificate_10be_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center gap-2 text-xs font-semibold text-orange-700 hover:underline"
        >
          <Receipt className="h-3.5 w-3.5" /> {t("Download 10BE Certificate")}
        </a>
      )}

      {/* Filters */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <SearchableSelect value={fy} onValueChange={setFy} options={fyOptions} placeholder={t("Financial Year")} />
        <SearchableSelect value={status} onValueChange={setStatus} options={statusOptions} placeholder={t("All Statuses")} />
      </div>

      {/* History */}
      <div className="mt-4 space-y-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 rounded-xl">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2 mt-2" />
            </Card>
          ))}

        {!loading && rows.length === 0 && (
          <EmptyState
            icon={HeartHandshake}
            title={t("No donations yet")}
            description={t("Donations you make to temples and institutions will appear here with their receipts.")}
          />
        )}

        {!loading &&
          rows.map((d) => (
            <Card key={d.uid || d.id} className="p-4 rounded-xl" data-testid={`donation-${d.uid || d.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900 truncate">
                      {d.institution_name || t("Donation")}
                    </span>
                    <Badge
                      className={`text-[10px] font-semibold border-0 ${
                        STATUS_TONE[String(d.status || "").toUpperCase()] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t(pretty(d.status))}
                    </Badge>
                    {d.is_80g_eligible && (
                      <Badge className="text-[9px] bg-emerald-100 text-emerald-700 border-0">80G</Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {d.category ? t(d.category) : "—"}
                    {d.mode ? ` · ${t(pretty(d.mode))}` : ""}
                  </div>
                  {d.donated_at && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(d.donated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-slate-900">
                    {formatMinor(d.amount_minor, d.currency)}
                  </div>
                  {["VERIFIED", "COMPLETED"].includes(String(d.status || "").toUpperCase()) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[11px] text-orange-700"
                      onClick={() => downloadReceipt(d.uid || d.id)}
                    >
                      <Receipt className="h-3 w-3 mr-1" /> {t("Receipt")}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
