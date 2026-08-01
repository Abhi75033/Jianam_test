/**
 * VolunteersPage — D4: Rebuilt per client spec.
 * Opportunity creation form now has full fields:
 * - Organisation Name, Event Name, Description
 * - Roles: repeatable rows of [Role Title + Count]
 * - Date & Time (DatePicker + TimePicker)
 * - Location type (Inside Temple / Ground + address)
 * - Instructions
 * - Contact Person (MemberLinkSelect with phone)
 */
import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Users, CheckCircle2, UserCircle2, UserCheck, Plus, Eye, Edit, Filter,
  Check, X, Briefcase, Trash2, MapPin, Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrgs, orgOptions } from "@/hooks/useOrgs";
import { OrgSelect } from "@/components/common/OrgSelect";
import MemberLinkSelect from "@/components/common/MemberLinkSelect";
import TimePicker from "@/components/common/TimePicker";
import { initials } from "@/lib/utils";
import { toast } from "sonner";
import { PermissionGate } from "@/components/common/PermissionGate";

const STATUS_TONE = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  ON_DUTY: "bg-amber-100 text-amber-700",
  AVAILABLE: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-orange-100 text-orange-700",
  REJECTED: "bg-red-100 text-red-700",
  INACTIVE: "bg-red-100 text-red-700",
};

const EMPTY_OPP = {
  organisationName: "",
  eventName: "",
  description: "",
  roles: [{ title: "", count: "" }],
  date: "",
  startTime: "",
  endTime: "",
  locationType: "inside_temple",
  locationAddress: "",
  instructions: "",
  contactPersonId: "",
};

const VOLUNTEER_AREAS_PRESETS = [
  "Cleanliness", "Event Support", "Bhojanshala", "Medical Help", "Security",
  "Crowd Management", "Water & Food Service", "Parking", "Admin / Management", "Other"
];

function RoleRow({ role, idx, onChange, onRemove, canRemove }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <select
            value={role.preset || (VOLUNTEER_AREAS_PRESETS.includes(role.title) ? role.title : "Other")}
            onChange={(e) => {
              const val = e.target.value;
              if (val !== "Other") {
                onChange(idx, "title", val);
              }
              onChange(idx, "preset", val);
            }}
            className="w-full h-8 text-xs font-medium rounded border border-slate-200 bg-white px-2 focus:outline-none"
          >
            <option value="">{t("Select Volunteer Area...")}</option>
            {VOLUNTEER_AREAS_PRESETS.map((area) => (
              <option key={area} value={area}>{t(area)}</option>
            ))}
          </select>
        </div>
        <div>
          <Input
            value={role.title}
            onChange={(e) => onChange(idx, "title", e.target.value)}
            placeholder={t("Area / Role Title (e.g. Cleanliness)")}
            className="h-8 text-xs bg-white"
          />
        </div>
      </div>
      <div className="w-32">
        <Input
          type="number"
          value={role.count}
          onChange={(e) => onChange(idx, "count", e.target.value)}
          placeholder={t("Count Needed")}
          className="h-8 text-xs font-bold bg-white"
          min={1}
        />
      </div>
      {canRemove && (
        <PermissionGate action="DELETE">
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="text-slate-400 hover:text-red-500 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </PermissionGate>
      )}
    </div>
  );
}

export default function VolunteersPage() {
  const { user, canDo, isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const { orgs } = useOrgs();
  const [selectedOrg, setSelectedOrg] = useState("");
  const orgId = user?.organizationIds?.[0] || selectedOrg || (isSuperAdmin ? orgs[0]?.id : undefined);
  const [opportunities, setOpportunities] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState(EMPTY_OPP);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/volunteers/opportunities").catch(() => ({ data: { data: [] } })),
      orgId
        ? api.get(`/volunteers/applications/org/${orgId}`).catch(() => ({ data: { data: [] } }))
        : Promise.resolve({ data: { data: [] } }),
    ]).then(([o, a]) => {
      setOpportunities(o.data?.data?.items || o.data?.data || []);
      setApps(a.data?.data?.items || a.data?.data || []);
    }).finally(() => setLoading(false));
  }, [orgId, reloadKey]);

  const decide = async (appId, allow) => {
    try {
      await api.patch(`/volunteers/applications/${appId}`, { status: allow ? "APPROVED" : "REJECTED" });
      toast.success(allow ? "Volunteer approved." : "Volunteer rejected.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleRoleChange = (idx, field, value) => {
    setForm((prev) => {
      const roles = [...prev.roles];
      roles[idx] = { ...roles[idx], [field]: value };
      return { ...prev, roles };
    });
  };

  const addRole = () => {
    setForm((prev) => ({ ...prev, roles: [...prev.roles, { title: "", count: "" }] }));
  };

  const removeRole = (idx) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    if (!form.eventName.trim()) { toast.error(t("Event name is required.")); return; }
    if (form.roles.some((r) => !r.title.trim())) { toast.error(t("All role titles must be filled in.")); return; }

    setSaving(true);
    try {
      const shiftLabel = form.startTime && form.endTime
        ? `${form.startTime} – ${form.endTime}`
        : form.startTime || "";

      const details = [
        form.description,
        `Roles: ${form.roles.map((r) => `${r.title} (${r.count || "—"})`).join(", ")}`,
        form.locationType === "inside_temple"
          ? "Location: Inside Temple"
          : `Location: Ground — ${form.locationAddress}`,
        form.instructions ? `Instructions: ${form.instructions}` : null,
      ].filter(Boolean).join("\n\n");

      const totalSlots = form.roles.reduce((acc, r) => acc + (parseInt(r.count) || 0), 0);

      await api.post("/volunteers/opportunities", {
        role: form.eventName.trim(),
        details,
        shiftTime: shiftLabel,
        totalSlots: totalSlots || undefined,
        organisationName: form.organisationName,
        date: form.date || undefined,
        locationAddress: form.locationType === "ground" ? form.locationAddress : undefined,
        contactPersonId: form.contactPersonId || undefined,
        organizationId: orgId,
      });

      toast.success(t("Opportunity created successfully!"));
      setOpenCreate(false);
      setForm(EMPTY_OPP);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const total = apps.length;
  const active = apps.filter((a) => a.status === "ACTIVE" || a.status === "APPROVED").length;
  const onDuty = apps.filter((a) => a.status === "ON_DUTY").length;
  const available = apps.filter((a) => a.status === "AVAILABLE" || a.status === "PENDING").length;

  return (
    <div data-testid="volunteers-page">
      <PageHeader
        title={t("volunteers.title", "Volunteer Management")}
        subtitle={t("volunteers.subtitle", "Manage and coordinate volunteers across temples, events and yatras.")}
        actions={
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 font-bold"
            onClick={() => { setForm(EMPTY_OPP); setOpenCreate(true); }}
            data-testid="volunteers-add-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("volunteers.createOpportunity", "Create Opportunity")}
          </Button>
        }
      />

      {isSuperAdmin && (
        <div className="mb-4">
          <OrgSelect value={orgId} onChange={setSelectedOrg} label={t("volunteers.viewingFor", "Viewing applications for")} testId="volunteers-org-select" />
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 mb-6">
        <StatCard label={t("volunteers.opportunityCount", "Opportunity Count")} value={opportunities.length} delta={t("volunteers.totalActiveDrives", "Total active drives")} icon={Briefcase} tone="purple" />
        <StatCard label={t("volunteers.totalVolunteersParticipated", "Total Volunteers Participated")} value={apps.length} delta={t("volunteers.volunteersRegistered", "Volunteers registered")} icon={Users} tone="teal" />
        <StatCard label={t("volunteers.activeVolunteers", "Active Volunteers")} value={active} delta={t("volunteers.approvedProfiles", "Approved profiles")} icon={CheckCircle2} tone="green" />
        <StatCard label={t("volunteers.onDuty", "On Duty")} value={onDuty} delta={t("volunteers.currentlyAssigned", "Currently assigned")} icon={UserCircle2} tone="orange" />
        <StatCard label={t("volunteers.available", "Available")} value={available} delta={t("volunteers.awaitingAssignment", "Awaiting assignment")} icon={UserCheck} tone="blue" />
        <StatCard label={t("volunteers.totalVolunteers", "Total Volunteers")} value={total || opportunities.length} delta={t("volunteers.allSignups", "All signups")} icon={Users} tone="blue" />
      </div>

      {/* Main table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card className="xl:col-span-2 p-5 rounded-xl border-border">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-heading text-base font-semibold">{t("volunteers.volunteerList", "Volunteer List")}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1.5" /> {t("action.filters", "Filters")}</Button>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : apps.length === 0 && opportunities.length === 0 ? (
            <EmptyState title={t("volunteers.noVolunteersYet", "No volunteers yet")} description={t("volunteers.addFirstVolunteer", "Add your first volunteer to start coordinating seva activities.")} icon={Users} className="border-0" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="text-left font-semibold py-2">{t("field.name", "Name")}</th>
                    <th className="text-left font-semibold">{t("field.phone", "Phone")}</th>
                    <th className="text-left font-semibold">{t("field.assigned", "Assigned")}</th>
                    <th className="text-left font-semibold">{t("field.role", "Role")}</th>
                    <th className="text-center font-semibold">{t("field.status", "Status")}</th>
                    <th className="text-right font-semibold">{t("field.actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(apps.length ? apps : opportunities).slice(0, 8).map((v, i) => {
                    const name = v.member?.fullName || (v.member?.firstName ? `${v.member.firstName} ${v.member.surname || ""}` : v.applicantName || v.role || v.title || "—");
                    const status = (v.status || "ACTIVE").toUpperCase();
                    return (
                      <tr key={v.id || i} className="border-b border-border/60 last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{initials(name)}</AvatarFallback></Avatar>
                            <span className="text-sm font-medium">{name}</span>
                          </div>
                        </td>
                        <td className="text-xs font-mono-num">{v.mobile || v.member?.mobile || "—"}</td>
                        <td className="text-xs">{v.organization?.name || v.opportunity?.title || "—"}</td>
                        <td className="text-xs">{v.role || v.area?.name || t("volunteers.volunteerRole", "Volunteer")}</td>
                        <td className="text-center"><span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_TONE[status] || STATUS_TONE.ACTIVE}`}>{status.replace("_", " ")}</span></td>
                        <td className="text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => decide(v.id, true)}
                              className="p-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-all shadow-xs"
                              title={t("Approve Volunteer & Assign On-Duty Seva")}
                              data-testid={`vol-approve-${v.id}`}
                            >
                              <Check className="h-3.5 w-3.5 font-bold text-emerald-600" />
                            </button>
                            <button
                              onClick={() => decide(v.id, false)}
                              className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-all shadow-xs"
                              title={t("Decline / Release Duty")}
                              data-testid={`vol-reject-${v.id}`}
                            >
                              <X className="h-3.5 w-3.5 font-bold text-rose-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Attendance donut */}
        <Card className="p-5 rounded-xl border-border">
          <h2 className="font-heading text-base font-semibold mb-3">{t("volunteers.attendanceOverview", "Attendance Overview")}</h2>
          <div className="relative h-40 flex items-center justify-center">
            <svg className="w-40 h-40 -rotate-90">
              <circle cx="80" cy="80" r="64" strokeWidth="14" stroke="hsl(var(--border))" fill="none" />
              <circle cx="80" cy="80" r="64" strokeWidth="14" stroke="hsl(var(--c-green))" fill="none" strokeDasharray={`${(active / (total || 1)) * 402} 402`} strokeLinecap="round" />
              <circle cx="80" cy="80" r="64" strokeWidth="14" stroke="hsl(var(--c-orange))" fill="none" strokeDasharray={`${(onDuty / (total || 1)) * 402} 402`} strokeDashoffset={`-${(active / (total || 1)) * 402}`} strokeLinecap="round" />
            </svg>
            <div className="absolute text-center">
              <div className="text-2xl font-bold">{active}</div>
              <div className="text-[10px] text-muted-foreground">{t("status.present", "Present")}</div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {t("status.present", "Present")}</span><span className="font-mono-num font-semibold">{active} ({total > 0 ? Math.round((active / total) * 100) : 0}%)</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> {t("status.onDuty", "On Duty")}</span><span className="font-mono-num font-semibold">{onDuty} ({total > 0 ? Math.round((onDuty / total) * 100) : 0}%)</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> {t("status.available", "Available")}</span><span className="font-mono-num font-semibold">{available} ({total > 0 ? Math.round((available / total) * 100) : 0}%)</span></div>
          </div>
        </Card>
      </div>

      {/* ─── Create Opportunity Dialog ─────────────────────────────────── */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Create Volunteer Opportunity")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Organisation Name & Event Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">{t("Organisation Name")}</Label>
                <Input
                  value={form.organisationName}
                  onChange={(e) => setForm({ ...form, organisationName: e.target.value })}
                  placeholder={t("e.g. Shree Shantinath Jain Derasar")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">{t("Event Name *")}</Label>
                <Input
                  value={form.eventName}
                  onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                  placeholder={t("e.g. Paryushan Seva 2025")}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Description of Event */}
            <div>
              <Label className="text-xs font-semibold">{t("Description of Event")}</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t("Describe the volunteer opportunity…")}
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Role Title and Number of Volunteers Required */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold">{t("Role Title & Number of Volunteers Required")}</Label>
                <Button type="button" size="sm" variant="outline" onClick={addRole} className="h-7 text-xs gap-1">
                  <Plus className="w-3 h-3" /> {t("Add Role Title")}
                </Button>
              </div>
              <div className="space-y-2">
                {form.roles.map((role, idx) => (
                  <RoleRow
                    key={idx}
                    role={role}
                    idx={idx}
                    onChange={handleRoleChange}
                    onRemove={removeRole}
                    canRemove={form.roles.length > 1}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {t("e.g. Cleanliness — 20 volunteers, Event Support — 10 volunteers")}
              </p>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">{t("Date")}</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold">{t("Start Time")}</Label>
                <TimePicker
                  value={form.startTime}
                  onChange={(t) => setForm({ ...form, startTime: t })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">{t("End Time")}</Label>
                <TimePicker
                  value={form.endTime}
                  onChange={(t) => setForm({ ...form, endTime: t })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label className="text-xs font-semibold">{t("Location (Type like inside temple, ground and address)")}</Label>
              <div className="flex gap-3 mt-2">
                {[
                  { value: "inside_temple", label: t("Inside Temple") },
                  { value: "ground", label: t("Ground / Outdoor") },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="locationType"
                      value={opt.value}
                      checked={form.locationType === opt.value}
                      onChange={() => setForm({ ...form, locationType: opt.value })}
                    />
                    <span className="text-sm">{t(opt.label)}</span>
                  </label>
                ))}
              </div>
              {form.locationType === "ground" && (
                <div className="mt-2">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={form.locationAddress}
                      onChange={(e) => setForm({ ...form, locationAddress: e.target.value })}
                      placeholder={t("Enter venue / address")}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Instructions if any */}
            <div>
              <Label className="text-xs font-semibold">{t("Instructions if any")}</Label>
              <textarea
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder={t("Special instructions for volunteers (dress code, entry point, tools to bring, etc.)")}
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Contact Person (link member) */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">{t("Contact Person (link member)")}</Label>
                <span className="text-[10px] text-emerald-600 font-medium">{t("Phone number will be visible to all members")}</span>
              </div>
              <MemberLinkSelect
                value={form.contactPersonId}
                onChange={(v) => setForm({ ...form, contactPersonId: v })}
                placeholder={t("Search member by name or ID…")}
                showPhone
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>{t("Cancel")}</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? t("Saving…") : t("Create Opportunity")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
