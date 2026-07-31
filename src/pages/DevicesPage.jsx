import GenericListPage from "@/components/common/GenericListPage";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DevicesPage() {
  const { t } = useLanguage();
  const columns = [
    { key: "publicId", header: t("ID"), width: 120, render: (r) => <Badge variant="outline" className="font-mono text-[10px]">{r.publicId || "—"}</Badge> },
    { key: "name", header: t("Device"), render: (r) => (
      <div>
        <div className="font-medium">{r.name || "—"}</div>
        <div className="text-xs text-muted-foreground">{r.deviceType || "GPS"} · {r.imei}</div>
      </div>
    ) },
    { key: "assignedTo", header: t("Assigned To"), render: (r) => r.assignedMonk?.dikshaName || "—" },
    { key: "battery", header: t("Battery"), render: (r) => (
      <div className="w-24">
        <div className="text-xs font-mono-num mb-1">{r.batteryLevel ?? "—"}%</div>
        <Progress value={r.batteryLevel || 0} className="h-1.5" />
      </div>
    ) },
    { key: "lastSeen", header: t("Last Seen"), render: (r) => <span className="text-xs">{formatDateTime(r.lastPingAt || r.lastSeenAt)}</span> },
    { key: "status", header: t("Status"), render: (r) => <StatusBadge status={r.status || "ACTIVE"} /> },
  ];
  return (
    <GenericListPage title={t("devices.title", "Devices")} subtitle={t("GPS trackers assigned to monks.")}
      endpoint="/devices" columns={columns} testId="devices-page"
      emptyTitle={t("No devices registered")} emptyDescription={t("Register a GPS tracker to enable real-time monk tracking.")} />
  );
}

// Also export a shared Progress-friendly wrapper for reuse
