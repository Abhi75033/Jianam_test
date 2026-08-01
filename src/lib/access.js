/**
 * access.js — Central Access Control & Delegation Engine.
 *
 * ─── The hierarchy ────────────────────────────────────────────────────────────
 *
 *   SUPER_ADMIN  ──grants tabs──▶  ADMIN  ──grants tabs──▶  SUB-ADMIN / STAFF
 *                                                     └──grants tabs──▶ STAFF
 *
 * Two rules govern the whole system:
 *
 *   1. SUBSET RULE — you can only delegate tabs you hold yourself. Whoever
 *      onboards an account decides that account's tabs, and can never hand out
 *      more than they were given. Revoking a tab upstream shrinks everything
 *      downstream on the next login.
 *
 *   2. CRU-NOT-D RULE — a delegated grant carries VIEW + CREATE + EDIT (plus
 *      APPROVE/EXPORT where the module supports it). DELETE is *never*
 *      delegated. Only SUPER_ADMIN destroys records. So an Admin granted
 *      "Temple Management" sees the tab, opens the record, adds and edits
 *      details — but is shown no delete affordance.
 *
 * Both rules are enforced here, in one place, so screens never re-implement
 * them. `buildCapabilities` is the only function that decides what an account
 * may do; everything else in the app asks it.
 */

/* ─── Actions ──────────────────────────────────────────────────────────────── */

export const ACTIONS = {
  VIEW: "VIEW",
  CREATE: "CREATE",
  EDIT: "EDIT",
  DELETE: "DELETE",
  APPROVE: "APPROVE",
  EXPORT: "EXPORT",
};

/** Everything a SUPER_ADMIN holds. */
export const ALL_ACTIONS = Object.values(ACTIONS);

/**
 * What a delegated grant is worth. DELETE is deliberately absent — see rule 2.
 * Flip `DELEGATED_ACTIONS` here if the platform ever decides to let Super Admin
 * hand out destructive rights; nothing else needs to change.
 */
export const DELEGATED_ACTIONS = [
  ACTIONS.VIEW,
  ACTIONS.CREATE,
  ACTIONS.EDIT,
  ACTIONS.APPROVE,
  ACTIONS.EXPORT,
];

/** Roles that own the platform outright. */
export const SUPER_ROLES = ["SUPER_ADMIN"];

/** Roles that may onboard other accounts and delegate their own tabs onward. */
export const DELEGATOR_ROLES = [
  "SUPER_ADMIN",
  "TEMPLE_ADMIN",
  "DHARAMSHALA_ADMIN",
  "JAIN_CENTER_ADMIN",
  "JC_ADMIN",
  "MONK_ADMIN",
  "SUB_ADMIN",
  "STAFF",
];

/* ─── Module catalogue ─────────────────────────────────────────────────────── */

/**
 * Every grantable tab on the platform. `category` drives the grouping in the
 * permission selector; `key` is what gets stored on the account.
 */
export const PLATFORM_MODULES = [
  { key: "MEMBERS", label: "Members & Family Directory", category: "People" },
  { key: "VOLUNTEERS", label: "Volunteer Management", category: "People" },
  { key: "MONKS", label: "MS Profiles & Chaturmas", category: "People" },
  { key: "STAFF", label: "Staff Management & Attendance", category: "People" },
  { key: "TEMPLES", label: "Temple Management", category: "Organizations" },
  { key: "DHARAMSHALAS", label: "Dharamshala & Rooms", category: "Organizations" },
  { key: "JAIN_CENTERS", label: "Jain Centre Management", category: "Organizations" },
  { key: "STHANAKS", label: "Sthanak Management", category: "Organizations" },
  { key: "COMMUNITY_PAGES", label: "Community Pages", category: "Organizations" },
  { key: "FEED", label: "Feed & Posts", category: "Community" },
  { key: "EVENTS", label: "Events & Registrations", category: "Community" },
  { key: "NEWS", label: "News & Announcements", category: "Community" },
  { key: "POLLS", label: "Polls & Voting", category: "Community" },
  { key: "TOURS", label: "Tours & Yatras", category: "Community" },
  { key: "COUNTERS", label: "Spiritual Counters", category: "Community" },
  { key: "CALENDAR", label: "Tithi Calendar", category: "Community" },
  { key: "NOTIFICATIONS", label: "Notification Center", category: "Community" },
  { key: "GALLERY", label: "Gallery & Albums", category: "Community" },
  { key: "ANNOUNCEMENTS", label: "Announcements", category: "Community" },
  { key: "COMMUNICATION", label: "Communication Center", category: "Community" },
  { key: "BOOKINGS", label: "Facility & Room Bookings", category: "Bookings" },
  { key: "DONATIONS", label: "Donations & Receipts", category: "Finance" },
  { key: "SPONSORS", label: "Sponsors & Ads", category: "Finance" },
  { key: "OFFERS", label: "Offers & Benefits", category: "Finance" },
  { key: "VISITORS", label: "Visitor Entry & Exit", category: "Operations" },
  { key: "TRACKING", label: "MS Live Tracking", category: "Operations" },
  { key: "REPORTS", label: "Reports & Analytics", category: "Reports" },
  { key: "SUPPORT", label: "Support & Feedback", category: "Support" },
  { key: "SETTINGS", label: "Organization Settings", category: "Settings" },
];

export const ALL_MODULE_KEYS = PLATFORM_MODULES.map((m) => m.key);

const MODULE_BY_KEY = PLATFORM_MODULES.reduce((acc, m) => {
  acc[m.key] = m;
  return acc;
}, {});

export function moduleLabel(key) {
  return MODULE_BY_KEY[key]?.label || key;
}

/**
 * Modules whose tab is a pure read surface — granting them never implies write
 * rights, so CREATE/EDIT are stripped even for a delegated grant.
 */
const READ_ONLY_MODULES = new Set(["REPORTS"]);

/**
 * Modules that expose an approval queue. APPROVE is only meaningful here.
 */
const APPROVAL_MODULES = new Set(["BOOKINGS", "DONATIONS", "COMMUNITY_PAGES", "VOLUNTEERS"]);

/* ─── Route → module mapping ───────────────────────────────────────────────── */

/**
 * Maps a sidebar/router path onto the module that gates it. Kept here (rather
 * than inside the Sidebar) so route guards, page guards and the sidebar all
 * resolve a route to the same module.
 */
export const ROUTE_TO_MODULE = {
  "/sa-dashboard": "DASHBOARD",
  "/a-dashboard": "DASHBOARD",
  "/": "DASHBOARD",

  "/members": "MEMBERS",
  "/jain-members": "MEMBERS",
  "/non-jain-members": "MEMBERS",
  "/family": "MEMBERS",
  "/member-requests": "MEMBERS",
  "/member-verification": "MEMBERS",

  "/volunteers": "VOLUNTEERS",

  "/monks": "MONKS",
  "/ms-profiles": "MONKS",
  "/guru-hierarchy": "MONKS",
  "/chaturmas": "MONKS",
  "/tapasya": "MONKS",

  "/staff": "STAFF",
  "/staff-management": "STAFF",
  "/committee-members": "STAFF",

  "/temples": "TEMPLES",
  "/temple-management": "TEMPLES",

  "/dharamshalas": "DHARAMSHALAS",
  "/dharamshala-management": "DHARAMSHALAS",

  "/jain-centers": "JAIN_CENTERS",
  "/stanaks": "STHANAKS",
  "/community-pages": "COMMUNITY_PAGES",

  "/feed": "FEED",
  "/events": "EVENTS",
  "/news": "NEWS",
  "/announcements": "ANNOUNCEMENTS",
  "/polls": "POLLS",
  "/tours": "TOURS",
  "/counters": "COUNTERS",
  "/calendar": "CALENDAR",
  "/notifications": "NOTIFICATIONS",
  "/gallery": "GALLERY",
  "/communication": "COMMUNICATION",

  "/bookings": "BOOKINGS",
  "/booking-calendar": "BOOKINGS",
  "/donations": "DONATIONS",
  "/receipts": "DONATIONS",

  "/sponsors": "SPONSORS",
  "/ads": "SPONSORS",

  "/offers": "OFFERS",
  "/visitors": "VISITORS",
  "/tracking": "TRACKING",
  "/live-map": "TRACKING",
  "/routes": "TRACKING",
  "/journey-logs": "TRACKING",
  "/reports": "REPORTS",
  "/support-tickets": "SUPPORT",
  "/feedback": "SUPPORT",
  "/incorrect-reports": "SUPPORT",
  "/settings": "SETTINGS",
  "/audit-logs": "SETTINGS",
  "/master-data": "SETTINGS",
  "/admins": "SETTINGS",
};

/** Resolve a route (with or without a query string) to its gating module. */
export function moduleForRoute(route) {
  if (!route) return null;
  const path = route.split("?")[0];
  if (ROUTE_TO_MODULE[path]) return ROUTE_TO_MODULE[path];

  // Longest-prefix fallback so nested routes (/admin/temples/:id) resolve too.
  const normalized = path.replace(/^\/admin/, "") || "/";
  if (ROUTE_TO_MODULE[normalized]) return ROUTE_TO_MODULE[normalized];

  const keys = Object.keys(ROUTE_TO_MODULE).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (key !== "/" && (normalized === key || normalized.startsWith(`${key}/`))) {
      return ROUTE_TO_MODULE[key];
    }
  }
  return null;
}

export function isSuperRole(role) {
  return SUPER_ROLES.includes(role);
}

export function canDelegate(role) {
  return DELEGATOR_ROLES.includes(role);
}

/* ─── Normalising raw grants ───────────────────────────────────────────────── */

/**
 * Grants arrive from several backend shapes depending on which endpoint
 * answered first:
 *
 *   ["TEMPLES", "MEMBERS"]                                  // /auth/me/modules
 *   [{ module: "TEMPLES", allowed: true }, …]               // permission-overrides
 *   [{ module: "TEMPLES", actions: ["VIEW","EDIT"] }, …]    // /staff/:id/permissions
 *   { TEMPLES: ["VIEW","EDIT"], … }                         // me.permissions
 *
 * `normalizeGrants` flattens any of them into { MODULE: [actions] | null },
 * where null means "granted, actions unspecified".
 */
export function normalizeGrants(raw) {
  const out = {};
  if (!raw) return out;

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (typeof entry === "string") {
        out[entry.toUpperCase()] = null;
      } else if (entry && typeof entry === "object") {
        const key = String(entry.module || entry.key || entry.moduleKey || "").toUpperCase();
        if (!key) continue;
        // An override row with allowed:false is an explicit revoke.
        if (entry.allowed === false) continue;
        out[key] = Array.isArray(entry.actions)
          ? entry.actions.map((a) => String(a).toUpperCase())
          : null;
      }
    }
    return out;
  }

  if (typeof raw === "object") {
    for (const [key, value] of Object.entries(raw)) {
      const k = key.toUpperCase();
      if (Array.isArray(value)) out[k] = value.map((a) => String(a).toUpperCase());
      else if (value) out[k] = null;
    }
  }
  return out;
}

/**
 * Which actions a delegated grant on `moduleKey` is worth, optionally narrowed
 * by the explicit action list the delegator stored.
 */
function delegatedActionsFor(moduleKey, explicitActions) {
  let actions = DELEGATED_ACTIONS.slice();

  if (READ_ONLY_MODULES.has(moduleKey)) {
    actions = [ACTIONS.VIEW, ACTIONS.EXPORT];
  }
  if (!APPROVAL_MODULES.has(moduleKey)) {
    actions = actions.filter((a) => a !== ACTIONS.APPROVE);
  }

  if (Array.isArray(explicitActions) && explicitActions.length > 0) {
    const requested = new Set(explicitActions);
    // Intersect with what delegation allows — an explicit DELETE is dropped.
    const narrowed = actions.filter((a) => requested.has(a));
    // VIEW is implied by holding the tab at all.
    if (!narrowed.includes(ACTIONS.VIEW)) narrowed.unshift(ACTIONS.VIEW);
    return narrowed;
  }

  return actions;
}

/* ─── Capability construction ──────────────────────────────────────────────── */

/**
 * Build the capability map for an account. This is the single source of truth
 * consumed by `useAuth()`, the sidebar, route guards and every page.
 *
 * @param {object}   input
 * @param {string}   input.role         primaryRoleKey, e.g. "TEMPLE_ADMIN"
 * @param {*}        input.modules      granted module keys (any supported shape)
 * @param {*}        input.permissions  action map from the backend, if present
 * @param {*}        input.overrides    per-user permission overrides, if present
 * @returns {{ [module: string]: string[] }} module → allowed actions
 */
export function buildCapabilities({ role, modules, permissions, overrides } = {}) {
  const caps = {};

  // Super Admin holds every module with every action, DELETE included.
  if (isSuperRole(role)) {
    for (const key of ALL_MODULE_KEYS) caps[key] = ALL_ACTIONS.slice();
    caps.DASHBOARD = ALL_ACTIONS.slice();
    return caps;
  }

  const fromModules = normalizeGrants(modules);
  const fromOverrides = normalizeGrants(overrides);
  const fromPermissions = normalizeGrants(permissions);

  /*
   * WHICH tabs vs WHAT you can do in them are two different questions, and only
   * the grant list answers the first.
   *
   * `permissions` is the backend's role-based action map — for a TEMPLE_ADMIN it
   * lists every module the *role* could theoretically touch. Unioning it into
   * the grant set handed an admin ~23 tabs when Super Admin had granted one.
   * So the explicit grant (modules, refined by per-user overrides) decides the
   * tab set, and `permissions` may only narrow the actions inside those tabs —
   * it can never add one.
   *
   * A grant list that was supplied but empty means "no tabs": fail closed. Only
   * when no grant list exists at all do we fall back to the permissions keys.
   */
  const grantSupplied = modules != null || overrides != null;
  const grantedSet = grantSupplied
    ? { ...fromModules, ...fromOverrides }
    : fromPermissions;

  for (const [moduleKey, grantActions] of Object.entries(grantedSet)) {
    if (moduleKey === "DASHBOARD") continue;
    if (!MODULE_BY_KEY[moduleKey]) continue; // ignore keys we don't know
    // Actions come from the grant if it specified any, else from the role map.
    const explicitActions = grantActions || fromPermissions[moduleKey] || null;
    caps[moduleKey] = delegatedActionsFor(moduleKey, explicitActions);
  }

  // The dashboard is every signed-in account's landing surface.
  caps.DASHBOARD = [ACTIONS.VIEW];

  return caps;
}

/* ─── Querying capabilities ────────────────────────────────────────────────── */

/** Does this capability map permit `action` on `module`? */
export function can(capabilities, module, action = ACTIONS.VIEW) {
  if (!capabilities || !module) return false;
  const allowed = capabilities[String(module).toUpperCase()];
  if (!allowed) return false;
  return allowed.includes(String(action).toUpperCase());
}

/** Module keys the account holds (excluding the always-on dashboard). */
export function grantedModules(capabilities) {
  return Object.keys(capabilities || {}).filter((k) => k !== "DASHBOARD");
}

/**
 * What this account may hand to someone it onboards — never more than it holds
 * itself (rule 1). Super Admin may delegate the whole catalogue.
 */
export function delegatableModules(capabilities, role) {
  if (isSuperRole(role)) return ALL_MODULE_KEYS.slice();
  return grantedModules(capabilities).filter((k) => ALL_MODULE_KEYS.includes(k));
}

/**
 * Clamp a requested grant to what the delegator actually holds. Anything the
 * delegator can't give is silently dropped — the caller gets back the granted
 * subset plus the rejected keys so it can explain the difference.
 */
export function sanitizeGrant(requestedModules, actorCapabilities, actorRole) {
  const allowed = new Set(delegatableModules(actorCapabilities, actorRole));
  const requested = Array.isArray(requestedModules) ? requestedModules : [];
  const granted = [];
  const rejected = [];
  for (const key of requested) {
    const k = String(key).toUpperCase();
    if (allowed.has(k)) granted.push(k);
    else rejected.push(k);
  }
  return { granted, rejected };
}

/**
 * The payload shape `/staff/:id/permissions` expects. Actions are stamped from
 * the delegation rule, so a delegated account can never be written with DELETE
 * even if a caller asks for it.
 */
export function toPermissionsPayload(moduleKeys) {
  return (moduleKeys || []).map((key) => ({
    module: key,
    actions: delegatedActionsFor(String(key).toUpperCase(), null),
  }));
}

/** The payload shape `/settings/users/:id/permission-overrides` expects. */
export function toOverridesPayload(moduleKeys) {
  const granted = new Set((moduleKeys || []).map((k) => String(k).toUpperCase()));
  return ALL_MODULE_KEYS.map((key) => ({ module: key, allowed: granted.has(key) }));
}

/**
 * Provenance stamped onto a grant so the UI can answer "who gave me this?".
 * The chain matters: staff onboarded by an Admin inherit from that Admin, and
 * staff who onboard further staff appear as the grantor for those accounts.
 */
export function buildGrantMeta(actor) {
  return {
    grantedBy: actor?.id || actor?.userId || null,
    grantedByName: [actor?.firstName, actor?.lastName].filter(Boolean).join(" ") || null,
    grantedByRole: actor?.primaryRoleKey || actor?.role || null,
    grantedAt: new Date().toISOString(),
  };
}
