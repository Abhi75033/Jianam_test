/**
 * StanaksPage — D7: Rebuilt per Stanak Document spec.
 * Community and Sub-Sect are FIXED dropdowns.
 * NO Gaccha field. NO Bhagwan fields.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, Home, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

// Community options — FIXED per Stanak document spec
const COMMUNITY_OPTIONS = [
  "Shwetambar", "Digambar", "Sthanakvasi", "Terapanthi", "Other",
];

// Sub-Sect options — FIXED (no Gaccha)
const SUB_SECT_OPTIONS = [
  "Tapa Gaccha", "Khartar Gaccha", "Anchalgaccha", "Maladhari", "Sthanakvasi",
  "Terapanthi", "Yapaniya", "Mulasangh", "Bispanthi", "Terapanthi Digambar",
  "Other",
];

const EMPTY_FORM = {
  name: "",
  community: "Shwetambar",
  subSect: "Sthanakvasi",
  address: "",
  city: "",
  state: "",
  pincode: "",
  contactPhone: "",
  contactEmail: "",
  mukhyaShravak: "",
  capacity: "",
  notes: "",
};

export default function StanaksPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { canDo } = useAuth();
  const canEdit = canDo("TEMPLES", "EDIT");

  const [stanaks, setStanaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadStanaks = () => {
    setLoading(true);
    api
      .get("/temples", { params: { subSect: "Sthanakvasi", q, page: 1, pageSize: 50 } })
      .then((res) => {
        const data = res.data?.data;
        const raw = Array.isArray(data) ? data : data?.items || [];
        const activeOnly = raw.filter((s) => s.status !== "INACTIVE" && !s.isDeleted && !s.deletedAt);
        setStanaks(activeOnly);
      })
      .catch(() => setStanaks([]))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadStanaks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setOpen(true);
  };

  const openEdit = (item) => {
    const rawComm = item.community || "Shwetambar";
    const normalizedComm = rawComm === "Shvetambar" ? "Shwetambar" : rawComm;
    setForm({
      name: item.name || "",
      community: normalizedComm,
      subSect: item.subSect || item.sub_sect || "Sthanakvasi",
      address: item.address || item.fullAddress || "",
      city: item.city || "",
      state: item.state || "",
      pincode: item.pincode || "",
      contactPhone: item.contactPhone || item.phone || "",
      contactEmail: item.contactEmail || item.email || "",
      mukhyaShravak: item.mukhyaShravak || "",
      capacity: item.capacity?.toString() || "",
      notes: item.notes || item.description || "",
    });
    setEditTarget(item);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(t("Sthanak name is required.")); return; }
    if (!form.community) { toast.error(t("Community is required.")); return; }
    if (!form.subSect) { toast.error(t("Sub-Sect is required.")); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: "TEMPLE",
        community: form.community,
        subSect: form.subSect,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        mukhyaShravak: form.mukhyaShravak,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
        notes: form.notes,
      };

      if (editTarget) {
        await api.patch(`/temples/${editTarget.id}`, payload);
        toast.success(t("Sthanak updated successfully."));
      } else {
        await api.post("/temples", payload);
        toast.success(t("Sthanak created successfully."));
      }
      setOpen(false);
      loadStanaks();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    try {
      try {
        await api.delete(`/temples/${targetId}`);
      } catch (err) {
        if (err?.response?.status === 404 || err?.response?.data?.message?.includes("Route not found")) {
          await api.patch(`/temples/${targetId}`, { status: "INACTIVE" });
        } else {
          throw err;
        }
      }
      setStanaks((prev) => prev.filter((item) => item.id !== targetId));
      toast.success(t("Sthanak deleted."));
      setDeleteTarget(null);
      loadStanaks();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const filtered = stanaks.filter((s) => {
    if (s.status === "INACTIVE" || s.isDeleted || s.deletedAt) return false;
    if (!q) return true;
    const ql = q.toLowerCase();
    return (
      s.name?.toLowerCase().includes(ql) ||
      s.city?.toLowerCase().includes(ql) ||
      s.community?.toLowerCase().includes(ql)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800">{t("Sthanak Management")}</h1>
          <p className="text-sm text-slate-500">{t("Manage all Sthanakvasi and related Sthanaks.")}</p>
        </div>
        {canEdit && (
          <Button
            onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            data-testid="stanaks-add-btn"
          >
            <Plus className="w-4 h-4" />
            {t("Add Sthanak")}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("Search by name, city, community…")}
          className="pl-9 h-9"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Home}
          title={t("No Sthanaks found")}
          description={t("Add your first Sthanak using the button above.")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold text-slate-800 text-sm truncate hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-1.5"
                    onClick={() => navigate(`/stanaks/${item.id}`)}
                    title={t("View Sthanak Profile")}
                  >
                    {item.name}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 shrink-0" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {item.city}{item.state ? `, ${item.state}` : ""}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {canEdit && (
                    <>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <PermissionGate action="DELETE">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(item)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </PermissionGate>
                    </>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                  {item.community || "—"}
                </Badge>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                  {item.subSect || item.sub_sect || "—"}
                </Badge>
              </div>

              {/* Contact */}
              {item.contactPhone && (
                <p className="text-xs text-slate-500 mt-2">{item.contactPhone}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? t("Edit Sthanak") : t("Add New Sthanak")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div>
              <Label className="text-xs font-semibold">{t("Sthanak Name *")}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("e.g. Ghatkopar Sthanakvasi Sangh")}
                className="mt-1"
              />
            </div>

            {/* Community — FIXED dropdown */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">{t("Community *")}</Label>
                <select
                  value={form.community}
                  onChange={(e) => setForm({ ...form, community: e.target.value })}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {COMMUNITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{t(opt)}</option>
                  ))}
                </select>
              </div>

              {/* Sub-Sect — FIXED dropdown, NO Gaccha */}
              <div>
                <Label className="text-xs font-semibold">{t("Sub-Sect *")}</Label>
                <select
                  value={form.subSect}
                  onChange={(e) => setForm({ ...form, subSect: e.target.value })}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {SUB_SECT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{t(opt)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <Label className="text-xs font-semibold">{t("Address")}</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder={t("Street address")}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">{t("City")}</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder={t("City")} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">{t("State")}</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder={t("State")} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">{t("Pincode")}</Label>
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="400001" className="mt-1" />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">{t("Contact Number")}</Label>
                <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="9876543210" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">{t("Contact Email")}</Label>
                <Input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="sthanak@email.com" className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">{t("Mukhya Shravak")}</Label>
                <Input value={form.mukhyaShravak} onChange={(e) => setForm({ ...form, mukhyaShravak: e.target.value })} placeholder={t("Name of Mukhya Shravak")} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">{t("Capacity (persons)")}</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder={t("e.g. 150")} className="mt-1" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-xs font-semibold">{t("Notes / Description")}</Label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t("Any additional information about this Sthanak")}
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {saving ? t("Saving…") : editTarget ? t("Save Changes") : t("Create Sthanak")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Delete Sthanak")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {t("Are you sure you want to delete")} <strong>{deleteTarget?.name}</strong>{t("? This action cannot be undone.")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("Cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t("Delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
