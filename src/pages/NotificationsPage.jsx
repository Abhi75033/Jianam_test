import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Bell } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notifications/my")
      .then((res) => setRows(res.data?.data?.items || res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const markOpened = async (id) => {
    try { await api.post(`/notifications/${id}/opened`); } catch {}
    setRows((r) => r.map((n) => n.id === id ? { ...n, openedAt: new Date().toISOString() } : n));
  };

  return (
    <div data-testid="notifications-page">
      <PageHeader title={t("Notifications")} subtitle={t("In-app notification inbox.")} />
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState title={t("You're all caught up")} icon={Bell} />
      ) : (
        <div className="space-y-2 max-w-3xl">
          {rows.map((n) => (
            <Card
              key={n.id}
              className={`p-4 rounded-md border-border cursor-pointer hover:shadow-sm transition-all ${!n.openedAt ? "border-l-4 border-l-primary" : ""}`}
              onClick={() => markOpened(n.id)}
              data-testid={`notification-${n.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{n.body || n.message}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">{n.channel || "IN_APP"}</Badge>
                    <Badge variant="outline" className="text-[10px]">{n.category || "SERVICE"}</Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{formatDateTime(n.createdAt)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
