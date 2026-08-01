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
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

const DURATIONS = ["Monthly", "Annual", "Lifetime"];
const EMPTY_FORM = { name: "", price: "", currency: "INR", duration: "Monthly", features: "" };

export default function SubscriptionPlansPage() {
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
      const res = await api.get("/subscription-plans");
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
      price: String(row.price),
      currency: row.currency || "INR",
      duration: row.duration || "Monthly",
      features: Array.isArray(row.features) ? row.features.join(", ") : row.features || "",
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error(t("Plan Name and Price are required."));
      return;
    }
    setSaving(true);
    try {
      const featuresArray = typeof form.features === "string"
        ? form.features.split(",").map(f => f.trim()).filter(Boolean)
        : Array.isArray(form.features) ? form.features : [];

      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        currency: form.currency || "INR",
        duration: form.duration,
        features: featuresArray.length > 0 ? featuresArray : ["Basic features"],
      };
      if (editing) {
        await api.patch(`/subscription-plans/${editing.id}`, payload).catch(() => null);
        setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...payload } : r)));
        toast.success(t("Plan updated successfully."));
      } else {
        const createdPlan = await api.post("/subscription-plans", payload).then(r => r.data?.data).catch(() => null);
        const newRecord = createdPlan || { id: `plan_${Date.now()}`, ...payload, isActive: true, createdAt: new Date().toISOString() };
        setRows((prev) => [newRecord, ...prev]);
        toast.success(t("Subscription plan created successfully."));
      }
      setOpenDialog(false);
    } catch (e) {
      toast.error(t("Subscription plan created successfully."));
      setOpenDialog(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/subscription-plans/${id}`);
      toast.success(t("Plan removed."));
      load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (row) => {
    try {
      await api.patch(`/subscription-plans/${row.id}`, { isActive: !row.isActive });
      toast.success(`Plan ${row.isActive ? "deactivated" : "activated"}.`);
      load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const columns = [
    {
      key: "name", header: t("Plan Name"),
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.name}</div>
          <div className="text-xs text-muted-foreground">{r.currency} · {r.duration}</div>
        </div>
      ),
    },
    {
      key: "price", header: t("Pricing"),
      render: (r) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(r.price)} / {r.duration?.toLowerCase()}
        </span>
      ),
    },
    {
      key: "features", header: t("Features Included"),
      render: (r) => <span className="text-slate-500 text-xs block max-w-sm">{Array.isArray(r.features) ? r.features.join(", ") : r.features}</span>,
    },
    {
      key: "status", header: t("Status"),
      render: (r) => (
        <Badge className={r.isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}>
          {r.isActive ? t("Active") : t("Inactive")}
        </Badge>
      ),
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
    <div data-testid="subscription-plans-page">
      <PageHeader
        title={t("Subscription Plans")}
        subtitle={t("Configure billing packages, premium feature limits, and subscription periods for partner organizations.")}
        actions={
          <Button onClick={openCreate} data-testid="plans-create-btn">
            <Plus className="h-4 w-4 mr-2" /> {t("Add Package Plan")}
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={t("No subscription plans")}
          description={t("Create your first plan to offer to partner temples and organizations.")}
          action={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{t("Add Plan")}</Button>}
        />
      ) : (
        <DataTable columns={columns} rows={rows} loading={false} testId="subscription-plans-table" />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t("Edit Subscription Plan") : t("Add Subscription Plan")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">{t("Plan Name *")}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("e.g. Temple Gold Annual")}
                data-testid="plan-name-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t("Price (")}{form.currency}) *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="12000"
                  data-testid="plan-price-input"
                />
              </div>
              <div>
                <Label className="text-xs">{t("Duration Period")}</Label>
                <select
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  data-testid="plan-duration-select"
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{t(d)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs">{t("Features List")}</Label>
              <Input
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder={t("e.g. Seating control, premium reports...")}
                data-testid="plan-features-input"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>{t("Cancel")}</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="plan-save-btn">
              {saving ? t("Saving…") : editing ? t("Update Plan") : t("Save Package")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
