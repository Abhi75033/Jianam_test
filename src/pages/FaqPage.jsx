import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

export default function FaqPage() {
  const { t } = useLanguage();
  const { user, isSuperAdmin } = useAuth();
  const orgId = user?.organizationIds?.[0];

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ question: "", answer: "", category: "General", displayOrder: 0 });

  const loadFaqs = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get(`/faqs/org/${orgId}`);
      setRows(res.data.data || []);
    } catch (e) {
      toast.error(t("Failed to load FAQs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ question: "", answer: "", category: "General", displayOrder: 0 });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ question: row.question, answer: row.answer, category: row.category, displayOrder: row.displayOrder ?? 0 });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.question || !form.answer) {
      toast.error(t("Please fill in both Question and Answer fields."));
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/faqs/${editing.id}`, form);
        toast.success(t("FAQ updated successfully."));
      } else {
        await api.post("/faqs", { ...form, organizationId: orgId });
        toast.success(t("FAQ added successfully."));
      }
      setOpen(false);
      loadFaqs();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete FAQ: "${row.question}"?`)) return;
    try {
      await api.delete(`/faqs/${row.id}`);
      toast.success(t("FAQ deleted."));
      loadFaqs();
    } catch (e) {
      toast.error(t("Failed to delete FAQ."));
    }
  };

  const columns = [
    { key: "question", header: t("Question"), render: (r) => <span className="font-semibold text-slate-800">{r.question}</span> },
    { key: "answer", header: t("Answer"), render: (r) => <span className="text-slate-600 text-xs block max-w-lg truncate">{r.answer}</span> },
    { key: "category", header: t("Category"), render: (r) => <Badge variant="secondary">{r.category}</Badge> },
    { key: "isActive", header: t("Status"), render: (r) => <Badge variant={r.isActive ? "default" : "outline"}>{r.isActive ? t("Active") : t("Inactive")}</Badge> },
    {
      key: "actions", header: "", render: (r) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
          <PermissionGate action="DELETE">
            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(r)}><Trash2 className="h-4 w-4" /></Button>
          </PermissionGate>
        </div>
      )
    }
  ];

  return (
    <div data-testid="faq-page">
      <PageHeader
        title={t("FAQ Management")}
        subtitle={t("Manage frequently asked questions displayed in the mobile and portal guides.")}
        actions={
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> {t("Add FAQ")}</Button>
        }
      />

      <DataTable columns={columns} rows={rows} loading={loading} testId="faq-table" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t("Edit FAQ") : t("Add FAQ")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div><Label className="text-xs">{t("Category")}</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder={t("General / Tracking / Donations")} /></div>
            <div><Label className="text-xs">{t("Question *")}</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder={t("e.g. How do I request a receipt?")} /></div>
            <div><Label className="text-xs">{t("Answer *")}</Label><Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder={t("Type the answer here...")} /></div>
            <div><Label className="text-xs">{t("Display Order")}</Label><Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? t("Saving...") : editing ? t("Update FAQ") : t("Save FAQ")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
