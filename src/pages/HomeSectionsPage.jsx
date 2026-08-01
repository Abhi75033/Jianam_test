import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { LayoutTemplate, Plus, Pencil, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

const SECTION_TYPES = ["Carousel", "Grid", "List", "Horizontal Cards"];
const EMPTY_FORM = { name: "", sectionType: "Carousel", displayOrder: "0" };

export default function HomeSectionsPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/home-sections");
      setRows(res.data?.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setOpenDialog(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name,
      sectionType: row.sectionType || "Carousel",
      displayOrder: String(row.displayOrder ?? 0),
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error(t("Section Name is required.")); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        sectionType: form.sectionType,
        displayOrder: parseInt(form.displayOrder) || 0,
      };
      if (editing) {
        await api.patch(`/home-sections/${editing.id}`, payload);
        toast.success(t("Home section updated."));
      } else {
        await api.post("/home-sections", payload);
        toast.success(t("Home section added."));
      }
      setOpenDialog(false);
      load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/home-sections/${id}`);
      toast.success(t("Section removed."));
      load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (row) => {
    try {
      await api.patch(`/home-sections/${row.id}`, { isActive: !row.isActive });
      toast.success(`Section ${row.isActive ? "deactivated" : "activated"}.`);
      load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const columns = [
    {
      key: "name", header: t("Section Display Name"),
      render: (r) => <span className="font-semibold text-slate-800">{r.name}</span>,
    },
    {
      key: "sectionType", header: t("UI Component Style"),
      render: (r) => <Badge variant="outline">{r.sectionType}</Badge>,
    },
    {
      key: "order", header: t("Position"),
      render: (r) => <Badge variant="secondary">#{r.displayOrder}</Badge>,
    },
    {
      key: "status", header: t("Status"),
      render: (r) => r.isActive
        ? <Badge className="bg-emerald-500 text-white flex items-center w-fit gap-1"><Check className="h-3 w-3" />{t("Live")}</Badge>
        : <Badge variant="secondary">{t("Inactive")}</Badge>,
    },
    {
      key: "active", header: t("Toggle"),
      render: (r) => <Switch checked={r.isActive} onCheckedChange={() => toggleActive(r)} />,
    },
    {
      key: "actions", header: "", width: 80,
      render: (r) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <PermissionGate action="DELETE">
            <Button
              size="sm" variant="ghost"
              disabled={deletingId === r.id}
              onClick={() => handleDelete(r.id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <div data-testid="home-sections-page">
      <PageHeader
        title={t("Home Screen Layout Sections")}
        subtitle={t("Manage dynamic visual sections and dashboard feed widgets visible in the mobile application.")}
        actions={
          <Button onClick={openCreate} data-testid="home-sections-create-btn">
            <Plus className="h-4 w-4 mr-2" /> {t("Add Layout Section")}
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title={t("No home sections configured")}
          description={t("Add layout sections to customize the mobile app home screen widget order.")}
          action={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{t("Add Layout Section")}</Button>}
        />
      ) : (
        <DataTable columns={columns} rows={rows} loading={false} testId="home-sections-table" />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t("Edit Home Section") : t("Add Home Page Widget")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">{t("Section Display Name *")}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("e.g. Daily Quotes & Spiritual Counters")}
                data-testid="section-name-input"
              />
            </div>
            <div>
              <Label className="text-xs">{t("UI Component Style")}</Label>
              <select
                className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.sectionType}
                onChange={(e) => setForm({ ...form, sectionType: e.target.value })}
                data-testid="section-type-select"
              >
                {SECTION_TYPES.map((tItem) => (
                  <option key={tItem} value={tItem}>{t(tItem)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">{t("Position / Display Order")}</Label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                placeholder="1"
                data-testid="section-order-input"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>{t("Cancel")}</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="section-save-btn">
              {saving ? t("Saving…") : editing ? t("Update Section") : t("Save Section")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
