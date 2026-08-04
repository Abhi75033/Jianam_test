import "@/App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VisibilityEngineProvider } from "@/contexts/VisibilityEngineContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import MemberProtectedRoute from "@/components/member/MemberProtectedRoute";
import { MemberAuthProvider } from "@/contexts/MemberAuthContext";
import AdminLayout from "@/components/layout/AdminLayout";
import LoginPage from "@/pages/LoginPage";
import LandingPage from "@/pages/LandingPage";
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const MembersPage = lazy(() => import("@/pages/MembersPage"));
const FamilyPage = lazy(() => import("@/pages/FamilyPage"));
const MonksPage = lazy(() => import("@/pages/MonksPage"));
const MonkDetailPage = lazy(() => import("@/pages/MonkDetailPage"));
const OrgListPage = lazy(() => import("@/pages/OrgListPage"));
const OrgDetailPage = lazy(() => import("@/pages/OrgDetailPage"));
const StaffPage = lazy(() => import("@/pages/StaffPage"));
const VisitorsPage = lazy(() => import("@/pages/VisitorsPage"));
const BookingsPage = lazy(() => import("@/pages/BookingsPage"));
const DonationsPage = lazy(() => import("@/pages/DonationsPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const ToursPage = lazy(() => import("@/pages/ToursPage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const OffersPage = lazy(() => import("@/pages/OffersPage"));
const AdsPage = lazy(() => import("@/pages/AdsPage"));
const NewsPage = lazy(() => import("@/pages/NewsPage"));
const CommunityPagesPage = lazy(() => import("@/pages/CommunityPagesPage"));
const PollsPage = lazy(() => import("@/pages/PollsPage"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
const CountersPage = lazy(() => import("@/pages/CountersPage"));
const TrackingPage = lazy(() => import("@/pages/TrackingPage"));
const DevicesPage = lazy(() => import("@/pages/DevicesPage"));
const AlertsPage = lazy(() => import("@/pages/AlertsPage"));
const AnnouncementsPage = lazy(() => import("@/pages/AnnouncementsPage"));
const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const VolunteersPage = lazy(() => import("@/pages/VolunteersPage"));
const SupportTicketsPage = lazy(() => import("@/pages/SupportTicketsPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const NotificationPreferencesPage = lazy(() => import("@/pages/NotificationPreferencesPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AuditLogsPage = lazy(() => import("@/pages/AuditLogsPage"));
const ReceiptsPage = lazy(() => import("@/pages/ReceiptsPage"));
const MasterDataPage = lazy(() => import("@/pages/MasterDataPage"));
const SubscriptionPlansPage = lazy(() => import("@/pages/SubscriptionPlansPage"));
const AccountStatusPage = lazy(() => import("@/pages/AccountStatusPage"));
const RolesPermissionsPage = lazy(() => import("@/pages/RolesPermissionsPage"));
const AdminsPage = lazy(() => import("@/pages/AdminsPage"));
import ComingSoonPage from "@/pages/ComingSoonPage";
import { Toaster } from "@/components/ui/sonner";
const CommitteePage = StaffPage;
const PassManagementPage = OrgListPage;
const SthanaksPage = OrgListPage;

/* ─── Member Panel Page Imports ───────────────────────────────────────────── */
import MemberLayout from "@/components/member/MemberLayout";
const MemberLoginPage = lazy(() => import("@/pages/member/MemberLoginPage"));
const MemberRegisterPage = lazy(() => import("@/pages/member/MemberRegisterPage"));
const MemberHomePage = lazy(() => import("@/pages/member/MemberHomePage"));
const MemberFeedPage = lazy(() => import("@/pages/member/MemberFeedPage"));
const MemberOffersPage = lazy(() => import("@/pages/member/MemberOffersPage"));
const MemberExplorePage = lazy(() => import("@/pages/member/MemberExplorePage"));
const MemberSpiritualPage = lazy(() => import("@/pages/member/MemberSpiritualPage"));
const MemberProfilePage = lazy(() => import("@/pages/member/MemberProfilePage"));
const MemberNewsPage = lazy(() => import("@/pages/member/MemberNewsPage"));
const MemberMSListPage = lazy(() => import("@/pages/member/MemberMSListPage"));
const MemberMSDetailPage = lazy(() => import("@/pages/member/MemberMSDetailPage"));
const MemberTempleListPage = lazy(() => import("@/pages/member/MemberTempleListPage"));
const MemberTempleDetailPage = lazy(() => import("@/pages/member/MemberTempleDetailPage"));
const MemberGalleryPage = lazy(() => import("@/pages/member/MemberGalleryPage"));
const MemberVisitsPage = lazy(() => import("@/pages/member/MemberVisitsPage"));
const MemberBookingPage = lazy(() => import("@/pages/member/MemberBookingPage"));
const MemberVolunteersPage = lazy(() => import("@/pages/member/MemberVolunteersPage"));
const MemberAnnouncementsPage = lazy(() => import("@/pages/member/MemberAnnouncementsPage"));
const MemberCommunityPagesPage = lazy(() => import("@/pages/member/MemberCommunityPagesPage"));
const MemberCommunityPageDetailPage = lazy(() => import("@/pages/member/MemberCommunityPageDetailPage"));
const MemberSupportPage = lazy(() => import("@/pages/member/MemberSupportPage"));
const MemberToursPage = lazy(() => import("@/pages/member/MemberToursPage"));
const MemberDigitalIdPage = lazy(() => import("@/pages/member/MemberDigitalIdPage"));
const MemberWalletPage = lazy(() => import("@/pages/member/MemberWalletPage"));
const MemberNotificationsPage = lazy(() => import("@/pages/member/MemberNotificationsPage"));
const MyBookingsPage = lazy(() => import("@/pages/member/MyBookingsPage"));
const BookingDetailPage = lazy(() => import("@/pages/member/BookingDetailPage"));
const MemberDonationsPage = lazy(() => import("@/pages/member/MemberDonationsPage"));
const MemberEventsPage = lazy(() => import("@/pages/member/MemberEventsPage"));
const MyTicketsPage = lazy(() => import("@/pages/member/MyTicketsPage"));

/**
 * SmartRouteResolver — Handles un-prefixed URLs dynamically for logged-in user.
 * Preserves query strings (e.g. ?module=Organization%20Documents or ?tab=documents).
 */
function SmartRouteResolver() {
  const location = useLocation();
  const path = location.pathname;
  const search = location.search;
  const { isAuthenticated, user, isSuperAdmin } = useAuth();

  if (!isAuthenticated) {
    // The member panel is the platform's front door: a signed-out visitor at
    // "/" (or any un-prefixed path) gets the member sign-in, not the admin
    // portal. Admins reach theirs explicitly at /login or /login/admin, and an
    // /admin/* deep link still lands on the admin sign-in.
    const target = path.startsWith("/admin") ? "/login" : "/member/login";
    return <Navigate to={target} state={{ from: location }} replace />;
  }

  // Inspect user object AND localStorage fallback to prevent transient role loss during route transitions
  let role = String(user?.primaryRoleKey || user?.role || user?.userRole || "").toUpperCase();
  if (!role || role === "UNDEFINED" || role === "NULL") {
    try {
      const stored = JSON.parse(localStorage.getItem("jinanam_user") || "{}");
      role = String(stored.primaryRoleKey || stored.role || "").toUpperCase();
    } catch {}
  }

  const isOrgAdmin =
    isSuperAdmin ||
    role.includes("ADMIN") ||
    role.includes("SUPER") ||
    role.includes("TEMPLE") ||
    role.includes("DHARAMSHALA") ||
    role.includes("MONK") ||
    role.includes("CENTER") ||
    role === "TEMPLE_ADMIN" ||
    role === "DHARAMSHALA_ADMIN" ||
    role === "JC_ADMIN" ||
    role === "MONK_ADMIN";

  // A /member/* URL is never an admin URL. Without this the resolver rewrote
  // /member/anything to /admin/member/anything for admin sessions, which is how
  // member tabs ended up in the admin panel.
  if (path.startsWith("/member")) {
    return <Navigate to="/member/home" replace />;
  }

  if (isOrgAdmin) {
    // "/" belongs to the member panel now; an admin who wants their dashboard
    // goes to /admin explicitly. Only the admin-specific aliases redirect.
    if (path === "/a-dashboard" || path === "/sa-dashboard") {
      return <Navigate to="/admin/a-dashboard" replace />;
    }
    if (path === "/" || path === "") {
      return <Navigate to="/member/login" replace />;
    }
    const cleanPath = path.startsWith("/admin") ? path : `/admin${path.startsWith("/") ? path : `/${path}`}`;
    return <Navigate to={`${cleanPath}${search}`} replace />;
  }

  // Member user
  if (path === "/" || path === "") {
    return <Navigate to="/member/home" replace />;
  }
  const cleanMemberPath = path.startsWith("/member") ? path : `/member${path.startsWith("/") ? path : `/${path}`}`;
  return <Navigate to={`${cleanMemberPath}${search}`} replace />;
}

/** Shown for the moment a route's chunk is in flight. */
function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <MemberAuthProvider>
          <VisibilityEngineProvider>
            {/* Pages are code-split (see the lazy() imports above), so each
                route downloads only its own chunk instead of shipping all 60+
                screens in the first bundle. */}
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public Auth Routes.
                  MemberLoginPage was imported but never routed, so /member/login
                  fell through to the protected /member parent and bounced every
                  signed-out member to the ADMIN login. It needs its own public
                  route, declared before the /member tree. */}
              <Route path="/login/admin" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/member/login" element={<MemberLoginPage />} />
              <Route path="/member/register" element={<MemberRegisterPage />} />
              <Route path="/register" element={<MemberRegisterPage />} />

              {/* Admin Panel Root (/admin/*) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["SUPER_ADMIN", "TEMPLE_ADMIN", "DHARAMSHALA_ADMIN", "JC_ADMIN", "MONK_ADMIN"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/a-dashboard" replace />} />
                <Route path="sa-dashboard" element={<DashboardPage />} />
                <Route path="a-dashboard" element={<DashboardPage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="jain-members" element={<MembersPage />} />
                <Route path="non-jain-members" element={<MembersPage />} />
                <Route path="family" element={<FamilyPage />} />
                <Route path="family-management" element={<FamilyPage />} />
                <Route path="member-requests" element={<MembersPage />} />
                <Route path="member-verification" element={<MembersPage />} />
                <Route path="family-groups" element={<FamilyPage />} />
                <Route path="import-members" element={<MembersPage />} />
                <Route path="export-members" element={<MembersPage />} />
                <Route path="volunteers" element={<VolunteersPage />} />
                <Route path="volunteer-management" element={<VolunteersPage />} />
                <Route path="volunteer-registration" element={<VolunteersPage />} />
                <Route path="volunteer-assignment" element={<VolunteersPage />} />
                <Route path="volunteer-attendance" element={<VolunteersPage />} />
                <Route path="volunteer-reports" element={<VolunteersPage />} />
                <Route path="ms-profiles" element={<MonksPage />} />
                <Route path="ms/:id" element={<MonkDetailPage />} />
                <Route path="guru-hierarchy" element={<MonksPage />} />
                <Route path="ms-groups" element={<MonksPage />} />
                <Route path="ms-associations" element={<MonksPage />} />
                <Route path="current-route" element={<TrackingPage />} />
                <Route path="route-planning" element={<TrackingPage />} />
                <Route path="journey-history" element={<TrackingPage />} />
                <Route path="chaturmas" element={<MonksPage />} />
                <Route path="tapasya" element={<MonksPage />} />
                <Route path="timeline" element={<MonksPage />} />
                <Route path="followers" element={<MonksPage />} />
                <Route path="staff-management" element={<StaffPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="staff-registration" element={<StaffPage />} />
                <Route path="staff-qr-cards" element={<StaffPage />} />
                <Route path="attendance" element={<StaffPage />} />
                <Route path="leave-management" element={<StaffPage />} />
                <Route path="documents" element={<StaffPage />} />
                <Route path="working-hours" element={<StaffPage />} />
                <Route path="committee-members" element={<CommitteePage />} />
                <Route path="designations" element={<CommitteePage />} />
                <Route path="contact-directory" element={<CommitteePage />} />
                <Route path="temple-management" element={<OrgListPage defaultType="TEMPLE" />} />
                <Route path="temple-management/:id" element={<OrgDetailPage />} />
                <Route path="temples" element={<OrgListPage defaultType="TEMPLE" />} />
                <Route path="temples/:id" element={<OrgDetailPage />} />
                <Route path="temple-information" element={<OrgListPage defaultType="TEMPLE" />} />
                <Route path="facilities" element={<OrgListPage defaultType="TEMPLE" />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="temple-committee" element={<OrgListPage defaultType="TEMPLE" />} />
                <Route path="notices" element={<AnnouncementsPage />} />
                <Route path="reviews" element={<OrgListPage defaultType="TEMPLE" />} />
                <Route path="dhaja" element={<OrgListPage defaultType="TEMPLE" />} />
                <Route path="social-links" element={<OrgListPage defaultType="TEMPLE" />} />
                <Route path="jain-center-management" element={<OrgListPage defaultType="JAIN_CENTER" />} />
                <Route path="jain-center-management/:id" element={<OrgDetailPage />} />
                <Route path="jain-centers" element={<OrgListPage defaultType="JAIN_CENTER" />} />
                <Route path="jain-centers/:id" element={<OrgDetailPage />} />
                <Route path="jain-centres/:id" element={<OrgDetailPage />} />
                <Route path="centre-information" element={<OrgListPage defaultType="JAIN_CENTER" />} />
                <Route path="dharamshala-management" element={<OrgListPage defaultType="DHARAMSHALA" />} />
                <Route path="dharamshala-management/:id" element={<OrgDetailPage />} />
                <Route path="dharamshalas" element={<OrgListPage defaultType="DHARAMSHALA" />} />
                <Route path="dharamshalas/:id" element={<OrgDetailPage />} />
                <Route path="sthanak-management" element={<SthanaksPage />} />
                <Route path="sthanak-management/:id" element={<OrgDetailPage />} />
                <Route path="stanaks" element={<SthanaksPage />} />
                <Route path="stanaks/:id" element={<OrgDetailPage />} />
                <Route path="sthanaks/:id" element={<OrgDetailPage />} />
                <Route path="orgs/:id" element={<OrgDetailPage />} />
                <Route path="org/:id" element={<OrgDetailPage />} />
                <Route path="buildings" element={<OrgListPage defaultType="DHARAMSHALA" />} />
                <Route path="floors" element={<OrgListPage defaultType="DHARAMSHALA" />} />
                <Route path="rooms" element={<OrgListPage defaultType="DHARAMSHALA" />} />
                <Route path="room-categories" element={<OrgListPage defaultType="DHARAMSHALA" />} />
                <Route path="amenities" element={<OrgListPage defaultType="DHARAMSHALA" />} />
                <Route path="pricing" element={<OrgListPage defaultType="DHARAMSHALA" />} />
                <Route path="rules" element={<OrgListPage defaultType="DHARAMSHALA" />} />
                <Route path="bhojanshala-management" element={<OrgListPage defaultType="BHOJANSHALA" />} />
                <Route path="timings" element={<OrgListPage defaultType="BHOJANSHALA" />} />
                <Route path="menu" element={<OrgListPage defaultType="BHOJANSHALA" />} />
                <Route path="pass-management" element={<PassManagementPage />} />
                <Route path="sthanak-management" element={<SthanaksPage />} />
                <Route path="stanaks" element={<SthanaksPage />} />
                <Route path="my-page" element={<CommunityPagesPage />} />
                <Route path="community-pages" element={<CommunityPagesPage />} />
                <Route path="page-information" element={<CommunityPagesPage />} />
                <Route path="seo-sharing" element={<CommunityPagesPage />} />
                <Route path="feed-management" element={<FeedPage />} />
                <Route path="feed" element={<FeedPage />} />
                <Route path="create-post" element={<FeedPage />} />
                <Route path="scheduled-posts" element={<FeedPage />} />
                <Route path="featured-posts" element={<FeedPage />} />
                <Route path="reported-posts" element={<FeedPage />} />
                <Route path="feed-analytics" element={<FeedPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="event-categories" element={<EventsPage />} />
                <Route path="event-management" element={<EventsPage />} />
                <Route path="event-schedule" element={<EventsPage />} />
                <Route path="registrations" element={<EventsPage />} />
                <Route path="attendees" element={<EventsPage />} />
                <Route path="seating-layout" element={<EventsPage />} />
                <Route path="ticket-categories" element={<EventsPage />} />
                <Route path="coupons" element={<EventsPage />} />
                <Route path="qr-check-in" element={<EventsPage />} />
                <Route path="check-in-reports" element={<EventsPage />} />
                <Route path="event-analytics" element={<EventsPage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="news-management" element={<NewsPage />} />
                <Route path="news-categories" element={<NewsPage />} />
                <Route path="featured-news" element={<NewsPage />} />
                <Route path="scheduled-news" element={<NewsPage />} />
                <Route path="archived-news" element={<NewsPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="announcement-management" element={<AnnouncementsPage />} />
                <Route path="priority-announcements" element={<AnnouncementsPage />} />
                <Route path="scheduled-announcements" element={<AnnouncementsPage />} />
                <Route path="polls" element={<PollsPage />} />
                <Route path="poll-management" element={<PollsPage />} />
                <Route path="responses" element={<PollsPage />} />
                <Route path="poll-results" element={<PollsPage />} />
                <Route path="tours" element={<ToursPage />} />
                <Route path="tour-management" element={<ToursPage />} />
                <Route path="tour-schedule" element={<ToursPage />} />
                <Route path="participants" element={<ToursPage />} />
                <Route path="99-management" element={<ToursPage />} />
                <Route path="99-categories" element={<ToursPage />} />
                <Route path="completion-reports" element={<ToursPage />} />
                <Route path="counters" element={<CountersPage />} />
                <Route path="spiritual-counter" element={<CountersPage />} />
                <Route path="counter-categories" element={<CountersPage />} />
                <Route path="member-statistics" element={<CountersPage />} />
                <Route path="daily-tithi" element={<CalendarPage />} />
                <Route path="choghadiya" element={<CalendarPage />} />
                <Route path="festival-list" element={<CalendarPage />} />
                <Route path="calendar-types" element={<CalendarPage />} />
                <Route path="calendar-correction" element={<CalendarPage />} />
                <Route path="donations" element={<DonationsPage />} />
                <Route path="donation-transactions" element={<DonationsPage />} />
                <Route path="counter-donations" element={<DonationsPage />} />
                <Route path="jinanam-donations" element={<DonationsPage />} />
                <Route path="donation-categories" element={<DonationsPage />} />
                <Route path="receipts" element={<ReceiptsPage />} />
                <Route path="verification-queue" element={<DonationsPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="dharamshala-bookings" element={<BookingsPage />} />
                <Route path="hall-bookings" element={<BookingsPage />} />
                <Route path="bhojanshala-passes" element={<PassManagementPage />} />
                <Route path="pooja-bookings" element={<BookingsPage />} />
                <Route path="calendar" element={<BookingsPage />} />
                <Route path="ads" element={<AdsPage />} />
                <Route path="ad-banners" element={<AdsPage />} />
                <Route path="in-feed-ads" element={<AdsPage />} />
                <Route path="ad-analytics" element={<AdsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="push-notifications" element={<NotificationsPage />} />
                <Route path="in-app-notifications" element={<NotificationsPage />} />
                <Route path="temporary-notifications" element={<NotificationsPage />} />
                <Route path="whatsapp-alerts" element={<NotificationsPage />} />
                <Route path="notifications/preferences" element={<NotificationPreferencesPage />} />
                <Route path="notification-preferences" element={<NotificationPreferencesPage />} />
                <Route path="tracking" element={<TrackingPage />} />
                <Route path="live-tracking-map" element={<TrackingPage />} />
                <Route path="monk-tracking-list" element={<TrackingPage />} />
                <Route path="manual-route-entry" element={<TrackingPage />} />
                <Route path="sos-alerts" element={<AlertsPage />} />
                <Route path="offline-alerts" element={<AlertsPage />} />
                <Route path="devices" element={<DevicesPage />} />
                <Route path="system-health" element={<DevicesPage />} />
                <Route path="support-tickets" element={<SupportTicketsPage />} />
                <Route path="general-inquiries" element={<SupportTicketsPage />} />
                <Route path="complaints" element={<SupportTicketsPage />} />
                <Route path="faqs" element={<SupportTicketsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="analytics-dashboard" element={<ReportsPage />} />
                <Route path="tracking-reports" element={<ReportsPage />} />
                <Route path="financial-reports" element={<ReportsPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="users-roles" element={<SettingsPage />} />
                <Route path="system-settings" element={<SettingsPage />} />
                <Route path="feature-flags" element={<SettingsPage />} />
                <Route path="master-data" element={<MasterDataPage />} />
                <Route path="subscription-plans" element={<SubscriptionPlansPage />} />
                <Route path="account-status" element={<AccountStatusPage />} />
                <Route path="roles-permissions" element={<RolesPermissionsPage />} />
                <Route path="admins" element={<AdminsPage />} />
                <Route path="coming-soon" element={<ComingSoonPage />} />
                <Route path="*" element={<Navigate to="/admin/a-dashboard" replace />} />
              </Route>

              {/* Direct Un-prefixed Admin Route Forwarders */}
              <Route path="/admins" element={<Navigate to="/admin/admins" replace />} />
              <Route path="/temples" element={<Navigate to="/admin/temples" replace />} />
              <Route path="/jain-centers" element={<Navigate to="/admin/jain-centers" replace />} />
              <Route path="/dharamshalas" element={<Navigate to="/admin/dharamshalas" replace />} />
              <Route path="/stanaks" element={<Navigate to="/admin/stanaks" replace />} />
              <Route path="/sthanaks" element={<Navigate to="/admin/sthanaks" replace />} />
              <Route path="/volunteers" element={<Navigate to="/admin/volunteers" replace />} />
              <Route path="/members" element={<Navigate to="/admin/members" replace />} />
              <Route path="/staff" element={<Navigate to="/admin/staff" replace />} />
              <Route path="/monks" element={<Navigate to="/admin/ms-profiles" replace />} />
              <Route path="/donations" element={<Navigate to="/admin/donations" replace />} />
              <Route path="/events" element={<Navigate to="/admin/events" replace />} />

              {/* Member Panel Root */}
              {/* Guarded by the MEMBER session, not the admin one — an admin
                  login no longer unlocks these screens. */}
              <Route
                path="/member"
                element={
                  <MemberProtectedRoute>
                    <MemberLayout />
                  </MemberProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/member/home" replace />} />
                <Route path="home" element={<MemberHomePage />} />
                <Route path="feed" element={<MemberFeedPage />} />
                <Route path="offers" element={<MemberOffersPage />} />
                <Route path="explore" element={<MemberExplorePage />} />
                <Route path="spiritual" element={<MemberSpiritualPage />} />
                <Route path="profile" element={<MemberProfilePage />} />
                <Route path="news" element={<MemberNewsPage />} />
                <Route path="ms" element={<MemberMSListPage />} />
                <Route path="ms/:id" element={<MemberMSDetailPage />} />
                <Route path="temples" element={<MemberTempleListPage />} />
                <Route path="temples/:id" element={<MemberTempleDetailPage />} />
                <Route path="temples/:id/gallery" element={<MemberGalleryPage />} />
                <Route path="temples/:id/book" element={<MemberBookingPage />} />
                <Route path="support" element={<MemberSupportPage />} />
                <Route path="tours" element={<MemberToursPage />} />
                <Route path="volunteers" element={<MemberVolunteersPage />} />
                <Route path="announcements" element={<MemberAnnouncementsPage />} />
                <Route path="community-pages" element={<MemberCommunityPagesPage />} />
                <Route path="community-pages/:id" element={<MemberCommunityPageDetailPage />} />
                <Route path="digital-id" element={<MemberDigitalIdPage />} />
                <Route path="wallet" element={<MemberWalletPage />} />
                <Route path="notifications" element={<MemberNotificationsPage />} />
                <Route path="bookings" element={<MyBookingsPage />} />
                <Route path="bookings/:uid" element={<BookingDetailPage />} />
                <Route path="donations" element={<MemberDonationsPage />} />
                <Route path="visits" element={<MemberVisitsPage />} />
                <Route path="events" element={<MemberEventsPage />} />
                <Route path="tickets" element={<MyTicketsPage />} />
                {/* Member-scoped catch-all. Without it an unknown /member/* URL
                    fell through to SmartRouteResolver, which prefixes /admin for
                    admin sessions — that is how member tabs landed in the admin
                    panel. Nothing under /member may leave /member. */}
                <Route path="*" element={<Navigate to="/member/home" replace />} />
              </Route>

              {/* Smart Catch-All Resolver for root "/" or any un-prefixed or mismatched URL */}
              <Route path="*" element={<SmartRouteResolver />} />
            </Routes>
            </Suspense>
            {/* One app-level Toaster. It used to live only in the two layouts,
                so the public member login/register pages — which sit outside
                both — silently swallowed every toast, making the Login button
                look dead when validation failed. */}
            <Toaster position="top-right" richColors />
          </VisibilityEngineProvider>
          </MemberAuthProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
