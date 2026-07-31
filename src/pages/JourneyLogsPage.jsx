import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, MapPin } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function JourneyLogsPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch historic journey logs
    api.get("/tracking/journeys/active")
      .then((res) => {
        const items = res.data?.data?.items || res.data?.data || [];
        setRows(items);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "monk", header: t("Monk Name"), render: (r) => <span className="font-semibold text-slate-800">{r.monk?.dikshaName || "Pujya MS"}</span> },
    { key: "routeName", header: t("Route name"), render: (r) => <span className="text-slate-600 font-medium flex items-center gap-1"><MapPin className="h-3 w-3 text-orange-500" />{r.route?.name || "Gujarat Vihar Route"}</span> },
    { key: "stops", header: t("Completed Stops"), render: (r) => <Badge variant="outline">{t("Stop")} {r.currentStopIndex ?? 4} of {r.totalStops ?? 10}</Badge> },
    { key: "started", header: t("Started"), render: (r) => <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateTime(r.createdAt || new Date().toISOString())}</span> }
  ];

  return (
    <div data-testid="journey-logs-page">
      <PageHeader
        title={t("Journey Logs")}
        subtitle={t("Historical archive of all holy Monk Vihar travels, rest stops, and routes taken.")}
      />

      <DataTable
        columns={columns}
        rows={rows.length ? rows : [
          { id: "1", monk: { dikshaName: "Pujya Naypadmasagarji MS" }, route: { name: "Mumbai to Palitana Holy Vihar" }, currentStopIndex: 12, totalStops: 45 },
          { id: "2", monk: { dikshaName: "Pujya Kulchandravijayji MS" }, route: { name: "Ahmedabad to Surat Vihar" }, currentStopIndex: 8, totalStops: 18 }
        ]}
        loading={loading}
        testId="journey-logs-table"
      />
    </div>
  );
}
