import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, FileText } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LiveReportPage() {
  const { t } = useLanguage();
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col" data-testid="live-report-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <PageHeader
          title={t("Live Audit Report")}
          subtitle={t("Real-time 100% audit report detailing module coverage, API endpoints, schema verifications, and platform metrics.")}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> {t("Refresh Report")}
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.open("/report.html", "_blank")}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> {t("Open Fullscreen")}
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
        <iframe
          key={key}
          src="/report.html"
          title={t("JiNANAM Live Audit Report")}
          className="w-full h-full border-none"
          style={{ minHeight: "650px" }}
        />
      </div>
    </div>
  );
}
