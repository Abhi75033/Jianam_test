import { useState } from "react";
import GenericListPage from "@/components/common/GenericListPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityFormDialog } from "@/components/common/EntityFormDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SupportTicketsPage() {
  const { t } = useLanguage();
  const { user, isSuperAdmin } = useAuth();
  const [openCreate, setOpenCreate] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  
  // Selected ticket for details modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Status update states
  const [statusVal, setStatusVal] = useState("OPEN");
  const [resolutionVal, setResolutionVal] = useState("");
  const [saving, setSaving] = useState(false);

  // When a ticket is opened, populate its status and resolution
  const handleOpenDetails = (ticket) => {
    setSelectedTicket(ticket);
    setStatusVal(ticket.status || "OPEN");
    setResolutionVal(ticket.resolution || "");
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSaving(true);
    try {
      await api.patch(`/support-tickets/${selectedTicket.id}/status`, {
        status: statusVal,
        resolution: resolutionVal,
      });
      toast.success(t("Ticket status updated successfully."));
      setSelectedTicket(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Only administrative users (excluding Super Admin) can raise support tickets
  const nonAdminRoles = ["MEMBER", "NON_JAIN_MEMBER"];
  const canRaise = user && !nonAdminRoles.includes(user.primaryRoleKey) && !isSuperAdmin;

  const columns = [
    { key: "publicId", header: t("ID"), width: 120, render: (r) => <Badge variant="outline" className="font-mono text-[10px]">{r.publicId || "—"}</Badge> },
    { key: "subject", header: t("Subject"), render: (r) => (
      <div>
        <div className="font-medium">{r.subject}</div>
        <div className="text-xs text-muted-foreground truncate max-w-xs">{r.description?.slice(0, 60)}</div>
      </div>
    ) },
    { key: "type", header: t("Type"), render: (r) => <Badge variant="outline" className="text-[10px]">{r.type}</Badge> },
    { key: "raisedBy", header: t("Raised By"), render: (r) => r.raisedByUser?.mobile || "—" },
    { key: "at", header: t("Created"), render: (r) => formatDateTime(r.createdAt) },
    { key: "status", header: t("Status"), render: (r) => <StatusBadge status={r.status || "OPEN"} /> },
    {
      key: "actions",
      header: t("Actions"),
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleOpenDetails(r)}
          className="text-xs h-7 px-2"
          data-testid={`ticket-view-${r.publicId}`}
        >
          {isSuperAdmin ? t("View & Update") : t("View Details")}
        </Button>
      ),
    }
  ];

  return (
    <>
      <GenericListPage
        key={reloadKey}
        title={t("support.title", "Support Tickets")}
        subtitle={t("All support requests including paid event and calendar corrections.")}
        endpoint="/support-tickets"
        columns={columns}
        testId="support-tickets-page"
        extraActions={
          canRaise && (
            <Button onClick={() => setOpenCreate(true)} data-testid="tickets-create-btn">
              <Plus className="h-4 w-4 mr-2" /> {t("Raise Ticket")}
            </Button>
          )
        }
      />

      <EntityFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        title={t("Raise Support Ticket")}
        endpoint="/support-tickets"
        onSaved={() => setReloadKey((k) => k + 1)}
        testId="support-ticket-form"
        fields={[
          { name: "subject", label: t("Subject"), required: true },
          { name: "description", label: t("Description"), type: "textarea", required: true },
          { name: "type", label: t("Type"), type: "select", required: true, options: [
            { value: "PAID_EVENT_REQUEST", label: t("Paid Event Request") },
            { value: "EVENT_DELETE_REQUEST", label: t("Event Delete Request") },
            { value: "CALENDAR_CORRECTION", label: t("Calendar Correction") },
            { value: "INCORRECT_INFO", label: t("Incorrect Info") },
            { value: "OTHER", label: t("Other") },
          ]},
        ]}
      />

      {/* Ticket Details & Action Update Dialog */}
      <Dialog open={Boolean(selectedTicket)} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-md" data-testid="ticket-detail-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("Support Ticket Details")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 font-sans text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <div>
                <span className="text-xs text-muted-foreground block">{t("Ticket ID")}</span>
                <span className="font-mono font-semibold">{selectedTicket?.publicId}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">{t("Category / Type")}</span>
                <span className="font-semibold">{selectedTicket?.type}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <div>
                <span className="text-xs text-muted-foreground block">{t("Raised By Admin")}</span>
                <span className="font-semibold">{selectedTicket?.raisedByUser?.firstName} {selectedTicket?.raisedByUser?.lastName} ({selectedTicket?.raisedByUser?.mobile || "—"})</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">{t("Creation Date")}</span>
                <span>{selectedTicket && formatDateTime(selectedTicket.createdAt)}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">{t("Subject")}</span>
              <span className="font-bold text-slate-800 text-sm">{selectedTicket?.subject}</span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block mb-1">{t("Description / Concern")}</span>
              <p className="bg-slate-50 border border-slate-100 rounded-md p-3 text-slate-700 font-medium whitespace-pre-wrap">
                {selectedTicket?.description || "No description provided."}
              </p>
            </div>

            {isSuperAdmin ? (
              <form onSubmit={handleUpdateStatus} className="space-y-3 pt-2 border-t">
                <span className="text-xs font-bold text-primary block">{t("Super Admin Actions")}</span>
                <div>
                  <Label className="text-xs">{t("Update Status")}</Label>
                  <SearchableSelect
                    value={statusVal}
                    onValueChange={setStatusVal}
                    options={[
                      { value: "OPEN", label: t("Open") },
                      { value: "IN_PROGRESS", label: t("Pending / In Progress") },
                      { value: "RESOLVED", label: t("Resolved") },
                      { value: "CLOSED", label: t("Closed") },
                    ]}
                    placeholder={t("Select Status")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("Resolution Notes")}</Label>
                  <Textarea
                    value={resolutionVal}
                    onChange={(e) => setResolutionVal(e.target.value)}
                    placeholder={t("Enter support ticket resolution notes...")}
                    rows={3}
                    className="mt-1 text-xs"
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="ghost" onClick={() => setSelectedTicket(null)}>{t("Cancel")}</Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {t("Update Ticket")}
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{t("Current Status")}</span>
                  <StatusBadge status={selectedTicket?.status || "OPEN"} />
                </div>
                {selectedTicket?.resolution && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">{t("Resolution")}</span>
                    <p className="bg-green-50/50 border border-green-100 rounded-md p-3 text-slate-700 font-medium">
                      {selectedTicket.resolution}
                    </p>
                  </div>
                )}
                <DialogFooter>
                  <Button onClick={() => setSelectedTicket(null)} className="w-full">
                    {t("Close")}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
