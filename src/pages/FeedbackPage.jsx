import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FeedbackPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const orgId = user?.organizationIds?.[0];

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const loadFeedback = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get("/feedback", {
        params: { organizationId: orgId }
      });
      setRows(res.data.data || []);
    } catch (e) {
      toast.error(t("Failed to load feedback."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const resolveFeedback = async (id, status) => {
    try {
      await api.patch(`/feedback/${id}`, { status });
      toast.success(`Feedback marked as ${status.toLowerCase()}.`);
      loadFeedback();
    } catch (e) {
      toast.error(t("Failed to update feedback status."));
    }
  };

  const columns = [
    { key: "userName", header: t("User"), render: (r) => <span className="font-semibold text-slate-800">{r.userName || `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.trim() || "Anonymous"}</span> },
    { key: "category", header: t("Category"), render: (r) => <Badge variant="secondary">{r.category}</Badge> },
    { key: "comment", header: t("Comment / Suggestion"), render: (r) => <span className="text-slate-600 text-xs block max-w-md whitespace-pre-wrap">{r.comment}</span> },
    { key: "status", header: t("Status"), render: (r) => <Badge className={r.status === "RESOLVED" ? "bg-emerald-500 text-white" : r.status === "DISMISSED" ? "bg-slate-500 text-white" : "bg-amber-500 text-white"}>{r.status}</Badge> },
    {
      key: "actions", header: t("Action"),
      render: (r) => r.status === "PENDING" ? (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-7 text-emerald-600 hover:text-emerald-700" onClick={() => resolveFeedback(r.id, "RESOLVED")}>
            <Check className="h-3 w-3 mr-1" /> {t("Resolve")}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-slate-600 hover:text-slate-700" onClick={() => resolveFeedback(r.id, "DISMISSED")}>
            <X className="h-3 w-3 mr-1" /> {t("Dismiss")}
          </Button>
        </div>
      ) : <span className="text-xs text-slate-400">{r.status}</span>
    }
  ];

  return (
    <div data-testid="feedback-page">
      <PageHeader
        title={t("User Feedback & Suggestions")}
        subtitle={t("Review community suggestions, bug reports, and feature requests sent via mobile app settings.")}
      />

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        testId="feedback-table"
      />
    </div>
  );
}
