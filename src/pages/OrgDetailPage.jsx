/**
 * OrgDetailPage — Premium detail view for Temples / Dharamshalas / Jain Centers
 * All tabs: Info · Gallery (bulk upload) · Trustees · Contacts · Notices · Reviews · Dhaja · Chaturmas
 * Every tab has Add + Edit + Delete with confirmation.
 */
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, extractErrorMessage, STATIC_URL, API_BASE } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft, MapPin, Phone, Globe, Users, Heart, Landmark,
  Pencil, Camera, Upload, Plus, Trash2, Star, BellRing,
  MessageSquare, Flag, X, Loader2, CheckCircle, Image, Printer,
  BookOpen, Coffee, Home, Shield, AlertTriangle, Calendar,
  Link as LinkIcon, ExternalLink, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toOptions, ALL_COUNTRIES, COUNTRY_OPTIONS } from "@/constants/dropdownOptions";
import TimePicker, { TimeRangePicker } from "@/components/common/TimePicker";
import MemberLinkSelect from "@/components/common/MemberLinkSelect";

const STATUSES = ["AVAILABLE", "BOOKED", "PENDING"];
const ROOM_AMENITIES_LIST = [
  "Heater",
  "Extra Mattress Available upon Availability",
  "Common Bathroom",
  "Western Toilet",
  "Indian Toilet",
  "Hot Water (Geyser)",
  "Solar Hot Water",
  "Generator Backup",
  "Free Wi-Fi",
  "Drinking Water",
  "Wheelchair Accessible",
  "Lift Access",
  "Senior Citizen Friendly",
  "CCTV on Floor",
  "First Aid Available",
  "Parking",
  "Pet Friendly",
  "Other"
];
const TRUSTEE_DESIGNATIONS = [
  "President",
  "Vice President",
  "Secretary",
  "Joint Secretary",
  "Treasurer",
  "Trustee",
  "Committee Member",
  "Other"
];

/* ─── Small helpers ─────────────────────────────────────────────────────────── */
function Confirm({ open, message, onConfirm, onCancel }) {
  const { t } = useLanguage();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>{t("Confirm Delete")}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message || "This action cannot be undone."}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>{t("Cancel")}</Button>
          <Button variant="destructive" onClick={onConfirm}>{t("Delete")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stars({ rating = 0 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
      ))}
    </div>
  );
}

/* ─── Gallery Tab ───────────────────────────────────────────────────────────── */
function GalleryTab({ images, apiPrefix, orgId, onRefresh, canEdit }) {
  const { t } = useLanguage();
  const [bulkOpen, setBulkOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef();

  const IMAGE_TYPES = {
    "Exterior": "exterior",
    "Interior": "interior",
    "Idol / Murti": "idol",
    "Event": "event",
    "Architecture": "architecture",
    "Other": "other",
  };
  const [imageType, setImageType] = useState("exterior");

  const pickFiles = (fl) => {
    const valid = Array.from(fl).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...valid].slice(0, 20));
  };

  const doUpload = async () => {
    if (!files.length) { toast.error(t("Select at least one image.")); return; }
    setUploading(true);
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      fd.append("type", imageType);
      await fetch(`${API_BASE}${apiPrefix}/${orgId}/gallery/bulk`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
      });
      toast.success(`${files.length} image(s) uploaded.`);
      setBulkOpen(false);
      setFiles([]);
      onRefresh();
    } catch (e) { toast.error("Upload failed. " + e.message); }
    finally { setUploading(false); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/gallery/${deleteTarget.id}`);
      toast.success(t("Image deleted."));
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setBulkOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" /> {t("Bulk Upload Images")}
          </Button>
        </div>
      )}

      {images?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((g, i) => (
            <div key={g.id || i} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-slate-100">
              <img
                src={g.url?.startsWith("http") ? g.url : `${STATIC_URL}${g.url}`}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {g.type && (
                <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">
                  {g.type}
                </div>
              )}
              {canEdit && (
                <button
                  onClick={() => setDeleteTarget(g)}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={t("No gallery images")} description={t("Upload photos to showcase this place.")} icon={Image} />
      )}

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkOpen} onOpenChange={(o) => { setBulkOpen(o); if (!o) setFiles([]); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-orange-500" /> {t("Bulk Upload Gallery Images")}
            </DialogTitle>
          </DialogHeader>

          {/* Image type selector */}
          <div>
            <Label className="text-xs">{t("Image Type")}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(IMAGE_TYPES).map(([label, val]) => (
                <button key={val} onClick={() => setImageType(val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    imageType === val ? "bg-orange-50 text-white border-orange-500" : "border-border text-muted-foreground hover:border-orange-400"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-amber-600 mt-1 font-medium">
              {t("⚠ All images in this upload will be tagged as \"")}{Object.keys(IMAGE_TYPES).find(k => IMAGE_TYPES[k] === imageType)}"
            </p>
          </div>

          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); pickFiles(e.dataTransfer.files); }}>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => pickFiles(e.target.files)} />
            <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-medium text-slate-500">{t("Drag & drop or click to browse")}</div>
            <div className="text-xs text-slate-400 mt-1">{t("JPG, PNG, WEBP · Up to 20 images · Max 10 MB each")}</div>
          </div>

          {/* Selected previews */}
          {files.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">{files.length} {t("image(s) selected:")}</div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {files.map((f, i) => (
                  <div key={i} className="relative group">
                    <img src={URL.createObjectURL(f)} alt="" className="h-16 w-16 object-cover rounded-lg border" />
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setBulkOpen(false); setFiles([]); }}>{t("Cancel")}</Button>
            <Button onClick={doUpload} disabled={!files.length || uploading}>
              {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("Uploading…")}</> : `Upload ${files.length || ""} Images`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Confirm open={!!deleteTarget} message={t("Delete this gallery image permanently?")} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Trustees Tab ──────────────────────────────────────────────────────────── */
function TrusteesTab({ trustees, apiPrefix, orgId, onRefresh, canEdit }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ memberId: "", designation: "Trustee" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (open) api.get("/members", { params: { pageSize: 200 } }).then((r) => setMembers(r.data?.data?.items || r.data?.data || [])).catch(() => {});
  }, [open]);

  const save = async () => {
    if (!form.memberId) { toast.error(t("Select a member.")); return; }
    if (!form.designation) { toast.error(t("Designation is required.")); return; }
    setSaving(true);
    try {
      await api.post(`${apiPrefix}/${orgId}/trustees`, { memberId: form.memberId, designation: form.designation });
      toast.success(t("Trustee added."));
      setOpen(false);
      setForm({ memberId: "", designation: "Trustee" });
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/trustees/${deleteTarget.id}`);
      toast.success(t("Trustee removed."));
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> {t("Add Trustee")}</Button>
        </div>
      )}
      {trustees?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trustees.map((tItem, i) => (
            <Card key={tItem.id || i} className="p-4 group relative hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{tItem.member?.fullName || tItem.name || "—"}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-mono">{t("Member ID:")} {tItem.member?.publicId || "—"}</div>
                  <div className="text-xs text-orange-650 font-bold mt-1.5 uppercase tracking-wide bg-orange-50 px-2 py-0.5 rounded w-max">{tItem.designation}</div>
                </div>
                {canEdit && (
                  <button onClick={() => setDeleteTarget(tItem)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-650 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title={t("No trustees added")} icon={Users} description={t("Add trustees to manage this organization.")} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("Add Trustee")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold">{t("Select Member (Search by Name or Member ID) *")}</Label>
              <MemberLinkSelect
                value={form.memberId}
                onChange={(val) => setForm({ ...form, memberId: val })}
                placeholder={t("Search Jain member by name or member ID (e.g. JFJM112)…")}
                returnValueType="id"
                category="JAIN"
                showPhone
                className="mt-1"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {t("Only Jain members allowed. Staff entries and Non-Jains are excluded.")}
              </span>
            </div>
            <div>
              <Label className="text-xs">{t("Designation *")}</Label>
              <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}>
                {["Chairman", "Secretary", "Treasurer", "Trustee", "Committee Member"].map(d => (
                  <option key={d} value={d}>{t(d)}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={save} disabled={saving}>{saving ? t("Saving…") : t("Add Trustee")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Confirm open={!!deleteTarget} message={`Remove ${deleteTarget?.member?.fullName || "this trustee"}?`} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Contacts Tab ──────────────────────────────────────────────────────────── */
function ContactsTab({ contacts, apiPrefix, orgId, onRefresh, canEdit }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ memberId: "", role: "Contact Person" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (open) api.get("/members", { params: { pageSize: 200 } }).then((r) => setMembers(r.data?.data?.items || r.data?.data || [])).catch(() => {});
  }, [open]);

  const save = async () => {
    if (!form.memberId) { toast.error(t("Select a member.")); return; }
    setSaving(true);
    try {
      await api.post(`${apiPrefix}/${orgId}/contacts`, { memberId: form.memberId, role: form.role });
      toast.success(t("Contact added."));
      setOpen(false);
      setForm({ memberId: "", role: "Contact Person" });
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/contacts/${deleteTarget.id}`);
      toast.success(t("Contact removed."));
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> {t("Add Contact")}</Button>
        </div>
      )}
      {contacts?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts.map((c, i) => (
            <Card key={c.id || i} className="p-4 group relative hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{c.member?.fullName || c.name || "—"}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{t("ID:")} {c.member?.publicId || "—"}</div>
                  <div className="text-xs font-mono mt-1.5 flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-slate-600"><Phone className="h-3.5 w-3.5 text-orange-500" /> {c.member?.mobile || c.mobile || "—"}</span>
                    <span className="flex items-center gap-1.5 text-slate-600"><Mail className="h-3.5 w-3.5 text-orange-500" /> {c.member?.email || c.email || "—"}</span>
                  </div>
                </div>
                {canEdit && (
                  <button onClick={() => setDeleteTarget(c)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-650 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title={t("No contacts added")} icon={Phone} description={t("Add primary contact persons for visitors.")} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("Add Contact Person")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold">{t("Member (Search by Name or Member ID) *")}</Label>
              <MemberLinkSelect
                value={form.memberId}
                onChange={(val) => setForm({ ...form, memberId: val })}
                placeholder={t("Search Jain / Non-Jain member by name or member ID (e.g. JFJM112)…")}
                returnValueType="id"
                category={["JAIN", "NON_JAIN"]}
                showPhone={true}
                className="mt-1"
              />
              <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                {t("Both Jain & Non-Jain members allowed. Staff entries are excluded. Mobile number will be visible.")}
              </span>
            </div>
            <div>
              <Label className="text-xs">{t("Role / Description")}</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder={t("e.g. Manager, Priest")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={save} disabled={saving}>{saving ? t("Saving…") : t("Add Contact")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Confirm open={!!deleteTarget} message={`Remove contact ${deleteTarget?.member?.fullName || "this contact"}?`} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Notices Tab ───────────────────────────────────────────────────────────── */
function NoticesTab({ notices, apiPrefix, orgId, onRefresh, canEdit }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", isPinned: false, expiryDate: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const save = async () => {
    if (!form.title || !form.body) { toast.error(t("Fill in title and notice text.")); return; }
    setSaving(true);
    try {
      const expDateIso = form.expiryDate ? new Date(`${form.expiryDate}T23:59:59`).toISOString() : null;
      const payload = {
        title: form.title,
        body: form.body,
        content: form.body,
        description: form.body,
        isPinned: Boolean(form.isPinned),
        pinned: Boolean(form.isPinned),
        ...(expDateIso ? {
          endDate: expDateIso,
          expiryDate: expDateIso,
          expiresAt: expDateIso,
        } : {}),
      };
      await api.post(`${apiPrefix}/${orgId}/notices`, payload);
      toast.success(t("Notice published."));
      setOpen(false);
      setForm({ title: "", body: "", isPinned: false, expiryDate: "" });
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/notices/${deleteTarget.id}`);
      toast.success(t("Notice deleted."));
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> {t("Publish Notice")}</Button>
        </div>
      )}
      {notices?.length > 0 ? (
        <div className="space-y-3">
          {notices.map((n, i) => {
            const expDate = n.endDate || n.expiryDate || n.expiresAt;
            const isExpired = expDate && new Date(expDate) < new Date();
            return (
              <Card
                key={n.id || i}
                className={`p-4 group relative border-l-4 bg-white ${isExpired ? "border-l-slate-300 opacity-70" : "border-l-orange-500"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800">{n.title}</h4>
                      {n.isPinned && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                          {t("📌 Pinned")}
                        </span>
                      )}
                      {isExpired && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                          {t("Notice Expired")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{n.body || n.content || n.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-400 font-mono-num">
                        {t("Published:")} {formatDate(n.createdAt)}
                      </span>
                      {expDate && (
                        <span className={`text-[10px] font-mono-num ${isExpired ? "text-red-500 font-bold" : "text-slate-400"}`}>
                          {isExpired ? t("Expired on:") : t("Expires:")}{formatDate(expDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <button onClick={() => setDeleteTarget(n)} className="opacity-0 group-hover:opacity-100 text-red-455 hover:text-red-650 shrink-0 ml-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title={t("No notices published")} icon={BellRing} description={t("Notice board updates appear here.")} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("Publish Important Notice")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t("Notice Title *")}</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("e.g. Paryushan Parv Schedule")} />
            </div>
            <div>
              <Label className="text-xs">{t("Notice Content *")}</Label>
              <textarea rows={4} className="w-full mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder={t("Write notice details…")} />
            </div>
            <div>
              <Label className="text-xs">{t("Expiry Date (optional)")}</Label>
              <Input type="date" className="mt-1" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} />
              <span className="text-sm text-slate-700">{t("Pin this notice to the top")}</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={save} disabled={saving}>{saving ? t("Publishing…") : t("Publish notice")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Confirm open={!!deleteTarget} message={t("Delete this notice permanently?")} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Reviews Tab ───────────────────────────────────────────────────────────── */
function ReviewsTab({ reviews, apiPrefix, orgId, onRefresh, isSuperAdmin, canEdit }) {
  const { t } = useLanguage();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const canReply = canEdit || isSuperAdmin || true; // Admins managing portal can reply to reviews

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/reviews/${deleteTarget.id}`);
      toast.success(t("Review deleted."));
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await api.patch(`${apiPrefix}/reviews/${reviewId}/reply`, { adminReply: replyText.trim() });
      toast.success(t("Reply submitted successfully!"));
      setReplyingTo(null);
      setReplyText("");
      onRefresh();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setReplying(false);
    }
  };

  return (
    <div>
      {reviews?.length > 0 ? (
        <div className="space-y-4 divide-y divide-slate-100">
          {reviews.map((r, i) => (
            <div key={r.id || i} className="pt-4 first:pt-0 flex items-start justify-between group">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-800">{r.member?.fullName || "Verified Visitor"}</span>
                  <Stars rating={r.rating} />
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{r.comment}</p>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono-num">{formatDate(r.createdAt)}</span>

                {/* Render existing Admin Reply if present */}
                {r.adminReply && replyingTo?.id !== r.id && (
                  <div className="mt-2.5 ml-4 p-2.5 bg-orange-50/50 border-l-2 border-orange-500 rounded-r-lg text-xs">
                    <span className="font-bold text-slate-700 block mb-0.5">{t("Admin Response:")}</span>
                    <p className="text-slate-600 leading-relaxed">{r.adminReply}</p>
                    {canReply && (
                      <button
                        onClick={() => {
                          setReplyingTo(r);
                          setReplyText(r.adminReply || "");
                        }}
                        className="mt-1.5 text-[11px] text-orange-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Pencil className="h-3 w-3" /> {t("Edit Reply")}
                      </button>
                    )}
                  </div>
                )}

                {/* Show Reply button if no reply yet and not currently open */}
                {!r.adminReply && replyingTo?.id !== r.id && canReply && (
                  <button
                    onClick={() => {
                      setReplyingTo(r);
                      setReplyText("");
                    }}
                    className="mt-2.5 text-[11px] text-orange-600 font-semibold hover:bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-orange-500" /> {t("Reply on Review")}
                  </button>
                )}

                {/* Reply Textarea Form */}
                {replyingTo?.id === r.id && (
                  <div className="mt-3 ml-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {r.adminReply ? t("Edit Admin Reply") : t("Write Admin Reply")}
                      </Label>
                      <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="text-slate-400 hover:text-slate-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <textarea
                      className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t("Type your official response to this review...")}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                      >
                        {t("Cancel")}
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white font-medium gap-1"
                        onClick={() => handleReplySubmit(r.id)}
                        disabled={replying || !replyText.trim()}
                      >
                        {replying ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                        {replying ? t("Saving...") : t("Submit Reply")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {isSuperAdmin && (
                <button onClick={() => setDeleteTarget(r)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 shrink-0 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={t("No reviews yet")} icon={Star} description={t("Be the first to rate and share review.")} />
      )}

      <Confirm open={!!deleteTarget} message={t("Remove this user review?")} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Dhaja Tab ─────────────────────────────────────────────────────────────── */
function DhajaTab({ dhajaRecords, apiPrefix, orgId, onRefresh, canEdit }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    status: "AVAILABLE",
    dhajaDate: "",
    items: [{ dhajaOf: "", memberIds: [] }],
    descriptionEn: "",
    descriptionHi: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleOpenNew = () => {
    setEditingRecord(null);
    setForm({
      year: new Date().getFullYear(),
      status: "AVAILABLE",
      dhajaDate: "",
      items: [{ dhajaOf: "", memberIds: [] }],
      descriptionEn: "",
      descriptionHi: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setForm({
      year: record.year || new Date().getFullYear(),
      status: record.status || "AVAILABLE",
      dhajaDate: record.dhajaDate ? record.dhajaDate.split("T")[0] : "",
      items: record.items && record.items.length > 0
        ? record.items.map((it) => ({
            dhajaOf: it.dhajaOf || "",
            memberIds: it.memberIds || (it.members ? it.members.map((m) => m.id || m.publicId) : [])
          }))
        : [{ dhajaOf: "", memberIds: [] }],
      descriptionEn: record.descriptionEn || "",
      descriptionHi: record.descriptionHi || "",
    });
    setOpen(true);
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { dhajaOf: "", memberIds: [] }],
    }));
  };

  const removeItem = (idx) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const updateItem = (idx, field, val) => {
    setForm((prev) => {
      const updated = [...prev.items];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, items: updated };
    });
  };

  const save = async () => {
    if (!form.year) { toast.error(t("Year is required.")); return; }
    setSaving(true);
    try {
      const payload = {
        year: Number(form.year),
        status: form.status,
        dhajaDate: form.dhajaDate ? new Date(form.dhajaDate).toISOString() : undefined,
        items: form.items.filter((it) => it.dhajaOf || it.memberIds?.length > 0),
        descriptionEn: form.descriptionEn,
        descriptionHi: form.descriptionHi,
      };

      if (editingRecord?.id) {
        await api.put(`${apiPrefix}/${orgId}/dhaja/${editingRecord.id}`, payload);
        toast.success(t("Dhaja record updated."));
      } else {
        await api.post(`${apiPrefix}/${orgId}/dhaja`, payload);
        toast.success(t("Dhaja record saved."));
      }
      setOpen(false);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/dhaja/${deleteTarget.id}`);
      toast.success(t("Dhaja record deleted."));
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={handleOpenNew} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-4 w-4" /> {t("Add Dhaja Record")}
          </Button>
        </div>
      )}

      {dhajaRecords?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dhajaRecords.map((d, i) => (
            <Card key={d.id || i} className="p-4 group relative border hover:shadow bg-white space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-800">{t("🚩 Year")} {d.year}</span>
                    <Badge variant={d.status === "BOOKED" ? "default" : "outline"} className="text-[9px]">
                      {d.status || "AVAILABLE"}
                    </Badge>
                  </div>
                  {d.dhajaDate && <div className="text-xs text-slate-500 font-mono-num mt-1">{t("Date:")} {formatDate(d.dhajaDate)}</div>}
                </div>
                {canEdit && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    <button onClick={() => handleOpenEdit(d)} className="text-slate-400 hover:text-orange-600 p-1" title={t("Edit Record")}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(d)} className="text-slate-400 hover:text-red-600 p-1" title={t("Delete Record")}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {d.items && d.items.length > 0 && (
                <div className="mt-2 space-y-1.5 border-t pt-2">
                  {d.items.map((it, itemIdx) => (
                    <div key={itemIdx} className="bg-slate-50 p-2 rounded text-xs space-y-0.5 border border-slate-100">
                      <span className="font-bold text-slate-700 block">{t("🚩 Dhaja Of:")} {it.dhajaOf || "Dhaja"}</span>
                      {it.members && it.members.length > 0 ? (
                        <div className="text-[11px] text-slate-600">
                          <span className="font-semibold text-orange-600">{t("Dhaja By:")} </span>
                          {it.members.map((m) => m.fullName || m.name || m.publicId).join(", ")}
                        </div>
                      ) : it.memberIds && it.memberIds.length > 0 ? (
                        <div className="text-[11px] text-slate-600">
                          <span className="font-semibold text-orange-600">{t("Dhaja By Members:")} </span>
                          {it.memberIds.join(", ")}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              {d.descriptionEn && <div className="text-xs text-slate-600 mt-1 font-medium">{d.descriptionEn}</div>}
              {d.descriptionHi && <div className="text-xs text-slate-500 font-medium">{d.descriptionHi}</div>}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title={t("No Dhaja records")} description={t("Add Dhaja records for this organization.")} icon={Flag} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRecord ? t("Edit Dhaja Record") : t("Add Dhaja Record")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">{t("Year *")}</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} min={1900} max={2100} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">{t("Status")}</Label>
                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-xs focus:outline-none"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{t(s.replace(/_/g, " "))}</option>)}
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">{t("Dhaja Date")}</Label>
              <Input type="date" value={form.dhajaDate} onChange={(e) => setForm({ ...form, dhajaDate: e.target.value })} className="mt-1 text-xs" />
            </div>

            {/* Repeatable Dhaja Of & Linked Members section */}
            <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-slate-800 block">{t("Dhaja Items (Dhaja Of & Linked Members)")}</Label>
                  <span className="text-[10px] text-slate-500">{t("Option to add multiple Dhaja entries below")}</span>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addItem} className="h-7 text-xs gap-1 bg-white border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold">
                  <Plus className="w-3.5 h-3.5" /> {t("Add Dhaja Item")}
                </Button>
              </div>

              {form.items.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-3 relative shadow-sm">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="text-xs font-bold text-slate-700">{t("Item #")}{idx + 1}</span>
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1 font-medium"
                      >
                        <X className="w-3.5 h-3.5" /> {t("Remove")}
                      </button>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">{t("Dhaja Of (text box) *")}</Label>
                    <Input
                      value={item.dhajaOf}
                      onChange={(e) => updateItem(idx, "dhajaOf", e.target.value)}
                      placeholder={t("e.g. Main Shikhar Dhaja, Dada Shikhar Dhaja")}
                      className="mt-1 bg-white h-9 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">{t("Dhaja by link member (option to add multiple members)")}</Label>
                    <MemberLinkSelect
                      value={item.memberIds}
                      onChange={(v) => updateItem(idx, "memberIds", v)}
                      placeholder={t("Search & select multiple members by name or ID…")}
                      returnValueType="id"
                      multi={true}
                      showPhone
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Label className="text-xs font-semibold">{t("Description (English)")}</Label>
              <textarea rows={2} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-xs focus:outline-none"
                value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} placeholder={t("Description in English…")} />
            </div>
            <div>
              <Label className="text-xs font-semibold">{t("Description (Hindi/Gujarati)")}</Label>
              <textarea rows={2} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-xs focus:outline-none"
                value={form.descriptionHi} onChange={(e) => setForm({ ...form, descriptionHi: e.target.value })} placeholder="हिंदी/गुजराती में विवरण…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={save} disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white">
              {saving ? t("Saving…") : t("Save Record")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Confirm open={!!deleteTarget} message={`Delete Dhaja record for ${deleteTarget?.year}?`} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Chaturmas Tab ─────────────────────────────────────────────────────────── */
function ChaturmasTab({ chaturmasStays = [], apiPrefix, orgId, org, onRefresh, canEdit, isSuperAdmin }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [monks, setMonks] = useState([]);
  const [members, setMembers] = useState([]);

  // Search queries for dialog selectors
  const [monkSearch, setMonkSearch] = useState("");
  const [sponsorSearch, setSponsorSearch] = useState("");

  // New Image & Link input states
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [linkTitleInput, setLinkTitleInput] = useState("");
  const [linkUrlInput, setLinkUrlInput] = useState("");

  const defaultLocation = org?.name || "Shree Shantinath Jain Derasar (Demo)";

  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
    locationName: defaultLocation,
    monkIds: [],
    sponsorIds: [],
    notes: "",
    images: [],
    links: []
  });

  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (open) {
      api.get("/monks").then((r) => setMonks(r.data?.data?.items || r.data?.data || [])).catch(() => {});
      api.get("/members", { params: { pageSize: 300 } }).then((r) => setMembers(r.data?.data?.items || r.data?.data || [])).catch(() => {});
    }
  }, [open]);

  const handleOpenNew = () => {
    setEditingRecord(null);
    setForm({
      year: new Date().getFullYear(),
      startDate: "",
      endDate: "",
      locationName: org?.name || "Shree Shantinath Jain Derasar (Demo)",
      monkIds: [],
      sponsorIds: [],
      notes: "",
      images: [],
      links: []
    });
    setMonkSearch("");
    setSponsorSearch("");
    setImageUrlInput("");
    setLinkTitleInput("");
    setLinkUrlInput("");
    setOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setForm({
      year: record.year || new Date().getFullYear(),
      startDate: record.startDate ? record.startDate.split("T")[0] : "",
      endDate: record.endDate ? record.endDate.split("T")[0] : "",
      locationName: record.locationName || org?.name || "Shree Shantinath Jain Derasar (Demo)",
      monkIds: record.monkIds || (record.monks ? record.monks.map((m) => m.id || m.publicId) : []),
      sponsorIds: record.sponsorIds || (record.sponsors ? record.sponsors.map((s) => s.id || s.publicId) : []),
      notes: record.notes || record.description || "",
      images: Array.isArray(record.images) ? record.images : [],
      links: Array.isArray(record.links) ? record.links : []
    });
    setMonkSearch("");
    setSponsorSearch("");
    setImageUrlInput("");
    setLinkTitleInput("");
    setLinkUrlInput("");
    setOpen(true);
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    if (form.images.length >= 20) {
      toast.error(t("Maximum 20 images allowed per Chaturmas entry."));
      return;
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
    setImageUrlInput("");
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (form.images.length + files.length > 20) {
      toast.error(t("Maximum 20 images allowed in total."));
    }
    const availableSlots = 20 - form.images.length;
    const filesToProcess = files.slice(0, availableSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setForm((prev) => ({
            ...prev,
            images: prev.images.length < 20 ? [...prev.images, evt.target.result] : prev.images
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemoveImage = (idx) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleAddLink = () => {
    if (!linkTitleInput.trim() || !linkUrlInput.trim()) {
      toast.error(t("Please provide both Link Title and Link URL."));
      return;
    }
    if (form.links.length >= 5) {
      toast.error(t("Maximum 5 links allowed per Chaturmas entry."));
      return;
    }
    let formattedUrl = linkUrlInput.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    setForm((prev) => ({
      ...prev,
      links: [...prev.links, { title: linkTitleInput.trim(), url: formattedUrl }]
    }));
    setLinkTitleInput("");
    setLinkUrlInput("");
  };

  const handleRemoveLink = (idx) => {
    setForm((prev) => ({ ...prev, links: prev.links.filter((_, i) => i !== idx) }));
  };

  const save = async () => {
    if (!form.year || !form.startDate || !form.endDate) {
      toast.error(t("Year, Start Date, and End Date are required."));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        year: Number(form.year),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        locationName: form.locationName,
        monkIds: form.monkIds,
        sponsorIds: form.sponsorIds,
        notes: form.notes,
        description: form.notes,
        images: form.images,
        links: form.links
      };

      if (editingRecord?.id) {
        await api.put(`${apiPrefix}/${orgId}/chaturmas/${editingRecord.id}`, payload);
        toast.success(t("Chaturmas entry updated successfully."));
      } else {
        await api.post(`${apiPrefix}/${orgId}/chaturmas`, payload);
        toast.success(t("Chaturmas entry created successfully."));
      }
      setOpen(false);
      onRefresh();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const getStatus = (start, end) => {
    const today = new Date();
    const sDate = new Date(start);
    const eDate = new Date(end);
    if (today < sDate) return "Upcoming";
    if (today > eDate) return "Completed";
    return "Ongoing";
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/chaturmas/${deleteTarget.id}`);
      toast.success(t("Chaturmas stay record deleted."));
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  // Filtered Monk list based on search query (Name or Monk ID)
  const filteredMonks = monks.filter((m) => {
    if (!monkSearch) return true;
    const q = monkSearch.toLowerCase();
    const name = (m.fullName || m.dikshaName || m.name || "").toLowerCase();
    const publicId = (m.publicId || m.monkId || "").toLowerCase();
    return name.includes(q) || publicId.includes(q);
  });

  // Filtered Sponsor list based on search query (Name or Member ID)
  const filteredMembers = members.filter((m) => {
    if (!sponsorSearch) return true;
    const q = sponsorSearch.toLowerCase();
    const name = (m.fullName || `${m.firstName || ""} ${m.lastName || ""}`).toLowerCase();
    const publicId = (m.publicId || m.id || "").toLowerCase();
    return name.includes(q) || publicId.includes(q);
  });

  // Identify Current Chaturmas (Ongoing or latest current year entry)
  const currentYear = new Date().getFullYear();
  const currentChaturmas = chaturmasStays.find(
    (c) => getStatus(c.startDate, c.endDate) === "Ongoing" || Number(c.year) === currentYear
  );

  // Past Chaturmas list & Year Filter state
  const [pastYearFilter, setPastYearFilter] = useState("ALL");
  const pastChaturmasStays = chaturmasStays.filter((c) => c !== currentChaturmas);
  const availableYears = Array.from(
    new Set(pastChaturmasStays.map((c) => c.year).filter(Boolean))
  ).sort((a, b) => b - a);

  const filteredPastChaturmas = pastChaturmasStays.filter((c) => {
    if (pastYearFilter === "ALL") return true;
    return String(c.year) === String(pastYearFilter);
  });

  return (
    <div className="space-y-5">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-800">
        <div>
          <h3 className="font-extrabold text-sm flex items-center gap-2 text-orange-400">
            <Sparkles className="h-4 w-4" /> {t("Maintain Year-Wise Chaturmas Records")}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {t("Maintain year-wise records of all Chaturmas conducted at the")} <span className="font-semibold text-white">{org?.name || "Temple / Jain Centre"}</span>.
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleOpenNew} className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /> {t("Add Chaturmas Entry")}
          </Button>
        )}
      </div>

      {/* Member View: Display Current Chaturmas Section */}
      {currentChaturmas && (
        <Card className="p-5 border-2 border-orange-500/30 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-600 text-white text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider">
                  {t("🌟 Current Chaturmas")}
                </Badge>
                <span className="font-extrabold text-base text-slate-900">{t("Year")} {currentChaturmas.year}</span>
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-2">
                <span>📅 {formatDate(currentChaturmas.startDate)} to {formatDate(currentChaturmas.endDate)}</span>
                <span>·</span>
                <span>📍 {currentChaturmas.locationName || org?.name}</span>
              </div>
            </div>
            {canEdit && (
              <Button size="sm" variant="outline" onClick={() => handleOpenEdit(currentChaturmas)} className="h-8 text-xs gap-1 text-orange-600 border-orange-200 hover:bg-orange-100/50">
                <Pencil className="h-3.5 w-3.5" /> {t("Edit Current")}
              </Button>
            )}
          </div>

          {/* Current Chaturmas Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Linked Monks */}
            <div>
              <span className="font-bold text-xs text-slate-800 block mb-1.5">{t("🛕 Linked Monks & Sadhvis")}</span>
              {currentChaturmas.monks?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {currentChaturmas.monks.map((m) => (
                    <Badge key={m.id || m.publicId} variant="secondary" className="text-xs font-semibold bg-white text-orange-800 border border-orange-200 shadow-xs">
                      {m.fullName || m.dikshaName || m.name} ({m.publicId || m.monkId || "JFMS108"})
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">{t("No monks linked to this Chaturmas.")}</span>
              )}
            </div>

            {/* Sponsors (Only Name, City, State - Mobile Hidden) */}
            <div>
              <span className="font-bold text-xs text-slate-800 block mb-1.5">{t("💰 Chaturmas Sponsors")}</span>
              {currentChaturmas.sponsors?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {currentChaturmas.sponsors.map((sp) => (
                    <Badge key={sp.id || sp.publicId} variant="outline" className="text-xs font-medium bg-white text-slate-700 border-slate-200 shadow-xs">
                      {sp.fullName || `${sp.firstName || ""} ${sp.lastName || ""}`.trim()} ({sp.city || "City"}, {sp.state || "State"})
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">{t("No sponsors linked yet.")}</span>
              )}
            </div>
          </div>

          {currentChaturmas.notes && (
            <div className="bg-white/80 p-3 rounded-xl border border-orange-100 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-800 block mb-0.5">{t("📝 Description / Notes:")}</span>
              {currentChaturmas.notes}
            </div>
          )}

          {/* Current Images & Links */}
          {((currentChaturmas.images && currentChaturmas.images.length > 0) || (currentChaturmas.links && currentChaturmas.links.length > 0)) && (
            <div className="pt-2 border-t border-orange-100 space-y-2">
              {currentChaturmas.images && currentChaturmas.images.length > 0 && (
                <div>
                  <span className="font-bold text-xs text-slate-800 block mb-1.5">{t("🖼️ Chaturmas Images (")}{currentChaturmas.images.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {currentChaturmas.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Chaturmas ${idx}`} className="w-16 h-16 object-cover rounded-lg border shadow-xs" />
                    ))}
                  </div>
                </div>
              )}
              {currentChaturmas.links && currentChaturmas.links.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentChaturmas.links.map((l, idx) => (
                    <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:underline bg-white px-2.5 py-1 rounded-md border border-orange-200">
                      <ExternalLink className="h-3 w-3" /> {l.title || l.url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Past Chaturmas Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b pb-2.5">
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
            {t("📜 Past Chaturmas Records")}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">{t("Filter by Year:")}</span>
            <select
              value={pastYearFilter}
              onChange={(e) => setPastYearFilter(e.target.value)}
              className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-xs"
            >
              <option value="ALL">{t("All Years (")}{pastChaturmasStays.length})</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {t("Year")} {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPastChaturmas.length > 0 ? (
          <div className="space-y-4">
            {filteredPastChaturmas.map((c, i) => {
              const status = getStatus(c.startDate, c.endDate);
              return (
                <Card key={c.id || i} className="p-5 group relative border hover:shadow-md bg-white transition-shadow">
                  <div className="flex items-start justify-between border-b pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-800">{t("❄️ Year")} {c.year} {t("Chaturmas")}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          status === "Ongoing" ? "bg-orange-500 text-white" : status === "Completed" ? "bg-slate-200 text-slate-700" : "bg-blue-500 text-white"
                        }`}>{status}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono-num mt-1 flex items-center gap-3">
                        <span>{t("Period:")} {formatDate(c.startDate)} to {formatDate(c.endDate)}</span>
                        <span>·</span>
                        <span>{t("📍 Location:")} {c.locationName || org?.name || "Temple / Jain Centre"}</span>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                        <button onClick={() => handleOpenEdit(c)} className="text-slate-400 hover:text-orange-600 p-1" title={t("Edit Entry")}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="text-slate-400 hover:text-red-600 p-1" title={t("Delete Entry")}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3.5 space-y-3 text-xs">
                    {/* Linked Monks */}
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">{t("🛕 Linked Monks (Multiple Selection)")}</span>
                      {c.monks?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {c.monks.map((m) => (
                            <Badge key={m.id || m.publicId} variant="secondary" className="text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-100">
                              {m.fullName || m.dikshaName || m.name} ({m.publicId || m.monkId || "JFMS108"})
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">{t("No monks linked to this Chaturmas.")}</span>
                      )}
                    </div>

                    {/* Chaturmas Sponsors (Only Name, City, State - Mobile Hidden) */}
                    {c.sponsors?.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">{t("💰 Chaturmas Sponsors (Name, City & State)")}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {c.sponsors.map((sp) => (
                            <Badge key={sp.id || sp.publicId} variant="outline" className="text-[11px] font-medium bg-slate-50 text-slate-700">
                              {sp.fullName || `${sp.firstName || ""} ${sp.lastName || ""}`.trim()} ({sp.city || "City"}, {sp.state || "State"})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description / Notes */}
                    {c.notes && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-600">
                        <span className="font-semibold text-slate-700 block mb-0.5">{t("Notes / Description:")}</span>
                        {c.notes}
                      </div>
                    )}

                    {/* Images & Web Links */}
                    {((c.images && c.images.length > 0) || (c.links && c.links.length > 0)) && (
                      <div className="pt-2 border-t space-y-2">
                        {c.images && c.images.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-700 block mb-1">{t("🖼️ Chaturmas Images (")}{c.images.length})</span>
                            <div className="flex flex-wrap gap-2">
                              {c.images.map((img, idx) => (
                                <img key={idx} src={img} alt={`Gallery ${idx}`} className="w-14 h-14 object-cover rounded-lg border" />
                              ))}
                            </div>
                          </div>
                        )}
                        {c.links && c.links.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {c.links.map((l, idx) => (
                              <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:underline bg-slate-50 px-2.5 py-1 rounded border">
                                <ExternalLink className="h-3 w-3" /> {l.title || l.url}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={t("No Past Chaturmas records found")}
            icon={Calendar}
            description={pastYearFilter !== "ALL" ? `No past records found for year ${pastYearFilter}.` : t("No past Chaturmas records available.")}
          />
        )}
      </div>

      {/* Add / Edit Chaturmas Entry Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRecord ? t("Edit Chaturmas Entry") : t("Add Chaturmas Entry")}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border text-slate-600 leading-relaxed">
              {t("Maintain year-wise records of all Chaturmas conducted at the")} <span className="font-bold text-slate-800">{form.locationName}</span>.
            </div>

            {/* Basic Year & Date fields */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">{t("Chaturmas Year *")}</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} min={2000} max={2100} className="mt-1 h-9 text-xs" />
              </div>
              <div>
                <Label className="text-xs font-semibold">{t("Start Date *")}</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1 h-9 text-xs" />
              </div>
              <div>
                <Label className="text-xs font-semibold">{t("End Date *")}</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-1 h-9 text-xs" />
              </div>
            </div>

            {/* Chaturmas Location */}
            <div>
              <Label className="text-xs font-semibold">{t("Chaturmas Location (Auto-linked)")}</Label>
              {isSuperAdmin ? (
                <Input
                  value={form.locationName}
                  onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                  placeholder={t("Temple / Jain Centre Location Name")}
                  className="mt-1 h-9 text-xs bg-white"
                />
              ) : (
                <div className="mt-1 p-2.5 bg-slate-100 rounded-md border text-slate-700 font-medium flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span>{form.locationName} {t("(Auto-linked to current Temple/Jain Centre)")}</span>
                </div>
              )}
            </div>

            {/* Link Monks (Multiple Selection by Monk Name or Monk ID) */}
            <div className="border p-3 rounded-xl bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 block">{t("Link Monks & Sadhvis (Multiple Selection)")}</Label>
                <span className="text-[10px] font-mono text-orange-600 font-semibold">{form.monkIds.length} {t("Selected")}</span>
              </div>
              
              <Input
                type="text"
                value={monkSearch}
                onChange={(e) => setMonkSearch(e.target.value)}
                placeholder={t("Search by Monk Name or Monk ID (e.g. JFMS108, Naypadmasagarji)...")}
                className="h-8 text-xs bg-white"
              />

              {/* Selected Monks Tags */}
              {form.monkIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.monkIds.map((mId) => {
                    const mObj = monks.find((x) => x.id === mId || x.publicId === mId);
                    return (
                      <span key={mId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 border border-orange-200 text-orange-800 text-xs font-semibold">
                        <span>{mObj ? `${mObj.fullName || mObj.dikshaName || mObj.name} (${mObj.publicId || mObj.monkId || mId})` : mId}</span>
                        <button type="button" onClick={() => setForm({ ...form, monkIds: form.monkIds.filter((x) => x !== mId) })} className="hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Monk Checklist */}
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-white space-y-1">
                {filteredMonks.length > 0 ? (
                  filteredMonks.map((m) => {
                    const idKey = m.id || m.publicId;
                    const checked = form.monkIds.includes(idKey);
                    return (
                      <label key={idKey} className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = checked ? form.monkIds.filter((x) => x !== idKey) : [...form.monkIds, idKey];
                              setForm({ ...form, monkIds: next });
                            }}
                            className="h-3.5 w-3.5 text-orange-500 rounded"
                          />
                          <span className="font-semibold text-slate-800">{m.fullName || m.dikshaName || m.name}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono text-slate-500">
                          {t("ID:")} {m.publicId || m.monkId || "JFMS108"}
                        </Badge>
                      </label>
                    );
                  })
                ) : (
                  <div className="text-slate-400 p-2 text-center">{t("No monks found matching \"")}{monkSearch}".</div>
                )}
              </div>
            </div>

            {/* Chaturmas Sponsors (Only Name, City & State - Mobile Hidden) */}
            <div className="border p-3 rounded-xl bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-slate-800 block">{t("Chaturmas Sponsors (Multiple Selection)")}</Label>
                  <span className="text-[10px] text-slate-500">{t("Viewed by Name, City and State only (mobile hidden)")}</span>
                </div>
                <span className="text-[10px] font-mono text-orange-600 font-semibold">{form.sponsorIds.length} {t("Selected")}</span>
              </div>

              <Input
                type="text"
                value={sponsorSearch}
                onChange={(e) => setSponsorSearch(e.target.value)}
                placeholder={t("Search member sponsors by Name or Member ID...")}
                className="h-8 text-xs bg-white"
              />

              {/* Selected Sponsors Tags */}
              {form.sponsorIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.sponsorIds.map((spId) => {
                    const spObj = members.find((x) => x.id === spId || x.publicId === spId);
                    return (
                      <span key={spId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 border text-slate-800 text-xs font-medium">
                        <span>{spObj ? `${spObj.fullName || spObj.name} (${spObj.city || "City"}, ${spObj.state || "State"})` : spId}</span>
                        <button type="button" onClick={() => setForm({ ...form, sponsorIds: form.sponsorIds.filter((x) => x !== spId) })} className="hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Members Checklist */}
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-white space-y-1">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m) => {
                    const idKey = m.id || m.publicId;
                    const checked = form.sponsorIds.includes(idKey);
                    return (
                      <label key={idKey} className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = checked ? form.sponsorIds.filter((x) => x !== idKey) : [...form.sponsorIds, idKey];
                              setForm({ ...form, sponsorIds: next });
                            }}
                            className="h-3.5 w-3.5 text-orange-500 rounded"
                          />
                          <span className="font-semibold text-slate-800">{m.fullName || `${m.firstName || ""} ${m.lastName || ""}`.trim()}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {m.city || "City"}, {m.state || "State"}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div className="text-slate-400 p-2 text-center">{t("No members found matching \"")}{sponsorSearch}".</div>
                )}
              </div>
            </div>

            {/* Chaturmas Description / Notes */}
            <div>
              <Label className="text-xs font-semibold">{t("Chaturmas Description / Notes")}</Label>
              <textarea
                rows={3}
                className="w-full mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t("Write Chaturmas details, lecture schedules, and host information...")}
              />
            </div>

            {/* Chaturmas Images (Option to upload 20 images) */}
            <div className="border p-3 rounded-xl bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-slate-800 block">{t("Chaturmas Images (Upload up to 20 images)")}</Label>
                  <span className="text-[10px] text-slate-500">{form.images.length} {t("/ 20 images uploaded")}</span>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1 text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-md hover:bg-slate-50 font-medium text-slate-700 shadow-xs">
                  <Upload className="h-3.5 w-3.5 text-orange-500" /> {t("Choose Files")}
                  <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder={t("Or paste image URL (e.g. https://...)")}
                  className="h-8 text-xs bg-white flex-1"
                />
                <Button type="button" size="sm" onClick={handleAddImage} className="h-8 text-xs bg-slate-800 text-white hover:bg-slate-900">
                  {t("Add URL")}
                </Button>
              </div>

              {/* Uploaded Thumbnails Grid */}
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {form.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border bg-white shadow-xs">
                      <img src={imgUrl} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chaturmas Web Links (Option to add 5 links) */}
            <div className="border p-3 rounded-xl bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-slate-800 block">{t("Chaturmas Web Links (Option to add 5 links)")}</Label>
                  <span className="text-[10px] text-slate-500">{form.links.length} {t("/ 5 links added")}</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                <Input
                  type="text"
                  value={linkTitleInput}
                  onChange={(e) => setLinkTitleInput(e.target.value)}
                  placeholder={t("Link Title (e.g. Live Pravachan)")}
                  className="h-8 text-xs bg-white col-span-2"
                />
                <Input
                  type="text"
                  value={linkUrlInput}
                  onChange={(e) => setLinkUrlInput(e.target.value)}
                  placeholder={t("URL (e.g. https://youtube.com/...)")}
                  className="h-8 text-xs bg-white col-span-2"
                />
                <Button type="button" size="sm" onClick={handleAddLink} className="h-8 text-xs bg-orange-600 text-white hover:bg-orange-700 col-span-1">
                  {t("Add Link")}
                </Button>
              </div>

              {/* Added Links List */}
              {form.links.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                  {form.links.map((l, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-xs">
                      <ExternalLink className="h-3 w-3 text-orange-500" />
                      <span>{l.title}</span>
                      <button type="button" onClick={() => handleRemoveLink(idx)} className="text-slate-400 hover:text-red-600 ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={save} disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white font-medium">
              {saving ? t("Saving…") : t("Save Chaturmas Entry")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Confirm open={!!deleteTarget} message={`Delete Chaturmas stay record for Year ${deleteTarget?.year}?`} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Edit Org Dialog — all fields ─────────────────────────────────────────── */
const FACILITY_OPTIONS = [
  "Parking", "CCTV", "Lift", "AC", "Cafeteria", "Medical", "Library", "Ramp", "Wheelchair Access",
  "Fire Safety", "Solar Power", "Dharamshala", "Bhojanshala", "Upashray", "Event Hall"
];
const TEMPLE_TYPES = ["SHIKHAR_BADDHA", "GHAR_DERASAR", "JAIN_CENTRE"];

const REGIONS_CURRENCIES = {
  "India": "INR (₹)",
  "United Kingdom": "GBP (£)",
  "United States": "USD ($)",
  "Canada": "CAD (C$)",
  "Australia": "AUD (A$)",
  "United Arab Emirates": "AED (د.إ)",
  "Singapore": "SGD (S$)",
  "Kenya": "KES (KSh)",
  "South Africa": "ZAR (R)",
};

const SHWETAMBAR_SUB = ["Murtipujak", "Sthanakvasi", "Terapanth", "Other"];
const DIGAMBAR_SUB = ["Bisapantha", "Terapantha", "Taranapantha", "Gumanapantha", "Totapantha", "Kanjipantha", "Other Digambar Traditions"];

const MURTIPUJAK_GACCHAS = [
  "Upkeśa Gaccha", "Achal Gaccha", "Jiravala Gaccha", "Kharatara Gaccha", "Lonka (Richmati) Gaccha",
  "Tapa Gaccha", "Gangeshvara Gaccha", "Korantavala Gaccha", "Anandapura Gaccha", "Bharavali Gaccha",
  "Udhaviya Gaccha", "Gudava Gaccha", "Dekawa Gaccha", "Bhinmala Gaccha", "Mahudiya Gaccha",
  "Gachhapala Gaccha", "Goshavala Gaccha", "Magatragada Gaccha", "Vrihmaniya Gaccha", "Talara Gaccha",
  "Vikadiya Gaccha", "Munjhiya Gaccha", "Chitroda Gaccha", "Sachora Gaccha", "Jachandiya Gaccha",
  "Sidhalava Gaccha", "Miyanniya Gaccha", "Agamiya Gaccha", "Maladhari Gaccha", "Bhavariya Gaccha",
  "Paliwala Gaccha", "Nagadigeshvara Gaccha", "Dharmaghosha Gaccha", "Nagapura Gaccha", "Uchatavala Gaccha",
  "Nannavala Gaccha", "Sadera Gaccha", "Mandovara Gaccha", "Surani Gaccha", "Khambhavati Gaccha",
  "Panchanda Gaccha", "Sopariya Gaccha", "Mandaliya Gaccha", "Kochhipana Gaccha", "Jaganna Gaccha",
  "Laparavala Gaccha", "Vosarada Gaccha", "Duivandaniya Gaccha", "Chitravala Gaccha", "Vegada Gaccha",
  "Vapada Gaccha", "Vijahara Gaccha", "Kapuri Gaccha", "Kachala Gaccha", "Handaliya Gaccha",
  "Mahukara Gaccha", "Putaliya Gaccha", "Kannariseya Gaccha", "Revardiya Gaccha", "Dhandhuka Gaccha",
  "Thambhanipana Gaccha", "Panchivala Gaccha", "Palanpura Gaccha", "Gandhariya Gaccha", "Veliya Gaccha",
  "Sadhapunamiya Gaccha", "Nagarakotiya Gaccha", "Hasora Gaccha", "Bhatanera Gaccha", "Janahara Gaccha",
  "Jagayana Gaccha", "Bhimasena Gaccha", "Takadiya Gaccha", "Kamboja Gaccha", "Senata Gaccha",
  "Vaghera Gaccha", "Vahediya Gaccha", "Siddhapura Gaccha", "Ghoghari Gaccha", "Nigamiya Gaccha",
  "Punamiya Gaccha", "Varhadiya Gaccha", "Namila Gaccha"
];

const MemberSelect = ({ label, value, onChange, placeholder = "Select Member..." }) => {
  return (
    <div>
      <Label className="text-xs font-semibold text-slate-600 mb-1 block">{label}</Label>
      <MemberLinkSelect
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        returnValueType="id"
      />
    </div>
  );
};

function EditOrgDialog({ open, onClose, org, apiPrefix, onSaved, entityLabel }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [bhagwans, setBhagwans] = useState([]);
  const { isSuperAdmin } = useAuth();

  // Custom deity creation states
  const [createDeityOpen, setCreateDeityOpen] = useState(false);
  const [deityName, setDeityName] = useState("");
  const [deityCategory, setDeityCategory] = useState("24 Tirthankars");
  const [deitySaving, setDeitySaving] = useState(false);

  useEffect(() => {
    api.get("/master-data/bhagwans").then((r) => setBhagwans(r.data?.data || [])).catch(() => {});
  }, []);

  const handleCreateDeitySubmit = async (e) => {
    e.preventDefault();
    if (!deityName.trim()) { toast.error(t("Deity name is required.")); return; }
    setDeitySaving(true);
    try {
      const res = await api.post("/master-data/bhagwans", { name: deityName.trim(), category: deityCategory });
      toast.success(t("Deity created successfully!"));
      const r = await api.get("/master-data/bhagwans");
      const updatedBhagwans = r.data?.data || [];
      setBhagwans(updatedBhagwans);
      const newDeity = updatedBhagwans.find(b => b.name === deityName.trim());
      if (newDeity) {
        setForm(prev => ({ ...prev, mulNayakBhagwanId: newDeity.id }));
      }
      setDeityName("");
      setCreateDeityOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeitySaving(false);
    }
  };

  const parseRange = (val) => {
    if (!val) return { from: "", to: "" };
    const parts = val.split("-").map(s => s.trim());
    return { from: parts[0] || "", to: parts[1] || "" };
  };

  const parseCharges = (val) => {
    if (!val || !val.includes("|")) return "";
    return val.split("|")[0].replace("Rs.", "").trim();
  };

  const parseTimeFromRange = (val) => {
    if (!val) return "";
    if (val.includes("|")) {
      return val.split("|")[1].trim();
    }
    return val;
  };

  const setTimeRangeVal = (key, part, timeStr) => {
    const current = form[key] || "";
    const chargesPart = current.includes("|") ? current.split("|")[0].trim() + " | " : "";
    const timingPart = current.includes("|") ? current.split("|")[1].trim() : current;
    const parts = timingPart.split("-").map(s => s.trim());
    
    let nextTiming = "";
    if (part === "from") {
      nextTiming = `${timeStr} - ${parts[1] || ""}`;
    } else {
      nextTiming = `${parts[0] || ""} - ${timeStr}`;
    }
    setForm(prev => ({ ...prev, [key]: `${chargesPart}${nextTiming}` }));
  };

  const setChargesVal = (key, chargesStr) => {
    const current = form[key] || "";
    const timingPart = current.includes("|") ? current.split("|")[1].trim() : current;
    const nextVal = chargesStr ? `Rs. ${chargesStr} | ${timingPart}` : timingPart;
    setForm(prev => ({ ...prev, [key]: nextVal }));
  };

  useEffect(() => {
    if (org && open) {
      setForm({
        name: org.name || "",
        shortName: org.shortName || "",
        trustName: org.trustName || "",
        trustRegistrationNumber: org.trustRegistrationNumber || "",
        history: org.history || "",
        addressLine: org.addressLine || "",
        city: org.city || "",
        state: org.state || "",
        country: org.country || "India",
        pincode: org.pincode || "",
        phone: org.phone || "",
        website: org.website || "",
        googleMapsLink: org.googleMapsLink || "",
        establishedDate: org.establishedDate ? org.establishedDate.slice(0, 10) : "",
        templeType: org.templeType || "SHIKHAR_BADDHA",
        sect: org.sect || "Shwetambar",
        subSect: org.subSect || "Murtipujak",
        gacchaName: org.gacchaName || "",
        mulNayakBhagwanId: org.mulNayakBhagwanId || "",
        muritCount: org.muritCount || "",
        tithiCalendar: org.tithiCalendar || "Gujarati",
        upiId: org.upiId || "",
        bankAccountName: org.bankAccountName || "",
        bankAccount: org.bankAccount || "",
        bankIfsc: org.bankIfsc || "",
        bankName: org.bankName || "",
        bankBranch: org.bankBranch || "",
        donationQrCodeUrl: org.donationQrCodeUrl || "",
        preferredCurrency: org.preferredCurrency || "INR (₹)",
        hasBhojanshala: org.hasBhojanshala ?? false,
        hasUpashray: org.hasUpashray ?? false,
        hasEventHall: org.hasEventHall ?? false,
        hasDharamshala: org.hasDharamshala ?? false,
        hasPathshala: org.hasPathshala ?? false,
        upashrayLocation: org.upashrayLocation || "Within Property",
        eventHallPurpose: org.eventHallPurpose || "Available for Booking",
        eventHallBookingLink: org.eventHallBookingLink || "",
        bhojanshalaBreakfast: org.bhojanshalaBreakfast || "07:00 AM - 08:30 AM",
        bhojanshalaLunch: org.bhojanshalaLunch || "11:30 AM - 01:00 PM",
        bhojanshalaDinner: org.bhojanshalaDinner || "05:00 PM - 06:00 PM",
        bhojanshalaMealType: org.bhojanshalaMealType || "Free",
        bhojanshalaAvailability: org.bhojanshalaAvailability || "Daily",
        bhojanshalaContact: org.bhojanshalaContact || "",
        dharamshalaRooms: org.dharamshalaRooms || "Both",
        dharamshalaOffice: org.dharamshalaOffice || "09:00 AM - 08:00 PM",
        dharamshalaPhone: org.dharamshalaPhone || "",
        dharamshalaContact: org.dharamshalaContact || "",
        dharamshalaOnline: org.dharamshalaOnline || "No",
        pathshalaTimings: org.pathshalaTimings || "04:30 PM - 06:00 PM",
        pathshalaDays: org.pathshalaDays || "Sat, Sun",
        pathshalaTeacher: org.pathshalaTeacher || "",
        morningStart: org.morningStart || "06:00 AM",
        morningEnd: org.morningEnd || "12:00 PM",
        eveningStart: org.eveningStart || "05:30 PM",
        eveningEnd: org.eveningEnd || "09:00 PM",
        pakshalStart: org.pakshalStart || "06:30 AM",
        pakshalEnd: org.pakshalEnd || "08:00 AM",
        poojaStart: org.poojaStart || "07:00 AM",
        poojaEnd: org.poojaEnd || "08:30 AM",
        aartiMorning: org.aartiMorning || "08:30 AM",
        aartiEvening: org.aartiEvening || "07:30 PM",
        is80gEligible: org.is80gEligible ?? false,
        csrEligible: org.csrEligible ?? false,
        facilities: org.facilities || [],
        preferredCurrency: org.preferredCurrency || "INR (₹)",
        // New Dharamshala fields
        landmark: org.landmark || "",
        railwayStation: org.railwayStation || "",
        district: org.district || "",
        hasTempleInside: org.hasTempleInside ?? false,
        templeMulNayakName: org.templeMulNayakName || "",
        templeMulNayakImageUrl: org.templeMulNayakImageUrl || "",
        templeTithiCalendar: org.templeTithiCalendar || "Gujarati",
        templeOpeningHours: org.templeOpeningHours || "",
        templePakshalStart: org.templePakshalStart || "",
        templePoojaStart: org.templePoojaStart || "",
        templeAartiEvening: org.templeAartiEvening || "",
        buildings: org.buildings || [],
        checkInTime: org.checkInTime || "12:00 PM",
        checkOutTime: org.checkOutTime || "11:00 AM",
        advanceBookingRequired: org.advanceBookingRequired ?? false,
        onlineBookingAvailable: org.onlineBookingAvailable ?? false,
        dharamshalaStatus: org.dharamshalaStatus || "High Availability",
        adminBlockedRooms: org.adminBlockedRooms || "",
        emergencyContact: org.emergencyContact || "",
        caretakerDetails: org.caretakerDetails || "",
        rulesText: org.rulesText || "",
        primaryContactMemberId: org.primaryContactMemberId || "",
        secondaryContactNumber: org.secondaryContactNumber || "",
        contactMobileVerified: org.contactMobileVerified ?? false,
        contactWhatsAppVerified: org.contactWhatsAppVerified ?? false,
        contactEmailVerified: org.contactEmailVerified ?? false,
        primaryContactPreference: org.primaryContactPreference || "Mobile",
        trusteesList: org.trusteesList || [],
        volunteersList: org.volunteersList || [],
        instaLink: org.instaLink || "",
        facebookLink: org.facebookLink || "",
        youtubeLink: org.youtubeLink || "",
        donationQrCodeUrl: org.donationQrCodeUrl || "",
        bankName: org.bankName || "",
        bankBranch: org.bankBranch || ""
      });
    }
  }, [org, open]);

  // Sync currency automatically on country change
  useEffect(() => {
    if (form.country) {
      const defaultCur = REGIONS_CURRENCIES[form.country] || "USD ($)";
      setForm((f) => ({ ...f, preferredCurrency: defaultCur }));
    }
  }, [form.country]);

  const toggleFacility = (f) => setForm((prev) => ({
    ...prev,
    facilities: prev.facilities.includes(f)
      ? prev.facilities.filter((x) => x !== f)
      : [...prev.facilities, f],
  }));

  const addBuilding = () => {
    const newB = {
      id: Date.now().toString(),
      name: `Building ${String.fromCharCode(65 + (form.buildings?.length || 0))}`,
      imageUrl: "",
      roomTypes: []
    };
    setForm(prev => ({ ...prev, buildings: [...(prev.buildings || []), newB] }));
  };

  const removeBuilding = (bid) => {
    setForm(prev => ({ ...prev, buildings: (prev.buildings || []).filter(b => b.id !== bid) }));
  };

  const updateBuildingName = (bid, name) => {
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? { ...b, name } : b)
    }));
  };

  const addRoomType = (bid) => {
    const newRoom = {
      id: Date.now().toString(),
      name: "Standard AC Room",
      category: "AC",
      type: "Private",
      roomCount: "10",
      bedCapacity: "2",
      charges: "1200",
      chargesType: "Per Room",
      deposit: "500",
      attachedBathroom: "Yes",
      amenities: ["Fan", "AC", "Geyser"]
    };
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? { ...b, roomTypes: [...(b.roomTypes || []), newRoom] } : b)
    }));
  };

  const updateRoomType = (bid, rid, key, value) => {
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? {
        ...b,
        roomTypes: (b.roomTypes || []).map(r => r.id === rid ? { ...r, [key]: value } : r)
      } : b)
    }));
  };

  const removeRoomType = (bid, rid) => {
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? {
        ...b,
        roomTypes: (b.roomTypes || []).filter(r => r.id !== rid)
      } : b)
    }));
  };

  const addTrusteeRow = () => {
    const newT = { id: Date.now().toString(), memberId: "", designation: "Trustee" };
    setForm(prev => ({ ...prev, trusteesList: [...(prev.trusteesList || []), newT] }));
  };
  const removeTrusteeRow = (id) => {
    setForm(prev => ({ ...prev, trusteesList: (prev.trusteesList || []).filter(t => t.id !== id) }));
  };
  const updateTrusteeRow = (id, key, value) => {
    setForm(prev => ({
      ...prev,
      trusteesList: (prev.trusteesList || []).map(t => t.id === id ? { ...t, [key]: value } : t)
    }));
  };

  const addVolunteerRow = () => {
    const newV = { id: Date.now().toString(), memberId: "" };
    setForm(prev => ({ ...prev, volunteersList: [...(prev.volunteersList || []), newV] }));
  };
  const removeVolunteerRow = (id) => {
    setForm(prev => ({ ...prev, volunteersList: (prev.volunteersList || []).filter(v => v.id !== id) }));
  };
  const updateVolunteerRow = (id, value) => {
    setForm(prev => ({
      ...prev,
      volunteersList: (prev.volunteersList || []).map(v => v.id === id ? { ...v, memberId: value } : v)
    }));
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <Label className="text-xs font-semibold text-slate-655">{label}</Label>
      <Input className="mt-1 bg-white h-9" type={type} value={form[key] || ""} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  const toggle = (label, key) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" className="h-4.5 w-4.5 text-orange-500 rounded border-slate-350" checked={!!form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </label>
  );

  const save = async () => {
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.mulNayakBhagwanId) {
        delete payload.mulNayakBhagwanId;
      }
      if (entityLabel === "Dharamshala" || entityLabel === "Sthanak") {
        delete payload.mulNayakBhagwanId;
      }
      if (payload.buildings && Array.isArray(payload.buildings)) {
        payload.buildings = payload.buildings.map((b) => ({
          ...b,
          roomTypes: (b.roomTypes || []).map((r) => ({
            ...r,
            roomCount: String(r.roomCount || r.totalCount || "0"),
            bedCapacity: String(r.bedCapacity || r.maxOccupancy || "2"),
            extraMattressCount: r.extraMattressCount ? Number(r.extraMattressCount) : 0,
            extraMattressCharge: r.extraMattressCharge ? Number(r.extraMattressCharge) : undefined,
            roomNumber: typeof r.roomNumbers === "string" ? r.roomNumbers : String(r.roomNumbers || ""),
            roomNumbers: typeof r.roomNumbers === "string" ? r.roomNumbers.split(",").map(x => x.trim()).filter(Boolean) : (r.roomNumbers || []),
            images: (r.images || []).slice(0, 6),
          })),
        }));
      }
      await api.patch(`${apiPrefix}/${org.id}`, {
        ...payload,
        muritCount: payload.muritCount ? Number(payload.muritCount) : undefined,
        establishedDate: payload.establishedDate ? new Date(payload.establishedDate).toISOString() : undefined,
      });
      toast.success(t("Details updated successfully."));
      onSaved?.();
      onClose();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  const isDharamshala = entityLabel === "Dharamshala";

  const configTabs = isDharamshala ? [
    { id: "basic", label: t("🏨 Basic Info") },
    { id: "temple", label: t("🛕 Inside Temple") },
    { id: "location", label: t("📍 Location & Contact") },
    { id: "accommodations", label: t("🏢 Accommodations") },
    { id: "facilities", label: t("✨ Facilities") },
    { id: "food", label: t("🥗 Bhojanalay") },
    { id: "contacts", label: t("👥 Contacts & Management") },
    { id: "trustees", label: t("📜 Trustees & Committee") },
    { id: "volunteers", label: t("🤝 Volunteers") },
    { id: "rules", label: t("📋 Rules & Safety") },
    { id: "bank", label: t("💰 Banking Details") },
    { id: "links", label: t("🔗 Social & UX Links") }
  ] : [
    { id: "basic", label: t("🛕 Basic & Trust") },
    { id: "location", label: t("📍 Location & Maps") },
    { id: "facilities", label: t("🏢 Facilities & Units") },
    { id: "timings", label: t("🕒 Slot Timings") },
    { id: "finance", label: t("💰 Banking Details") }
  ];

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl md:max-w-5xl w-full p-0 overflow-hidden rounded-2xl shadow-2xl bg-white border border-slate-100 h-[88vh] max-h-[92vh] flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left panel tabs selector */}
          <div className="w-full md:w-60 bg-slate-900 text-slate-350 p-5 flex flex-col gap-1 shrink-0 border-r border-slate-800 h-full">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-2">{t("Setup Sections")}</div>
            {configTabs.map((tItem) => (
              <button
                key={tItem.id}
                onClick={() => setTab(tItem.id)}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                  tab === tItem.id
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"
                }`}
              >
                {t(tItem.label)}
              </button>
            ))}
          </div>

          {/* Form Content body */}
          <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
              
              {tab === "basic" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">
                    {isDharamshala ? t("🏨 Basic Dharamshala Info") : t("🛕 Basic & Trust Details")}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">{field(isDharamshala ? t("Dharamshala Name *") : t("Name *"), "name")}</div>
                    {field("Short Name", "shortName")}
                    {field("Established Date", "establishedDate", "date")}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">{t("Community")}</Label>
                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                        value={form.sect || ""} onChange={(e) => setForm({ ...form, sect: e.target.value, subSect: e.target.value === "Digambar" ? "Bisapantha" : "Murtipujak" })}>
                        <option value="Shwetambar">{t("Shwetambar")}</option>
                        <option value="Digambar">{t("Digambar")}</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">{t("Sub-Sect / Tradition")}</Label>
                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                        value={form.subSect || ""} onChange={(e) => setForm({ ...form, subSect: e.target.value })}>
                        {form.sect === "Digambar" ? (
                          DIGAMBAR_SUB.map(s => <option key={s} value={s}>{t(s)}</option>)
                        ) : (
                          SHWETAMBAR_SUB.map(s => <option key={s} value={s}>{t(s)}</option>)
                        )}
                      </select>
                    </div>
                  </div>

                  {form.sect === "Shwetambar" && form.subSect === "Murtipujak" && (
                    <div>
                      <Label className="text-xs">{t("Gaccha")}</Label>
                      <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                        value={form.gacchaName || ""} onChange={(e) => setForm({ ...form, gacchaName: e.target.value })}>
                        <option value="">{t("Select Gaccha...")}</option>
                        {MURTIPUJAK_GACCHAS.map(g => <option key={g} value={g}>{t(g)}</option>)}
                      </select>
                    </div>
                  )}

                  {!isDharamshala && entityLabel !== "Sthanak" && form.subSect !== "Sthanakvasi" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">{t("Mul Nayak Bhagwan")}</Label>
                          {isSuperAdmin && (
                            <button type="button" onClick={() => setCreateDeityOpen(true)}
                              className="text-[10px] text-purple-700 hover:text-purple-900 font-bold transition-all">
                              {t("+ Create Deity")}
                            </button>
                          )}
                        </div>
                        <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                          value={form.mulNayakBhagwanId || ""} onChange={(e) => setForm({ ...form, mulNayakBhagwanId: e.target.value })}>
                          <option value="">{t("Select Bhagwan...")}</option>
                          {bhagwans.filter(b => b.category === "24 Tirthankars").length > 0 && (
                            <optgroup label={t("24 Tirthankars")}>
                              {bhagwans.filter(b => b.category === "24 Tirthankars").map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </optgroup>
                          )}
                          {bhagwans.filter(b => b.category !== "24 Tirthankars").length > 0 && (
                            <optgroup label={t("Others")}>
                              {bhagwans.filter(b => b.category !== "24 Tirthankars").map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                      {field("Murti Count", "muritCount", "number")}
                    </div>
                  )}

                  {!isDharamshala && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("Temple / JC Type")}</Label>
                        <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                          value={form.templeType || ""} onChange={(e) => setForm({ ...form, templeType: e.target.value })}>
                          {TEMPLE_TYPES.map((tItem) => <option key={tItem} value={tItem}>{t(tItem.replace(/_/g, " "))}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">{t("Tithi Calendar Type")}</Label>
                        <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                          value={form.tithiCalendar || ""} onChange={(e) => setForm({ ...form, tithiCalendar: e.target.value })}>
                          {["Gujarati", "Hindi", "Kutchi", "Marathi", "Marwari", "Other"].map(m => (
                            <option key={m} value={m}>{t(m)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {field("Trust Name", "trustName")}
                    {field("Trust Registration Number", "trustRegistrationNumber")}
                  </div>

                  <div>
                    <Label className="text-xs">{t("History / Background Details")}</Label>
                    <textarea rows={2} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none"
                      value={form.history || ""} onChange={(e) => setForm({ ...form, history: e.target.value })} placeholder={t("Historical background...")} />
                  </div>
                </div>
              )}

              {isDharamshala && tab === "temple" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🛕 Temple Inside Dharamshala Premises")}</h3>
                  {toggle("Temple Available Inside?", "hasTempleInside")}
                  {form.hasTempleInside && (
                    <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-slate-700">{t("Mul Nayak Bhagwan")}</Label>
                          {isSuperAdmin && (
                            <button type="button" onClick={() => setCreateDeityOpen(true)}
                              className="text-[10px] text-purple-700 hover:text-purple-900 font-bold transition-all">
                              {t("+ Create Deity")}
                            </button>
                          )}
                        </div>
                        <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                          value={form.templeMulNayakName || ""} onChange={(e) => setForm({ ...form, templeMulNayakName: e.target.value })}>
                          <option value="">{t("Select Bhagwan...")}</option>
                          {bhagwans.filter(b => b.category === "24 Tirthankars").length > 0 && (
                            <optgroup label={t("24 Tirthankars")}>
                              {bhagwans.filter(b => b.category === "24 Tirthankars").map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                              ))}
                            </optgroup>
                          )}
                          {bhagwans.filter(b => b.category !== "24 Tirthankars").length > 0 && (
                            <optgroup label={t("Others")}>
                              {bhagwans.filter(b => b.category !== "24 Tirthankars").map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                      {field("Mul Nayak Image URL", "templeMulNayakImageUrl", "text", "https://...")}
                      <div>
                        <Label className="text-xs">{t("Temple Type")}</Label>
                        <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                          value={form.templeType || "Griha Chaityalaya"} onChange={(e) => setForm({ ...form, templeType: e.target.value })}>
                          <option value="Shikhar-baddha">{t("Shikhar-baddha")}</option>
                          <option value="Griha Chaityalaya">{t("Griha Chaityalaya")}</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">{t("Select Tithi Calendar")}</Label>
                        <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                          value={form.templeTithiCalendar || "Gujarati"} onChange={(e) => setForm({ ...form, templeTithiCalendar: e.target.value })}>
                          <option value="Gujarati">{t("Gujarati")}</option>
                          <option value="Hindi">{t("Hindi")}</option>
                          <option value="Marwari">{t("Marwari")}</option>
                          <option value="Other">{t("Other")}</option>
                        </select>
                      </div>

                      {/* Opening Timings: Morning & Evening Clock Time Pickers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Morning Opening Timings")}</Label>
                          <TimeRangePicker
                            fromValue={form.morningStart || "06:00 AM"}
                            toValue={form.morningEnd || "12:00 PM"}
                            onFromChange={(val) => setForm(prev => ({ ...prev, morningStart: val }))}
                            onToChange={(val) => setForm(prev => ({ ...prev, morningEnd: val }))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Evening Opening Timings")}</Label>
                          <TimeRangePicker
                            fromValue={form.eveningStart || "05:30 PM"}
                            toValue={form.eveningEnd || "09:00 PM"}
                            onFromChange={(val) => setForm(prev => ({ ...prev, eveningStart: val }))}
                            onToChange={(val) => setForm(prev => ({ ...prev, eveningEnd: val }))}
                          />
                        </div>
                      </div>

                      {/* Pakshal, Pooja & Aarti Clock Pickers */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Pakshal Timings")}</Label>
                          <TimePicker
                            value={form.templePakshalStart || form.pakshalStart || "06:30 AM"}
                            onChange={(t) => setForm(prev => ({ ...prev, templePakshalStart: t, pakshalStart: t }))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Morning Pooja Timings")}</Label>
                          <TimePicker
                            value={form.templePoojaStart || form.poojaStart || "07:30 AM"}
                            onChange={(t) => setForm(prev => ({ ...prev, templePoojaStart: t, poojaStart: t }))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Morning Aarti Timings")}</Label>
                          <TimePicker
                            value={form.aartiMorning || "08:30 AM"}
                            onChange={(t) => setForm(prev => ({ ...prev, aartiMorning: t }))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-700 mb-1 block">{t("Evening Aarti Timings")}</Label>
                          <TimePicker
                            value={form.templeAartiEvening || form.aartiEvening || "07:15 PM"}
                            onChange={(t) => setForm(prev => ({ ...prev, templeAartiEvening: t, aartiEvening: t }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "location" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("📍 Address & Contact Details")}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">{field("Full Address", "addressLine")}</div>
                    {isDharamshala && field("Nearest Landmark", "landmark")}
                    {isDharamshala && field("Nearest Railway Station / Bus Stop", "railwayStation")}
                    {isDharamshala && field("District", "district")}
                    {field("City", "city")}
                    {field("State", "state")}
                    <div>
                      <Label className="text-xs font-semibold text-slate-655">{t("Country")}</Label>
                      <select
                        className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                        value={form.country || "India"}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                      >
                        {ALL_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{t(c)}</option>
                        ))}
                      </select>
                    </div>
                    {field("Pin Code", "pincode")}
                    <div className="col-span-2">{field("Google Maps Link", "googleMapsLink")}</div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-655">{t("Contact Number")}</Label>
                      <Input className="bg-white h-9" type="tel" value={form.phone || ""} placeholder="+91..."
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      <div className="pt-1">
                        <Label className="text-[10px] font-bold text-slate-500 block mb-0.5">{t("Link Member for Contact Number")}</Label>
                        <MemberLinkSelect
                          value={form.primaryContactMemberId}
                          onChange={(v) => setForm({ ...form, primaryContactMemberId: v })}
                          placeholder={t("Search member by ID or name to link...")}
                          showPhone
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isDharamshala && tab === "accommodations" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🏢 Accommodations & Building Management")}</h3>
                  
                  {/* Building List */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-105 p-3 rounded-xl border">
                      <span className="text-xs font-bold text-slate-700">{t("🏢 Buildings:")} {form.buildings?.length || 0}</span>
                      <Button type="button" size="sm" onClick={addBuilding} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-7 text-xs">
                        {t("+ Add Building")}
                      </Button>
                    </div>

                    {(form.buildings || []).map((b, bIdx) => (
                      <div key={b.id || bIdx} className="border p-4 rounded-xl bg-white space-y-3 relative shadow-sm">
                        <button type="button" onClick={() => removeBuilding(b.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <div>
                            <Label className="text-xs font-bold">{t("Building Name / Identifier")}</Label>
                            <Input value={b.name} onChange={(e) => updateBuildingName(b.id, e.target.value)} className="mt-1 h-9" placeholder={t("e.g. Building A")} />
                          </div>
                          <div>
                            <Label className="text-xs font-bold">{t("Building Image URL (Optional)")}</Label>
                            <Input value={b.imageUrl} onChange={(e) => {
                              setForm(prev => ({
                                ...prev,
                                buildings: prev.buildings.map(x => x.id === b.id ? { ...x, imageUrl: e.target.value } : x)
                              }));
                            }} className="mt-1 h-9" placeholder="https://..." />
                          </div>
                        </div>

                        {/* Room Types in this Building */}
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between items-center border-t pt-2">
                            <span className="text-xs font-bold text-slate-600">{t("🛏 Room Types inside")} {b.name}</span>
                            <Button type="button" size="sm" variant="outline" onClick={() => addRoomType(b.id)} className="h-6 text-[10px] font-bold">
                              {t("+ Add Room Type")}
                            </Button>
                          </div>

                          {(b.roomTypes || []).map((r, rIdx) => (
                            <div key={r.id || rIdx} className="bg-slate-50 border p-3 rounded-lg space-y-2.5 relative">
                              <button type="button" onClick={() => removeRoomType(b.id, r.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                <X className="h-3.5 w-3.5" />
                              </button>

                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Room Type Name")}</Label>
                                  <Input value={r.name} onChange={(e) => updateRoomType(b.id, r.id, "name", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" placeholder={t("e.g. Standard AC Room")} />
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Category")}</Label>
                                  <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                    value={r.category} onChange={(e) => updateRoomType(b.id, r.id, "category", e.target.value)}>
                                    <option value="AC Room">{t("AC Room")}</option>
                                    <option value="Non-AC Room">{t("Non-AC Room")}</option>
                                    <option value="Deluxe Room">{t("Deluxe Room")}</option>
                                    <option value="Suite">{t("Suite")}</option>
                                    <option value="Dormitory">{t("Dormitory")}</option>
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Category Type")}</Label>
                                  <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                    value={r.type} onChange={(e) => updateRoomType(b.id, r.id, "type", e.target.value)}>
                                    <option value="Private">{t("Private")}</option>
                                    <option value="Shared">{t("Shared")}</option>
                                    <option value="Dormitory">{t("Dormitory")}</option>
                                  </select>
                                </div>
                              </div>

                              {/* Room Numbers setup & auto room count */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Room Numbers Setup (e.g. 101, 102, 103)")}</Label>
                                  <Input
                                    value={r.roomNumbers || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const count = val.split(",").filter(x => x.trim().length > 0).length;
                                      updateRoomType(b.id, r.id, "roomNumbers", val);
                                      if (count > 0) updateRoomType(b.id, r.id, "roomCount", count);
                                    }}
                                    className="h-8 text-xs mt-0.5 bg-white"
                                    placeholder="101, 102, 103, 104"
                                  />
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("No. of Rooms")}</Label>
                                  <Input type="number" value={r.roomCount || r.totalCount} onChange={(e) => updateRoomType(b.id, r.id, "roomCount", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" placeholder="4" />
                                </div>
                              </div>

                              {/* Occupancy & Bed Type */}
                              <div className="grid grid-cols-4 gap-2">
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Maximum Occupancy")}</Label>
                                  <Input type="number" value={r.maxOccupancy || 2} onChange={(e) => updateRoomType(b.id, r.id, "maxOccupancy", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" placeholder="2" />
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Bed Type")}</Label>
                                  <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                    value={r.bedType || "Double Occupancy"} onChange={(e) => updateRoomType(b.id, r.id, "bedType", e.target.value)}>
                                    <option value="Single Occupancy">{t("Single Occupancy")}</option>
                                    <option value="Double Occupancy">{t("Double Occupancy")}</option>
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Extra Mattress?")}</Label>
                                  <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                    value={r.hasExtraMattress || "No"} onChange={(e) => updateRoomType(b.id, r.id, "hasExtraMattress", e.target.value)}>
                                    <option value="No">{t("No")}</option>
                                    <option value="Yes">{t("Yes")}</option>
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Extra Mattress Count")}</Label>
                                  <Input type="number" disabled={r.hasExtraMattress !== "Yes"} value={r.extraMattressCount || (r.hasExtraMattress === "Yes" ? 1 : 0)} onChange={(e) => updateRoomType(b.id, r.id, "extraMattressCount", e.target.value)} className="h-8 text-xs mt-0.5 bg-white disabled:bg-slate-100" placeholder="1" />
                                </div>
                              </div>

                              {/* Charges with Currency, Basis & Extra Mattress Charge */}
                              <div className="grid grid-cols-4 gap-2">
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Charges (")}{form.preferredCurrency || "INR (₹)"})</Label>
                                  <Input type="number" value={r.charges} onChange={(e) => updateRoomType(b.id, r.id, "charges", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" placeholder="1200" />
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Charge Basis")}</Label>
                                  <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                    value={r.chargesType} onChange={(e) => updateRoomType(b.id, r.id, "chargesType", e.target.value)}>
                                    <option value="Per Room">{t("Per Room")}</option>
                                    <option value="Per Bed">{t("Per Bed")}</option>
                                    <option value="Per Person">{t("Per Person")}</option>
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Extra Mattress Charge (Rs/Mattress)")}</Label>
                                  <Input type="number" disabled={r.hasExtraMattress !== "Yes"} value={r.extraMattressCharge || ""} onChange={(e) => updateRoomType(b.id, r.id, "extraMattressCharge", e.target.value)} className="h-8 text-xs mt-0.5 bg-white disabled:bg-slate-100" placeholder={t("e.g. 200")} />
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Security Deposit")}</Label>
                                  <Input type="number" value={r.deposit} onChange={(e) => updateRoomType(b.id, r.id, "deposit", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" placeholder="500" />
                                </div>
                              </div>

                              {/* Bathroom & Room View */}
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                <div>
                                  <Label className="text-[10px] font-bold text-slate-500">{t("Attached Bathroom?")}</Label>
                                  <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                    value={r.attachedBathroom} onChange={(e) => updateRoomType(b.id, r.id, "attachedBathroom", e.target.value)}>
                                    <option value="Yes">{t("Yes")}</option>
                                    <option value="No">{t("No")}</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <Label className="text-[10px] font-bold text-slate-500">{t("Amenities (comma-separated)")}</Label>
                                <Input value={r.amenities?.join(", ") || ""} onChange={(e) => updateRoomType(b.id, r.id, "amenities", e.target.value.split(",").map(x => x.trim()))} className="h-8 text-xs mt-0.5 bg-white" placeholder={t("Fan, AC, Geyser")} />
                              </div>

                              {/* Image Upload Option (up to 5-6 images) */}
                              <div className="mt-2 pt-2 border-t space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <Label className="text-[10px] font-bold text-slate-600">{t("Room Type Images (Up to 6 images)")}</Label>
                                  <span className="text-[9px] text-slate-400 font-semibold">{(r.images || []).length}{t("/6 images uploaded")}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {(r.images || []).map((img, imgIdx) => (
                                    <div key={imgIdx} className="relative group w-11 h-11 rounded border bg-white overflow-hidden shrink-0 shadow-xs">
                                      <img src={img} alt={`Room ${imgIdx}`} className="w-full h-full object-cover" />
                                      <button type="button" onClick={() => {
                                        const updated = (r.images || []).filter((_, i) => i !== imgIdx);
                                        updateRoomType(b.id, r.id, "images", updated);
                                      }} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                  {(r.images || []).length < 6 && (
                                    <label className="w-11 h-11 rounded border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 text-slate-400 hover:text-orange-500 transition-colors">
                                      <Plus className="h-3.5 w-3.5" />
                                      <span className="text-[7px] font-bold mt-0.5">{t("Upload")}</span>
                                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        const available = 6 - (r.images || []).length;
                                        files.slice(0, available).forEach(file => {
                                          const reader = new FileReader();
                                          reader.onload = (evt) => {
                                            if (evt.target?.result) {
                                              const currentImages = r.images || [];
                                              updateRoomType(b.id, r.id, "images", [...currentImages, evt.target.result]);
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        });
                                        e.target.value = "";
                                      }} />
                                    </label>
                                  )}
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stay details */}
                  <div className="border p-4 rounded-xl bg-white space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 border-b pb-1">{t("⏱ Stay & Booking Configuration")}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {field("Check-in Time", "checkInTime", "text", "12:00 PM")}
                      {field("Check-out Time", "checkOutTime", "text", "11:00 AM")}
                    </div>
                    <div className="flex gap-4 mt-2">
                      {toggle("Advance Booking Required?", "advanceBookingRequired")}
                      {toggle("Online Booking Available?", "onlineBookingAvailable")}
                    </div>
                  </div>

                  {/* Feature Status */}
                  <div className="border p-4 rounded-xl bg-white space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 border-b pb-1">{t("📊 Availability & Block Control")}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("Live Availability Status")}</Label>
                        <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                          value={form.dharamshalaStatus || "High Availability"} onChange={(e) => setForm({ ...form, dharamshalaStatus: e.target.value })}>
                          <option value="High Availability">{t("High Availability")}</option>
                          <option value="Limited">{t("Limited Availability")}</option>
                          <option value="Full">{t("Full (Sold Out)")}</option>
                        </select>
                      </div>
                      {field("Admin Hold / Block Rooms Count", "adminBlockedRooms", "number", "0")}
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      {t("* Note: Rooms blocked or put on hold by the Admin will be displayed as \"booked\" to members, but remain flagged as Admin Blocked in backend control layers.")}
                    </p>
                  </div>

                </div>
              )}

              {tab === "facilities" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🏢 Facilities & Units")}</h3>
                  
                  {/* General Amenities */}
                  <div>
                    <Label className="text-xs block mb-2 font-semibold">{t("Select Additional Facilities Available")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {FACILITY_OPTIONS.map((f) => (
                        <button key={f} type="button" onClick={() => toggleFacility(f)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            form.facilities?.includes(f)
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white text-slate-700 border-slate-200 hover:border-orange-400"
                          }`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upashray Unit */}
                  <div className="border p-4 rounded-xl bg-white space-y-3">
                    {toggle("Upashray Available", "hasUpashray")}
                    {form.hasUpashray && (
                      <div className="grid grid-cols-2 gap-3 pl-6 border-l-2 border-l-orange-500">
                        <div>
                          <Label className="text-xs">{t("Upashray Location")}</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={form.upashrayLocation || "Within Property"} onChange={(e) => setForm({ ...form, upashrayLocation: e.target.value })}>
                            <option value="Within Property">{t("Within Property")}</option>
                            <option value="Nearby Location">{t("Nearby Location")}</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isDharamshala && (
                    /* Event Hall Unit */
                    <div className="border p-4 rounded-xl bg-white space-y-3">
                      {toggle("Event Hall Available", "hasEventHall")}
                      {form.hasEventHall && (
                        <div className="grid grid-cols-2 gap-3 pl-6 border-l-2 border-l-orange-500">
                          <div>
                            <Label className="text-xs">{t("Event Hall Purpose")}</Label>
                            <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                              value={form.eventHallPurpose || "Available for Booking"} onChange={(e) => setForm({ ...form, eventHallPurpose: e.target.value })}>
                              <option value="Available for Booking">{t("Available for Booking")}</option>
                              <option value="Temple Use Only">{t("Temple Use Only")}</option>
                            </select>
                          </div>
                          {form.eventHallPurpose === "Available for Booking" && (
                            field("Event Hall Booking Link", "eventHallBookingLink", "url", "https://...")
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!isDharamshala && (
                    /* Bhojanshala (Food) Unit */
                    <div className="border p-4 rounded-xl bg-white space-y-3">
                      {toggle("Bhojanshala (Food) Available", "hasBhojanshala")}
                      {form.hasBhojanshala && (
                        <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs mb-1 block">{t("Navkarsi Timing")}</Label>
                              {(() => {
                                const range = parseRange(form.bhojanshalaBreakfast);
                                return (
                                  <TimeRangePicker
                                    fromValue={range.from}
                                    toValue={range.to}
                                    onFromChange={(val) => setTimeRangeVal("bhojanshalaBreakfast", "from", val)}
                                    onToChange={(val) => setTimeRangeVal("bhojanshalaBreakfast", "to", val)}
                                  />
                                );
                              })()}
                            </div>
                            <div>
                              <Label className="text-xs mb-1 block">{t("Lunch Timing")}</Label>
                              {(() => {
                                const range = parseRange(form.bhojanshalaLunch);
                                return (
                                  <TimeRangePicker
                                    fromValue={range.from}
                                    toValue={range.to}
                                    onFromChange={(val) => setTimeRangeVal("bhojanshalaLunch", "from", val)}
                                    onToChange={(val) => setTimeRangeVal("bhojanshalaLunch", "to", val)}
                                  />
                                );
                              })()}
                            </div>
                            <div>
                              <Label className="text-xs mb-1 block">{t("Choviyar Timing")}</Label>
                              {(() => {
                                const range = parseRange(form.bhojanshalaDinner);
                                return (
                                  <TimeRangePicker
                                    fromValue={range.from}
                                    toValue={range.to}
                                    onFromChange={(val) => setTimeRangeVal("bhojanshalaDinner", "from", val)}
                                    onToChange={(val) => setTimeRangeVal("bhojanshalaDinner", "to", val)}
                                  />
                                );
                              })()}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">{t("Meal Type")}</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                value={form.bhojanshalaMealType || "Free"} onChange={(e) => setForm({ ...form, bhojanshalaMealType: e.target.value })}>
                                <option value="Free">{t("Free (Gochari / Sadharmik)")}</option>
                                <option value="Paid">{t("Paid (Token System)")}</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">{t("Availability")}</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                value={form.bhojanshalaAvailability || "Daily"} onChange={(e) => setForm({ ...form, bhojanshalaAvailability: e.target.value })}>
                                <option value="Daily">{t("Daily")}</option>
                                <option value="Available on Request">{t("Available on Request")}</option>
                              </select>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold">{t("Contact Person (Link Member)")}</Label>
                              </div>
                              <MemberLinkSelect
                                value={form.bhojanshalaContact}
                                onChange={(v) => setForm({ ...form, bhojanshalaContact: v })}
                                placeholder={t("Search Jain / Non-Jain member by ID or name...")}
                                showPhone
                                className="mt-1"
                              />
                              <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">{t("Mobile number will be visible to members")}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!isDharamshala && (
                    /* Dharamshala Unit */
                    <div className="border p-4 rounded-xl bg-white space-y-3">
                      {toggle("Dharamshala Available", "hasDharamshala")}
                      {form.hasDharamshala && (
                        <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">{t("Room Configuration")}</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                value={form.dharamshalaRooms || "Both"} onChange={(e) => setForm({ ...form, dharamshalaRooms: e.target.value })}>
                                <option value="AC">{t("AC Rooms only")}</option>
                                <option value="Non-AC">{t("Non-AC Rooms only")}</option>
                                <option value="Both">{t("Both AC and Non-AC")}</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs mb-1 block">{t("Office Timings")}</Label>
                              {(() => {
                                const range = parseRange(form.dharamshalaOffice);
                                return (
                                  <TimeRangePicker
                                    fromValue={range.from}
                                    toValue={range.to}
                                    onFromChange={(val) => setTimeRangeVal("dharamshalaOffice", "from", val)}
                                    onToChange={(val) => setTimeRangeVal("dharamshalaOffice", "to", val)}
                                  />
                                );
                              })()}
                            </div>
                            {field("Contact Phone", "dharamshalaPhone", "tel", "+91...")}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs font-semibold">{t("Contact Person / Manager (Link Member)")}</Label>
                              <MemberLinkSelect
                                value={form.dharamshalaContact}
                                onChange={(v) => setForm({ ...form, dharamshalaContact: v })}
                                placeholder={t("Search manager by ID or name...")}
                                showPhone
                                className="mt-1"
                              />
                              <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">{t("Mobile number will be visible to members")}</span>
                            </div>
                            <div>
                              <Label className="text-xs">{t("Online Booking Available?")}</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                value={form.dharamshalaOnline || "No"} onChange={(e) => setForm({ ...form, dharamshalaOnline: e.target.value })}>
                                <option value="Yes">{t("Yes")}</option>
                                <option value="No">{t("No")}</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!isDharamshala && (
                    /* Pathshala Unit */
                    <div className="border p-4 rounded-xl bg-white space-y-3">
                      {toggle("Pathshala Available", "hasPathshala")}
                      {form.hasPathshala && (
                        <div className="grid grid-cols-3 gap-3 pl-6 border-l-2 border-l-orange-500">
                            <div>
                              <Label className="text-xs mb-1 block">{t("Pathshala Timings")}</Label>
                              {(() => {
                                const range = parseRange(form.pathshalaTimings);
                                return (
                                  <TimeRangePicker
                                    fromValue={range.from}
                                    toValue={range.to}
                                    onFromChange={(val) => setTimeRangeVal("pathshalaTimings", "from", val)}
                                    onToChange={(val) => setTimeRangeVal("pathshalaTimings", "to", val)}
                                  />
                                );
                              })()}
                            </div>
                          {field("Pathshala Days", "pathshalaDays", "text", "Sat, Sun")}
                          {field("Teacher Name", "pathshalaTeacher", "text", "Shastriji / Teacher")}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {isDharamshala && tab === "food" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🥗 Bhojanalay / Food Facility")}</h3>
                  {toggle("Bhojanalay Available Inside?", "hasBhojanshala")}
                  {form.hasBhojanshala && (
                    <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {/* Breakfast */}
                        <div className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-3.5 space-y-2.5 shadow-2xs hover:border-amber-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">{t("🥣 Navkarsi")}</span>
                          </div>
                          <div>
                            <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Charges (₹)")}</Label>
                            <Input
                              type="number"
                              className="h-8.5 text-xs bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500 font-medium"
                              value={form.bhojanshalaBreakfastCharge || parseCharges(form.bhojanshalaBreakfast)}
                              onChange={(e) => setForm({ ...form, bhojanshalaBreakfastCharge: e.target.value })}
                              placeholder={t("e.g. 50")}
                            />
                          </div>
                          <div>
                            <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Timings (From – To)")}</Label>
                            {(() => {
                              const range = parseRange(form.bhojanshalaBreakfastTiming || parseTimeFromRange(form.bhojanshalaBreakfast));
                              return (
                                <TimeRangePicker
                                  fromValue={range.from || "07:00 AM"}
                                  toValue={range.to || "08:30 AM"}
                                  onFromChange={(val) => setForm(prev => ({ ...prev, bhojanshalaBreakfastTiming: `${val} - ${range.to || "08:30 AM"}` }))}
                                  onToChange={(val) => setForm(prev => ({ ...prev, bhojanshalaBreakfastTiming: `${range.from || "07:00 AM"} - ${val}` }))}
                                />
                              );
                            })()}
                          </div>
                        </div>

                        {/* Lunch */}
                        <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-xl p-3.5 space-y-2.5 shadow-2xs hover:border-emerald-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">{t("🍱 Lunch")}</span>
                          </div>
                          <div>
                            <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Charges (₹)")}</Label>
                            <Input
                              type="number"
                              className="h-8.5 text-xs bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-medium"
                              value={form.bhojanshalaLunchCharge || parseCharges(form.bhojanshalaLunch)}
                              onChange={(e) => setForm({ ...form, bhojanshalaLunchCharge: e.target.value })}
                              placeholder={t("e.g. 100")}
                            />
                          </div>
                          <div>
                            <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Timings (From – To)")}</Label>
                            {(() => {
                              const range = parseRange(form.bhojanshalaLunchTiming || parseTimeFromRange(form.bhojanshalaLunch));
                              return (
                                <TimeRangePicker
                                  fromValue={range.from || "11:30 AM"}
                                  toValue={range.to || "01:00 PM"}
                                  onFromChange={(val) => setForm(prev => ({ ...prev, bhojanshalaLunchTiming: `${val} - ${range.to || "01:00 PM"}` }))}
                                  onToChange={(val) => setForm(prev => ({ ...prev, bhojanshalaLunchTiming: `${range.from || "11:30 AM"} - ${val}` }))}
                                />
                              );
                            })()}
                          </div>
                        </div>

                        {/* Choviyar / Dinner */}
                        <div className="bg-purple-50/40 border border-purple-200/70 rounded-xl p-3.5 space-y-2.5 shadow-2xs hover:border-purple-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">{t("🌇 Choviyar")}</span>
                          </div>
                          <div>
                            <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Charges (₹)")}</Label>
                            <Input
                              type="number"
                              className="h-8.5 text-xs bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500 font-medium"
                              value={form.bhojanshalaDinnerCharge || parseCharges(form.bhojanshalaDinner)}
                              onChange={(e) => setForm({ ...form, bhojanshalaDinnerCharge: e.target.value })}
                              placeholder={t("e.g. 80")}
                            />
                          </div>
                          <div>
                            <Label className="text-[11px] font-bold text-slate-600 block mb-1">{t("Timings (From – To)")}</Label>
                            {(() => {
                              const range = parseRange(form.bhojanshalaDinnerTiming || parseTimeFromRange(form.bhojanshalaDinner));
                              return (
                                <TimeRangePicker
                                  fromValue={range.from || "05:00 PM"}
                                  toValue={range.to || "06:00 PM"}
                                  onFromChange={(val) => setForm(prev => ({ ...prev, bhojanshalaDinnerTiming: `${val} - ${range.to || "06:00 PM"}` }))}
                                  onToChange={(val) => setForm(prev => ({ ...prev, bhojanshalaDinnerTiming: `${range.from || "05:00 PM"} - ${val}` }))}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <div>
                          <Label className="text-xs font-semibold">{t("Contact Person / Manager (Link Member: Jain, Non-Jain or Staff)")}</Label>
                          <MemberLinkSelect
                            value={form.bhojanshalaContactMemberId || form.bhojanshalaContact}
                            onChange={(v) => setForm({ ...form, bhojanshalaContactMemberId: v, bhojanshalaContact: v })}
                            placeholder={t("Search Jain, Non-Jain or staff member...")}
                            showPhone
                            className="mt-1"
                          />
                          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">{t("Mobile number will be visible to members")}</span>
                        </div>
                        <div>
                          <Label className="text-xs">{t("Availability")}</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                            value={form.bhojanshalaAvailability || "Daily"} onChange={(e) => setForm({ ...form, bhojanshalaAvailability: e.target.value })}>
                            <option value="Daily">{t("Available Daily")}</option>
                            <option value="Available on Request">{t("Available on Request")}</option>
                          </select>
                        </div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mt-2 text-xs text-orange-850 font-semibold italic">
                        {t("📢 Auto-Message Warning Rule: \"Please call and confirm one day prior.\"")}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isDharamshala && tab === "contacts" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("👥 Contacts & Verification")}</h3>
                  <div className="space-y-3">
                    <MemberSelect label={t("Primary Contact Person (Jain / Non-Jain)")} value={form.primaryContactMemberId} onChange={(val) => setForm({ ...form, primaryContactMemberId: val })} placeholder={t("Link primary member...")} />
                    <div>
                      <Label className="text-xs font-semibold">{t("Secondary Contact Person (Link Member: Jain or Non-Jain)")}</Label>
                      <MemberLinkSelect
                        value={form.secondaryContactMemberId || form.secondaryContactNumber}
                        onChange={(v) => setForm({ ...form, secondaryContactMemberId: v, secondaryContactNumber: v })}
                        placeholder={t("Search member by ID or name to link...")}
                        showPhone
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs block font-semibold mb-1">{t("Contact Details Verification Flags")}</Label>
                        <span className="text-[10px] text-slate-500 font-medium italic">{t("📢 Tracks whether Mobile / WhatsApp / Email were OTP verified")}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 bg-white p-3 rounded-xl border">
                        {toggle("Primary Mobile Number OTP Verified (Mandatory)", "contactMobileVerified")}
                        {toggle("WhatsApp Number OTP Verified (Optional)", "contactWhatsAppVerified")}
                        {toggle("Email ID OTP Verified (Optional)", "contactEmailVerified")}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-semibold">{t("Primary Contact Preference")}</Label>
                        <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                          value={form.primaryContactPreference || "Mobile"} onChange={(e) => setForm({ ...form, primaryContactPreference: e.target.value })}>
                          <option value="Mobile">{t("Mobile")}</option>
                          <option value="WhatsApp">{t("WhatsApp")}</option>
                          <option value="Email">{t("Email")}</option>
                        </select>
                      </div>

                      {form.primaryContactPreference === "Email" && (
                        <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-200 space-y-1">
                          <Label className="text-xs font-bold text-orange-900">{t("Primary Contact Email ID *")}</Label>
                          <Input
                            type="email"
                            value={form.email || form.primaryContactEmail || ""}
                            onChange={(e) => setForm({ ...form, email: e.target.value, primaryContactEmail: e.target.value })}
                            placeholder={t("e.g. contact@dharamshala.org")}
                            className="h-9 bg-white text-sm"
                          />
                        </div>
                      )}

                      {form.primaryContactPreference === "WhatsApp" && (
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 space-y-1">
                          <Label className="text-xs font-bold text-emerald-900">{t("Primary Contact WhatsApp Number *")}</Label>
                          <Input
                            type="tel"
                            value={form.whatsapp || form.primaryContactWhatsapp || ""}
                            onChange={(e) => setForm({ ...form, whatsapp: e.target.value, primaryContactWhatsapp: e.target.value })}
                            placeholder={t("e.g. +91 9876543210")}
                            className="h-9 bg-white text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isDharamshala && tab === "trustees" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <h3 className="text-sm font-bold text-slate-800">{t("👥 Trustees & Committee Members (Max 20)")}</h3>
                    <Button type="button" size="sm" onClick={addTrusteeRow} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-7 text-xs" disabled={(form.trusteesList || []).length >= 20}>
                      {t("+ Link Trustee")}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {(form.trusteesList || []).map((tItem, idx) => (
                      <div key={tItem.id || idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border relative">
                        <button type="button" onClick={() => removeTrusteeRow(tItem.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                        <div className="flex-1">
                          <MemberSelect label={`Trustee #${idx+1} Member`} value={tItem.memberId} onChange={(val) => updateTrusteeRow(tItem.id, "memberId", val)} placeholder={t("Link trustee member...")} />
                        </div>
                        <div className="w-56">
                          <Label className="text-xs font-semibold text-slate-700">{t("Designation *")}</Label>
                          <select
                            className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium focus:outline-none focus:border-orange-500"
                            value={
                              TRUSTEE_DESIGNATIONS.includes(tItem.designation)
                                ? tItem.designation
                                : tItem.designation
                                ? "Other"
                                : "Trustee"
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "Other") {
                                updateTrusteeRow(tItem.id, "designation", "Other");
                              } else {
                                updateTrusteeRow(tItem.id, "designation", val);
                              }
                            }}
                          >
                            {TRUSTEE_DESIGNATIONS.map((d) => (
                              <option key={d} value={d}>{t(d)}</option>
                            ))}
                          </select>
                          {(!TRUSTEE_DESIGNATIONS.includes(tItem.designation) || tItem.designation === "Other") && (
                            <Input
                              className="h-8 text-xs mt-1.5 bg-white"
                              value={tItem.customDesignation || (tItem.designation === "Other" ? "" : tItem.designation)}
                              onChange={(e) => updateTrusteeRow(tItem.id, "designation", e.target.value)}
                              placeholder={t("Specify custom designation...")}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isDharamshala && tab === "volunteers" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <h3 className="text-sm font-bold text-slate-800">{t("🤝 Volunteer Members")}</h3>
                    <Button type="button" size="sm" onClick={addVolunteerRow} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-7 text-xs">
                      {t("+ Link Volunteer")}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {(form.volunteersList || []).map((v, idx) => (
                      <div key={v.id || idx} className="flex items-end gap-3 bg-white p-3 rounded-xl border relative">
                        <button type="button" onClick={() => removeVolunteerRow(v.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                        <div className="flex-1">
                          <MemberSelect label={`Volunteer #${idx+1} Member`} value={v.memberId} onChange={(val) => updateVolunteerRow(v.id, val)} placeholder={t("Link volunteer member...")} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    {t("* Linking members as volunteers will automatically display \"Volunteer at this Dharamshala\" on their public member profile card.")}
                  </p>
                </div>
              )}

              {isDharamshala && tab === "rules" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("📜 Guidelines & Safety Controls")}</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-bold">{t("Rules & Guidelines Section")}</Label>
                      <textarea rows={6} className="w-full mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                        value={form.rulesText} onChange={(e) => setForm({ ...form, rulesText: e.target.value })}
                        placeholder={t("Define Dharamshala rules, ID requirements, stay limits, cleanliness instructions, and discipline guidelines...")} />
                    </div>
                  </div>
                </div>
              )}

              {isDharamshala && tab === "bank" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("💰 Bank & Donation Details")}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {field("Bank Account Name", "bankAccountName", "text", "e.g. Shree Jain Sangh Trust")}
                    {field("Bank Account Number", "bankAccount", "text", "Account Number")}
                    {field("IFSC Code", "bankIfsc", "text", "e.g. SBIN0001234")}
                    {field("Bank Name", "bankName", "text", "e.g. State Bank of India")}
                    <div className="col-span-2">{field("Branch Address", "bankBranch", "text", "Branch Name / Address")}</div>
                    {field("UPI ID", "upiId", "text", "name@upi")}
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Preferred Display Currency")}</Label>
                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:border-orange-500"
                        value={form.preferredCurrency || "INR (₹)"}
                        onChange={(e) => setForm({ ...form, preferredCurrency: e.target.value })}>
                        <option value="INR (₹)">{t("INR (₹)")}</option>
                        <option value="USD ($)">{t("USD ($)")}</option>
                        <option value="EUR (€)">{t("EUR (€)")}</option>
                        <option value="GBP (£)">{t("GBP (£)")}</option>
                        <option value="AED (AED)">{t("AED (AED)")}</option>
                        <option value="CAD ($)">{t("CAD ($)")}</option>
                        <option value="AUD ($)">{t("AUD ($)")}</option>
                        <option value="SGD ($)">{t("SGD ($)")}</option>
                        <option value="Other">{t("Other")}</option>
                      </select>
                    </div>
                    <div className="col-span-2">{field("QR Code upload / Image URL", "donationQrCodeUrl", "text", "https://...")}</div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 bg-white p-3.5 border rounded-xl">
                    {toggle("Eligible for 80G Tax Deductions", "is80gEligible")}
                    {toggle("Eligible for CSR Charity Funding", "csrEligible")}
                  </div>
                </div>
              )}

              {isDharamshala && tab === "links" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🔗 Social Media & UX Links")}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {field("Instagram Link", "instaLink", "url", "https://instagram.com/...")}
                    {field("Facebook Link", "facebookLink", "url", "https://facebook.com/...")}
                    {field("YouTube Link", "youtubeLink", "url", "https://youtube.com/...")}
                    {field("Website Link", "website", "url", "https://...")}
                  </div>
                  <div className="border-t pt-3">
                    <Label className="text-xs font-bold block mb-1">{t("Live Availability Indicator Option")}</Label>
                    {toggle("Activate Live Bookings Dashboard?", "onlineBookingAvailable")}
                  </div>
                </div>
              )}

              {!isDharamshala && tab === "timings" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🕒 Slot & Ritual Timings")}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Morning Darshan From *")}</Label>
                      <TimePicker
                        value={form.morningStart || "08:00 AM"}
                        onChange={(t) => setForm({ ...form, morningStart: t })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Morning Darshan To *")}</Label>
                      <TimePicker
                        value={form.morningEnd || "12:00 PM"}
                        onChange={(t) => setForm({ ...form, morningEnd: t })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Evening Darshan From")}</Label>
                      <TimePicker
                        value={form.eveningStart || "05:30 PM"}
                        onChange={(t) => setForm({ ...form, eveningStart: t })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Evening Darshan To")}</Label>
                      <TimePicker
                        value={form.eveningEnd || "09:00 PM"}
                        onChange={(t) => setForm({ ...form, eveningEnd: t })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t pt-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Pakshal Timing From")}</Label>
                      <TimePicker
                        value={form.pakshalStart || "06:30 AM"}
                        onChange={(t) => setForm({ ...form, pakshalStart: t })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Pakshal Timing To")}</Label>
                      <TimePicker
                        value={form.pakshalEnd || "08:00 AM"}
                        onChange={(t) => setForm({ ...form, pakshalEnd: t })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Morning Pooja From")}</Label>
                      <TimePicker
                        value={form.poojaStart || "07:00 AM"}
                        onChange={(t) => setForm({ ...form, poojaStart: t })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Morning Pooja To")}</Label>
                      <TimePicker
                        value={form.poojaEnd || "08:30 AM"}
                        onChange={(t) => setForm({ ...form, poojaEnd: t })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t pt-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Morning Aarti From")}</Label>
                      <TimePicker
                        value={form.aartiMorning || "08:30 AM"}
                        onChange={(t) => setForm({ ...form, aartiMorning: t })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Evening Aarti To")}</Label>
                      <TimePicker
                        value={form.aartiEvening || "07:30 PM"}
                        onChange={(t) => setForm({ ...form, aartiEvening: t })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {!isDharamshala && tab === "finance" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("💰 Bank & Donation Details")}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {field("Bank Account Name", "bankAccountName", "text", "e.g. Shree Jain Sangh Trust")}
                    {field("Bank Account Number", "bankAccount", "text", "Account Number")}
                    {field("IFSC Code", "bankIfsc", "text", "e.g. SBIN0001234")}
                    {field("Bank Name", "bankName", "text", "e.g. State Bank of India")}
                    <div className="col-span-2">{field("Branch Address", "bankBranch", "text", "Branch Name / Address")}</div>
                    {field("UPI ID", "upiId", "text", "name@upi")}
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">{t("Currency")}</Label>
                      <Input className="mt-1 bg-white h-9" value={form.preferredCurrency || "INR (₹)"}
                        onChange={(e) => setForm({ ...form, preferredCurrency: e.target.value })} placeholder={t("INR (₹)")} />
                    </div>
                    <div className="col-span-2">{field("QR Code upload / Image URL", "donationQrCodeUrl", "text", "https://...")}</div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 bg-white p-3.5 border rounded-xl">
                    {toggle("Eligible for 80G Tax Deductions", "is80gEligible")}
                    {toggle("Eligible for CSR Charity Funding", "csrEligible")}
                  </div>
                </div>
              )}

            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={onClose}>{t("Cancel")}</Button>
              <Button onClick={save} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">{loading ? t("Saving…") : t("Save Changes")}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
      {/* Inline Deity Creation Dialog */}
      <Dialog open={createDeityOpen} onOpenChange={setCreateDeityOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateDeitySubmit}>
            <DialogHeader>
              <DialogTitle className="text-slate-800 flex items-center gap-2">
                {t("🪷 Create Deity (Bhagwan / Deva)")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 text-xs">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Deity Name *")}</Label>
                <Input value={deityName} onChange={(e) => setDeityName(e.target.value)} placeholder={t("e.g. Shri Nakoda Parshvanath")} className="mt-1 h-9 bg-white" required />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Category *")}</Label>
                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                  value={deityCategory} onChange={(e) => setDeityCategory(e.target.value)}>
                  <option value="24 Tirthankars">{t("24 Tirthankars")}</option>
                  <option value="Others">{t("Others")}</option>
                </select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setCreateDeityOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={deitySaving} className="bg-purple-700 hover:bg-purple-800 text-white font-bold">
                {deitySaving ? t("Creating...") : t("Create Deity")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Main OrgDetailPage ────────────────────────────────────────────────────── */
export default function OrgDetailPage({ basePath, entityLabel, apiPrefix }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const [org, setOrg]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]       = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const logoFileRef = useRef();
  const [logoUploading, setLogoUploading] = useState(false);

  // Incorrect Info Ticket dialog state
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketField, setTicketField] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketSaving, setTicketSaving] = useState(false);

  const loadOrg = () => {
    setLoading(true);
    api.get(`${apiPrefix}/${id}`)
      .then((res) => setOrg(res.data?.data || null))
      .catch((e) => setErr(extractErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, apiPrefix]);

  const follow = async () => {
    try { await api.post(`${apiPrefix}/${id}/follow`); toast.success(`Following this ${entityLabel.toLowerCase()}.`); }
    catch (e) { toast.error(extractErrorMessage(e)); }
  };

  const uploadLogo = async (file) => {
    setLogoUploading(true);
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const fd = new FormData(); fd.append("logo", file);
      const res = await fetch(`${API_BASE}${apiPrefix}/${id}/logo`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      if (!res.ok) throw new Error();
      toast.success(t("Logo updated."));
      loadOrg();
    } catch { toast.error(t("Logo upload failed.")); }
    finally { setLogoUploading(false); }
  };

  const submitIncorrectInfoTicket = async () => {
    if (!ticketField || !ticketDesc) {
      toast.error(t("Please provide the incorrect field and a description."));
      return;
    }
    setTicketSaving(true);
    try {
      const payload = {
        title: `Incorrect Info: ${entityLabel} (${org?.publicId})`,
        category: "INCORRECT_INFO_REPORT",
        description: `Field: ${ticketField}\nDetails: ${ticketDesc}`,
        priority: "MEDIUM"
      };
      await api.post("/tickets", payload);
      toast.success(t("Support ticket registered successfully. You can track status in the app."));
      setTicketOpen(false);
      setTicketField("");
      setTicketDesc("");
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setTicketSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );

  if (err) return <EmptyState title={t("Unable to load")} description={err} />;
  if (!org) return <EmptyState title={t("Not found")} />;

  const isTemple = entityLabel === "Temple";
  const isDharamshala = entityLabel === "Dharamshala";
  const accentClass = isTemple ? "from-orange-500 to-amber-400" : isDharamshala ? "from-teal-600 to-emerald-500" : "from-blue-600 to-indigo-500";
  const accentColor = isTemple ? "#E64E0A" : isDharamshala ? "#0D9488" : "#2563EB";
  const canEdit = isSuperAdmin;

  return (
    <div data-testid="org-detail-page">
      {/* Back */}
      <button onClick={() => navigate(basePath)}
        className="flex items-center text-xs text-muted-foreground hover:text-foreground mb-5 group">
        <ChevronLeft className="h-3.5 w-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
        {t("Back to")} {entityLabel}s
      </button>

      {/* Hero Card — premium */}
      <div className={`relative rounded-2xl overflow-hidden mb-6 shadow-xl`}>
        {/* Gradient top banner */}
        <div className={`h-28 w-full bg-gradient-to-r ${accentClass} relative`}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="absolute inset-0 flex items-center justify-end px-6 gap-3">
            <Button variant="outline" onClick={() => setTicketOpen(true)} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Flag className="h-4 w-4 mr-2" /> {t("Report Error")}
            </Button>
            {!isSuperAdmin && (
              <Button variant="outline" onClick={follow} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Heart className="h-4 w-4 mr-2" /> {t("Follow")}
              </Button>
            )}
            {canEdit && (
              <Button onClick={() => setEditOpen(true)} className="bg-white text-slate-800 hover:bg-white/90">
                <Pencil className="h-4 w-4 mr-2" /> {t("Edit Details")}
              </Button>
            )}
          </div>
        </div>

        {/* Content below banner */}
        <div className="bg-white px-6 pb-6">
          <div className="flex gap-5 -mt-12">
            {/* Logo */}
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-lg bg-slate-100 overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => canEdit && logoFileRef.current?.click()}>
                {logoUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                ) : org.logoUrl ? (
                  <img src={org.logoUrl.startsWith("http") ? org.logoUrl : `${STATIC_URL}${org.logoUrl}`}
                    alt="" className="h-full w-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Landmark className="h-8 w-8 text-slate-400" />
                    {canEdit && <span className="text-[9px] text-slate-400">{t("Upload logo")}</span>}
                  </div>
                )}
              </div>
              {canEdit && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center shadow cursor-pointer"
                  onClick={() => logoFileRef.current?.click()}>
                  <Camera className="h-3 w-3 text-white" />
                </div>
              )}
              <input ref={logoFileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
            </div>

            {/* Info */}
            <div className="pt-14">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-800 leading-tight">{org.name}</h2>
                <Badge variant="secondary" className="font-mono text-xs text-orange-655 tracking-wider bg-orange-50 font-bold border border-orange-100">
                  {org.publicId}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-orange-500" /> {org.addressLine || [org.city, org.state].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-5 border-slate-100">
            {[
              ["Followers",      org.followerCount || 0, "❤️"],
              ["Dhaja Records", org.dhajaRecords?.length || 0, "🚩"],
              ["Average Rating", org.averageRating || "—", "⭐"],
              ["Volunteers",     org.volunteerCount || 0, "🤝"]
            ].map(([label, count, emoji]) => (
              <div key={label} className="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-lg font-black text-slate-800">{emoji} {count}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-extrabold mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="mb-5 flex-wrap h-auto gap-1 bg-slate-100/80 p-1 rounded-xl">
          {(isDharamshala
            ? ["info", "accommodations", "food", "trustees", "volunteers", "rules", "bank", "gallery", "reviews"]
            : ["info", "gallery", "trustees", "contacts", "notices", "reviews", "dhaja", "chaturmas"]
          ).map((tab) => {
            if ((entityLabel !== "Temple" && entityLabel !== "Jain Center") && tab === "chaturmas") return null;
            return (
              <TabsTrigger key={tab} value={tab} data-testid={`tab-${tab}`}
                className="capitalize rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-bold py-2 px-3">
                {tab === "dhaja" ? t("🚩 Dhaja") : tab === "gallery" ? t("🖼 Gallery") : tab === "trustees" ? t("👥 Trustees") :
                 tab === "contacts" ? t("📞 Contacts") : tab === "notices" ? t("📢 Notices") : tab === "reviews" ? t("⭐ Reviews") :
                 tab === "chaturmas" ? t("❄️ Chaturmas") : tab === "accommodations" ? t("🏨 Rooms & Rates") :
                 tab === "food" ? t("🥗 Bhojanalay") : tab === "volunteers" ? t("🤝 Volunteers") :
                 tab === "rules" ? t("📋 Safety & Rules") : tab === "bank" ? t("💰 Banking") : t("ℹ Info")}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* INFO */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Primary metadata list */}
            <Card className="p-6 rounded-2xl border-border">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4">
                {isDharamshala ? t("🏨 Dharamshala Basic Details") : t("Basic Information")}
              </h3>
              <div className="grid grid-cols-2 gap-x-10 gap-y-3.5">
                {isDharamshala ? (
                  [
                    ["Public ID",       org.publicId],
                    ["Community",       org.sect || "Shwetambar"],
                    ["Sub-Community",   org.subSect || "—"],
                    ["Gaccha Name",     org.gacchaName || "—"],
                    ["Trust Name",      org.trustName],
                    ["Trust Reg. No.",  org.trustRegistrationNumber],
                    ["Established",     formatDate(org.establishedDate)],
                    ["City",            org.city],
                    ["State",           org.state],
                    ["Country",         org.country],
                    ["Pincode",         org.pincode],
                    ["General Phone",   org.phone],
                    ["Website",         org.website],
                    ["Landmark",        org.landmark],
                    ["Railway Station", org.railwayStation],
                    ["District",        org.district],
                  ].filter(([, v]) => v != null && v !== "").map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">{k}</div>
                      <div className="text-sm mt-0.5 font-medium text-slate-800">{v}</div>
                    </div>
                  ))
                ) : (
                  [
                    ["Public ID",       org.publicId],
                    ["Sect",            org.sect || "Shwetambar"],
                    ["Sub-Sect",        org.subSect || "Murtipujak"],
                    ["Gaccha Name",     org.gacchaName || "—"],
                    ["Mul Nayak",       org.mulNayakBhagwan?.name || "—"],
                    ["Established",     formatDate(org.establishedDate)],
                    ["City",            org.city],
                    ["State",           org.state],
                    ["Country",         org.country],
                    ["Pincode",         org.pincode],
                    ["Phone",           org.phone],
                    ["Website",         org.website],
                    ["Bhojanshala",     org.hasBhojanshala ? t("Yes ✓") : t("No")],
                    ["Upashray",        org.hasUpashray ? t("Yes ✓") : t("No")],
                    ["Event Hall",      org.hasEventHall ? t("Yes ✓") : t("No")],
                    ["80G Tax-Exempt",  org.is80gEligible ? t("Yes ✓") : t("No")],
                    ["CSR Eligible",    org.csrEligible ? t("Yes ✓") : t("No")],
                    ["Trust Name",      org.trustName],
                    ["Trust Reg. No.",  org.trustRegistrationNumber],
                    ["UPI ID",          org.upiId],
                    ["Display Currency", org.preferredCurrency || "INR (₹)"],
                    ["Temple Type",     org.templeType?.replace(/_/g, " ")],
                  ].filter(([, v]) => v != null && v !== "").map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">{k}</div>
                      <div className="text-sm mt-0.5 font-medium text-slate-800">{v}</div>
                    </div>
                  ))
                )}
              </div>

              {org.facilities?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-3">{t("Additional Facilities")}</div>
                  <div className="flex flex-wrap gap-2">
                    {org.facilities.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {org.history && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-2">{t("History & Background")}</div>
                  <p className="text-sm leading-relaxed text-slate-700 font-medium">{org.history}</p>
                </div>
              )}
            </Card>

            {/* Timing Slots or Directions Card */}
            <Card className="p-6 rounded-2xl border-border space-y-4">
              {isDharamshala ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{t("📍 Directions & Map")}</h3>
                  {org.googleMapsLink ? (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">{t("Find us on Google Maps for step-by-step directions to our property:")}</p>
                      <Button onClick={() => window.open(org.googleMapsLink, "_blank")} className="bg-teal-655 hover:bg-teal-700 text-white font-bold text-xs gap-2">
                        <MapPin className="h-4 w-4" /> {t("Open in Maps")}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">{t("No GPS coordinates or Maps link registered yet.")}</p>
                  )}
                  {org.hasTempleInside && (
                    <div className="border-t pt-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-750 flex items-center gap-1.5">{t("🛕 Inside Temple Available")}</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="font-semibold text-slate-500 block">{t("Bhagwan")}</span> <span className="font-bold text-slate-800">{org.templeMulNayakName || "—"}</span></div>
                        <div><span className="font-semibold text-slate-500 block">{t("Type")}</span> <span className="font-bold text-slate-800">{org.templeType || "—"}</span></div>
                        <div><span className="font-semibold text-slate-500 block">{t("Pakshal Timings")}</span> <span className="font-bold text-slate-800">{org.templePakshalStart || "—"}</span></div>
                        <div><span className="font-semibold text-slate-500 block">{t("Morning Pooja")}</span> <span className="font-bold text-slate-800">{org.templePoojaStart || "—"}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{t("🕒 Standard Temple Timings")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Morning Timing")}</span>
                      <span className="text-sm font-semibold text-slate-800 block mt-1">{org.morningStart || "06:00 AM"} – {org.morningEnd || "12:00 PM"}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Evening Timing")}</span>
                      <span className="text-sm font-semibold text-slate-800 block mt-1">{org.eveningStart || "05:30 PM"} – {org.eveningEnd || "09:00 PM"}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Pakshal Timing")}</span>
                      <span className="text-sm font-semibold text-slate-800 block mt-1">{org.pakshalStart || "06:30 AM"} – {org.pakshalEnd || "08:00 AM"}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Morning Aarti")}</span>
                      <span className="text-sm font-semibold text-slate-800 block mt-1">{org.aartiMorning || "08:30 AM"}</span>
                    </div>
                  </div>

                  {org.hasBhojanshala && (
                    <div className="bg-orange-50/50 p-4 border border-orange-100 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-orange-850 flex items-center gap-1.5"><Coffee className="h-4 w-4" /> {t("Bhojanshala Stay details")}</span>
                      <div className="text-xs text-orange-700 leading-relaxed space-y-1">
                        <p>{t("• Lunch:")} {org.bhojanshalaLunch || "11:30 AM to 01:30 PM"}</p>
                        <p>{t("• Choviyar:")} {org.bhojanshalaDinner || "Up to 20 minutes before Sunset"}</p>
                        <p className="font-bold text-[10px] uppercase tracking-wider text-orange-600 mt-2">{t("✓ Rule: \"Please call and confirm your visit at least one day prior.\"")}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

          </div>

          {/* Disclaimer at bottom */}
          <div className="bg-slate-100 p-4 rounded-xl border text-[11px] text-slate-500 leading-relaxed font-semibold italic text-center">
            {isDharamshala ? (
              <span>
                {t("📌 Disclaimer: “All the above timings, charges, and availability are subject to change. Kindly contact the")} {org.name} {t("directly to confirm before planning your stay.”")}
              </span>
            ) : (
              <span>
                {t("📌 Disclaimers: \"All the above timings, facilities, contact details, and other information are subject to change. Visitors are advised to contact the respective Temple / Jain Centre directly to confirm the latest information before planning their visit.\"")}
              </span>
            )}
          </div>
        </TabsContent>

        {isDharamshala && (
          <>
            <TabsContent value="accommodations" className="space-y-4">
              <Card className="p-6 rounded-2xl border-border space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">{t("🏢 Accommodations & Availability")}</h3>
                  <Badge className="bg-teal-655 text-white">{org.dharamshalaStatus || "High Availability"}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Check-in Time")}</span>
                    <span className="text-sm font-semibold text-slate-800 block mt-1">{org.checkInTime || "12:00 PM"}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Check-out Time")}</span>
                    <span className="text-sm font-semibold text-slate-800 block mt-1">{org.checkOutTime || "11:00 AM"}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Advance Booking")}</span>
                    <span className="text-sm font-semibold text-slate-800 block mt-1">{org.advanceBookingRequired ? t("Yes ✓") : t("No")}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Online Booking")}</span>
                    <span className="text-sm font-semibold text-slate-800 block mt-1">{org.onlineBookingAvailable ? t("Available ✓") : t("Off-line Only")}</span>
                  </div>
                </div>

                {org.adminBlockedRooms > 0 && (
                  <div className="bg-slate-100 p-3.5 border rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" /> {t("Admin blocked or put on hold:")} {org.adminBlockedRooms} {t("rooms. (Visible only in admin dashboard panel)")}
                  </div>
                )}

                {/* Buildings List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{t("🏢 Buildings & Rooms Registry")}</h4>
                  {org.buildings && org.buildings.length > 0 ? (
                    org.buildings.map((b, bIdx) => (
                      <div key={b.id || bIdx} className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="font-bold text-sm text-slate-850">🏢 {b.name}</span>
                          {b.imageUrl && <span className="text-[10px] text-teal-600 font-semibold">{t("Image Uploaded ✓")}</span>}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(b.roomTypes || []).map((r, rIdx) => (
                            <div key={r.id || rIdx} className="bg-slate-50 p-3 rounded-lg border text-xs space-y-1.5">
                              <div className="flex justify-between font-bold text-slate-800">
                                <span>{r.name}</span>
                                <Badge variant="outline" className="text-[9px] scale-90 origin-right">{r.category} | {r.type}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-500 font-medium pt-1">
                                <div>{t("Rooms:")} <span className="font-bold text-slate-800">{r.roomCount}</span></div>
                                <div>{t("Capacity:")} <span className="font-bold text-slate-800">{r.bedCapacity} {t("beds")}</span></div>
                                <div>{t("Rate:")} <span className="font-bold text-slate-800">₹{r.charges} / {r.chargesType}</span></div>
                                <div>{t("Attached Bath:")} <span className="font-bold text-slate-800">{r.attachedBathroom}</span></div>
                              </div>
                              {r.amenities?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-slate-100">
                                  {r.amenities.map(a => <Badge key={a} variant="outline" className="text-[9px] bg-white">{a}</Badge>)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-slate-400 py-6">{t("No building accommodation records configured.")}</div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="food" className="space-y-4">
              <Card className="p-6 rounded-2xl border-border space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">{t("🥗 Bhojanalay Details")}</h3>
                {org.hasBhojanshala ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Navkarsi")}</span>
                        <span className="text-sm font-semibold text-slate-800 block mt-1">{org.bhojanshalaBreakfast || "—"}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Lunch")}</span>
                        <span className="text-sm font-semibold text-slate-800 block mt-1">{org.bhojanshalaLunch || "—"}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Choviyar")}</span>
                        <span className="text-sm font-semibold text-slate-800 block mt-1">{org.bhojanshalaDinner || "—"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs border-t pt-4">
                      <div><span className="text-slate-500 font-semibold block">{t("Availability Status")}</span> <span className="font-bold text-slate-800 text-sm">{org.bhojanshalaAvailability || "Daily"}</span></div>
                      <div><span className="text-slate-500 font-semibold block">{t("Food Contact / Manager")}</span> <span className="font-bold text-slate-800 text-sm">{org.bhojanshalaContact || "Caretaker / Office Manager"}</span></div>
                    </div>
                    <div className="bg-orange-50 p-4 border border-orange-100 rounded-xl text-xs text-orange-850 font-semibold text-center italic">
                      {t("📢 Auto-Message Warning Rule: \"Please call and confirm one day prior.\"")}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-6 text-center">{t("Bhojanshala facility is not available inside the property.")}</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="volunteers" className="space-y-4">
              <Card className="p-6 rounded-2xl border-border space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">{t("🤝 Volunteer Members Registry")}</h3>
                {org.volunteersList && org.volunteersList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {org.volunteersList.map((v, i) => (
                      <Card key={i} className="p-3 bg-slate-50 border rounded-xl flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{v.member?.fullName || "Linked Volunteer"}</span>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase font-mono">{t("ID:")} {v.member?.publicId || "—"}</span>
                        <span className="text-[10px] text-teal-655 font-bold mt-1 bg-teal-50 px-2 py-0.5 rounded w-max">{t("Active Volunteer")}</span>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-6 text-center">{t("No volunteer members associated with this Dharamshala.")}</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <Card className="p-6 rounded-2xl border-border space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">{t("📋 Stay Guidelines & Rules")}</h3>
                {org.rulesText ? (
                  <p className="text-xs text-slate-655 font-medium whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border">
                    {org.rulesText}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic py-6 text-center">{t("No rules or guidelines defined yet.")}</p>
                )}
                <div className="grid grid-cols-2 gap-4 border-t pt-4 text-xs">
                  <div><span className="text-slate-500 font-semibold block">{t("🚨 Emergency Contact Number")}</span> <span className="font-bold text-slate-800">{org.emergencyContact || "—"}</span></div>
                  <div><span className="text-slate-500 font-semibold block">{t("Caretaker / Manager Details")}</span> <span className="font-bold text-slate-800">{org.caretakerDetails || "—"}</span></div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <Card className="p-6 rounded-2xl border-border space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">{t("💰 Banking & Tax Exemption Details")}</h3>
                <div className="grid grid-cols-2 gap-x-10 gap-y-3.5 text-xs">
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Bank Account Number")}</span> <span className="font-bold text-slate-800 text-sm">{org.bankAccount || "—"}</span></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Bank Name")}</span> <span className="font-bold text-slate-800 text-sm">{org.bankName || "—"}</span></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Branch Name")}</span> <span className="font-bold text-slate-800 text-sm">{org.bankBranch || "—"}</span></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">{t("IFSC Code")}</span> <span className="font-bold text-slate-800 text-sm">{org.bankIfsc || "—"}</span></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">{t("UPI ID")}</span> <span className="font-bold text-slate-800 text-sm">{org.upiId || "—"}</span></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Preferred display Currency")}</span> <span className="font-bold text-slate-800 text-sm">{org.preferredCurrency || "INR (₹)"}</span></div>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 bg-slate-50 p-3.5 border rounded-xl text-xs font-semibold">
                  <div>{t("80G Tax-Exempt Status:")} <Badge variant="outline" className={org.is80gEligible ? "text-green-600 bg-green-50" : "text-slate-400"}>{org.is80gEligible ? t("Eligible ✓") : t("No")}</Badge></div>
                  <div>{t("CSR Charity Funding:")} <Badge variant="outline" className={org.csrEligible ? "text-green-600 bg-green-50" : "text-slate-400"}>{org.csrEligible ? t("Eligible ✓") : t("No")}</Badge></div>
                </div>
                {org.donationQrCodeUrl && (
                  <div className="border-t pt-4 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">{t("Scan to Donate UPI QR Code")}</span>
                    <img src={org.donationQrCodeUrl} className="mx-auto h-32 w-32 border p-1 bg-white rounded-lg shadow-sm" alt={t("Donation QR Code")} />
                  </div>
                )}
              </Card>
            </TabsContent>
          </>
        )}

        <TabsContent value="gallery">
          <GalleryTab images={org.gallery} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="trustees">
          <TrusteesTab trustees={org.trustees} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsTab contacts={org.contacts} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="notices">
          <NoticesTab notices={org.notices} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTab reviews={org.reviews} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} isSuperAdmin={isSuperAdmin} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="dhaja">
          <DhajaTab dhajaRecords={org.dhajaRecords} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="chaturmas">
          <ChaturmasTab chaturmasStays={org.chaturmasStays} apiPrefix={apiPrefix} orgId={org.id} org={org} onRefresh={loadOrg} canEdit={canEdit} isSuperAdmin={isSuperAdmin} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <EditOrgDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        org={org}
        apiPrefix={apiPrefix}
        onSaved={loadOrg}
        entityLabel={entityLabel}
      />

      {/* Report Incorrect Info Dialog */}
      <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <AlertTriangle className="h-5 w-5 text-orange-500" /> {t("Report Incorrect Information")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">{t("Which field/section is incorrect?")}</Label>
              <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                value={ticketField} onChange={(e) => setTicketField(e.target.value)}>
                <option value="">{t("Select section...")}</option>
                <option value="Timings">{t("Temple timings")}</option>
                <option value="Facilities">{t("Facilities list")}</option>
                <option value="Bhojanshala">{t("Bhojanshala details")}</option>
                <option value="Trustees">{t("Trustees roster")}</option>
                <option value="Address/Maps">{t("Address or Maps location")}</option>
                <option value="Other">{t("Other details")}</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">{t("Correct Information Details")}</Label>
              <textarea rows={4} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none"
                value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} placeholder={t("Please describe the correct details...")} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setTicketOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={submitIncorrectInfoTicket} disabled={ticketSaving} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">{ticketSaving ? t("Submitting…") : t("Report Error")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
