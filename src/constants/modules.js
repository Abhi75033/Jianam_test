import {
  LayoutDashboard, Users, UsersRound, HandHeart, Landmark, Hotel, Building2,
  Briefcase, ScanLine, CalendarCheck, HeartHandshake, PartyPopper, Ticket,
  Armchair, Route, Newspaper, Tag, Megaphone, ScrollText, BarChart3, Calendar,
  Sigma, MapPin, Smartphone, BellRing, MessagesSquare, Image, HandshakeIcon,
  LifeBuoy, Bell, TrendingUp, Settings, ClipboardList, Search, Database,
  UserX, Church, Home as HomeIcon, HelpCircle,
  LayoutTemplate, MessageSquareWarning,
  CreditCard, CalendarDays,
  PieChart, Activity, GitBranch, Map as MapIcon, Footprints,
  BookOpen, BadgeIndianRupee, Receipt, Flame, AlertTriangle, BarChart2,
  Megaphone as Announce, Globe,
} from "lucide-react";

// Sidebar structure — grouped per client Super Admin spec
export const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, moduleKey: "DASHBOARD", testId: "nav-dashboard" },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/members", label: "Jain Members", icon: Users, moduleKey: "MEMBERS", testId: "nav-members" },
      { to: "/non-jain-members", label: "Non-Jain Members", icon: UserX, moduleKey: "MEMBERS", testId: "nav-non-jain-members" },
      { to: "/monks", label: "MS Management", icon: HandHeart, moduleKey: "MONKS", testId: "nav-monks" },
      { to: "/family", label: "Family", icon: UsersRound, moduleKey: "FAMILY", testId: "nav-family" },
      { to: "/staff", label: "Staff Management", icon: Briefcase, moduleKey: "STAFF", testId: "nav-staff" },
      { to: "/volunteers", label: "Volunteers", icon: HandshakeIcon, moduleKey: "VOLUNTEERS", testId: "nav-volunteers" },
    ],
  },
  {
    label: "Organizations",
    items: [
      { to: "/temples", label: "Temples", icon: Landmark, moduleKey: "TEMPLES", testId: "nav-temples" },
      { to: "/jain-centers", label: "Jain Centres", icon: Building2, moduleKey: "JAIN_CENTERS", testId: "nav-jain-centers" },
      { to: "/stanaks", label: "Sthanaks", icon: HomeIcon, moduleKey: "TEMPLES", testId: "nav-stanaks" },
      { to: "/dharamshalas", label: "Dharamshalas", icon: Hotel, moduleKey: "DHARAMSHALAS", testId: "nav-dharamshalas" },
      { to: "/community-pages", label: "Community Pages", icon: Globe, moduleKey: "COMMUNITY_PAGES", testId: "nav-community-pages" },
    ],
  },
  {
    label: "Activities",
    items: [
      { to: "/events", label: "Events", icon: PartyPopper, moduleKey: "EVENTS", testId: "nav-events" },
      { to: "/tours", label: "Tours (99 Yatra)", icon: Route, moduleKey: "TOURS", testId: "nav-tours" },
      { to: "/chaturmas", label: "Chaturmas", icon: Flame, moduleKey: "EVENTS", testId: "nav-chaturmas" },
      { to: "/feed", label: "Feed Management", icon: Newspaper, moduleKey: "FEED", testId: "nav-feed" },
      { to: "/news", label: "News", icon: ScrollText, moduleKey: "NEWS", testId: "nav-news" },
      { to: "/announcements", label: "Announcements", icon: Announce, moduleKey: "ANNOUNCEMENTS", testId: "nav-announcements" },
      { to: "/polls", label: "Polls", icon: BarChart3, moduleKey: "POLLS", testId: "nav-polls" },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/donations", label: "Donations", icon: HeartHandshake, moduleKey: "DONATIONS", testId: "nav-donations" },
      { to: "/receipts", label: "Receipts", icon: Receipt, moduleKey: "DONATIONS", testId: "nav-receipts" },
      { to: "/offers", label: "Offers", icon: Tag, moduleKey: "OFFERS", testId: "nav-offers" },
      { to: "/ads", label: "Advertisements", icon: Megaphone, moduleKey: "ADS", testId: "nav-ads" },
    ],
  },
  {
    label: "Bookings",
    items: [
      { to: "/bookings", label: "Booking Requests", icon: CalendarCheck, moduleKey: "BOOKINGS", testId: "nav-bookings" },
      { to: "/visitors", label: "Visitors", icon: ScanLine, moduleKey: "VISITORS", testId: "nav-visitors" },
    ],
  },
  {
    label: "Tracking",
    items: [
      { to: "/ms-tracking", label: "MS Tracking", icon: Activity, moduleKey: "TRACKING", testId: "nav-ms-tracking" },
      { to: "/tracking", label: "GPS Tracking", icon: MapPin, moduleKey: "TRACKING", testId: "nav-tracking" },
      { to: "/manual-tracking", label: "Manual Tracking", icon: Footprints, moduleKey: "TRACKING", testId: "nav-manual-tracking" },
      { to: "/journey-logs", label: "Journey Logs", icon: BookOpen, moduleKey: "TRACKING", testId: "nav-journey-logs" },
      { to: "/routes", label: "Routes", icon: GitBranch, moduleKey: "TRACKING", testId: "nav-routes" },
      { to: "/live-map", label: "Live Map", icon: MapIcon, moduleKey: "TRACKING", testId: "nav-live-map" },
      { to: "/devices", label: "GPS Devices", icon: Smartphone, moduleKey: "DEVICES", testId: "nav-devices" },
      { to: "/alerts", label: "Alerts", icon: BellRing, moduleKey: "ALERTS", testId: "nav-alerts" },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/gallery", label: "Gallery", icon: Image, moduleKey: "GALLERY", testId: "nav-gallery" },
      { to: "/calendar", label: "Tithi Calendar", icon: Calendar, moduleKey: "CALENDAR", testId: "nav-calendar" },
      { to: "/counters", label: "Spiritual Counters", icon: Sigma, moduleKey: "COUNTERS", testId: "nav-counters" },
      { to: "/tickets", label: "Tickets", icon: Ticket, moduleKey: "TICKETS", testId: "nav-tickets" },
      { to: "/seating", label: "Seating", icon: Armchair, moduleKey: "SEATING", testId: "nav-seating" },
      { to: "/faq", label: "FAQ", icon: HelpCircle, superAdminOnly: true, testId: "nav-faq" },
      { to: "/banners", label: "Banners", icon: Image, superAdminOnly: true, testId: "nav-banners" },
      { to: "/home-sections", label: "Home Page Sections", icon: LayoutTemplate, superAdminOnly: true, testId: "nav-home-sections" },
    ],
  },
  {
    label: "Reports & Analytics",
    items: [
      { to: "/reports", label: "All Reports", icon: TrendingUp, moduleKey: "REPORTS", testId: "nav-reports" },
      { to: "/reports/members", label: "Member Reports", icon: Users, moduleKey: "REPORTS", testId: "nav-reports-members" },
      { to: "/reports/donations", label: "Donation Reports", icon: BadgeIndianRupee, moduleKey: "REPORTS", testId: "nav-reports-donations" },
      { to: "/reports/events", label: "Events Reports", icon: PartyPopper, moduleKey: "REPORTS", testId: "nav-reports-events" },
      { to: "/reports/feed-analytics", label: "Feed Analytics", icon: BarChart2, moduleKey: "REPORTS", testId: "nav-reports-feed" },
      { to: "/reports/app-usage", label: "App Usage", icon: PieChart, moduleKey: "REPORTS", testId: "nav-reports-app" },
    ],
  },
  {
    label: "Support",
    items: [
      { to: "/support-tickets", label: "Support Tickets", icon: LifeBuoy, moduleKey: "SUPPORT_TICKETS", testId: "nav-support-tickets" },
      { to: "/feedback", label: "Feedback", icon: MessagesSquare, testId: "nav-feedback" },
      { to: "/incorrect-reports", label: "Incorrect Info Reports", icon: MessageSquareWarning, testId: "nav-incorrect-reports" },
      { to: "/communication", label: "Communication", icon: MessagesSquare, moduleKey: "COMMUNICATION", testId: "nav-communication" },
      { to: "/notifications", label: "Notifications", icon: Bell, testId: "nav-notifications" },
    ],
  },
  {
    label: "Masters & Settings",
    items: [
      { to: "/master-data", label: "Master Data", icon: Database, superAdminOnly: true, testId: "nav-master-data" },
      { to: "/subscription-plans", label: "Subscription Plans", icon: CreditCard, superAdminOnly: true, testId: "nav-subscription-plans" },
      { to: "/settings", label: "System Settings", icon: Settings, superAdminOnly: true, testId: "nav-settings" },
      { to: "/admins", label: "Manage Admins", icon: UsersRound, superAdminOnly: true, testId: "nav-admins" },
      { to: "/audit-logs", label: "Audit Logs", icon: ClipboardList, moduleKey: "AUDIT_LOGS", testId: "nav-audit-logs" },
    ],
  },
];

export const PUBLIC_ID_PREFIXES = {
  TEMPLE: "JFJT",
  MONK: "JFMS",
  DHARAMSHALA: "JFD",
  JAIN_CENTER: "JFJC",
  JAIN_MEMBER: "JFJM",
  NON_JAIN_MEMBER: "JFNJM",
  STAFF: "JFST",
  COMMUNITY_PAGE: "JFCP",
  BOOKING: "JFBK",
  DONATION: "JFDN",
  RECEIPT: "JFRC",
  EVENT: "JFEV",
  TICKET: "JFTK",
  VISITOR: "JFVE",
  TOUR: "JFTR",
  OFFER: "JFOF",
  NEWS: "JFNW",
  SUPPORT_TICKET: "JFSU",
  DEVICE: "JFDV",
};

export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  TEMPLE_ADMIN: "Temple Admin",
  DHARAMSHALA_ADMIN: "Dharamshala Admin",
  JAIN_CENTER_ADMIN: "Jain Center Admin",
  MONK_ADMIN: "Monk Admin",
  STAFF: "Staff",
  SECURITY_GUARD: "Security Guard",
  EVENT_SCANNER: "Event Scanner",
  PAGE_OWNER: "Page Owner",
  MEMBER: "Member",
  NON_JAIN_MEMBER: "Non-Jain Member",
};

export const ALL_MODULES = [
  "MEMBERS", "FAMILY", "MONKS", "TEMPLES", "DHARAMSHALAS", "JAIN_CENTERS",
  "STAFF", "VISITORS", "BOOKINGS", "DONATIONS", "EVENTS", "EVENTS_PAID",
  "TICKETS", "SEATING", "TOURS", "FEED", "OFFERS", "ADS", "NEWS",
  "COMMUNITY_PAGES", "POLLS", "CALENDAR", "COUNTERS", "TRACKING", "DEVICES",
  "ALERTS", "COMMUNICATION", "ANNOUNCEMENTS", "GALLERY", "VOLUNTEERS",
  "SUPPORT_TICKETS", "REPORTS", "SETTINGS", "AUDIT_LOGS", "MASTER_DATA",
  "DASHBOARD",
];

export const ALL_ACTIONS = ["VIEW", "CREATE", "EDIT", "APPROVE", "REJECT", "DELETE"];
