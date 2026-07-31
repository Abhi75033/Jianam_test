import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Download, FileText, FileSpreadsheet, FileJson, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/common/DataTable";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const REPORTS_DEF = [
  { key: "donations", labelKey: "reports.donations", defaultLabel: "Donations" },
  { key: "bookings", labelKey: "reports.bookings", defaultLabel: "Bookings" },
  { key: "events", labelKey: "reports.events", defaultLabel: "Events" },
  { key: "visitors", labelKey: "reports.visitors", defaultLabel: "Visitors" },
  { key: "members", labelKey: "reports.members", defaultLabel: "Member Enrollment" },
  { key: "admins", labelKey: "reports.admins", defaultLabel: "Admin Reports" },
  { key: "staff", labelKey: "reports.staff", defaultLabel: "Staff" },
  { key: "journeys", labelKey: "reports.journeys", defaultLabel: "Journeys" },
  { key: "devices", labelKey: "reports.devices", defaultLabel: "Devices" },
  { key: "volunteers", labelKey: "reports.volunteers", defaultLabel: "Volunteers" },
];

export default function ReportsPage() {
  const { user, isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const orgId = user?.organizationIds?.[0];
  const [searchParams, setSearchParams] = useSearchParams();

  // Sidebar links arrive as /reports?tab=<reportKey>. Honour the param so each
  // nav item actually selects its report instead of always landing on the default.
  const urlTab = searchParams.get("tab");
  const validKeys = useMemo(() => REPORTS_DEF.map((r) => r.key), []);
  const [reportKey, setReportKey] = useState(
    urlTab && validKeys.includes(urlTab) ? urlTab : "donations"
  );

  // Keep state in sync when the user clicks a different report in the sidebar
  // while already on this page (pathname unchanged, only the query changes).
  useEffect(() => {
    if (urlTab && validKeys.includes(urlTab) && urlTab !== reportKey) {
      setReportKey(urlTab);
      setRows([]);
    }
  }, [urlTab, validKeys, reportKey]);

  const handleReportChange = (value) => {
    setReportKey(value);
    setRows([]);
    setSearchParams(value === "donations" ? {} : { tab: value }, { replace: true });
  };
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [scope, setScope] = useState(isSuperAdmin ? "platform" : "org");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const reportOptions = useMemo(() => {
    return REPORTS_DEF.map((r) => ({
      value: r.key,
      label: t(r.labelKey, r.defaultLabel),
    }));
  }, [t]);

  const preview = async () => {
    setLoading(true);
    try {
      const url = scope === "platform"
        ? `/reports/${reportKey}/platform`
        : `/reports/${reportKey}/org/${orgId}`;
      const res = await api.get(url, { params: { from, to, format: "json" } });
      const data = res.data?.data;
      const list = Array.isArray(data) ? data : (data?.items || []);
      setRows(list);
      if (list.length === 0) toast.info(t("reports.noRows", "No rows for this range."));
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  const exportAs = async (format) => {
    const url = scope === "platform"
      ? `/reports/${reportKey}/platform`
      : `/reports/${reportKey}/org/${orgId}`;
    try {
      const res = await api.get(url, {
        params: { format, ...(from && { from }), ...(to && { to }) },
        responseType: "blob",
      });
      const ext = format === "excel" ? "xlsx" : format;
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${reportKey}-report.${ext}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const columns = rows.length > 0
    ? Object.keys(rows[0]).slice(0, 8).map((k) => ({ key: k, header: k, render: (r) => String(r[k] ?? "—") }))
    : [];

  return (
    <div data-testid="reports-page">
      <PageHeader title={t("reports.title", "Reports")} subtitle={t("reports.subtitle", "Generate and export platform reports (PDF / Excel / CSV).")} />

      <Card className="p-5 rounded-md border-border mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Label className="text-xs font-semibold">{t("reports.reportLabel", "Report")}</Label>
            <SearchableSelect
              value={reportKey}
              onValueChange={handleReportChange}
              options={reportOptions}
              placeholder={t("action.search", "Select Report")}
              searchPlaceholder={t("action.search", "Search report…")}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold">{t("reports.scopeLabel", "Scope")}</Label>
            <SearchableSelect
              value={scope}
              onValueChange={setScope}
              options={[
                { value: "org", label: t("reports.myOrg", "My Organization") },
                ...(isSuperAdmin ? [{ value: "platform", label: t("reports.platformWide", "Platform-wide") }] : []),
              ]}
              placeholder={t("reports.scopeLabel", "Select Scope")}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold">{t("reports.fromLabel", "From")}</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} data-testid="reports-from" />
          </div>
          <div>
            <Label className="text-xs font-semibold">{t("reports.toLabel", "To")}</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} data-testid="reports-to" />
          </div>
          <div className="flex items-end">
            <Button onClick={preview} disabled={loading} className="w-full font-bold bg-orange-600 hover:bg-orange-700 text-white" data-testid="reports-preview-button">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t("reports.preview", "Preview")}
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportAs("pdf")} data-testid="reports-export-pdf"><FileText className="h-3.5 w-3.5 mr-1.5" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={() => exportAs("excel")} data-testid="reports-export-excel"><FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> {t("Excel")}</Button>
          <Button variant="outline" size="sm" onClick={() => exportAs("csv")} data-testid="reports-export-csv"><Download className="h-3.5 w-3.5 mr-1.5" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={() => exportAs("json")}><FileJson className="h-3.5 w-3.5 mr-1.5" /> JSON</Button>
        </div>
      </Card>

      {rows.length > 0 && (
        <DataTable columns={columns} rows={rows} testId="reports-table" />
      )}
    </div>
  );
}
