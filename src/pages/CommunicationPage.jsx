import { useState } from "react";
import GenericListPage from "@/components/common/GenericListPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityFormDialog } from "@/components/common/EntityFormDialog";
import { formatDateTime } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgs, orgOptions } from "@/hooks/useOrgs";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CommunicationPage() {
  const { t } = useLanguage();
  const { user, canDo } = useAuth();
  const { orgs } = useOrgs();
  const orgId = user?.organizationIds?.[0];
  const [openCreate, setOpenCreate] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const columns = [
    { key: "from", header: t("From"), render: (r) => r.fromOrg?.name || "—" },
    { key: "to", header: t("To"), render: (r) => r.toOrg?.name || <Badge variant="outline" className="text-[10px]">BROADCAST</Badge> },
    { key: "message", header: t("Message"), render: (r) => <div className="font-medium max-w-md truncate">{r.message}</div> },
    { key: "sentAt", header: t("Sent"), render: (r) => formatDateTime(r.createdAt) },
  ];
  return (
    <>
      <GenericListPage
        key={reloadKey}
        title={t("Communication")}
        subtitle={t("Org-to-org messages, notices, and coordination.")}
        endpoint={orgId ? `/communication/org/${orgId}` : `/communication`}
        columns={columns}
        testId="communication-page"
        extraActions={canDo("COMMUNICATION", "CREATE") && (
          <Button onClick={() => setOpenCreate(true)} data-testid="comm-create-btn">
            <Plus className="h-4 w-4 mr-2" /> {t("New Message")}
          </Button>
        )}
      />
      <EntityFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        title={t("New Message")}
        endpoint="/communication/messages"
        onSaved={() => setReloadKey((k) => k + 1)}
        testId="comm-form"
        fields={[
          { name: "organizationId", label: t("From organization"), type: "select", required: true, options: orgOptions(orgs) },
          { name: "toOrgId", label: t("To organization (leave empty to broadcast)"), type: "select", options: orgOptions(orgs) },
          { name: "message", label: t("Message"), type: "textarea", required: true },
        ]}
        initial={{ organizationId: orgId }}
      />
    </>
  );
}
