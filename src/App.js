import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import LoginPage from "@/pages/LoginPage";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import MembersPage from "@/pages/MembersPage";
import FamilyPage from "@/pages/FamilyPage";
import MonksPage from "@/pages/MonksPage";
import MonkDetailPage from "@/pages/MonkDetailPage";
import OrgListPage from "@/pages/OrgListPage";
import OrgDetailPage from "@/pages/OrgDetailPage";
import StaffPage from "@/pages/StaffPage";
import VisitorsPage from "@/pages/VisitorsPage";
import BookingsPage from "@/pages/BookingsPage";
import DonationsPage from "@/pages/DonationsPage";
import EventsPage from "@/pages/EventsPage";
import ToursPage from "@/pages/ToursPage";
import FeedPage from "@/pages/FeedPage";
import OffersPage from "@/pages/OffersPage";
import AdsPage from "@/pages/AdsPage";
import NewsPage from "@/pages/NewsPage";
import CommunityPagesPage from "@/pages/CommunityPagesPage";
import PollsPage from "@/pages/PollsPage";
import CalendarPage from "@/pages/CalendarPage";
import CountersPage from "@/pages/CountersPage";
import TrackingPage from "@/pages/TrackingPage";
import DevicesPage from "@/pages/DevicesPage";
import AlertsPage from "@/pages/AlertsPage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import GalleryPage from "@/pages/GalleryPage";
import VolunteersPage from "@/pages/VolunteersPage";
import SupportTicketsPage from "@/pages/SupportTicketsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotificationPreferencesPage from "@/pages/NotificationPreferencesPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import AuditLogsPage from "@/pages/AuditLogsPage";
import MasterDataPage from "@/pages/MasterDataPage";
import BulkImportPage from "@/pages/BulkImportPage";
import TourJatraPage from "@/pages/TourJatraPage";
import NonJainMembersPage from "@/pages/NonJainMembersPage";
import StanaksPage from "@/pages/StanaksPage";
import ChaturmasPage from "@/pages/ChaturmasPage";
import ReceiptsPage from "@/pages/ReceiptsPage";
import MSTrackingPage from "@/pages/MSTrackingPage";
import ManualTrackingPage from "@/pages/ManualTrackingPage";
import JourneyLogsPage from "@/pages/JourneyLogsPage";
import RoutesPage from "@/pages/RoutesPage";
import LiveMapPage from "@/pages/LiveMapPage";
import FaqPage from "@/pages/FaqPage";
import BannersPage from "@/pages/BannersPage";
import HomeSectionsPage from "@/pages/HomeSectionsPage";
import FeedbackPage from "@/pages/FeedbackPage";
import IncorrectReportsPage from "@/pages/IncorrectReportsPage";
import SubscriptionPlansPage from "@/pages/SubscriptionPlansPage";
import AdminsPage from "@/pages/AdminsPage";
import MemberReportsPage from "@/pages/MemberReportsPage";
import DonationReportsPage from "@/pages/DonationReportsPage";
import EventsReportsPage from "@/pages/EventsReportsPage";
import FeedAnalyticsPage from "@/pages/FeedAnalyticsPage";
import AppUsagePage from "@/pages/AppUsagePage";
import BookingCalendarPage from "@/pages/BookingCalendarPage";
import SADashboardPage from "@/pages/SADashboardPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import SiteComingSoonPage from "@/pages/SiteComingSoonPage";

/* The public site and the admin panel are two separate router trees.
   The admin tree is mounted with basename="/admin", so every absolute
   path inside it — nav.config.js, navigate("/members"), ROUTE_TONES
   keyed on location.pathname — keeps working unchanged while the
   browser URL carries the /admin prefix. Moving between the two trees
   is a full page load (<a href>), not a client-side <Link>. */
const isAdminPath =
  typeof window !== "undefined" &&
  (window.location.pathname === "/admin" ||
    window.location.pathname.startsWith("/admin/"));

function PublicApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SiteComingSoonPage />} />
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function AdminApp() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* ─── Dashboards & Shared ──────────────────────────────── */}
            <Route index element={<DashboardPage />} />
            <Route path="sa-dashboard" element={<SADashboardPage />} />
            <Route path="coming-soon" element={<ComingSoonPage />} />

            {/* ─── People: Members ────────────────────────────────── */}
            <Route path="members" element={<MembersPage />} />
            <Route path="members/bulk-import" element={<BulkImportPage />} />
            <Route path="non-jain-members" element={<NonJainMembersPage />} />
            <Route path="family" element={<FamilyPage />} />
            <Route path="people/member-requests" element={<ComingSoonPage moduleName="Member Requests" />} />
            <Route path="people/member-verification" element={<ComingSoonPage moduleName="Member Verification" />} />
            <Route path="people/family-groups" element={<ComingSoonPage moduleName="Family Groups" />} />
            <Route path="people/export-members" element={<ComingSoonPage moduleName="Export Members" />} />

            {/* ─── People: Volunteers ─────────────────────────────── */}
            <Route path="volunteers" element={<VolunteersPage />} />
            <Route path="people/volunteer-registration" element={<ComingSoonPage moduleName="Volunteer Registration" />} />
            <Route path="people/volunteer-assignment" element={<ComingSoonPage moduleName="Volunteer Assignment" />} />
            <Route path="people/volunteer-attendance" element={<ComingSoonPage moduleName="Volunteer Attendance" />} />
            <Route path="people/volunteer-reports" element={<ComingSoonPage moduleName="Volunteer Reports" />} />

            {/* ─── People: MS Management ──────────────────────────── */}
            <Route path="monks" element={<MonksPage />} />
            <Route path="monks/:id" element={<MonkDetailPage />} />
            <Route path="ms/guru-hierarchy" element={<ComingSoonPage moduleName="Guru Hierarchy" />} />
            <Route path="ms/groups" element={<ComingSoonPage moduleName="MS Groups" />} />
            <Route path="ms/ms-associations" element={<ComingSoonPage moduleName="MS Associations" />} />
            <Route path="ms/route-planning" element={<ComingSoonPage moduleName="Route Planning" />} />

            {/* ─── People: Staff ──────────────────────────────────── */}
            <Route path="staff" element={<StaffPage />} />

            {/* ─── People: Committee ──────────────────────────────── */}
            <Route path="people/committee" element={<ComingSoonPage moduleName="Committee" />} />
            <Route path="people/committee/members" element={<ComingSoonPage moduleName="Committee Members" />} />
            <Route path="people/committee/designations" element={<ComingSoonPage moduleName="Committee Designations" />} />
            <Route path="people/committee/directory" element={<ComingSoonPage moduleName="Contact Directory" />} />

            {/* ─── Organizations ──────────────────────────────────── */}
            <Route
              path="temples"
              element={
                <OrgListPage
                  endpoint="/temples"
                  entity="temple"
                  label="Temple"
                  pluralLabel="Temples"
                  moduleKey="TEMPLES"
                  testId="temples-page"
                />
              }
            />
            <Route
              path="temples/:id"
              element={
                <OrgDetailPage
                  basePath="/temples"
                  entityLabel="Temple"
                  apiPrefix="/temples"
                />
              }
            />
            <Route
              path="dharamshalas"
              element={
                <OrgListPage
                  endpoint="/dharamshalas"
                  entity="dharamshala"
                  label="Dharamshala"
                  pluralLabel="Dharamshalas"
                  moduleKey="DHARAMSHALAS"
                  testId="dharamshalas-page"
                />
              }
            />
            <Route
              path="dharamshalas/:id"
              element={
                <OrgDetailPage
                  basePath="/dharamshalas"
                  entityLabel="Dharamshala"
                  apiPrefix="/dharamshalas"
                />
              }
            />
            <Route
              path="jain-centers"
              element={
                <OrgListPage
                  endpoint="/jain-centers"
                  entity="jain-center"
                  label="Jain Centre"
                  pluralLabel="Jain Centres"
                  moduleKey="JAIN_CENTERS"
                  testId="jain-centers-page"
                />
              }
            />
            <Route
              path="jain-centers/:id"
              element={
                <OrgDetailPage
                  basePath="/jain-centers"
                  entityLabel="Jain Centre"
                  apiPrefix="/jain-centers"
                />
              }
            />
            <Route path="stanaks" element={<StanaksPage />} />
            <Route path="bhojanshala" element={<ComingSoonPage moduleName="Bhojanshala Management" />} />
            <Route path="community-pages" element={<CommunityPagesPage />} />

            {/* ─── Community ──────────────────────────────────────── */}
            <Route path="feed" element={<FeedPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="polls" element={<PollsPage />} />
            <Route path="tours" element={<ToursPage />} />
            <Route path="tour-jatra" element={<TourJatraPage />} />
            <Route path="tours/:tourId/participants/:participantId" element={<TourJatraPage />} />
            <Route path="chaturmas" element={<ChaturmasPage />} />
            <Route path="counters" element={<CountersPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="notifications/preferences" element={<NotificationPreferencesPage />} />
            <Route path="varshitap" element={<ComingSoonPage moduleName="Varshitap Management" />} />

            {/* ─── Bookings ───────────────────────────────────────── */}
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="booking-calendar" element={<BookingCalendarPage />} />

            {/* ─── Finance ────────────────────────────────────────── */}
            <Route path="donations" element={<DonationsPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="ads" element={<AdsPage />} />
            <Route path="sponsors" element={<ComingSoonPage moduleName="Sponsors" />} />
            <Route path="finance/partner-businesses" element={<ComingSoonPage moduleName="Partner Businesses" />} />

            {/* ─── Operations ─────────────────────────────────────── */}
            <Route path="visitors" element={<VisitorsPage />} />
            <Route path="ms-tracking" element={<MSTrackingPage />} />
            <Route path="tracking" element={<TrackingPage />} />
            <Route path="manual-tracking" element={<ManualTrackingPage />} />
            <Route path="journey-logs" element={<JourneyLogsPage />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="live-map" element={<LiveMapPage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="operations/documents" element={<ComingSoonPage moduleName="Document Management" />} />
            <Route path="operations/tasks" element={<ComingSoonPage moduleName="Task Management" />} />
            <Route path="operations/chaturmas-tracking" element={<ComingSoonPage moduleName="Chaturmas Tracking" />} />
            <Route path="attendance" element={<ComingSoonPage moduleName="Attendance" />} />

            {/* ─── Reports & Analytics ────────────────────────────── */}
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/members" element={<MemberReportsPage />} />
            <Route path="reports/donations" element={<DonationReportsPage />} />
            <Route path="reports/events" element={<EventsReportsPage />} />
            <Route path="reports/feed-analytics" element={<FeedAnalyticsPage />} />
            <Route path="reports/app-usage" element={<AppUsagePage />} />

            {/* ─── Support ────────────────────────────────────────── */}
            <Route path="support-tickets" element={<SupportTicketsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="incorrect-reports" element={<IncorrectReportsPage />} />
            <Route path="support/callback-requests" element={<ComingSoonPage moduleName="Callback Requests" />} />
            <Route path="faq" element={<FaqPage />} />

            {/* ─── Settings ───────────────────────────────────────── */}
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/payment-settings" element={<ComingSoonPage moduleName="Payment Settings" />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="master-data" element={<MasterDataPage />} />
            <Route path="subscription-plans" element={<SubscriptionPlansPage />} />

            {/* ─── Content Management (SA) ────────────────────────── */}
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="home-sections" element={<HomeSectionsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function App() {
  return isAdminPath ? <AdminApp /> : <PublicApp />;
}

export default App;
