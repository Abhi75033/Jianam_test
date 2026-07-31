import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Save, Sliders, Shield, History, Bell, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { ALL_MODULES, ALL_ACTIONS, ROLE_LABELS } from "@/constants/modules";
import { formatDateTime } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const ROLES = [
  "SUPER_ADMIN", "TEMPLE_ADMIN", "DHARAMSHALA_ADMIN", "JAIN_CENTER_ADMIN",
  "MONK_ADMIN", "STAFF", "SECURITY_GUARD", "EVENT_SCANNER", "PAGE_OWNER",
];

function RolePermissionMatrix() {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState("TEMPLE_ADMIN");
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/settings/roles/${selectedRole}/permissions`)
      .then((res) => {
        const perms = res.data?.data?.permissions || [];
        const map = {};
        (Array.isArray(perms) ? perms : []).forEach((p) => {
          map[`${p.module}:${p.action}`] = p.allowed;
        });
        setMatrix(map);
      })
      .catch(() => setMatrix({}))
      .finally(() => setLoading(false));
  }, [selectedRole]);

  const toggle = (module, action) => {
    const key = `${module}:${action}`;
    setMatrix((m) => ({ ...m, [key]: !m[key] }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const permissions = ALL_MODULES.flatMap((m) =>
        ALL_ACTIONS.map((a) => ({
          module: m, action: a, allowed: !!matrix[`${m}:${a}`],
        }))
      );
      await api.put(`/settings/roles/${selectedRole}/permissions`, { permissions });
      toast.success(t("Permissions saved."));
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally { setSaving(false); }
  };

  return (
    <Card className="p-5 rounded-md border-border bg-white shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="flex-1">
          <h3 className="font-heading text-lg font-semibold text-slate-800">{t("Role Permission Matrix")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("Configure what each role can do. DELETE is always Super-Admin only.")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                selectedRole === r
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white border-border text-foreground/70 hover:text-foreground hover:border-orange-200"
              }`}
              data-testid={`rbac-role-${r}`}
            >
              {ROLE_LABELS[r] || r}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] uppercase tracking-widest text-slate-400 py-2 pr-4 w-56">{t("Module")}</th>
                {ALL_ACTIONS.map((a) => (
                  <th key={a} className="text-center text-[10px] uppercase tracking-widest text-slate-400 py-2 px-2 w-24">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_MODULES.map((m) => (
                <tr key={m} className="border-b border-border/60">
                  <td className="py-2 pr-4 text-sm text-slate-800">{m.replace(/_/g, " ")}</td>
                  {ALL_ACTIONS.map((a) => {
                    const disabled = a === "DELETE" && selectedRole !== "SUPER_ADMIN";
                    return (
                      <td key={a} className="text-center py-2 px-2">
                        <Checkbox
                          checked={disabled ? false : !!matrix[`${m}:${a}`]}
                          disabled={disabled}
                          onCheckedChange={() => toggle(m, a)}
                          data-testid={`rbac-cell-${m}-${a}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end mt-4">
        <Button onClick={save} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white" data-testid="rbac-save-button">
          <Save className="h-4 w-4 mr-2" /> {saving ? t("Saving...") : t("Save Permissions")}
        </Button>
      </div>
    </Card>
  );
}

function AppSettings() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get("/settings/app").then((res) => {
      setSettings(res.data?.data || []);
    }).catch(() => setSettings([])).finally(() => setLoading(false));
  }, []);

  const upsert = async () => {
    if (!newKey) return;
    try {
      await api.put(`/settings/app/${encodeURIComponent(newKey)}`, { value: newVal });
      toast.success(t("Setting updated."));
      setNewKey(""); setNewVal("");
      const res = await api.get("/settings/app");
      setSettings(res.data?.data || []);
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <Card className="p-5 rounded-md border-border bg-white shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-slate-800 mb-1">{t("App Settings")}</h3>
      <p className="text-xs text-muted-foreground mb-4">{t("Platform-wide key/value configuration.")}</p>
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {settings.length === 0 && <div className="text-sm text-muted-foreground">{t("No settings yet.")}</div>}
          {settings.map((s, i) => (
            <div key={s.key || i} className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 border border-slate-100 rounded-md">
              <div className="font-mono text-xs font-semibold text-slate-700">{s.key}</div>
              <div className="font-mono text-xs text-slate-500 truncate max-w-xs">{String(s.value)}</div>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder={t("Key")} data-testid="settings-key-input" />
        <Input value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder={t("Value")} data-testid="settings-value-input" />
        <Button onClick={upsert} className="bg-orange-500 hover:bg-orange-600 text-white" data-testid="settings-save-button"><Save className="h-4 w-4 mr-2" /> {t("Save")}</Button>
      </div>
    </Card>
  );
}

function AlertThresholds() {
  const { t } = useLanguage();
  const [thresholds, setThresholds] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/settings/alert-thresholds").then((res) => {
      const data = res.data?.data || {};
      const map = {};
      (Array.isArray(data) ? data : []).forEach((t) => { map[t.type] = t.value; });
      setThresholds(map);
    }).catch(() => setThresholds({})).finally(() => setLoading(false));
  }, []);

  const update = async (type, value) => {
    try {
      await api.put(`/settings/alert-thresholds/${type}`, { value: Number(value) });
      toast.success(t("Threshold updated."));
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <Card className="p-5 rounded-md border-border bg-white shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-slate-800 mb-1">{t("Alert Thresholds")}</h3>
      <p className="text-xs text-muted-foreground mb-4">{t("Configure when device alerts are triggered.")}</p>
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { type: "OFFLINE_MINUTES", label: t("Offline (minutes)"), default: 30 },
            { type: "LOW_BATTERY_PCT", label: t("Low Battery (%)"), default: 20 },
            { type: "ROUTE_DELAY_MINUTES", label: t("Route Delay (minutes)"), default: 30 },
          ].map((tItem) => (
            <div key={tItem.type}>
              <Label className="text-xs text-slate-600 font-semibold">{t(tItem.label)}</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  defaultValue={thresholds[tItem.type] ?? tItem.default}
                  onBlur={(e) => update(tItem.type, e.target.value)}
                  data-testid={`threshold-${tItem.type}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function LoginHistory() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/settings/login-history").then((res) => {
      setRows(res.data?.data?.items || res.data?.data || []);
    }).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-5 rounded-md border-border bg-white shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-slate-800 mb-4">{t("Login History")}</h3>
      {loading ? <Skeleton className="h-40 w-full" /> : (
        rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t("No login records.")}</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 border border-slate-100 rounded-md">
                <div>
                  <div className="font-semibold text-slate-800">{r.user?.mobile || r.mobile}</div>
                  <div className="text-xs text-slate-400">{t("IP:")} {r.ip || "Unknown"} {t("· Device ID:")} {r.deviceId || "Unknown"}</div>
                </div>
                <div className="text-xs text-slate-400 font-mono-num">{formatDateTime(r.createdAt)}</div>
                {r.flaggedSuspicious && <Badge variant="destructive">{t("Suspicious")}</Badge>}
              </div>
            ))}
          </div>
        )
      )}
    </Card>
  );
}

// ─── USER SPECIFIC PERMISSION OVERRIDES FOR SUPER ADMIN ────────────────────

function UserPermissionOverrides() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [overrides, setOverrides] = useState([]);
  const [loadingOverrides, setLoadingOverrides] = useState(false);
  const [selectedModule, setSelectedModule] = useState(ALL_MODULES[0] || "");
  const [selectedAction, setSelectedAction] = useState(ALL_ACTIONS[0] || "VIEW");
  const [allowed, setAllowed] = useState(true);
  const [organizationId, setOrganizationId] = useState("");
  const [savingOverride, setSavingOverride] = useState(false);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/members`, { params: { q: searchQuery } });
      setMembers(res.data?.data || []);
    } catch (e) {
      toast.error(t("Failed to search members."));
    } finally {
      setSearching(false);
    }
  };

  const fetchOverrides = async (userId) => {
    setLoadingOverrides(true);
    try {
      const res = await api.get(`/settings/users/${userId}/permission-overrides`);
      setOverrides(res.data?.data || []);
    } catch (e) {
      toast.error(t("Failed to load user permission overrides."));
    } finally {
      setLoadingOverrides(false);
    }
  };

  const selectUser = (member) => {
    if (!member.userId) {
      toast.error(t("Selected member does not have a linked User ID."));
      return;
    }
    setSelectedUser({
      userId: member.userId,
      fullName: member.fullName,
      mobile: member.mobile,
      publicId: member.publicId,
    });
    fetchOverrides(member.userId);
  };

  const addOverride = async () => {
    if (!selectedUser) return;
    setSavingOverride(true);
    try {
      await api.post(`/settings/users/${selectedUser.userId}/permission-overrides`, {
        module: selectedModule,
        action: selectedAction,
        allowed,
        organizationId: organizationId || null,
      });
      toast.success(t("Permission override saved."));
      fetchOverrides(selectedUser.userId);
      setOrganizationId("");
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSavingOverride(false);
    }
  };

  const deleteOverride = async (overrideId) => {
    if (!selectedUser) return;
    try {
      await api.delete(`/settings/users/${selectedUser.userId}/permission-overrides/${overrideId}`);
      toast.success(t("Override removed."));
      fetchOverrides(selectedUser.userId);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 rounded-md border-border bg-white shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-slate-800 mb-1">{t("User Permission Overrides")}</h3>
        <p className="text-xs text-muted-foreground mb-4">{t("Add granular access permissions or restrictions for individual users, overriding role-based defaults.")}</p>
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-slate-700">{t("Search for Member to manage overrides")}</Label>
          <div className="flex gap-2">
            <Input 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder={t("Search by name, mobile number, or Member ID")} 
              onKeyDown={(e) => e.key === "Enter" && searchUsers()}
            />
            <Button onClick={searchUsers} disabled={searching} className="bg-orange-500 hover:bg-orange-600 text-white">
              {searching ? t("Searching...") : t("Search")}
            </Button>
          </div>

          {members.length > 0 && (
            <div className="border rounded-md max-h-40 overflow-y-auto divide-y">
              {members.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex items-center justify-between p-2.5 text-sm cursor-pointer hover:bg-slate-50 transition-colors ${selectedUser?.userId === m.userId ? "bg-orange-50/50 border-orange-200" : ""}`}
                  onClick={() => selectUser(m)}
                >
                  <div>
                    <div className="font-semibold text-slate-800">{m.fullName} ({m.publicId})</div>
                    <div className="text-xs text-slate-400">{t("Mobile:")} {m.mobile} {t("· Category:")} {m.category}</div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs px-2.5 py-1">
                    {t("Select")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {selectedUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 rounded-md border-border bg-white shadow-sm h-fit">
            <h4 className="font-heading text-sm font-semibold text-slate-800 mb-4">
              {t("Add Override rule for")} <span className="text-orange-500">{selectedUser.fullName}</span>
            </h4>
            <div className="space-y-3.5">
              <div>
                <Label className="text-xs font-semibold text-slate-700">{t("Module")}</Label>
                <select 
                  value={selectedModule} 
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {ALL_MODULES.map(m => (
                    <option key={m} value={m}>{t(m.replace(/_/g, " "))}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">{t("Action")}</Label>
                <select 
                  value={selectedAction} 
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {ALL_ACTIONS.map(a => (
                    <option key={a} value={a}>{t(a)}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">{t("Organization ID (Optional Scope)")}</Label>
                <Input 
                  value={organizationId} 
                  onChange={(e) => setOrganizationId(e.target.value)} 
                  placeholder={t("Leave empty for global scope")} 
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Checkbox 
                  id="override-allowed"
                  checked={allowed} 
                  onCheckedChange={(checked) => setAllowed(!!checked)} 
                />
                <Label htmlFor="override-allowed" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  {t("Allow Action (uncheck to explicitly Block)")}
                </Label>
              </div>

              <Button onClick={addOverride} disabled={savingOverride} className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2">
                <Save className="h-4 w-4 mr-2" /> {savingOverride ? t("Saving...") : t("Add Override Rule")}
              </Button>
            </div>
          </Card>

          <Card className="p-5 rounded-md border-border bg-white shadow-sm">
            <h4 className="font-heading text-sm font-semibold text-slate-800 mb-4">{t("Active Override Rules")}</h4>
            {loadingOverrides ? (
              <Skeleton className="h-40 w-full" />
            ) : overrides.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">{t("No permission overrides active for this user.")}</div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {overrides.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={o.allowed ? "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow" : "bg-destructive text-destructive-foreground"}>
                          {o.allowed ? "ALLOWED" : "BLOCKED"}
                        </Badge>
                        <span className="font-semibold text-slate-800">{o.module} : {o.action}</span>
                      </div>
                      {o.organizationId && (
                        <div className="text-[10px] text-muted-foreground mt-1">{t("Org ID Scope:")} {o.organizationId}</div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteOverride(o.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                    >
                      {t("Delete")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── NEW ORG-SPECIFIC CONFIGURATION FOR NORMAL ADMINS ──────────────────────

function OrgConfigForm({ orgId }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    staffWorkingHoursStart: "",
    staffWorkingHoursEnd: "",
    staffLateArrivalAfter: "",
    staffEarlyExitBefore: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    api.get(`/temples/${orgId}`).then((res) => {
      const d = res.data?.data || {};
      setForm({
        staffWorkingHoursStart: d.staffWorkingHoursStart || "",
        staffWorkingHoursEnd: d.staffWorkingHoursEnd || "",
        staffLateArrivalAfter: d.staffLateArrivalAfter || "",
        staffEarlyExitBefore: d.staffEarlyExitBefore || "",
      });
    }).catch(() => {
      toast.error(t("Failed to load organization settings."));
    }).finally(() => setLoading(false));
  }, [orgId]);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/temples/${orgId}`, form);
      toast.success(t("Organization settings updated successfully."));
    } catch (e) {
      toast.error(t("Failed to update organization settings."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card className="p-5 rounded-md border-border bg-white shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-slate-800 mb-1">{t("Organization Working Rules")}</h3>
      <p className="text-xs text-muted-foreground mb-4">{t("Configure shift timings and attendance rules for your staff.")}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label className="text-xs font-semibold text-slate-700">{t("Staff Working Hours Start")}</Label>
          <Input type="time" value={form.staffWorkingHoursStart} onChange={(e) => setForm({ ...form, staffWorkingHoursStart: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-slate-700">{t("Staff Working Hours End")}</Label>
          <Input type="time" value={form.staffWorkingHoursEnd} onChange={(e) => setForm({ ...form, staffWorkingHoursEnd: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-slate-700">{t("Mark Late Arrival After")}</Label>
          <Input type="time" value={form.staffLateArrivalAfter} onChange={(e) => setForm({ ...form, staffLateArrivalAfter: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-slate-700">{t("Mark Early Exit Before")}</Label>
          <Input type="time" value={form.staffEarlyExitBefore} onChange={(e) => setForm({ ...form, staffEarlyExitBefore: e.target.value })} className="mt-1" />
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button onClick={save} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Save className="h-4 w-4 mr-2" /> {saving ? t("Saving...") : t("Save Settings")}
        </Button>
      </div>
    </Card>
  );
}

function OrgAuditHistory({ orgId }) {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    api.get(`/audit-logs`, { params: { organizationId: orgId } }).then((res) => {
      setLogs(res.data?.data?.items || res.data?.data || []);
    }).catch(() => {
      setLogs([]);
    }).finally(() => setLoading(false));
  }, [orgId]);

  return (
    <Card className="p-5 rounded-md border-border bg-white shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-slate-800 mb-4">{t("Activity History Log")}</h3>
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : logs.length === 0 ? (
        <div className="text-sm text-muted-foreground">{t("No recent activity logs.")}</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((l, i) => (
            <div key={i} className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 border border-slate-100 rounded-md">
              <div>
                <div className="font-semibold text-slate-800">{l.action} · {l.entityType}</div>
                <div className="text-xs text-slate-400">{t("Actor ID:")} {l.actorId}</div>
              </div>
              <div className="text-xs text-slate-400 font-mono-num">{formatDateTime(l.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── SETTINGS PAGE ROUTER ENTRYPOINT ─────────────────────────────────────────

export default function SettingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const simulatedRole = localStorage.getItem("simulatedRole");
  const activeRole = simulatedRole || user?.primaryRoleKey || "MEMBER";
  const isSuperAdminUser = activeRole === "SUPER_ADMIN";
  const orgId = user?.organizationIds?.[0];

  const validSuperTabs = ["rbac", "user-overrides", "app", "alerts", "login-history", "security"];
  const currentTab = (tabParam === "security" ? "rbac" : tabParam) || (isSuperAdminUser ? "app" : "org-config");

  const handleTabChange = (val) => {
    setSearchParams({ tab: val });
  };

  if (!isSuperAdminUser) {
    return (
      <div data-testid="settings-page">
        <PageHeader
          title={t("Organization Settings")}
          subtitle={t("Configure working rules, timings, and view audit history logs for your center.")}
        />
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="org-config">
              <Sliders className="h-3.5 w-3.5 mr-1.5" /> {t("Working Rules")}
            </TabsTrigger>
            <TabsTrigger value="audit">
              <History className="h-3.5 w-3.5 mr-1.5" /> {t("Activity History")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="org-config">
            <OrgConfigForm orgId={orgId} />
          </TabsContent>
          <TabsContent value="audit">
            <OrgAuditHistory orgId={orgId} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div data-testid="settings-page">
      <PageHeader
        title={t("Settings & Platform Governance")}
        subtitle={t("Roles & permissions, app configuration, alert thresholds, and security controls.")}
      />
      <Tabs value={validSuperTabs.includes(currentTab) ? currentTab : "app"} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="app" data-testid="settings-tab-app">
            <Sliders className="h-3.5 w-3.5 mr-1.5" /> {t("Platform Settings")}
          </TabsTrigger>
          <TabsTrigger value="rbac" data-testid="settings-tab-rbac">
            <Shield className="h-3.5 w-3.5 mr-1.5" /> {t("Security & Access Control")}
          </TabsTrigger>
          <TabsTrigger value="user-overrides" data-testid="settings-tab-user-overrides">
            <UserCheck className="h-3.5 w-3.5 mr-1.5" /> {t("User Overrides")}
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="settings-tab-alerts">
            <Bell className="h-3.5 w-3.5 mr-1.5" /> {t("Alert Thresholds")}
          </TabsTrigger>
          <TabsTrigger value="login-history" data-testid="settings-tab-login-history">
            <History className="h-3.5 w-3.5 mr-1.5" /> {t("Login History")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="app"><AppSettings /></TabsContent>
        <TabsContent value="rbac"><RolePermissionMatrix /></TabsContent>
        <TabsContent value="user-overrides"><UserPermissionOverrides /></TabsContent>
        <TabsContent value="alerts"><AlertThresholds /></TabsContent>
        <TabsContent value="login-history"><LoginHistory /></TabsContent>
      </Tabs>
    </div>
  );
}
