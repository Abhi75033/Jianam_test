import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { History, ShieldCheck, ShieldAlert, Monitor, Smartphone, Globe } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { api, extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginHistoryPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/audit-logs", { params: { action: "LOGIN" } });
      const items = res.data?.data?.items || res.data?.data || [];
      setLogs(items);
      const total = items.length;
      const failed = items.filter((i) => i.status === "FAILED" || i.action?.includes("FAIL")).length;
      setStats({ total, success: total - failed, failed });
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    {
      key: "actor",
      header: t("Admin / User"),
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.actorName || r.actorId || "Admin User"}</div>
          <div className="text-[11px] text-slate-500 font-mono">{r.actorEmail || r.ipAddress || "127.0.0.1"}</div>
        </div>
      ),
    },
    {
      key: "device",
      header: t("Device & Browser"),
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <Monitor className="h-3.5 w-3.5 text-slate-400" />
          <span>{r.userAgent || "Chrome on macOS"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: t("Login Result"),
      render: (r) => (
        <Badge className={r.status === "FAILED" ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"}>
          {r.status || "SUCCESS"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: t("Timestamp"),
      render: (r) => formatDateTime(r.createdAt || new Date()),
    },
  ];

  return (
    <div className="space-y-4" data-testid="login-history-page">
      <PageHeader
        title={t("Login History")}
        subtitle={t("Security audit logs tracking administrator and user authentication attempts, IP addresses, and session details.")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label={t("Total Logins Today")} value={loading ? "..." : stats.total} icon={History} tone="blue" />
        <StatCard label={t("Successful Logins")} value={loading ? "..." : stats.success} icon={ShieldCheck} tone="green" />
        <StatCard label={t("Failed Attempts")} value={loading ? "..." : stats.failed} icon={ShieldAlert} tone="red" />
      </div>

      <Card className="p-4 border border-slate-200 bg-white">
        <DataTable
          columns={columns}
          rows={logs}
          loading={loading}
          emptyTitle={t("No Login History Logs")}
          emptyDescription={t("Authentication logs will appear here.")}
        />
      </Card>
    </div>
  );
}
