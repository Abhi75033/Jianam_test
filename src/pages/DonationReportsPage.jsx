import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { BadgeIndianRupee, TrendingUp, HeartHandshake } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { StatCard } from "@/components/common/StatCard";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DonationReportsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const orgId = user?.organizationIds?.[0];

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    totalOnline: 0,
    totalOffline: 0,
    total: 0,
    chartData: []
  });

  const loadReport = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/summary/donations/org/${orgId}`);
      setData(res.data.data);
    } catch (e) {
      toast.error(t("Failed to load donation analytics report."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const formatRupee = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  return (
    <div className="space-y-4" data-testid="donation-reports-page">
      <PageHeader
        title={t("Donation Analytics Report")}
        subtitle={t("Historical collections breakdown comparing offline counter collections and online app pings.")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label={t("Online Contributions")} value={loading ? "..." : formatRupee(data.totalOnline)} icon={TrendingUp} tone="warning" />
        <StatCard label={t("Offline Counter Logs")} value={loading ? "..." : formatRupee(data.totalOffline)} icon={HeartHandshake} tone="default" />
        <StatCard label={t("Overall Collections")} value={loading ? "..." : formatRupee(data.total)} icon={BadgeIndianRupee} tone="info" />
      </div>

      <Card className="p-4 border border-slate-200 bg-white">
        <div className="text-sm font-semibold text-slate-800 mb-4">{t("Donation velocity trend (last 6 months)")}</div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString()}`, ""]} />
              <Area type="monotone" dataKey="Online" stroke="#f97316" fill="#ffedd5" name="Online Payments" />
              <Area type="monotone" dataKey="Offline" stroke="#64748b" fill="#f1f5f9" name="Cash / Offline" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
