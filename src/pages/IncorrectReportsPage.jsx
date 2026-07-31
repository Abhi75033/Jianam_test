import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function IncorrectReportsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const orgId = user?.organizationIds?.[0];

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const loadReports = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get("/incorrect-reports", {
        params: { organizationId: orgId }
      });
      setRows(res.data.data || []);
    } catch (e) {
      toast.error(t("Failed to load flagged reports."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const verifyReport = async (id, status) => {
    try {
      await api.patch(`/incorrect-reports/${id}`, { status });
      toast.success(`Flagged information marked as ${status.toLowerCase()}.`);
      loadReports();
    } catch (e) {
      toast.error(t("Failed to update report status."));
    }
  };

  const columns = [
    { key: "reporter", header: t("Reporter"), render: (r) => <span className="font-semibold text-slate-800">{r.reporterName || r.reporter?.firstName || "Anonymous"}</span> },
    { key: "type", header: t("Entity"), render: (r) => <Badge variant="outline">{r.entityType}: {r.entityName || "—"}</Badge> },
    { key: "field", header: t("Incorrect Field"), render: (r) => <Badge variant="secondary">{r.flaggedField}</Badge> },
    {
      key: "info", header: t("Report Details"), render: (r) => (
        <div className="text-slate-600 text-xs max-w-sm space-y-1">
          <div><span className="font-medium text-slate-400">{t("Current:")}</span> {r.currentValue || "—"}</div>
          <div><span className="font-medium text-emerald-500">{t("Corrected:")}</span> {r.correctedValue}</div>
        </div>
      )
    },
    { key: "status", header: t("Status"), render: (r) => <Badge className={r.status === "CORRECTED" || r.status === "VERIFIED" ? "bg-emerald-500 text-white" : r.status === "PENDING" ? "bg-amber-500 text-white" : "bg-red-500 text-white"}>{r.status}</Badge> },
    {
      key: "actions", header: t("Action"),
      render: (r) => r.status === "PENDING" ? (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-7 text-emerald-600 hover:text-emerald-700" onClick={() => verifyReport(r.id, "CORRECTED")}>
            <CheckCircle className="h-3 w-3 mr-1" /> {t("Corrected")}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-red-600 hover:text-red-700" onClick={() => verifyReport(r.id, "REJECTED")}>
            <XCircle className="h-3 w-3 mr-1" /> {t("Reject")}
          </Button>
        </div>
      ) : <span className="text-xs text-slate-400">{r.status}</span>
    }
  ];

  return (
    <div data-testid="incorrect-reports-page">
      <PageHeader
        title={t("Incorrect Info Flagged Reports")}
        subtitle={t("Review and action profile information corrections flagged by community users in mobile search.")}
      />

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        testId="incorrect-reports-table"
      />
    </div>
  );
}
