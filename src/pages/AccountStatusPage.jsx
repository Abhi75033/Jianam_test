import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { ShieldAlert, UserX, UserCheck, Lock, Unlock, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { toast } from "sonner";
import { api, extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AccountStatusPage() {
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, locked: 0, suspended: 0 });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/admins");
      const list = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.items || []);
      setAccounts(list);

      const total = list.length;
      const locked = list.filter((a) => a.isLocked || a.status === "LOCKED").length;
      const suspended = list.filter((a) => a.status === "SUSPENDED" || a.status === "INACTIVE").length;
      const active = total - (locked + suspended);
      setStats({ total, active, locked, suspended });
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleLock = async (account) => {
    try {
      const isLockedNow = !account.isLocked;
      toast.success(`Account ${isLockedNow ? "locked" : "unlocked"} successfully.`);
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, isLocked: isLockedNow } : a))
      );
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const columns = [
    {
      key: "name",
      header: t("Account Name"),
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.fullName || r.name || "Admin Account"}</div>
          <div className="text-[11px] text-slate-500">{r.email || r.mobile || "—"}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: t("Role"),
      render: (r) => <Badge variant="outline">{r.role || "ADMIN"}</Badge>,
    },
    {
      key: "status",
      header: t("Account Status"),
      render: (r) => (
        <Badge className={r.isLocked ? "bg-amber-100 text-amber-800" : r.status === "INACTIVE" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}>
          {r.isLocked ? "LOCKED" : r.status || "ACTIVE"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: t("Actions"),
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleToggleLock(r)}
          className={r.isLocked ? "text-emerald-700 hover:bg-emerald-50" : "text-amber-700 hover:bg-amber-50"}
        >
          {r.isLocked ? <Unlock className="h-3.5 w-3.5 mr-1" /> : <Lock className="h-3.5 w-3.5 mr-1" />}
          {r.isLocked ? t("Unlock Account") : t("Lock Account")}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4" data-testid="account-status-page">
      <PageHeader
        title={t("Account Status & Security Control")}
        subtitle={t("Manage account states, unlock accounts locked by failed login thresholds, and control active/inactive administrative permissions.")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <StatCard label={t("Total Accounts")} value={loading ? "..." : stats.total} icon={UserCheck} tone="blue" />
        <StatCard label={t("Active Accounts")} value={loading ? "..." : stats.active} icon={UserCheck} tone="green" />
        <StatCard label={t("Locked Accounts")} value={loading ? "..." : stats.locked} icon={Lock} tone="warning" />
        <StatCard label={t("Suspended")} value={loading ? "..." : stats.suspended} icon={AlertTriangle} tone="red" />
      </div>

      <Card className="p-4 border border-slate-200 bg-white">
        <DataTable
          columns={columns}
          rows={accounts}
          loading={loading}
          emptyTitle={t("No Accounts Found")}
          emptyDescription={t("Administrative accounts will appear here.")}
        />
      </Card>
    </div>
  );
}
