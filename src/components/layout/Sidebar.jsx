/**
 * Sidebar.jsx — JiNANAM Admin Sidebar
 *
 * Config-driven navigation consuming nav.config.js.
 * Supports both "flat" and "nested" layout modes.
 * Groups are collapsible; expanded state persists in localStorage.
 * Feature-flagged items render with a "Soon" badge (not hidden).
 * Role-based visibility applied from config roles[] array.
 *
 * NOTE: Recursive JSX components cause Babel stack overflows.
 * This file uses explicit flat/two-level rendering instead.
 */

import { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ChevronRight, Zap } from "lucide-react";
import {
  FLAT_NAV,
  NESTED_NAV,
  NAV_LAYOUT,
  ROUTE_TONES,
  TONE_HEX,
} from "@/constants/nav.config";

// ─── Persist collapse state ────────────────────────────────────────────────────
const STORAGE_KEY = "jinanam_nav_expanded";

function loadExpanded() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveExpanded(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isRoleAllowed(nodeRoles, isSuperAdmin) {
  if (!nodeRoles || nodeRoles.length === 0) return true;
  if (isSuperAdmin) return true;
  return false;
}

function getTone(route) {
  if (!route) return "blue";
  const keys = Object.keys(ROUTE_TONES).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (route.startsWith(key.split("?")[0])) return ROUTE_TONES[key];
  }
  return "blue";
}

function getHex(route) {
  return TONE_HEX[getTone(route)] || "#3B82F6";
}

// ─── Single leaf nav link ──────────────────────────────────────────────────────
function NavLeaf({ item, collapsed, onNavigate, indent }) {
  const location = useLocation();
  const Icon = item.icon;
  const hex = getHex(item.route);

  // Split route into pathname and optional query string
  const routeBase = item.route ? item.route.split("?")[0] : null;
  const routeQuery = item.route && item.route.includes("?") ? item.route.split("?")[1] : null;

  const active = (() => {
    if (!routeBase) return false;
    if (routeBase === "/") return location.pathname === "/";

    // Route has a query string → require BOTH path AND query to match
    // e.g. "/staff?tab=attendance" is only active when URL is /staff?tab=attendance
    if (routeQuery) {
      return (
        location.pathname === routeBase &&
        location.search.includes(routeQuery)
      );
    }

    // Route has no query string:
    // If the browser URL currently has a search/query parameter,
    // this plain route is NOT active (since a query-specific sub-item is active instead)
    if (location.search && location.search.length > 1) {
      return false;
    }
    return location.pathname === routeBase || location.pathname.startsWith(routeBase + "/");
  })();

  if (!item.route) return null;

  return (
    <li style={indent ? { paddingLeft: indent } : undefined}>
      <NavLink
        to={item.route}
        onClick={onNavigate}
        end={item.route === "/" || item.route === "/reports"}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center rounded-lg text-sm transition-all duration-150 group relative",
          collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5",
          active
            ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
            : "text-blue-100/80 hover:text-white hover:bg-white/10"
        )}
      >
        {Icon ? (
          <span
            className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={
              active
                ? { backgroundColor: "#F59E0B", color: "#0F172A" }
                : { backgroundColor: `${hex}33`, color: hex }
            }
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : (
          !collapsed && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-100/40 mr-1 ml-3 shrink-0" />
          )
        )}

        {!collapsed && (
          <span className="truncate text-xs font-semibold flex-1">{item.label}</span>
        )}

        {!collapsed && item.featureFlag && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
            Soon
          </span>
        )}
      </NavLink>
    </li>
  );
}

// ─── Collapsible group toggle row (non-leaf, non-top) ─────────────────────────
function SubGroupToggle({ node, expanded, onToggle, collapsed, indent }) {
  const Icon = node.icon;
  const hex = getHex(node.route || (node.children && node.children[0]?.route));

  if (collapsed) {
    return (
      <div className="flex justify-center py-1" style={indent ? { paddingLeft: indent } : undefined}>
        <span
          className="h-7 w-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${hex}22`, color: hex }}
          title={node.label}
        >
          {Icon && <Icon className="h-4 w-4" />}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer select-none hover:bg-white/5 transition-all duration-150"
      style={indent ? { paddingLeft: indent } : undefined}
      onClick={() => onToggle(node.id)}
    >
      <span
        className="h-6 w-6 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${hex}22`, color: hex }}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
      </span>
      <span className="text-xs font-semibold text-white/80 flex-1 truncate">{node.label}</span>
      {node.featureFlag && (
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Soon
        </span>
      )}
      <ChevronRight
        className={cn(
          "h-3 w-3 text-white/40 transition-transform duration-200",
          expanded ? "rotate-90" : ""
        )}
      />
    </div>
  );
}

// ─── Section header (top-level group) ─────────────────────────────────────────
function SectionHeader({ node, expanded, onToggle, collapsed }) {
  const Icon = node.icon;
  const hex = getHex(node.children && node.children[0]?.route);

  if (collapsed) {
    return <div className="h-px border-t border-white/10 mx-2 mt-2 mb-1" />;
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none hover:bg-white/5 rounded-lg transition-all duration-150"
      onClick={() => onToggle(node.id)}
    >
      {Icon && (
        <span className="h-5 w-5 rounded flex items-center justify-center shrink-0" style={{ color: hex }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      )}
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200/70 flex-1">
        {node.label}
      </span>
      <ChevronRight
        className={cn(
          "h-3.5 w-3.5 text-blue-200/40 transition-transform duration-200",
          expanded ? "rotate-90" : ""
        )}
      />
    </div>
  );
}

// ─── FLAT MODE renderer ────────────────────────────────────────────────────────
function FlatNav({ collapsed, onNavigate, isSuperAdmin, expandedState, onToggle }) {
  const sections = [];
  let current = null;

  for (const item of FLAT_NAV) {
    if (!isRoleAllowed(item.roles, isSuperAdmin)) continue;

    if (item.isSeparator) {
      if (current) sections.push(current);
      current = { id: item.id, label: item.label, items: [] };
    } else {
      if (!current) current = { id: "default", label: null, items: [] };
      current.items.push(item);
    }
  }
  if (current) sections.push(current);

  return sections.map((section, si) => {
    if (section.items.length === 0) return null;
    const key = `flat-${si}`;
    const isExpanded = expandedState[key] !== false;

    return (
      <div key={key} className={si > 0 ? "mb-2 mt-1" : "mb-2"}>
        {section.label && !collapsed && (
          <>
            {si > 0 && <div className="h-px bg-white/8 mx-2 mb-2" />}
            <div
              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-blue-200/50 flex items-center justify-between select-none cursor-pointer hover:text-blue-100/80 transition-colors group"
              onClick={() => onToggle(key)}
            >
              <span>{section.label}</span>
              <ChevronRight
                className={cn(
                  "h-3 w-3 text-blue-200/40 group-hover:text-blue-100/70 transition-all duration-200",
                  isExpanded ? "rotate-90" : ""
                )}
              />
            </div>
          </>
        )}
        {(!section.label || isExpanded) && (
          <ul className="mt-0.5 space-y-0.5">
            {section.items.map((item) => (
              <NavLeaf key={item.id} item={item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </ul>
        )}
      </div>
    );
  });
}

// ─── NESTED MODE renderer (2 explicit levels, no recursion) ───────────────────
function NestedNav({ collapsed, onNavigate, isSuperAdmin, expandedState, onToggle }) {
  return NESTED_NAV.map((topNode) => {
    if (!isRoleAllowed(topNode.roles, isSuperAdmin)) return null;

    const hasChildren = topNode.children && topNode.children.length > 0;
    const topExpanded = expandedState[topNode.id] !== false;

    // Leaf-only top-level (SA Dashboard, A Dashboard)
    if (!hasChildren) {
      return (
        <div key={topNode.id} className="mb-1">
          <ul>
            <NavLeaf item={topNode} collapsed={collapsed} onNavigate={onNavigate} />
          </ul>
        </div>
      );
    }

    const visibleTopChildren = topNode.children.filter((c) => isRoleAllowed(c.roles, isSuperAdmin));
    if (visibleTopChildren.length === 0) return null;

    return (
      <div key={topNode.id} className="mb-2">
        <SectionHeader
          node={topNode}
          expanded={topExpanded}
          onToggle={onToggle}
          collapsed={collapsed}
        />

        {!collapsed && topExpanded && (
          <ul className="mt-1 space-y-0.5">
            {visibleTopChildren.map((child) => {
              if (!isRoleAllowed(child.roles, isSuperAdmin)) return null;

              const hasGrandchildren = child.children && child.children.length > 0;
              const childExpanded = expandedState[child.id] !== false;

              // Level-2 leaf
              if (!hasGrandchildren) {
                return <NavLeaf key={child.id} item={child} collapsed={collapsed} onNavigate={onNavigate} />;
              }

              const visibleGrand = child.children.filter((g) => isRoleAllowed(g.roles, isSuperAdmin));
              if (visibleGrand.length === 0) return null;

              // Level-2 group with level-3 leaves
              return (
                <li key={child.id} className="list-none">
                  <SubGroupToggle
                    node={child}
                    expanded={childExpanded}
                    onToggle={onToggle}
                    collapsed={collapsed}
                  />

                  {!collapsed && childExpanded && (
                    <ul className="ml-3 pl-3 border-l border-white/10 space-y-0.5 mt-0.5">
                      {visibleGrand.map((grand) => {
                        if (!isRoleAllowed(grand.roles, isSuperAdmin)) return null;

                        const hasGreat = grand.children && grand.children.length > 0;
                        const grandExpanded = expandedState[grand.id] !== false;

                        // Level-3 leaf
                        if (!hasGreat) {
                          return (
                            <NavLeaf key={grand.id} item={grand} collapsed={collapsed} onNavigate={onNavigate} indent="4px" />
                          );
                        }

                        // Level-3 group (render its children flat — max depth 4)
                        const visibleGreat = grand.children.filter((g) => isRoleAllowed(g.roles, isSuperAdmin));
                        return (
                          <li key={grand.id} className="list-none">
                            <SubGroupToggle
                              node={grand}
                              expanded={grandExpanded}
                              onToggle={onToggle}
                              collapsed={collapsed}
                              indent="4px"
                            />
                            {!collapsed && grandExpanded && (
                              <ul className="ml-3 pl-3 border-l border-white/10 space-y-0.5 mt-0.5">
                                {visibleGreat.map((great) => (
                                  <NavLeaf key={great.id} item={great} collapsed={collapsed} onNavigate={onNavigate} indent="8px" />
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  });
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({ onNavigate, collapsed = false }) {
  const { isSuperAdmin } = useAuth();

  const [expandedState, setExpandedState] = useState(() => loadExpanded());

  const handleToggle = useCallback((id) => {
    setExpandedState((prev) => {
      const next = { ...prev, [id]: prev[id] === false ? true : false };
      saveExpanded(next);
      return next;
    });
  }, []);

  const layout = NAV_LAYOUT;

  return (
    <div
      className="h-full flex flex-col overflow-hidden transition-all duration-300"
      style={{
        background: "linear-gradient(180deg, #0d1527 0%, #080d19 100%)",
        color: "#EFF6FF",
        width: collapsed ? 64 : 256,
        minWidth: collapsed ? 64 : 256,
      }}
      data-testid="admin-sidebar"
    >
      {/* Brand Header */}
      <div
        className={cn(
          "h-20 flex items-center border-b border-white/10 shrink-0 transition-all duration-300",
          collapsed ? "justify-center px-0" : "gap-3 px-5"
        )}
      >
        <div className="w-11 h-11 rounded-xl bg-white p-1 shadow-sm shrink-0 flex items-center justify-center">
          <img src="/logo.png" alt="JiNANAM" className="w-full h-full object-contain" />
        </div>
        <div
          className="leading-tight overflow-hidden transition-all duration-300"
          style={{
            width: collapsed ? 0 : "auto",
            opacity: collapsed ? 0 : 1,
            whiteSpace: "nowrap",
          }}
        >
          <div className="font-brand text-xl text-white tracking-wide">JiNANAM</div>
          <div className="text-[10px] tracking-[0.15em] uppercase text-white/60 mt-0.5">
            Connecting Jain Life
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10">
        <nav className="py-3 px-2">
          {layout === "flat" ? (
            <FlatNav
              collapsed={collapsed}
              onNavigate={onNavigate}
              isSuperAdmin={isSuperAdmin}
              expandedState={expandedState}
              onToggle={handleToggle}
            />
          ) : (
            <NestedNav
              collapsed={collapsed}
              onNavigate={onNavigate}
              isSuperAdmin={isSuperAdmin}
              expandedState={expandedState}
              onToggle={handleToggle}
            />
          )}
        </nav>
      </div>

      {/* Footer — version label only. NO mobile-app promo banner. */}
      <div className="px-3 py-2.5 border-t border-white/10 shrink-0">
        {collapsed ? (
          <div className="flex justify-center">
            <span className="text-white/30 text-[9px]">v1</span>
          </div>
        ) : (
          <div className="text-[10px] text-white/30 text-center tracking-wide">
            v1.0 · JiNANAM Admin
          </div>
        )}
      </div>
    </div>
  );
}
