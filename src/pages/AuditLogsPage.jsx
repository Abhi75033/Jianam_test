import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { ALL_MODULES, ALL_ACTIONS } from "@/constants/modules";
import { Filter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const renderDiffViewer = (log) => {
  const diff = log.diff;
  if (!diff) {
    return (
      <div className="text-xs text-muted-foreground bg-slate-50 p-4 rounded-lg border text-center font-medium">
        Structured field differences not computed (initial creation or hard delete event).
      </div>
    );
  }
  
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-semibold border-b">
          <tr>
            <th className="p-3 w-1/3 border-r">Property / Field</th>
            <th className="p-3 w-1/3 bg-red-50/50 text-red-800 border-r">Original Value</th>
            <th className="p-3 w-1/3 bg-emerald-50/50 text-emerald-800">Modified Value</th>
          </tr>
        </thead>
        <tbody className="divide-y bg-white">
          {Object.entries(diff).map(([key, value]) => {
            const oldVal = value.old === null || value.old === undefined ? "—" : typeof value.old === 'object' ? JSON.stringify(value.old, null, 1) : String(value.old);
            const newVal = value.new === null || value.new === undefined ? "—" : typeof value.new === 'object' ? JSON.stringify(value.new, null, 1) : String(value.new);
            return (
              <tr key={key} className="hover:bg-slate-50/60">
                <td className="p-3 font-semibold text-slate-700 border-r break-all">{key}</td>
                <td className="p-3 bg-red-50/10 text-red-800 font-mono-num border-r break-all whitespace-pre-wrap">{oldVal}</td>
                <td className="p-3 bg-emerald-50/10 text-emerald-800 font-mono-num break-all whitespace-pre-wrap">{newVal}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default function AuditLogsPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLog, setDetailLog] = useState(null);
  const [filters, setFilters] = useState({
    module: "ALL", action: "ALL", from: "", to: "", isCritical: "ALL",
  });

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = { page: 1, pageSize: 100 };
    if (filters.module !== "ALL") params.module = filters.module;
    if (filters.action !== "ALL") params.action = filters.action;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.isCritical !== "ALL") params.isCritical = filters.isCritical === "YES";

    api.get("/audit-logs", { params })
      .then((res) => setRows(res.data?.data?.items || res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const columns = [
    { key: "at", header: t("Timestamp"), render: (r) => <span className="text-xs font-mono-num">{formatDateTime(r.createdAt || r.at)}</span> },
    { key: "actor", header: t("Actor"), render: (r) => r.actor?.mobile || r.actorId || "system" },
    { key: "module", header: t("Module"), render: (r) => <Badge variant="outline" className="text-[10px]">{r.module}</Badge> },
    { key: "action", header: t("Action"), render: (r) => <Badge variant="outline" className="text-[10px]">{r.action}</Badge> },
    { key: "entity", header: t("Entity"), render: (r) => <span className="text-xs">{r.entityType} · {r.entityId?.slice(0, 12)}</span> },
    { key: "critical", header: t("Critical"), render: (r) => r.isCritical ? <Badge variant="destructive">{t("Critical")}</Badge> : <span className="text-muted-foreground text-xs">—</span> },
  ];

  return (
    <div data-testid="audit-logs-page">
      <PageHeader
        title={t("audit.title", "Audit Logs")}
        subtitle={t("Immutable, read-only trail of all critical actions on the platform.")}
      />

      <Card className="p-4 rounded-md border-border mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <Label className="text-xs">{t("Module")}</Label>
            <SearchableSelect
              value={filters.module}
              onValueChange={(v) => setFilters({ ...filters, module: v })}
              options={[{ value: "ALL", label: t("All Modules") }, ...ALL_MODULES.map(m => ({ value: m, label: m }))]}
              placeholder={t("All Modules")}
              searchPlaceholder={t("Search module…")}
            />
          </div>
          <div>
            <Label className="text-xs">{t("Action")}</Label>
            <SearchableSelect
              value={filters.action}
              onValueChange={(v) => setFilters({ ...filters, action: v })}
              options={[{ value: "ALL", label: t("All Actions") }, ...ALL_ACTIONS.map(a => ({ value: a, label: a }))]}
              placeholder={t("All Actions")}
              searchPlaceholder={t("Search action…")}
            />
          </div>
          <div>
            <Label className="text-xs">{t("From")}</Label>
            <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">{t("To")}</Label>
            <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">{t("Critical")}</Label>
            <SearchableSelect
              value={filters.isCritical}
              onValueChange={(v) => setFilters({ ...filters, isCritical: v })}
              options={[
                { value: "ALL", label: t("All Logs") },
                { value: "YES", label: t("Critical only") },
                { value: "NO", label: t("Non-critical") },
              ]}
              placeholder={t("All Logs")}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchLogs} className="w-full" data-testid="audit-apply-button">
              <Filter className="h-4 w-4 mr-2" /> {t("Apply")}
            </Button>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        testId="audit-logs-table"
        emptyTitle={t("No audit logs")}
        emptyDescription={t("Actions performed by users will appear here.")}
        onRowClick={setDetailLog}
      />

      <Dialog open={Boolean(detailLog)} onOpenChange={() => setDetailLog(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" data-testid="audit-diff-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("Audit Log ·")} <span className="font-mono text-sm">{detailLog?.id?.slice(0, 12)}</span></DialogTitle>
          </DialogHeader>
          {detailLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div><div className="text-muted-foreground font-semibold">{t("Actor")}</div><div className="font-medium mt-0.5">{detailLog.actor?.mobile || detailLog.actorId || "system"}</div></div>
                <div><div className="text-muted-foreground font-semibold">{t("IP Address")}</div><div className="font-mono mt-0.5">{detailLog.ipAddress || detailLog.ip || "—"}</div></div>
                <div><div className="text-muted-foreground font-semibold">{t("User Agent")}</div><div className="font-medium truncate max-w-[150px] mt-0.5" title={detailLog.userAgent || detailLog.deviceInfo?.userAgent}>{detailLog.userAgent || detailLog.deviceInfo?.userAgent || "—"}</div></div>
                <div><div className="text-muted-foreground font-semibold">{t("Critical Action")}</div><div className="font-medium mt-0.5">{detailLog.isCritical ? <Badge variant="destructive">YES</Badge> : t("NO")}</div></div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">{t("Visual Difference View")}</div>
                {renderDiffViewer(detailLog)}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{t("Before Structure")}</div>
                  <pre className="text-[11px] p-3 bg-red-50 border border-red-100 rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap break-all font-mono">
                    {detailLog.before ? JSON.stringify(detailLog.before, null, 2) : "—"}
                  </pre>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{t("After Structure")}</div>
                  <pre className="text-[11px] p-3 bg-emerald-50 border border-emerald-100 rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap break-all font-mono">
                    {detailLog.after ? JSON.stringify(detailLog.after, null, 2) : "—"}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
