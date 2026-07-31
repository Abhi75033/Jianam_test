import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { MemberIdCardDialog } from "@/components/common/MemberIdCardDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MemberLinkSelect from "@/components/common/MemberLinkSelect";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { GENDER_OPTIONS } from "@/constants/dropdownOptions";
import { UserPlus, Loader2, Users, Shield, IdCard } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { initials } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/* ─── Add Family Member Dialog ─────────────────────────────────────────
 *
 * Two ways to add someone:
 *   "link"   — pick an EXISTING member and relate them to the anchor member.
 *   "invite" — create a new person from name + mobile (original behaviour).
 *
 * Expected API contract (backend team — please match):
 *   POST /family
 *     link   → { anchorMemberPublicId?, relatedMemberPublicId, relationshipTypeId }
 *     invite → { anchorMemberPublicId?, name, mobile, relationshipTypeId, category }
 *   `anchorMemberPublicId` is omitted for "my family"; Super Admins send it to
 *   link two arbitrary members under one family.
 * ------------------------------------------------------------------ */
function AddFamilyDialog({ open, onClose, onCreated, anchorPublicId, anchorLabel }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState("link");
  const [linkedMember, setLinkedMember] = useState("");
  const [form, setForm] = useState({
    firstName: "", surname: "", mobile: "", relationshipTypeId: "", dob: "", gender: "Male",
  });
  const [relTypes, setRelTypes] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      api.get("/master-data/relationship-types")
        .then((res) => setRelTypes(res.data?.data || []))
        .catch(() => setRelTypes([]));
    }
  }, [open]);

  const reset = () => {
    setForm({ firstName: "", surname: "", mobile: "", relationshipTypeId: "", dob: "", gender: "Male" });
    setLinkedMember("");
    setMode("link");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.relationshipTypeId) { toast.error(t("Please select a relationship.")); return; }
    if (mode === "link" && !linkedMember) { toast.error(t("Please select a member to link.")); return; }
    if (mode === "link" && anchorPublicId && linkedMember === anchorPublicId) {
      toast.error(t("A member cannot be linked to themselves."));
      return;
    }
    setSaving(true);
    try {
      const payload = mode === "link"
        ? {
            ...(anchorPublicId ? { anchorMemberPublicId: anchorPublicId } : {}),
            relatedMemberPublicId: linkedMember,
            relationshipTypeId: form.relationshipTypeId,
          }
        : {
            ...(anchorPublicId ? { anchorMemberPublicId: anchorPublicId } : {}),
            name: `${form.firstName} ${form.surname}`.trim(),
            mobile: form.mobile,
            relationshipTypeId: form.relationshipTypeId,
            category: "JAIN",
          };
      await api.post("/family", payload);
      toast.success(mode === "link" ? t("Members linked into one family.") : t("Family member added."));
      onCreated();
      onClose();
      reset();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="family-add-dialog">
        <DialogHeader>
          <DialogTitle className="font-heading">{t("Add Family Member")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {anchorLabel && (
            <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
              {t("Adding to the family of")} <span className="font-semibold text-slate-700">{anchorLabel}</span>
            </p>
          )}

          {/* Link an existing member, or invite someone new */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "link", label: t("Link Existing Member") },
              { key: "invite", label: t("Invite New Person") },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setMode(opt.key)}
                className={`text-xs font-semibold rounded-md border px-3 py-2 transition-colors ${
                  mode === opt.key
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-slate-600 border-slate-200 hover:border-orange-400"
                }`}
                data-testid={`family-mode-${opt.key}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {mode === "link" ? (
            <div>
              <Label className="text-xs">{t("Member to Link *")}</Label>
              <MemberLinkSelect
                value={linkedMember}
                onChange={setLinkedMember}
                placeholder={t("Search Jain / Non-Jain member by name or member ID (e.g. JFJM112)…")}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {t("Both members will appear under the same family group.")}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("First Name *")}</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required={mode === "invite"} data-testid="family-first-name" />
                </div>
                <div>
                  <Label className="text-xs">{t("Surname")}</Label>
                  <Input value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} data-testid="family-surname" />
                </div>
              </div>
              <div>
                <Label className="text-xs">{t("Mobile (+91…) *")}</Label>
                <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder={t("+91XXXXXXXXXX")} required={mode === "invite"} data-testid="family-mobile" />
              </div>
            </>
          )}
          <div>
            <Label className="text-xs">{t("Relationship *")}</Label>
            <SearchableSelect
              value={form.relationshipTypeId}
              onValueChange={(v) => setForm({ ...form, relationshipTypeId: v })}
              options={relTypes.map((r) => ({ value: r.id, label: r.name }))}
              placeholder={t("Select relationship…")}
              searchPlaceholder={t("Search relationship…")}
            />
          </div>
          {/* Only relevant when creating a brand-new person */}
          {mode === "invite" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t("Date of Birth")}</Label>
                <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} data-testid="family-dob" />
              </div>
              <div>
                <Label className="text-xs">{t("Gender")}</Label>
                <SearchableSelect
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v })}
                  options={GENDER_OPTIONS}
                  placeholder={t("Select gender")}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>{t("Cancel")}</Button>
            <Button type="submit" disabled={saving} data-testid="family-add-submit">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {mode === "link" ? t("Link Member") : t("Send Invite")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Family Member Card ────────────────────────────────────────────── */
function FamilyCard({ link, onClick }) {
  const { t } = useLanguage();
  const m = link.member || {};
  const isActive = m.status === "ACTIVE";

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-white hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      data-testid={`family-card-${link.id}`}
    >
      <Avatar className="h-12 w-12 shrink-0 ring-2 ring-orange-100 group-hover:ring-orange-300 transition-all">
        {m.photoUrl ? (
          <img src={m.photoUrl} alt={m.fullName} className="object-cover" />
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 text-sm font-bold">
            {initials(m.fullName || "F")}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{m.fullName || "—"}</div>
        <div className="text-xs text-muted-foreground font-mono-num truncate mt-0.5">{m.mobile || "—"}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4">
            {m.publicId || "—"}
          </Badge>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
            isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
          }`}>
            {m.status || "INACTIVE"}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("Relation")}</div>
        <div className="text-xs font-semibold text-orange-600 mt-0.5">{link.relation || "Family"}</div>
        <IdCard className="h-3.5 w-3.5 text-muted-foreground mt-2 ml-auto group-hover:text-orange-500 transition-colors" />
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function FamilyPage() {
  const { t } = useLanguage();
  const { user, isSuperAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  // Super Admin can view/manage any member's family group, not just their own.
  // Empty = "my family" (GET /family/my).
  // Expected API contract: GET /family/member/{publicId} → same shape as /family/my
  const [anchorPublicId, setAnchorPublicId] = useState("");

  // ID card dialog
  const [selectedLink, setSelectedLink] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [cardOpen, setCardOpen] = useState(false);

  const load = () => {
    setLoading(true);
    const url = anchorPublicId ? `/family/member/${anchorPublicId}` : "/family/my";
    api.get(url)
      .then((res) => setMembers(res.data?.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [anchorPublicId]);

  /* Open card — fetch full member detail by publicId */
  const openCard = async (link) => {
    setSelectedLink(link);
    // Use link.member as initial data (has publicId, fullName, mobile, status, photoUrl)
    const m = link.member || {};
    setSelectedMember({ ...m, relation: link.relation, direction: link.direction });
    setCardOpen(true);

    // Fetch full detail if publicId available
    if (m.publicId) {
      try {
        const res = await api.get(`/members/${m.publicId}`);
        const detail = res.data?.data;
        if (detail) {
          setSelectedMember({ ...detail, relation: link.relation, direction: link.direction });
        }
      } catch {
        // keep list data
      }
    }
  };

  const closeCard = () => {
    setCardOpen(false);
    setSelectedLink(null);
    setSelectedMember(null);
  };

  /* Save edited profile fields */
  const handleSave = async (fields) => {
    if (!selectedMember?.publicId) return;
    await api.patch(`/members/${selectedMember.publicId}`, fields);
    load();
  };

  /* Save uploaded photo */
  const handlePhotoSave = async (file) => {
    if (!selectedMember?.publicId) return;
    const fd = new FormData();
    fd.append("photo", file);
    await api.post(`/members/${selectedMember.publicId}/photo`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    load();
  };

  /* Remove family link */
  const handleRemove = async (linkId) => {
    if (!isSuperAdmin) { toast.error(t("Only Super Admin can remove family links.")); return; }
    if (!window.confirm("Remove this family link?")) return;
    try {
      await api.delete(`/family/${linkId}`);
      toast.success(t("Family link removed."));
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Group by relation
  const byRelation = members.reduce((acc, m) => {
    const key = m.relation || "Family";
    acc[key] = acc[key] || [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div data-testid="family-page">
      <PageHeader
        title={anchorPublicId ? t("Family Group") : t("My Family")}
        subtitle={t("See and manage your family tree. Adding a member sends them a signup invite via SMS.")}
        actions={
          <Button onClick={() => setAddOpen(true)} data-testid="family-add-btn">
            <UserPlus className="h-4 w-4 mr-2" /> {t("Add Family Member")}
          </Button>
        }
      />

      {/* Super Admin: pick whose family group to view / link members into */}
      {isSuperAdmin && (
        <Card className="p-4 rounded-xl border-border mb-4">
          <Label className="text-xs font-semibold">{t("View Family Group Of")}</Label>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1">
              <MemberLinkSelect
                value={anchorPublicId}
                onChange={setAnchorPublicId}
                placeholder={t("Search Jain / Non-Jain member by name or member ID (e.g. JFJM112)…")}
              />
            </div>
            {anchorPublicId && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setAnchorPublicId("")}>
                {t("My Family")}
              </Button>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            {t("Pick any member to see their family group and link relatives under one family.")}
          </p>
        </Card>
      )}

      {/* Your Card */}
      <Card className="p-5 rounded-xl border-border mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-orange-200">
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white text-xl font-bold">
              {initials(user?.firstName || user?.fullName || "SA")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-orange-500 font-semibold mb-1">{t("You")}</div>
            <div className="font-heading font-bold text-xl">
              {user?.firstName || user?.fullName || "Super"}{" "}
              {user?.lastName || user?.surname || ""}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] font-mono">
                {user?.publicId || user?.mobile || "—"}
              </Badge>
              <Shield className="h-3 w-3 text-orange-500" />
              <span className="text-[10px] text-orange-600 font-semibold">
                {user?.primaryRoleKey?.replace(/_/g, " ") || "Member"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Family List */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading family…")}
        </div>
      ) : members.length === 0 ? (
        <Card className="p-10 rounded-xl border-dashed text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <div className="font-semibold text-base">{t("No family members yet")}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {t("Add your first family member — they'll receive a signup invite over SMS.")}
          </div>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> {t("Add Family Member")}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(byRelation).map(([relation, links]) => (
            <div key={relation}>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-xs font-bold uppercase tracking-widest text-orange-500">{relation}</div>
                <div className="flex-1 h-px bg-orange-100" />
                <Badge variant="outline" className="text-[10px]">{links.length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {links.map((link) => (
                  <FamilyCard key={link.id} link={link} onClick={() => openCard(link)} />
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground text-center pt-2">
            {t("Click any card to view, edit, or upload a photo")}
          </p>
        </div>
      )}

      {/* Add Dialog */}
      <AddFamilyDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={load}
        anchorPublicId={anchorPublicId}
        anchorLabel={anchorPublicId || null}
      />

      {/* ID Card Dialog — with Add Image, Edit, Preview tabs */}
      <MemberIdCardDialog
        open={cardOpen}
        onClose={closeCard}
        member={selectedMember}
        relation={selectedMember?.relation}
        onSave={handleSave}
        onPhotoSave={handlePhotoSave}
        isSuperAdmin={isSuperAdmin}
        linkId={selectedLink?.id}
        onRemoveLink={handleRemove}
      />
    </div>
  );
}
