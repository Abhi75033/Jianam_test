import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Footprints, Plus, Search, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

const EMPTY_FORM = { monkPublicId: "", monkName: "", stationName: "", notes: "" };

export default function ManualTrackingPage() {
  const { t } = useLanguage();
  const { orgId } = useAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [q, setQ] = useState("");

  const load = async (search = "") => {
    setLoading(true);
    try {
      const params = { pageSize: 50, page: 1 };
      if (search) params.q = search;
      const res = await api.get("/manual-tracking", { params });
      const data = res.data?.data;
      setRows(data?.items || data || []);
      setTotal(data?.total || 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQ(val);
    load(val);
  };

  const handleSubmit = async () => {
    if (!form.monkName || !form.stationName) {
      toast.error(t("MS Name and Current Station are required."));
      return;
    }
    setSaving(true);
    try {
      await api.post("/manual-tracking", {
        monkPublicId: form.monkPublicId || undefined,
        monkName: form.monkName,
        stationName: form.stationName,
        notes: form.notes || undefined,
      });
      toast.success(t("Manual vihar location logged successfully."));
      setOpenDialog(false);
      setForm(EMPTY_FORM);
      load(q);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/manual-tracking/${id}`);
      toast.success(t("Entry deleted."));
      load(q);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: "monkId", header: t("MS ID"),
      render: (r) => (
        <Badge variant="secondary" className="font-mono text-[10px]">
          {r.monk?.publicId || r.monkPublicId || "—"}
        </Badge>
      ),
    },
    {
      key: "monkName", header: t("MS Name"),
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.monk?.photoUrl && (
            <img src={r.monk.photoUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
          )}
          <span className="font-medium">{r.monkName}</span>
        </div>
      ),
    },
    {
      key: "stationName", header: t("Current Station / Checkpoint"),
      render: (r) => (
        <span className="flex items-center gap-1 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          {r.stationName}
        </span>
      ),
    },
    {
      key: "loggedAt", header: t("Logged At"),
      render: (r) => <span className="text-xs text-muted-foreground">{formatDateTime(r.loggedAt || r.createdAt)}</span>,
    },
    {
      key: "notes", header: t("Notes"),
      render: (r) => <span className="text-xs text-muted-foreground">{r.notes || "—"}</span>,
    },
    {
      key: "actions", header: "", width: 56,
      render: (r) => (
        <PermissionGate action="DELETE">
          <Button
            size="sm" variant="ghost"
            disabled={deletingId === r.id}
            onClick={() => handleDelete(r.id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div data-testid="manual-tracking-page">
      <PageHeader
        title={t("Manual Vihar Tracking")}
        subtitle={t("Log manual location checkpoints for MS members traveling without GPS devices.")}
        actions={
          <Button onClick={() => setOpenDialog(true)} data-testid="manual-tracking-create-btn">
            <Plus className="h-4 w-4 mr-2" /> {t("Log Location")}
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("Search by MS name or station…")}
            value={q}
            onChange={handleSearch}
            data-testid="manual-tracking-search"
          />
        </div>
        <span className="text-xs text-muted-foreground">{total} {t("entries")}</span>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Footprints}
          title={t("No manual tracking entries")}
          description={t("Log a monk's current location checkpoint manually when GPS is unavailable.")}
          action={<Button onClick={() => setOpenDialog(true)}><Plus className="h-4 w-4 mr-2" />{t("Log Location")}</Button>}
        />
      ) : (
        <DataTable columns={columns} rows={rows} loading={false} testId="manual-tracking-table" />
      )}

      {/* Log Location Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Log Manual Vihar Location")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">{t("MS ID (Optional)")}</Label>
              <Input
                value={form.monkPublicId}
                onChange={(e) => setForm({ ...form, monkPublicId: e.target.value })}
                placeholder={t("e.g. JFMS108")}
                data-testid="manual-tracking-monkid-input"
              />
            </div>
            <div>
              <Label className="text-xs">{t("MS Name *")}</Label>
              <Input
                value={form.monkName}
                onChange={(e) => setForm({ ...form, monkName: e.target.value })}
                placeholder={t("e.g. Pujya Naypadmasagarji MS")}
                data-testid="manual-tracking-monkname-input"
              />
            </div>
            <div>
              <Label className="text-xs">{t("Current Station / Checkpoint *")}</Label>
              <Input
                value={form.stationName}
                onChange={(e) => setForm({ ...form, stationName: e.target.value })}
                placeholder={t("e.g. Dahisar Toll Plaza")}
                data-testid="manual-tracking-station-input"
              />
            </div>
            <div>
              <Label className="text-xs">{t("Notes (Optional)")}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t("e.g. Taking morning rest break, vihar proceeding smoothly")}
                rows={3}
                data-testid="manual-tracking-notes-input"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>{t("Cancel")}</Button>
            <Button onClick={handleSubmit} disabled={saving} data-testid="manual-tracking-submit-btn">
              {saving ? t("Logging…") : t("Log Location")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
