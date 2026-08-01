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
import { Image as BannerIcon, Plus, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

const EMPTY_FORM = { title: "", imageUrl: "", deviceType: "MOBILE", redirectUrl: "", displayOrder: "0" };

export default function BannersPage() {
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
      const res = await api.get("/banners");
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
      title: row.title,
      imageUrl: row.imageUrl,
      deviceType: row.deviceType || "MOBILE",
      redirectUrl: row.redirectUrl || "",
      displayOrder: String(row.displayOrder ?? 0),
    });
    setOpenDialog(true);
  };

  const validateImageRatio = (url, deviceType) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const expected = deviceType === "DESKTOP" ? 5.0 : 3.0;
        const tolerance = deviceType === "DESKTOP" ? 0.35 : 0.25;
        if (Math.abs(ratio - expected) > tolerance) {
          resolve({
            valid: false,
            msg: `Image aspect ratio is ${ratio.toFixed(2)}:1. Expected ~${expected}:1 for ${deviceType}.`
          });
        } else {
          resolve({ valid: true });
        }
      };
      img.onerror = () => {
        resolve({ valid: true }); // fallback if CORS restricts loading
      };
      img.src = url;
    });
  };

  const handleSave = async () => {
    if (!form.title || !form.imageUrl) {
      toast.error(t("Title and Image URL are required."));
      return;
    }
    setSaving(true);
    try {
      const validation = await validateImageRatio(form.imageUrl, form.deviceType || "MOBILE");
      if (!validation.valid) {
        toast.error(validation.msg + " Please crop the image or adjust the target device.");
        setSaving(false);
        return;
      }

      const payload = {
        title: form.title,
        imageUrl: form.imageUrl,
        deviceType: form.deviceType || "MOBILE",
        redirectUrl: form.redirectUrl || undefined,
        displayOrder: parseInt(form.displayOrder) || 0,
      };
      if (editing) {
        await api.patch(`/banners/${editing.id}`, payload);
        toast.success(t("Banner updated."));
      } else {
        await api.post("/banners", payload);
        toast.success(t("Banner added."));
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
      await api.delete(`/banners/${id}`);
      toast.success(t("Banner removed."));
      load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (row) => {
    try {
      await api.patch(`/banners/${row.id}`, { isActive: !row.isActive });
      toast.success(`Banner ${row.isActive ? "deactivated" : "activated"}.`);
      load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const columns = [
    {
      key: "imageUrl", header: t("Preview"), width: 80,
      render: (r) => (
        <div className="h-10 w-16 bg-slate-100 rounded overflow-hidden">
          <img src={r.imageUrl} alt={r.title} className="h-full w-full object-cover" />
        </div>
      ),
    },
    {
      key: "deviceType", header: t("Target Device"),
      render: (r) => (
        <Badge variant="outline" className={r.deviceType === "DESKTOP" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-orange-200 text-orange-700 bg-orange-50"}>
          {r.deviceType || "MOBILE"}
        </Badge>
      ),
    },
    {
      key: "title", header: t("Banner Title"),
      render: (r) => <span className="font-semibold text-slate-800">{r.title}</span>,
    },
    {
      key: "redirectUrl", header: t("Redirects To"),
      render: (r) => r.redirectUrl ? (
        <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />{r.redirectUrl}
        </span>
      ) : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      key: "order", header: t("Position"),
      render: (r) => <Badge variant="secondary">#{r.displayOrder}</Badge>,
    },
    {
      key: "active", header: t("Active"),
      render: (r) => (
        <Switch checked={r.isActive} onCheckedChange={() => toggleActive(r)} />
      ),
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
    <div data-testid="banners-page">
      <PageHeader
        title={t("Promotional Banners")}
        subtitle={t("Configure hero slideshow banners displayed on the mobile app home screen.")}
        actions={
          <Button onClick={openCreate} data-testid="banners-create-btn">
            <Plus className="h-4 w-4 mr-2" /> {t("Add Banner")}
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={BannerIcon}
          title={t("No banners configured")}
          description={t("Add your first promotional banner to show on the mobile app home screen.")}
          action={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{t("Add Banner")}</Button>}
        />
      ) : (
        <DataTable columns={columns} rows={rows} loading={false} testId="banners-table" />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t("Edit Banner") : t("Add Home Screen Banner")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">{t("Title *")}</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t("e.g. Paryushan Special Live Streams")}
                data-testid="banner-title-input"
              />
            </div>
            <div>
              <Label className="text-xs">{t("Image URL *")}</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/banner.png"
                data-testid="banner-imageurl-input"
              />
            </div>
            <div>
              <Label className="text-xs">{t("Target Device / Layout Type *")}</Label>
              <select
                className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.deviceType || "MOBILE"}
                onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
              >
                <option value="MOBILE">{t("Mobile App Banner (3:1 Aspect Ratio)")}</option>
                <option value="DESKTOP">{t("Web Portal Banner (5:1 Aspect Ratio)")}</option>
              </select>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 space-y-1">
              <span className="text-xs font-bold text-amber-800 block">{t("📐 Banner Sizing Instructions")}</span>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                {form.deviceType === "DESKTOP" 
                  ? t("Desktop banners require a strict 5:1 aspect ratio constraint (e.g. 1500 x 300 px recommended). Standard limits will enforce ratio validation.") 
                  : t("Mobile banners require a strict 3:1 aspect ratio constraint (e.g. 1200 x 400 px recommended). Standard limits will enforce ratio validation.")}
              </p>
            </div>
            <div>
              <Label className="text-xs">{t("Redirect Link / Route")}</Label>
              <Input
                value={form.redirectUrl}
                onChange={(e) => setForm({ ...form, redirectUrl: e.target.value })}
                placeholder={t("/events or website URL")}
                data-testid="banner-redirect-input"
              />
            </div>
            <div>
              <Label className="text-xs">{t("Display Order / Position")}</Label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                placeholder="1"
                data-testid="banner-order-input"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>{t("Cancel")}</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="banner-save-btn">
              {saving ? t("Saving…") : editing ? t("Update Banner") : t("Save Banner")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
