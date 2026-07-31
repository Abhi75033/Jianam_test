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
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { ChevronRight, Zap } from "lucide-react";
import {
  FLAT_NAV,
  NESTED_NAV,
  NAV_LAYOUT,
  ROUTE_TONES,
  TONE_HEX,
} from "@/constants/nav.config";

function getNavLabel(label, t) {
  if (!label) return "";
  const keyMap = {
    "SA Dashboard": "nav.saDashboard",
    "A Dashboard": "nav.aDashboard",
    "People": "nav.people",
    "Members": "nav.members",
    "Jain Members": "nav.jainMembers",
    "Non-Jain Members": "nav.nonJainMembers",
    "Family Management": "nav.familyManagement",
    "Member Requests": "nav.memberRequests",
    "Member Verification": "nav.memberVerification",
    "Family Groups": "nav.familyGroups",
    "Import Members": "nav.importMembers",
    "Export Members": "nav.exportMembers",
    "Volunteers": "nav.volunteers",
    "Volunteer Management": "nav.volunteerManagement",
    "Volunteer Registration": "nav.volunteerRegistration",
    "Volunteer Assignment": "nav.volunteerAssignment",
    "Volunteer Attendance": "nav.volunteerAttendance",
    "Volunteer Reports": "nav.volunteerReports",
    "MS Management": "nav.msManagement",
    "MS Profiles": "nav.msProfiles",
    "Guru Hierarchy": "nav.guruHierarchy",
    "MS Groups": "nav.msGroups",
    "MS Associations": "nav.msAssociations",
    "Current Route": "nav.currentRoute",
    "Route Planning": "nav.routePlanning",
    "Journey History": "nav.journeyHistory",
    "Chaturmas": "nav.chaturmas",
    "Tapasya": "nav.tapasya",
    "Timeline": "nav.timeline",
    "Followers": "nav.followers",
    "Staff": "nav.staff",
    "Staff Management": "nav.staffManagement",
    "Staff Registration": "nav.staffRegistration",
    "Staff QR Cards": "nav.staffQrCards",
    "Attendance": "nav.attendance",
    "Leave Management": "nav.leaveManagement",
    "Documents": "nav.documents",
    "Working Hours": "nav.workingHours",
    "Committee": "nav.committee",
    "Committee Members": "nav.committeeMembers",
    "Designations": "nav.designations",
    "Contact Directory": "nav.contactDirectory",
    "Organizations": "nav.organizations",
    "Temple": "nav.temple",
    "Temple Management": "nav.templeManagement",
    "Temple Information": "nav.templeInformation",
    "Facilities": "nav.facilities",
    "Gallery": "nav.gallery",
    "Temple Committee": "nav.templeCommittee",
    "Notices": "nav.notices",
    "Reviews": "nav.reviews",
    "Dhaja": "nav.dhaja",
    "Social Links": "nav.socialLinks",
    "Jain Centre": "nav.jainCenter",
    "Jain Centre Management": "nav.jainCenterManagement",
    "Centre Information": "nav.centreInformation",
    "Dharamshala": "nav.dharamshala",
    "Dharamshala Management": "nav.dharamshalaManagement",
    "Buildings": "nav.buildings",
    "Floors": "nav.floors",
    "Rooms": "nav.rooms",
    "Room Categories": "nav.roomCategories",
    "Amenities": "nav.amenities",
    "Pricing": "nav.pricing",
    "Rules": "nav.rules",
    "Bhojanshala": "nav.bhojanshala",
    "Bhojanshala Management": "nav.bhojanshalaManagement",
    "Timings": "nav.timings",
    "Menu": "nav.menu",
    "Pass Management": "nav.passManagement",
    "Sthanaks": "nav.sthanaks",
    "Sthanak Management": "nav.sthanakManagement",
    "Community Pages": "nav.communityPages",
    "My Page": "nav.myPage",
    "Page Information": "nav.pageInformation",
    "SEO & Sharing": "nav.seoSharing",
    "Community": "nav.community",
    "Feed": "nav.feed",
    "Feed Management": "nav.feedManagement",
    "Create Post": "nav.createPost",
    "Scheduled Posts": "nav.scheduledPosts",
    "Featured Posts": "nav.featuredPosts",
    "Reported Posts": "nav.reportedPosts",
    "Feed Analytics": "nav.feedAnalytics",
    "Events": "nav.events",
    "Event Categories": "nav.eventCategories",
    "Event Management": "nav.eventManagement",
    "Event Schedule": "nav.eventSchedule",
    "Registrations": "nav.registrations",
    "Attendees": "nav.attendees",
    "Seating Layout": "nav.seatingLayout",
    "Ticket Categories": "nav.ticketCategories",
    "Coupons": "nav.coupons",
    "QR Check-in": "nav.qrCheckIn",
    "Check-in Reports": "nav.checkInReports",
    "Event Analytics": "nav.eventAnalytics",
    "News": "nav.news",
    "News Management": "nav.newsManagement",
    "Categories": "nav.categories",
    "Featured News": "nav.featuredNews",
    "Scheduled News": "nav.scheduledNews",
    "Archived News": "nav.archivedNews",
    "Announcements": "nav.announcements",
    "Announcement Management": "nav.announcementManagement",
    "Priority Announcements": "nav.priorityAnnouncements",
    "Scheduled Announcements": "nav.scheduledAnnouncements",
    "Polls": "nav.polls",
    "Poll Management": "nav.pollManagement",
    "Responses": "nav.responses",
    "Poll Results": "nav.pollResults",
    "Tours": "nav.tours",
    "Tour Management": "nav.tourManagement",
    "Tour Schedule": "nav.tourSchedule",
    "Participants": "nav.participants",
    "99 Management": "nav.management99",
    "99 Categories": "nav.categories99",
    "Completion Reports": "nav.completionReports",
    "Spiritual Counter": "nav.spiritualCounter",
    "Counter Categories": "nav.counterCategories",
    "Member Statistics": "nav.memberStatistics",
    "Global Statistics": "nav.globalStatistics",
    "Tithi Calendar": "nav.tithiCalendar",
    "Calendar Management": "nav.calendarManagement",
    "Calendar Types": "nav.calendarTypes",
    "Tithi Management": "nav.tithiManagement",
    "Notifications": "nav.notifications",
    "Push Notifications": "nav.pushNotifications",
    "WhatsApp": "nav.whatsApp",
    "SMS": "nav.sms",
    "Email": "nav.email",
    "Notification History": "nav.notificationHistory",
    "Varshitap Management": "nav.varshitapManagement",
    "Bookings": "nav.bookings",
    "Booking Categories": "nav.bookingCategories",
    "Category Management": "nav.categoryManagement",
    "Booking Rules": "nav.bookingRules",
    "Required Approvals": "nav.requiredApprovals",
    "Booking Resources": "nav.bookingResources",
    "Halls": "nav.halls",
    "Pooja Booking": "nav.poojaBooking",
    "Pathshala": "nav.pathshala",
    "Other Resources": "nav.otherResources",
    "Booking Management": "nav.bookingManagement",
    "Booking Requests": "nav.bookingRequests",
    "Reservations": "nav.reservations",
    "Walk-in Bookings": "nav.walkInBookings",
    "Group Bookings": "nav.groupBookings",
    "Waiting List": "nav.waitingList",
    "Booking Extensions": "nav.bookingExtensions",
    "Cancellations": "nav.cancellations",
    "Pricing & Availability": "nav.pricingAvailability",
    "Seasonal Pricing": "nav.seasonalPricing",
    "Availability": "nav.availability",
    "Blackout Dates": "nav.blackoutDates",
    "Booking Limits": "nav.bookingLimits",
    "Calendar": "nav.calendar",
    "Daily, Weekly, Monthly": "nav.gridCalendar",
    "Resource Availability": "nav.resourceAvailability",
    "Check-In / Check-Out": "nav.checkInCheckOut",
    "Check-In": "nav.checkIn",
    "Check-Out": "nav.checkOut",
    "Current Occupancy": "nav.currentOccupancy",
    "Overstay Management": "nav.overstayManagement",
    "Finance": "nav.finance",
    "Donations": "nav.donations",
    "Donation Categories": "nav.donationCategories",
    "Donation Campaigns": "nav.donationCampaigns",
    "Donation Management": "nav.donationManagement",
    "Pending Verification": "nav.pendingVerification",
    "Online Donations": "nav.onlineDonations",
    "Offline Donations": "nav.offlineDonations",
    "Receipts": "nav.receipts",
    "80G Receipts": "nav.receipts80g",
    "Donation Reports": "nav.donationReports",
    "Bank & Payment": "nav.bankPayment",
    "Bank Accounts": "nav.bankAccounts",
    "UPI QR Codes": "nav.upiQrCodes",
    "Payment Gateway": "nav.paymentGateway",
    "Payment Transactions": "nav.paymentTransactions",
    "Payment Reconciliation": "nav.paymentReconciliation",
    "Sponsors": "nav.sponsors",
    "Sponsor Management": "nav.sponsorManagement",
    "Sponsor Categories": "nav.sponsorCategories",
    "Sponsorship Packages": "nav.sponsorshipPackages",
    "Active Sponsors": "nav.activeSponsors",
    "Sponsor Reports": "nav.sponsorReports",
    "Advertisements": "nav.advertisements",
    "Advertisement Management": "nav.adManagement",
    "Advertisement Categories": "nav.adCategories",
    "Banner Management": "nav.bannerManagement",
    "Campaign Schedule": "nav.campaignSchedule",
    "Advertisement Reports": "nav.adReports",
    "Offers & Benefits": "nav.offers",
    "Offer Categories": "nav.offerCategories",
    "Offer Management": "nav.offerManagement",
    "Partner Businesses": "nav.partnerBusinesses",
    "Offer Reports": "nav.offerReports",
    "Offer Analytics": "nav.offerAnalytics",
    "Operations": "nav.operations",
    "Visitor Management": "nav.visitorManagement",
    "Visitor Entry": "nav.visitorEntry",
    "Visitor Exit": "nav.visitorExit",
    "Visitor History": "nav.visitorHistory",
    "Expected Visitors": "nav.expectedVisitors",
    "Vehicle Entry": "nav.vehicleEntry",
    "VIP Visitors": "nav.vipVisitors",
    "Blacklisted Visitors": "nav.blacklistedVisitors",
    "Visitor Reports": "nav.visitorReports",
    "MS Tracking": "nav.msTracking",
    "Live Tracking": "nav.liveTracking",
    "Manual Tracking": "nav.manualTracking",
    "Live Map": "nav.liveMap",
    "Chaturmas Tracking": "nav.chaturmasTracking",
    "Route Reports": "nav.routeReports",
    "Staff Operations": "nav.staffOperations",
    "Manual Attendance": "nav.manualAttendance",
    "QR Attendance": "nav.qrAttendance",
    "Shift and Salary Management": "nav.shiftSalaryManagement",
    "Attendance Reports": "nav.attendanceReports",
    "Document Management": "nav.documentManagement",
    "Organization Documents": "nav.orgDocuments",
    "Staff Documents": "nav.staffDocuments",
    "Upload Documents": "nav.uploadDocuments",
    "Expiry Reminders": "nav.expiryReminders",
    "Download Documents": "nav.downloadDocuments",
    "Task Management": "nav.taskManagement",
    "Pending Tasks": "nav.pendingTasks",
    "Pending Approvals": "nav.pendingApprovals",
    "Follow-ups": "nav.followUps",
    "Reminders": "nav.reminders",
    "Completed Tasks": "nav.completedTasks",
    "Operational Summary": "nav.operationalSummary",
    "Reports & Analytics": "nav.reports",
    "Executive Dashboard": "nav.executiveDashboard",
    "People Reports": "nav.peopleReports",
    "Organization Reports": "nav.organizationReports",
    "Community Reports": "nav.communityReports",
    "Booking Reports": "nav.bookingReports",
    "Financial Reports": "nav.financialReports",
    "Operations Reports": "nav.operationsReports",
    "Export Center": "nav.exportCenter",
    "Support": "nav.support",
    "Support Tickets": "nav.supportTickets",
    "Feedback": "nav.feedback",
    "Incorrect Information": "nav.incorrectInformation",
    "Contact Requests": "nav.contactRequests",
    "Knowledge Base": "nav.knowledgeBase",
    "Settings": "nav.settings",
    "Admin Management": "nav.adminManagement",
    "Roles & Permissions": "nav.rolesPermissions",
    "Master Data": "nav.masterData",
    "Notification Center": "nav.notificationCenter",
    "Platform Settings": "nav.platformSettings",
    "Payment Settings": "nav.paymentSettings",
    "Security": "nav.security",
    "Subscription": "nav.subscription",
  };
  // Prefer the curated dotted key; otherwise fall through to the English label
  // as the key, which is how the bulk of the nav is translated.
  const key = keyMap[label] || `nav.${label.replace(/[^a-zA-Z0-9]/g, "")}`;
  const mapped = t(key, "");
  return mapped && mapped !== key ? mapped : t(label);
}

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

// Helper: collect all registered base routes to avoid parent route highlighting when a specific sub-route is matched
function getAllNavBaseRoutes() {
  const routes = new Set();
  const extract = (items) => {
    (items || []).forEach((item) => {
      if (item.route) routes.add(item.route.split("?")[0]);
      if (item.children) extract(item.children);
    });
  };
  extract(FLAT_NAV);
  extract(NESTED_NAV);
  return routes;
}
const ALL_NAV_BASE_ROUTES = getAllNavBaseRoutes();

// ─── Single-active resolution ─────────────────────────────────────────────────
// Highlighting used to be decided per-item, so any two items whose routes both
// matched the URL (e.g. the same route listed twice, or a query-string subset)
// lit up together. Instead we score every nav item once per location and light
// only the single best match; ties resolve to the first item in nav order.
function flattenNavItems(items, out = []) {
  (items || []).forEach((item) => {
    if (item.route) out.push(item);
    if (item.children) flattenNavItems(item.children, out);
  });
  return out;
}
const RENDERED_NAV_ITEMS = flattenNavItems(NAV_LAYOUT === "flat" ? FLAT_NAV : NESTED_NAV);

function scoreNavRoute(route, pathname, search) {
  const [base, query] = route.split("?");
  if (base === "/") return pathname === "/" && !search ? 100 : 0;

  if (query) {
    if (pathname !== base) return 0;
    const current = new URLSearchParams(search);
    const wanted = new URLSearchParams(query);
    for (const [key, value] of wanted.entries()) {
      if (current.get(key) !== value) return 0;
    }
    // Query matches are the most specific: more matched params wins.
    return 90 + [...wanted.keys()].length;
  }

  if (pathname === base) return search && search.length > 1 ? 0 : 80;

  if (pathname.startsWith(base + "/")) {
    if (ALL_NAV_BASE_ROUTES.has(pathname)) return 0;
    return 50 + base.length; // deeper base route wins over a shallower one
  }
  return 0;
}

let activeNavCache = { key: null, id: null };
function resolveActiveNavId(pathname, search) {
  const key = `${pathname}${search}`;
  if (activeNavCache.key === key) return activeNavCache.id;
  let bestId = null;
  let bestScore = 0;
  for (const item of RENDERED_NAV_ITEMS) {
    const score = scoreNavRoute(item.route, pathname, search);
    if (score > bestScore) {   // strict > keeps the first item on a tie
      bestScore = score;
      bestId = item.id;
    }
  }
  activeNavCache = { key, id: bestId };
  return bestId;
}

// ─── Single leaf nav link ──────────────────────────────────────────────────────
function NavLeaf({ item, collapsed, onNavigate, indent }) {
  const { t } = useLanguage();
  const location = useLocation();
  const Icon = item.icon;
  const hex = getHex(item.route);

  // Exactly one nav item is active for any given URL — see resolveActiveNavId.
  const active =
    !!item.route &&
    !!item.id &&
    item.id === resolveActiveNavId(location.pathname, location.search);

  if (!item.route) return null;

  const displayLabel = getNavLabel(item.label, t);

  return (
    <li style={indent ? { paddingLeft: indent } : undefined}>
      <NavLink
        to={item.route}
        onClick={onNavigate}
        end={item.route === "/" || item.route === "/reports"}
        title={collapsed ? displayLabel : undefined}
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
          <span className="truncate text-xs font-semibold flex-1">{displayLabel}</span>
        )}

        {!collapsed && ((item.route && item.route.includes("/coming-soon")) || (item.featureFlag && (!item.route || item.route.includes("/coming-soon")))) && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
            {t("Soon")}
          </span>
        )}
      </NavLink>
    </li>
  );
}

// ─── Collapsible group toggle row (non-leaf, non-top) ─────────────────────────
function SubGroupToggle({ node, expanded, onToggle, collapsed, indent }) {
  const { t } = useLanguage();
  const Icon = node.icon;
  const hex = getHex(node.route || (node.children && node.children[0]?.route));
  const displayLabel = getNavLabel(node.label, t);

  if (collapsed) {
    return (
      <div className="flex justify-center py-1" style={indent ? { paddingLeft: indent } : undefined}>
        <span
          className="h-7 w-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${hex}22`, color: hex }}
          title={displayLabel}
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
      <span className="text-xs font-semibold text-white/80 flex-1 truncate">{displayLabel}</span>
      {node.featureFlag && (
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {t("Soon")}
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
  const { t } = useLanguage();
  const Icon = node.icon;
  const hex = getHex(node.children && node.children[0]?.route);
  const displayLabel = getNavLabel(node.label, t);

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
        {displayLabel}
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
  const { t } = useLanguage();
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
              <span>{t(section.label)}</span>
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
  const { t } = useLanguage();
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
          <img src="/logo.png" alt={t("JiNANAM")} className="w-full h-full object-contain" />
        </div>
        <div
          className="leading-tight overflow-hidden transition-all duration-300"
          style={{
            width: collapsed ? 0 : "auto",
            opacity: collapsed ? 0 : 1,
            whiteSpace: "nowrap",
          }}
        >
          <div className="font-brand text-xl text-white tracking-wide">{t("JiNANAM")}</div>
          <div className="text-[10px] tracking-[0.15em] uppercase text-white/60 mt-0.5">
            {t("Connecting Jain Life")}
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
            {t("v1.0 · JiNANAM Admin")}
          </div>
        )}
      </div>
    </div>
  );
}
