import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { PartyPopper, Route, Armchair } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { StatCard } from "@/components/common/StatCard";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EventsReportsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const orgId = user?.organizationIds?.[0];

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    totalEvents: 0,
    totalRsvps: 0,
    totalCheckins: 0,
    avgOccupancy: 0,
    chartData: []
  });

  const loadReport = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/summary/events/org/${orgId}`);
      setData(res.data.data);
    } catch (e) {
      toast.error(t("Failed to load event attendance report."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  return (
    <div className="space-y-4" data-testid="events-reports-page">
      <PageHeader
        title={t("Event Attendance Report")}
        subtitle={t("Summarize RSVP lists, ticket scanner check-in counts, and auditorium seating utilization.")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label={t("Total Event RSVPs")} value={loading ? "..." : data.totalRsvps.toLocaleString()} icon={PartyPopper} tone="warning" />
        <StatCard label={t("Actual Attendance")} value={loading ? "..." : data.totalCheckins.toLocaleString()} icon={Route} tone="default" />
        <StatCard label={t("Avg. Seating Occupancy")} value={loading ? "..." : `${data.avgOccupancy}%`} icon={Armchair} tone="info" />
      </div>

      <Card className="p-4 border border-slate-200 bg-white">
        <div className="text-sm font-semibold text-slate-800 mb-4">{t("RSVP vs Actual Checkin metrics")}</div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="RSVPs" fill="#f97316" radius={[4, 4, 0, 0]} name="Expected RSVPs" />
              <Bar dataKey="Checkins" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual Checkins" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
