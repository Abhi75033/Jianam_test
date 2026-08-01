import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Check, UserCheck, UsersRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { moduleLabel, ACTIONS } from "@/lib/access";

/**
 * MyAccessPanel — "what can I do, and who gave it to me?"
 *
 * Renders the signed-in account's granted tabs, the actions each grant carries,
 * and the account that onboarded them. Makes the delegation chain legible so an
 * Admin can see exactly what they may pass on to sub-admins and staff.
 */
export function MyAccessPanel({ className = "" }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, capabilities, allowedModules, delegatableModules, isSuperAdmin } = useAuth();

  const grantedBy = user?.grantedByName || user?.grantedBy;
  const grantedByRole = user?.grantedByRole;

  return (
    <Card className={`p-5 rounded-2xl border-slate-200 bg-white space-y-4 ${className}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t("My Tab Access")}</h3>
            <p className="text-[11px] text-slate-500">
              {isSuperAdmin
                ? t("Super Admin — full platform access, including delete.")
                : t("Tabs granted to your account and what you can do in each.")}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-bold border-slate-200 bg-slate-50 text-slate-600"
        >
          {allowedModules.length} {t("tabs")}
        </Badge>
      </div>

      {/* Who onboarded this account */}
      {!isSuperAdmin && grantedBy && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
          <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>
            {t("Access granted by")} <strong className="text-slate-800">{grantedBy}</strong>
            {grantedByRole ? ` (${String(grantedByRole).replace(/_/g, " ")})` : ""}.
          </span>
        </div>
      )}

      {/* The CRU-not-D rule, stated plainly */}
      {!isSuperAdmin && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
          <Lock className="h-3.5 w-3.5 mt-px shrink-0 text-amber-600" />
          <span>
            {t("Each tab below lets you")} <strong>{t("view, add and edit")}</strong>.{" "}
            {t("Deleting records is reserved for Super Admin.")}
          </span>
        </div>
      )}

      {allowedModules.length === 0 ? (
        <div className="text-xs text-slate-400 italic text-center py-6">
          {t("No tabs have been granted to your account yet. Contact whoever onboarded you.")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allowedModules.map((key) => {
            const actions = capabilities[key] || [];
            return (
              <div
                key={key}
                className="flex items-start justify-between gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/60"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {t(moduleLabel(key))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {actions
                      .filter((a) => a !== ACTIONS.VIEW)
                      .map((a) => (
                        <span
                          key={a}
                          className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
                        >
                          {a}
                        </span>
                      ))}
                    {!actions.includes(ACTIONS.DELETE) && (
                      <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 line-through">
                        {t("Delete")}
                      </span>
                    )}
                  </div>
                </div>
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              </div>
            );
          })}
        </div>
      )}

      {/* What this account can hand onward, plus the way to do it */}
      {delegatableModules.length > 0 && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[11px] text-slate-600 max-w-md">
            {t("You can delegate")}{" "}
            <strong className="text-slate-800">{delegatableModules.length}</strong>{" "}
            {t("of these tabs to sub-admins and staff you onboard — never more than you hold yourself.")}
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/admin/staff")}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] h-8"
          >
            <UsersRound className="h-3.5 w-3.5 mr-1.5" />
            {t("Onboard & Manage Team")}
          </Button>
        </div>
      )}
    </Card>
  );
}

export default MyAccessPanel;
