import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, UserCheck, Save } from "lucide-react";
import { toast } from "sonner";
import { api, extractErrorMessage } from "@/lib/api";
import { ALL_MODULES, ALL_ACTIONS, ROLE_LABELS } from "@/constants/modules";
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
      toast.success(t("Permissions saved successfully."));
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
            {t("Configure module-level permissions for each platform role.")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                selectedRole === r
                  ? "bg-purple-700 text-white border-purple-700 font-bold"
                  : "bg-white border-border text-foreground/70 hover:text-foreground hover:border-purple-200"
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
                <tr key={m} className="border-b border-border/60 hover:bg-slate-50">
                  <td className="py-2.5 pr-4 text-xs font-semibold text-slate-700">{m}</td>
                  {ALL_ACTIONS.map((a) => {
                    const key = `${m}:${a}`;
                    const checked = !!matrix[key];
                    const disabled = a === "DELETE" && selectedRole !== "SUPER_ADMIN";
                    return (
                      <td key={a} className="text-center py-2.5 px-2">
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={() => toggle(m, a)}
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
        <Button onClick={save} disabled={saving} className="bg-purple-700 hover:bg-purple-800 text-white font-bold">
          <Save className="h-4 w-4 mr-2" /> {saving ? t("Saving...") : t("Save Matrix")}
        </Button>
      </div>
    </Card>
  );
}

export default function RolesPermissionsPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-4" data-testid="roles-permissions-page">
      <PageHeader
        title={t("Roles & Permission Assignment")}
        subtitle={t("Manage access control matrices, module permissions, and user override rules across the platform.")}
      />
      <RolePermissionMatrix />
    </div>
  );
}
