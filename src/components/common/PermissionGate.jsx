import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ACTIONS, moduleForRoute } from "@/lib/access";
import { Lock } from "lucide-react";

/**
 * Resolves the module gating the current screen from its route, so a component
 * deep in a page can ask about permissions without being handed a module key.
 */
export function useRouteModule() {
  const { pathname } = useLocation();
  return moduleForRoute(pathname);
}

/**
 * Capability hooks scoped to the current route. `useCanDelete()` is false for
 * every account except Super Admin, since DELETE is never delegated.
 */
export function useCan(action = ACTIONS.VIEW, module) {
  const routeModule = useRouteModule();
  const { canDo } = useAuth();
  return canDo(module || routeModule, action);
}

export const useCanCreate = (module) => useCan(ACTIONS.CREATE, module);
export const useCanEdit = (module) => useCan(ACTIONS.EDIT, module);
export const useCanDelete = (module) => useCan(ACTIONS.DELETE, module);

/**
 * PermissionGate — declarative capability check around a piece of UI.
 *
 *   <PermissionGate module="TEMPLES" action="DELETE">
 *     <DeleteButton />
 *   </PermissionGate>
 *
 * Renders `children` only when the account holds `action` on `module`. Because
 * DELETE is never delegated, wrapping a delete control in this gate removes it
 * for every account except Super Admin — which is exactly the "CRU, no D"
 * affordance an onboarded Admin or staff member should see.
 *
 * Props:
 *   module   — module key, e.g. "TEMPLES". Omit to resolve it from the route.
 *   action   — VIEW | CREATE | EDIT | DELETE | APPROVE | EXPORT (default VIEW)
 *   mode     — "hide" (default) removes the UI; "disable" renders it inert
 *   fallback — node rendered instead when denied (ignored in "disable" mode)
 */
export function PermissionGate({
  module,
  action = ACTIONS.VIEW,
  mode = "hide",
  fallback = null,
  children,
}) {
  const allowed = useCan(action, module);

  if (allowed) return children;
  if (mode === "disable") {
    return (
      <span
        className="opacity-40 pointer-events-none select-none"
        aria-disabled="true"
        title="Not permitted for your account"
      >
        {children}
      </span>
    );
  }
  return fallback;
}

/**
 * Banner explaining why an account sees no destructive controls. Drop it on a
 * management screen so the restriction reads as intentional rather than broken.
 */
export function ReadEditOnlyNotice({ className = "" }) {
  const { isSuperAdmin } = useAuth();
  if (isSuperAdmin) return null;
  return (
    <div
      className={`flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 ${className}`}
    >
      <Lock className="h-3.5 w-3.5 text-slate-400 mt-px shrink-0" />
      <span>
        You can <strong>view, add and edit</strong> records in this tab. Deleting
        records is reserved for Super Admin.
      </span>
    </div>
  );
}

export default PermissionGate;
