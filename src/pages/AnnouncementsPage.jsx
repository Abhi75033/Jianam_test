import { useState } from "react";
import GenericListPage from "@/components/common/GenericListPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityFormDialog } from "@/components/common/EntityFormDialog";
import { formatDateTime } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AnnouncementsPage() {
  const { t } = useLanguage();
  const { canDo } = useAuth();
  const [openCreate, setOpenCreate] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const columns = [
    { key: "title", header: t("Announcement"), render: (r) => (
      <div>
        <div className="font-medium">{r.title}</div>
        <div className="text-xs text-muted-foreground truncate max-w-md">{r.body || r.message || r.description}</div>
      </div>
    ) },
    { key: "audience", header: t("Audience"), render: (r) => r.visibilityConfig?.audience || "All" },
    { key: "publishedAt", header: t("Published"), render: (r) => formatDateTime(r.publishedAt || r.createdAt) },
  ];
  return (
    <>
      <GenericListPage
        key={reloadKey}
        title={t("announcements.title", "Announcements")}
        subtitle={t("Platform-wide and org-scoped announcements.")}
        endpoint="/announcements"
        columns={columns}
        testId="announcements-page"
        extraActions={canDo("ANNOUNCEMENTS", "CREATE") && (
          <Button onClick={() => setOpenCreate(true)} data-testid="announcements-create-btn">
            <Plus className="h-4 w-4 mr-2" /> {t("New Announcement")}
          </Button>
        )}
      />
      <EntityFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        title={t("New Announcement")}
        endpoint="/announcements"
        onSaved={() => setReloadKey((k) => k + 1)}
        testId="announcement-form"
        fields={[
          { name: "title", label: t("Title"), required: true },
          { name: "body", label: t("Message"), type: "textarea", required: true },
        ]}
      />
    </>
  );
}
