import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  UsersRound, Save, Trash2, KeyRound, Building,
  PlusCircle, UserCheck, ShieldAlert, X, Edit, Search,
  Mail, MessageSquare, Copy, Sliders, Shield
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { TabPermissionSelector, PLATFORM_MODULE_LIST } from "@/components/common/TabPermissionSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const ADMIN_ROLES = [
  { key: "TEMPLE_ADMIN", label: "Temple Admin" },
  { key: "DHARAMSHALA_ADMIN", label: "Dharamshala Admin" },
  { key: "JAIN_CENTER_ADMIN", label: "Jain Center Admin" },
  { key: "MONK_ADMIN", label: "Monk Admin" },
];

export default function AdminsPage() {
  const { t } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("directory");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Registration Form state
  const [form, setForm] = useState({
    mobile: "",
    firstName: "",
    lastName: "",
    role: "TEMPLE_ADMIN",
    organizationIds: [],
    grantedModules: PLATFORM_MODULE_LIST.map((m) => m.key),
  });
  
  // Organization Options list (fetched depending on selected role)
  const [organizations, setOrganizations] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [orgSearchQuery, setOrgSearchQuery] = useState("");

  // Scopes editing modal state
  const [editingAdmin, setEditingAdmin] = useState(null); // { id (userId), firstName, role, organizationIds }
  const [editingOrgs, setEditingOrgs] = useState([]);
  const [savingScope, setSavingScope] = useState(false);

  // Tab permissions editing modal state
  const [tabAccessAdmin, setTabAccessAdmin] = useState(null);
  const [selectedAdminTabs, setSelectedAdminTabs] = useState([]);
  const [savingTabs, setSavingTabs] = useState(false);

  // Newly created admin password popup state
  const [credentialPopup, setCredentialPopup] = useState(null); // { username, password, role }

  // Load admins list
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/admins");
      setAdmins(res.data?.data || []);
    } catch (e) {
      toast.error(t("Failed to fetch administrative accounts."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Fetch corresponding organizations based on selected role
  const fetchOrganizations = async (roleKey) => {
    if (roleKey === "MONK_ADMIN") {
      setOrganizations([]);
      return;
    }
    setLoadingOrgs(true);
    let endpoint = "";
    if (roleKey === "TEMPLE_ADMIN") endpoint = "/temples";
    else if (roleKey === "DHARAMSHALA_ADMIN") endpoint = "/dharamshalas";
    else if (roleKey === "JAIN_CENTER_ADMIN") endpoint = "/jain-centers";

    try {
      const res = await api.get(endpoint);
      setOrganizations(res.data?.data || []);
    } catch (e) {
      toast.error(`Failed to load organizations for ${roleKey}`);
    } finally {
      setLoadingOrgs(false);
    }
  };

  // Re-fetch organizations whenever the creation role changes
  useEffect(() => {
    fetchOrganizations(form.role);
    setForm(f => ({ ...f, organizationIds: [] }));
  }, [form.role]);

  // Handle register submit
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.mobile) {
      toast.error(t("First Name and Mobile Number are required."));
      return;
    }
    if (form.role !== "MONK_ADMIN" && form.organizationIds.length === 0) {
      toast.error(t("Please scope this administrator to at least one organization."));
      return;
    }

    try {
      const res = await api.post("/auth/admins", form);
      const data = res.data?.data;
      
      // Open credentials popup
      setCredentialPopup({
        username: form.mobile,
        password: data.tempPassword || "Sent via WhatsApp/SMS",
        role: form.role,
      });

      toast.success(t("Administrator account registered successfully."));
      
      // Reset form
      setForm({
        mobile: "",
        firstName: "",
        lastName: "",
        role: "TEMPLE_ADMIN",
        organizationIds: [],
      });
      
      fetchAdmins();
      setActiveTab("directory");
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  // Handle admin deletion
  const handleDeleteAdmin = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to revoke privileges and delete admin account for "${name}"?`)) {
      return;
    }
    try {
      await api.delete(`/auth/admins/${userId}`);
      toast.success(t("Admin account deleted."));
      fetchAdmins();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  // Toggle active / inactive status for any admin
  const handleToggleAdminStatus = async (admin) => {
    const nextStatus = (admin.status === "ACTIVE" || !admin.status) ? "INACTIVE" : "ACTIVE";
    try {
      await api.patch(`/auth/admins/${admin.id}/status`, { status: nextStatus }).catch(() => null);
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? { ...a, status: nextStatus } : a)));
      toast.success(`Admin status updated to ${nextStatus}.`);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  // Handle scope update modal open
  const openScopeEditor = async (admin) => {
    setEditingAdmin(admin);
    const mappedOrgIds = admin.userOrganizations?.map(uo => uo.organizationId) || [];
    setEditingOrgs(mappedOrgIds);
    
    // Fetch options for modal
    setLoadingOrgs(true);
    let endpoint = "";
    if (admin.primaryRoleKey === "TEMPLE_ADMIN") endpoint = "/temples";
    else if (admin.primaryRoleKey === "DHARAMSHALA_ADMIN") endpoint = "/dharamshalas";
    else if (admin.primaryRoleKey === "JAIN_CENTER_ADMIN") endpoint = "/jain-centers";
    
    if (endpoint) {
      try {
        const res = await api.get(endpoint);
        setOrganizations(res.data?.data || []);
      } catch (e) {
        toast.error(t("Failed to load organizations for mapping."));
      } finally {
        setLoadingOrgs(false);
      }
    } else {
      setOrganizations([]);
      setLoadingOrgs(false);
    }
  };

  // Save updated scopes
  const saveScopeEdits = async () => {
    if (!editingAdmin) return;
    setSavingScope(true);
    try {
      await api.patch(`/auth/admins/${editingAdmin.id}/organizations`, {
        organizationIds: editingOrgs,
      });
      toast.success(t("Admin scopes updated."));
      setEditingAdmin(null);
      fetchAdmins();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSavingScope(false);
    }
  };

  // Open Tab Access Manager for an Admin
  const openTabAccessModal = async (admin) => {
    setTabAccessAdmin(admin);
    try {
      const res = await api.get(`/settings/users/${admin.id}/permission-overrides`).catch(() => ({ data: { data: [] } }));
      const overrides = res.data?.data || [];
      const activeModules = overrides.filter((o) => o.allowed).map((o) => o.module);
      // Default to all if none explicitly restricted yet
      setSelectedAdminTabs(activeModules.length > 0 ? Array.from(new Set(activeModules)) : PLATFORM_MODULE_LIST.map((m) => m.key));
    } catch {
      setSelectedAdminTabs(PLATFORM_MODULE_LIST.map((m) => m.key));
    }
  };

  // Save updated Tab Access for an Admin
  const handleSaveTabAccess = async () => {
    if (!tabAccessAdmin) return;
    setSavingTabs(true);
    try {
      await api.put(`/auth/admins/${tabAccessAdmin.id}/modules`, {
        grantedModules: selectedAdminTabs,
      });
      toast.success(`Tab access permissions updated for ${tabAccessAdmin.firstName}.`);
      setTabAccessAdmin(null);
      fetchAdmins();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSavingTabs(false);
    }
  };

  // Filter organizations by search input
  const filteredOrgs = organizations.filter(o => 
    o.name?.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
    o.city?.toLowerCase().includes(orgSearchQuery.toLowerCase())
  );

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h2 className="text-xl font-bold text-slate-800">{t("Access Denied")}</h2>
        <p className="text-sm text-slate-500">{t("Only Super Admins can access this page.")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admins-management-page">
      <PageHeader
        title={t("Admin Accounts Manager")}
        subtitle={t("Provision community administrator profiles, assign scope authorities, and track credentials.")}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="directory" data-testid="admins-tab-directory">
            <UsersRound className="h-3.5 w-3.5 mr-1.5" /> {t("Administrators List")}
          </TabsTrigger>
          <TabsTrigger value="register" data-testid="admins-tab-register">
            <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> {t("Register Admin")}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Administrators Directory */}
        <TabsContent value="directory">
          <Card className="p-5 rounded-md border-border bg-white shadow-sm">
            <h3 className="font-heading text-lg font-semibold text-slate-800 mb-4">{t("Administrators Directory")}</h3>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-10 text-slate-500">{t("No administrative profiles found.")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="text-[10px] uppercase tracking-widest text-slate-400 py-3 pr-4 w-48">{t("Admin Name")}</th>
                      <th className="text-[10px] uppercase tracking-widest text-slate-400 py-3 px-4 w-36">{t("Mobile / Username")}</th>
                      <th className="text-[10px] uppercase tracking-widest text-slate-400 py-3 px-4 w-40">{t("System Role")}</th>
                      <th className="text-[10px] uppercase tracking-widest text-slate-400 py-3 px-4">{t("Scoped Organizations")}</th>
                      <th className="text-[10px] uppercase tracking-widest text-slate-400 py-3 px-4 w-28">{t("Status")}</th>
                      <th className="text-[10px] uppercase tracking-widest text-slate-400 py-3 pl-4 w-28 text-right">{t("Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} className="border-b border-border/60 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pr-4 text-sm font-semibold text-slate-800">
                          {admin.firstName} {admin.lastName || ""}
                          <div className="text-[10px] text-slate-400 font-normal">{t("Registered")} {formatDateTime(admin.createdAt)}</div>
                        </td>
                        <td className="py-3.5 px-4 text-sm font-mono text-slate-600">{admin.mobile}</td>
                        <td className="py-3.5 px-4 text-sm">
                          <Badge variant="outline" className="border-orange-200 bg-orange-50/30 text-orange-600 text-xs px-2 py-0.5">
                            {admin.primaryRoleKey.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-sm">
                          {admin.primaryRoleKey === "MONK_ADMIN" || admin.primaryRoleKey === "SUPER_ADMIN" ? (
                            <span className="text-slate-400 italic text-xs">{t("Global/All Scope")}</span>
                          ) : (admin.userOrganizations || []).length === 0 ? (
                            <span className="text-red-500 text-xs font-semibold">{t("No active organization scope")}</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                              {admin.userOrganizations.map((uo) => (
                                <Badge key={uo.id} variant="secondary" className="text-[10px] bg-slate-100 text-slate-700">
                                  {uo.organization?.name || uo.organizationId} ({uo.organization?.city || "Unknown"})
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-sm">
                          <button
                            onClick={() => handleToggleAdminStatus(admin)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              admin.status === "ACTIVE" || !admin.status
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                                : "bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200"
                            }`}
                            title={t("Click to toggle Active / Inactive status")}
                          >
                            {admin.status === "ACTIVE" || !admin.status ? "ACTIVE" : "INACTIVE"}
                          </button>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-2 border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold"
                              onClick={() => openTabAccessModal(admin)}
                              title={t("Manage Tab & Module Access Permissions")}
                            >
                              <Sliders className="h-3.5 w-3.5 mr-1" /> {t("Tab Access")}
                            </Button>
                            {admin.primaryRoleKey !== "MONK_ADMIN" && admin.primaryRoleKey !== "SUPER_ADMIN" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2"
                                onClick={() => openScopeEditor(admin)}
                                title={t("Edit organization scope")}
                              >
                                <Edit className="h-3.5 w-3.5 text-slate-600" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-2 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteAdmin(admin.id, `${admin.firstName} ${admin.lastName || ""}`)}
                              title={t("Delete admin account")}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 2: Register New Admin */}
        <TabsContent value="register">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 rounded-md border-border bg-white shadow-sm md:col-span-2">
              <h3 className="font-heading text-lg font-semibold text-slate-800 mb-4">{t("Register System Administrator")}</h3>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">{t("First Name")}</Label>
                    <Input 
                      required
                      value={form.firstName} 
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })} 
                      placeholder={t("e.g. Ramesh")} 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">{t("Last Name")}</Label>
                    <Input 
                      value={form.lastName} 
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })} 
                      placeholder={t("e.g. Shah")} 
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">{t("Mobile Number (Must include country code, e.g. +919876543210)")}</Label>
                  <Input 
                    required
                    value={form.mobile} 
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })} 
                    placeholder={t("e.g. +919000000000")} 
                    className="mt-1 font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">{t("Administrative Role")}</Label>
                  <select 
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {ADMIN_ROLES.map(r => (
                      <option key={r.key} value={r.key}>{t(r.label)}</option>
                    ))}
                  </select>
                </div>

                {/* Organization Selection (only if not Monk Admin) */}
                {form.role !== "MONK_ADMIN" && (
                  <div className="border border-slate-100 rounded-md p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-800 flex items-center">
                        <Building className="h-4 w-4 text-orange-500 mr-1.5" /> {t("Scope Organizations")}
                      </Label>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {form.organizationIds.length} {t("Selected")}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Input 
                        value={orgSearchQuery}
                        onChange={(e) => setOrgSearchQuery(e.target.value)}
                        placeholder={t("Search scopes by name or city...")}
                        className="bg-white text-xs h-9"
                      />
                    </div>

                    {loadingOrgs ? (
                      <Skeleton className="h-28 w-full" />
                    ) : filteredOrgs.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-4 text-center">{t("No organizations found.")}</div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto divide-y bg-white border rounded-md px-2.5">
                        {filteredOrgs.map(org => {
                          const isChecked = form.organizationIds.includes(org.id);
                          return (
                            <label 
                              key={org.id} 
                              className="flex items-center justify-between py-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <div className="flex items-center gap-2">
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const nextIds = e.target.checked
                                      ? [...form.organizationIds, org.id]
                                      : form.organizationIds.filter(id => id !== org.id);
                                    setForm({ ...form, organizationIds: nextIds });
                                  }}
                                  className="h-3.5 w-3.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <span>{org.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">{org.city}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <TabPermissionSelector
                  selectedModules={form.grantedModules || []}
                  onChange={(mods) => setForm({ ...form, grantedModules: mods })}
                  isSuperAdmin={true}
                  title={t("Assign Initial Tab & Feature Permissions for this Admin")}
                />

                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 font-bold">
                  <Save className="h-4 w-4 mr-2" /> {t("Register Admin & Save Tab Access")}
                </Button>
              </form>
            </Card>

            {/* Quick specifications helper panel */}
            <Card className="p-5 rounded-md border-border bg-slate-50 h-fit space-y-4">
              <h4 className="font-heading text-sm font-semibold text-slate-800 flex items-center">
                <UserCheck className="h-4 w-4 text-emerald-500 mr-2" /> {t("Administrator Rules")}
              </h4>
              <ul className="text-xs space-y-2.5 text-slate-600 list-disc list-inside">
                <li>{t("Admins **cannot self-register** to the platform. They must be registered by a Super Admin.")}</li>
                <li>{t("Login credentials will be dispatched automatically via **WhatsApp & SMS** to the admin's mobile number.")}</li>
                <li>{t("**Temple/Dharamshala/Jain Center Admins** must be mapped to at least one scoped organization. They can only CRUD resources inside their scoped organizations.")}</li>
                <li>{t("**Monk Admins** have a global scope and are not restricted to specific organizations.")}</li>
              </ul>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 1. Temp Password Popup Modal */}
      {credentialPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Card className="p-6 w-full max-w-md bg-white border border-border shadow-lg relative transform transition-all scale-100 space-y-4">
            <button 
              onClick={() => setCredentialPopup(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5 text-amber-600">
              <KeyRound className="h-6 w-6" />
              <h3 className="text-lg font-semibold font-heading">{t("Temporary Admin Password")}</h3>
            </div>
            <p className="text-xs text-slate-600">
              {t("The administrator account has been successfully registered. The following credentials were generated and queued for SMS/WhatsApp dispatch:")}
            </p>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-md font-mono text-xs space-y-2.5">
              <div>
                <span className="text-slate-400">{t("Mobile/Login:")} </span>
                <span className="font-bold text-slate-800">{credentialPopup.username}</span>
              </div>
              <div>
                <span className="text-slate-400">{t("Temporary Password:")} </span>
                <span className="font-bold text-slate-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  {credentialPopup.password}
                </span>
              </div>
              <div>
                <span className="text-slate-400">{t("Assigned Role:")} </span>
                <span className="font-semibold text-slate-700">{credentialPopup.role}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t font-sans">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("Share Credentials")}</span>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={() => {
                    const msg = `Jai Jinendra, your admin account has been registered on the JiNANAM platform.\n\nUsername: ${credentialPopup.username}\nTemporary Password: ${credentialPopup.password}\nRole: ${credentialPopup.role}\n\nPlease login and change your password.`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
                  }} 
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs py-1 h-9 px-2 flex items-center justify-center gap-1"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> {t("WhatsApp")}
                </Button>
                <Button 
                  onClick={() => {
                    const msg = `Jai Jinendra, your admin account has been registered on the JiNANAM platform.\n\nUsername: ${credentialPopup.username}\nTemporary Password: ${credentialPopup.password}\nRole: ${credentialPopup.role}\n\nPlease login and change your password.`;
                    window.open(`mailto:?subject=${encodeURIComponent("JiNANAM Admin Credentials")}&body=${encodeURIComponent(msg)}`, "_self");
                  }} 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 h-9 px-2 flex items-center justify-center gap-1"
                >
                  <Mail className="h-3.5 w-3.5" /> {t("Email")}
                </Button>
                <Button 
                  onClick={() => {
                    const msg = `Jai Jinendra, your admin account has been registered on the JiNANAM platform.\n\nUsername: ${credentialPopup.username}\nTemporary Password: ${credentialPopup.password}\nRole: ${credentialPopup.role}\n\nPlease login and change your password.`;
                    navigator.clipboard.writeText(msg);
                    toast.success(t("Credentials copied to clipboard!"));
                  }} 
                  className="bg-slate-700 hover:bg-slate-800 text-white text-xs py-1 h-9 px-2 flex items-center justify-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" /> {t("Copy / SMS")}
                </Button>
              </div>
              <Button onClick={() => setCredentialPopup(null)} variant="outline" className="w-full h-9 mt-1 text-xs">
                {t("Close")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 2. Update Scopes Mapping Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Card className="p-6 w-full max-w-lg bg-white border border-border shadow-lg relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setEditingAdmin(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5 text-slate-800">
              <Building className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold font-heading">
                {t("Update Scopes for")} <span className="text-orange-500">{editingAdmin.firstName}</span>
              </h3>
            </div>
            
            <p className="text-xs text-slate-500">
              {t("Configure which administrative centers this account is allowed to manage.")}
            </p>

            <div className="space-y-3.5">
              <div className="flex gap-2">
                <Input 
                  value={orgSearchQuery}
                  onChange={(e) => setOrgSearchQuery(e.target.value)}
                  placeholder={t("Filter organizations...")}
                  className="text-xs h-9"
                />
              </div>

              {loadingOrgs ? (
                <Skeleton className="h-28 w-full" />
              ) : filteredOrgs.length === 0 ? (
                <div className="text-xs text-slate-400 italic text-center py-6">{t("No organizations found.")}</div>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y bg-slate-50 border rounded-md px-3">
                  {filteredOrgs.map(org => {
                    const isChecked = editingOrgs.includes(org.id);
                    return (
                      <label 
                        key={org.id} 
                        className="flex items-center justify-between py-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                      >
                        <div className="flex items-center gap-2.5 font-medium">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const nextIds = e.target.checked
                                ? [...editingOrgs, org.id]
                                : editingOrgs.filter(id => id !== org.id);
                              setEditingOrgs(nextIds);
                            }}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span>{org.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{org.city}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button variant="outline" onClick={() => setEditingAdmin(null)}>{t("Cancel")}</Button>
              <Button 
                onClick={saveScopeEdits} 
                disabled={savingScope || editingOrgs.length === 0} 
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {savingScope ? t("Saving...") : t("Save Scope Changes")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Super Admin Manage Tab Access Dialog for Admin */}
      <Dialog open={tabAccessAdmin !== null} onOpenChange={(o) => { if (!o) setTabAccessAdmin(null); }}>
        <DialogContent className="max-w-3xl text-xs max-h-[85vh] overflow-y-auto">
          {tabAccessAdmin && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-slate-800 font-bold">
                  <Sliders className="h-5 w-5 text-orange-600" />
                  {t("Manage Tab Access Permissions:")} {tabAccessAdmin.firstName} {tabAccessAdmin.lastName || ""}
                </DialogTitle>
              </DialogHeader>

              <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-lg text-[11px] text-orange-900">
                <strong>{t("Super Admin Override Control")}</strong>{t(": Selecting tabs here will dynamically grant or restrict which sidebar options and features")} <strong>{tabAccessAdmin.firstName}</strong> {t("can access and delegate to staff.")}
              </div>

              <TabPermissionSelector
                selectedModules={selectedAdminTabs}
                onChange={setSelectedAdminTabs}
                isSuperAdmin={true}
                title={`Configured Tab Access for ${tabAccessAdmin.firstName}`}
              />

              <DialogFooter className="gap-2 border-t pt-3">
                <Button variant="ghost" onClick={() => setTabAccessAdmin(null)}>{t("Cancel")}</Button>
                <Button
                  onClick={handleSaveTabAccess}
                  disabled={savingTabs}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  {savingTabs ? t("Saving Permissions...") : t("Save & Update Admin Tab Access")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
