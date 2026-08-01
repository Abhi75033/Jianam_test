import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { moduleForRoute, moduleLabel } from "@/lib/access";

/**
 * ModuleRouteGuard — enforces tab access at the route, not just in the sidebar.
 *
 * Hiding a nav link only removes the signpost; the URL still worked. An admin
 * granted the Temple tab could type /admin/donations and get the full page.
 * This wraps the admin outlet and blocks any route whose module the account
 * wasn't granted, so the sidebar and the router agree on one answer.
 *
 * Routes that map to no module (or to DASHBOARD) stay open — those are the
 * shared shell screens every signed-in admin needs.
 */
/**
 * Routes every signed-in admin may reach regardless of tab grants. These show
 * the account its *own* access and team — no privileged data — so gating them
 * behind a module would lock an admin out of the page that explains why they
 * are locked out. `/admins` in particular is the Team & Access Management
 * screen for non-Super-Admins.
 */
const SELF_SERVICE_ROUTES = ["/admins", "/account-status", "/profile"];

function isSelfServiceRoute(pathname) {
  const path = (pathname || "").replace(/^\/admin/, "") || "/";
  return SELF_SERVICE_ROUTES.some((r) => path === r || path.startsWith(`${r}/`));
}

export default function ModuleRouteGuard({ children }) {
  const { pathname } = useLocation();
  const { canDo, isSuperAdmin, allowedModules } = useAuth();
  const { t } = useLanguage();

  const moduleKey = moduleForRoute(pathname);

  const blocked =
    !isSuperAdmin &&
    !isSelfServiceRoute(pathname) &&
    moduleKey &&
    moduleKey !== "DASHBOARD" &&
    !canDo(moduleKey, "VIEW");

  if (!blocked) return children;

  return (
    <div className="space-y-6" data-testid="module-route-blocked">
      <Card className="p-8 max-w-xl mx-auto rounded-2xl border border-orange-100 bg-orange-50/40 text-center space-y-4 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">{t("Tab not available")}</h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {t("Your account has not been granted the")}{" "}
            <strong>{t(moduleLabel(moduleKey))}</strong>{" "}
            {t("tab. Ask whoever onboarded your account if you need it.")}
          </p>
          {allowedModules.length > 0 && (
            <p className="text-[11px] text-slate-500 mt-2">
              {t("You currently have access to")} <strong>{allowedModules.length}</strong>{" "}
              {t("tab(s).")}
            </p>
          )}
        </div>
        <Button
          onClick={() => { window.location.href = "/admin/a-dashboard"; }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
        >
          {t("Return to Dashboard")}
        </Button>
      </Card>
    </div>
  );
}
