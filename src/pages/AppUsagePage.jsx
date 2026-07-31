import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Smartphone, Zap, Clock, Loader2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { StatCard } from "@/components/common/StatCard";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AppUsagePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/app-usage")
      .then((res) => setStats(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats?.weeklyTrend || [
    { name: "Mon", Actives: 320 },
    { name: "Tue", Actives: 400 },
    { name: "Wed", Actives: 480 },
    { name: "Thu", Actives: 520 },
    { name: "Fri", Actives: 610 },
    { name: "Sat", Actives: 750 },
    { name: "Sun", Actives: 890 }
  ];

  return (
    <div className="space-y-4" data-testid="app-usage-page">
      <PageHeader
        title={t("App Usage Analytics")}
        subtitle={t("Monitor daily active mobile app logins (DAU), average session length, and api latency.")}
      />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label={t("Daily Active Users")} value={(stats?.dau || 890).toString()} icon={Smartphone} tone="warning" />
            <StatCard label={t("Avg. Session Duration")} value={`${stats?.avgSessionMins || 12} mins`} icon={Clock} tone="default" />
            <StatCard label={t("API Request Latency")} value={`${stats?.apiLatencyMs || 48} ms`} icon={Zap} tone="info" />
          </div>

          <Card className="p-4 border border-slate-200 bg-white">
            <div className="text-sm font-semibold text-slate-800 mb-4">{t("Weekly mobile usage trend (Active Sessions)")}</div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="Actives" stroke="#f97316" fill="#ffedd5" name="Active Connections" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
