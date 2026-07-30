import { useState } from "react";
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

const REPORTS = [
  { key: "donations", label: "Donations", desc: "Amounts, donors, verification status" },
  { key: "bookings", label: "Bookings", desc: "Items, dates, amounts, approvals" },
  { key: "events", label: "Events", desc: "RSVPs & ticket counts" },
  { key: "visitors", label: "Visitors", desc: "Check-in/out entries" },
  { key: "members", label: "Member Enrollment", desc: "Geographic segmentation, Jain & Non-Jain registrations" },
  { key: "admins", label: "Admin Reports", desc: "Role segmentation, Super Admin & Organization Admins" },
  { key: "staff", label: "Staff", desc: "Staff register with departments" },
  { key: "journeys", label: "Journeys", desc: "Monk journeys & delays" },
  { key: "devices", label: "Devices", desc: "GPS trackers report" },
];

export default function ReportsPage() {
  const { user, isSuperAdmin } = useAuth();
  const orgId = user?.organizationIds?.[0];
  const [reportKey, setReportKey] = useState("donations");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [scope, setScope] = useState(isSuperAdmin ? "platform" : "org");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

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
      if (list.length === 0) toast.info("No rows for this range.");
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  const exportAs = async (format) => {
    const url = scope === "platform"
      ? `/reports/${reportKey}/platform`
      : `/reports/${reportKey}/org/${orgId}`;
    try {
      // window.open cannot carry the auth header — download via axios blob
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
      <PageHeader title="Reports" subtitle="Generate and export platform reports (PDF / Excel / CSV)." />

      <Card className="p-5 rounded-md border-border mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Label className="text-xs">Report</Label>
            <SearchableSelect
              value={reportKey}
              onValueChange={setReportKey}
              options={REPORTS.map((r) => ({ value: r.key, label: r.label }))}
              placeholder="Select Report"
              searchPlaceholder="Search report…"
            />
          </div>
          <div>
            <Label className="text-xs">Scope</Label>
            <SearchableSelect
              value={scope}
              onValueChange={setScope}
              options={[
                { value: "org", label: "My Organization" },
                ...(isSuperAdmin ? [{ value: "platform", label: "Platform-wide" }] : []),
              ]}
              placeholder="Select Scope"
            />
          </div>
          <div>
            <Label className="text-xs">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} data-testid="reports-from" />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} data-testid="reports-to" />
          </div>
          <div className="flex items-end">
            <Button onClick={preview} disabled={loading} className="w-full" data-testid="reports-preview-button">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Preview
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportAs("pdf")} data-testid="reports-export-pdf"><FileText className="h-3.5 w-3.5 mr-1.5" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={() => exportAs("excel")} data-testid="reports-export-excel"><FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> Excel</Button>
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
