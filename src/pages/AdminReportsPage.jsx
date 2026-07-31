import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/common/StatCard";
import { DataTable } from "@/components/common/DataTable";
import { UsersRound, ShieldCheck, Landmark, Hotel, Download, FileSpreadsheet, FileText } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { toast } from "sonner";
import { api, extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminReportsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    superAdmins: 0,
    templeAdmins: 0,
    dharamshalaAdmins: 0,
    activePercent: 100,
    chartData: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/admins");
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : (res.data?.data?.items || []);
      setAdmins(list);

      const total = list.length;
      const superAdmins = list.filter((a) => a.role === "SUPER_ADMIN" || a.isSuperAdmin).length;
      const templeAdmins = list.filter((a) => a.role === "TEMPLE_ADMIN" || a.role === "JAIN_CENTER_ADMIN").length;
      const dharamshalaAdmins = list.filter((a) => a.role === "DHARAMSHALA_ADMIN").length;
      const activeCount = list.filter((a) => a.status === "ACTIVE" || a.isActive !== false).length;
      const activePercent = total > 0 ? Math.round((activeCount / total) * 100) : 100;

      // Distribution chart data
      const chartData = [
        { name: "Super Admins", count: superAdmins },
        { name: "Temple Admins", count: templeAdmins },
        { name: "Dharamshala Admins", count: dharamshalaAdmins },
        { name: "Staff Admins", count: total - (superAdmins + templeAdmins + dharamshalaAdmins) },
      ];

      setStats({ total, superAdmins, templeAdmins, dharamshalaAdmins, activePercent, chartData });
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = (format) => {
    toast.success(`Exporting Admin Reports in ${format.toUpperCase()} format...`);
  };

  const columns = [
    {
      key: "fullName",
      header: t("Admin Name"),
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.fullName || r.name || "Admin User"}</div>
          <div className="text-[11px] text-slate-500">{r.email || r.mobile || "—"}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: t("Role"),
      render: (r) => (
        <Badge
          className={
            r.role === "SUPER_ADMIN" || r.isSuperAdmin
              ? "bg-purple-100 text-purple-800 border-purple-200"
              : r.role === "TEMPLE_ADMIN"
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-blue-100 text-blue-800 border-blue-200"
          }
        >
          {r.role || (r.isSuperAdmin ? "SUPER_ADMIN" : "ADMIN")}
        </Badge>
      ),
    },
    {
      key: "organization",
      header: t("Assigned Organization"),
      render: (r) => r.organization?.name || r.orgName || "Platform Wide",
    },
    {
      key: "status",
      header: t("Status"),
      render: (r) => (
        <Badge className={r.status === "INACTIVE" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}>
          {r.status || "ACTIVE"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4" data-testid="admin-reports-page">
      <PageHeader
        title={t("Admin Enrollment & Distribution Report")}
        subtitle={t("Role segmentation, geographic organization assignment, and active status for all system administrators.")}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleExport("csv")}>
              <FileText className="h-4 w-4 mr-1 text-slate-600" /> {t("Export CSV")}
            </Button>
            <Button size="sm" className="bg-purple-700 hover:bg-purple-800 text-white font-bold" onClick={() => handleExport("excel")}>
              <FileSpreadsheet className="h-4 w-4 mr-1" /> {t("Export Excel")}
            </Button>
          </div>
        }
      />

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <StatCard label={t("Total Admin Accounts")} value={loading ? "..." : stats.total} icon={UsersRound} tone="purple" />
        <StatCard label={t("Super Admins")} value={loading ? "..." : stats.superAdmins} icon={ShieldCheck} tone="info" />
        <StatCard label={t("Temple & JC Admins")} value={loading ? "..." : stats.templeAdmins} icon={Landmark} tone="warning" />
        <StatCard label={t("Dharamshala Admins")} value={loading ? "..." : stats.dharamshalaAdmins} icon={Hotel} tone="green" />
      </div>

      {/* Chart Section */}
      <Card className="p-4 border border-slate-200 bg-white">
        <div className="text-sm font-semibold text-slate-800 mb-4">{t("Admin Account Distribution by Role & Privilege")}</div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Accounts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Admin Users Table */}
      <Card className="p-4 border border-slate-200 bg-white">
        <div className="text-sm font-semibold text-slate-800 mb-3">{t("Admin Account Register")}</div>
        <DataTable
          columns={columns}
          rows={admins}
          loading={loading}
          emptyTitle={t("No Admin Accounts Found")}
          emptyDescription={t("Administrator accounts will appear here.")}
        />
      </Card>
    </div>
  );
}
