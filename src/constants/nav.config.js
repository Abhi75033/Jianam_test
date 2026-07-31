import {
  LayoutDashboard, Users, UsersRound, HandHeart, Landmark, Hotel, Building2,
  Briefcase, ScanLine, CalendarCheck, HeartHandshake, PartyPopper, Ticket,
  Armchair, Route, Newspaper, Tag, Megaphone, ScrollText, BarChart3, Calendar,
  Sigma, MapPin, Smartphone, BellRing, MessagesSquare, Image, HandshakeIcon,
  LifeBuoy, Bell, TrendingUp, Settings, ClipboardList, Search, Database,
  UserX, Home as HomeIcon, HelpCircle, LayoutTemplate, MessageSquareWarning,
  CreditCard, CalendarDays, PieChart, Activity, GitBranch, Map as MapIcon,
  Footprints, BookOpen, BadgeIndianRupee, Receipt, Flame, AlertTriangle,
  BarChart2, Globe, ShieldAlert, CheckSquare, PhoneCall, Wallet, FileText
} from "lucide-react";

export const NAV_LAYOUT = "nested"; // "flat" | "nested"

export const ROUTE_TONES = {
  "/": "yellow",
  "/search": "blue",
  "/members": "blue",
  "/family": "purple",
  "/monks": "orange",
  "/community-pages": "pink",
  "/temples": "orange",
  "/dharamshalas": "green",
  "/jain-centers": "purple",
  "/staff": "teal",
  "/visitors": "blue",
  "/bookings": "green",
  "/donations": "orange",
  "/events": "purple",
  "/tickets": "pink",
  "/seating": "teal",
  "/tours": "orange",
  "/feed": "blue",
  "/offers": "green",
  "/ads": "purple",
  "/news": "orange",
  "/polls": "teal",
  "/calendar": "purple",
  "/counters": "orange",
  "/gallery": "pink",
  "/announcements": "red",
  "/tracking": "blue",
  "/devices": "teal",
  "/alerts": "red",
  "/communication": "blue",
  "/volunteers": "green",
  "/support-tickets": "orange",
  "/notifications": "purple",
  "/reports": "green",
  "/settings": "orange",
  "/audit-logs": "purple",
  "/master-data": "teal",
};

export const TONE_HEX = {
  yellow: "#FACC15",
  green: "#10B981",
  orange: "#F59E0B",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  red: "#EF4444",
  teal: "#14B8A6",
  pink: "#EC4899",
};

// --- FLAT STRUCTURE (Option 1) ---
export const FLAT_NAV = [
  { id: "sep-overview", isSeparator: true, label: "Overview" },
  { id: "sa-dashboard", label: "SA Dashboard", icon: LayoutDashboard, route: "/sa-dashboard", roles: ["SUPER_ADMIN"] },
  { id: "a-dashboard", label: "A Dashboard", icon: LayoutDashboard, route: "/", roles: ["TEMPLE_ADMIN", "DHARAMSHALA_ADMIN", "JAIN_CENTER_ADMIN", "MONK_ADMIN"] },

  { id: "sep-orgs", isSeparator: true, label: "Organizations" },
  { id: "flat-temples", label: "Temple", icon: Landmark, route: "/temples" },
  { id: "flat-jain-centers", label: "Jain Centre", icon: Building2, route: "/jain-centers" },
  { id: "flat-dharamshalas", label: "Dharamshala", icon: Hotel, route: "/dharamshalas" },
  { id: "flat-bhojanshala", label: "Bhojanshala", icon: Sigma, route: "/coming-soon?module=Bhojanshala", featureFlag: true },
  { id: "flat-stanaks", label: "Sthanaks", icon: HomeIcon, route: "/stanaks" },
  { id: "flat-community-pages", label: "Community Pages", icon: Globe, route: "/community-pages" },

  { id: "sep-people", isSeparator: true, label: "People" },
  { id: "flat-jain-members", label: "Jain Members", icon: Users, route: "/members" },
  { id: "flat-non-jain-members", label: "Non-Jain Members", icon: UserX, route: "/non-jain-members" },
  { id: "flat-ms", label: "MS Management", icon: HandHeart, route: "/monks" },
  { id: "flat-family", label: "Family", icon: UsersRound, route: "/family" },
  { id: "flat-staff", label: "Staff Management", icon: Briefcase, route: "/staff" },
  { id: "flat-volunteers", label: "Volunteers", icon: HandshakeIcon, route: "/volunteers" },

  { id: "sep-comm", isSeparator: true, label: "Communication" },
  { id: "flat-feed", label: "Feed", icon: Newspaper, route: "/feed" },
  { id: "flat-events", label: "Events", icon: PartyPopper, route: "/events" },
  { id: "flat-announcements", label: "Announcements", icon: Megaphone, route: "/announcements" },
  { id: "flat-news", label: "News", icon: ScrollText, route: "/news" },
  { id: "flat-polls", label: "Polls", icon: BarChart3, route: "/polls" },
  { id: "flat-notifications", label: "Notifications", icon: Bell, route: "/notifications" },
  { id: "flat-tours", label: "Tours", icon: Route, route: "/tours" },
  { id: "flat-99-management", label: "99 Management", icon: GitBranch, route: "/coming-soon?module=99 Management", featureFlag: true },
  { id: "flat-varshitap", label: "Varshitap Management", icon: Flame, route: "/coming-soon?module=Varshitap Management", featureFlag: true },

  { id: "sep-bookings", isSeparator: true, label: "Bookings" },
  { id: "flat-booking-setup", label: "Booking Setup", icon: CalendarCheck, route: "/coming-soon?module=Booking Setup", featureFlag: true },
  { id: "flat-booking-categories", label: "Categories", icon: ClipboardList, route: "/coming-soon?module=Booking Categories", featureFlag: true },
  { id: "flat-booking-requests", label: "Requests", icon: CalendarCheck, route: "/bookings?tab=admin_bookings" },
  { id: "flat-booking-reservations", label: "Reservations", icon: CalendarCheck, route: "/bookings?tab=reservations" },
  { id: "flat-booking-calendar", label: "Calendar", icon: Calendar, route: "/booking-calendar" },

  { id: "sep-operations", isSeparator: true, label: "Operations" },
  { id: "flat-visitors", label: "Visitors", icon: ScanLine, route: "/visitors" },
  { id: "flat-gps", label: "GPS", icon: MapPin, route: "/tracking" },
  { id: "flat-routes", label: "Routes", icon: GitBranch, route: "/routes" },
  { id: "flat-journey-logs", label: "Journey Logs", icon: BookOpen, route: "/journey-logs" },
  { id: "flat-live-map", label: "Live Map", icon: MapIcon, route: "/live-map" },
  { id: "flat-attendance", label: "Attendance", icon: CheckSquare, route: "/staff?tab=attendance", featureFlag: true },

  { id: "sep-finance", isSeparator: true, label: "Finance" },
  { id: "flat-donations", label: "Donations", icon: HeartHandshake, route: "/donations" },
  { id: "flat-receipts", label: "Receipts", icon: Receipt, route: "/receipts" },
  { id: "flat-sponsors", label: "Sponsors", icon: Wallet, route: "/coming-soon?module=Sponsors", featureFlag: true },
  { id: "flat-offers", label: "Offers", icon: Tag, route: "/offers" },
  { id: "flat-ads", label: "Advertisements", icon: Megaphone, route: "/ads" },

  { id: "sep-admin-mgt", isSeparator: true, label: "Admin Management" },
  { id: "flat-admin-users", label: "Admin Users", icon: UsersRound, route: "/admins", roles: ["SUPER_ADMIN"] },
  { id: "flat-subscription-plans", label: "Subscription Plans", icon: CreditCard, route: "/subscription-plans", roles: ["SUPER_ADMIN"] },
  { id: "flat-roles-permissions", label: "Roles & Permission Assignment", icon: Settings, route: "/roles-permissions", roles: ["SUPER_ADMIN"] },
  { id: "flat-login-history", label: "Login History", icon: ClipboardList, route: "/login-history", roles: ["SUPER_ADMIN"] },
  { id: "flat-account-status", label: "Account Status", icon: ShieldAlert, route: "/account-status", roles: ["SUPER_ADMIN"] },

  { id: "flat-reports", label: "Reports", icon: TrendingUp, route: "/reports" },
  { id: "flat-support", label: "Support", icon: LifeBuoy, route: "/support-tickets" },
  { id: "flat-activity-logs", label: "Activity Logs", icon: ClipboardList, route: "/audit-logs", roles: ["SUPER_ADMIN"] },
  { id: "flat-settings", label: "Settings", icon: Settings, route: "/settings" }
];

// --- NESTED STRUCTURE (Option 2) ---
export const NESTED_NAV = [
  { id: "sa-dashboard", label: "SA Dashboard", icon: LayoutDashboard, route: "/sa-dashboard", roles: ["SUPER_ADMIN"] },
  { id: "a-dashboard", label: "A Dashboard", icon: LayoutDashboard, route: "/", roles: ["TEMPLE_ADMIN", "DHARAMSHALA_ADMIN", "JAIN_CENTER_ADMIN", "MONK_ADMIN"] },

  {
    id: "group-people",
    label: "People",
    icon: Users,
    children: [
      {
        id: "folder-members",
        label: "Members",
        icon: Users,
        children: [
          { id: "m-jain", label: "Jain Members", route: "/members" },
          { id: "m-non-jain", label: "Non-Jain Members", route: "/non-jain-members" },
          { id: "m-family", label: "Family Management", route: "/family" },
          { id: "m-requests", label: "Member Requests", route: "/coming-soon?module=Member Requests", featureFlag: true },
          { id: "m-verify", label: "Member Verification", route: "/coming-soon?module=Member Verification", featureFlag: true },
          { id: "m-groups", label: "Family Groups", route: "/coming-soon?module=Family Groups", featureFlag: true },
          { id: "m-import", label: "Import Members", route: "/members/bulk-import" },
          { id: "m-export", label: "Export Members", route: "/members?export=true" }
        ]
      },
      {
        id: "folder-volunteers",
        label: "Volunteers",
        icon: HandshakeIcon,
        children: [
          { id: "v-mgt", label: "Volunteer Management", route: "/volunteers" },
          { id: "v-reg", label: "Volunteer Registration", route: "/coming-soon?module=Volunteer Registration", featureFlag: true },
          { id: "v-assign", label: "Volunteer Assignment", route: "/coming-soon?module=Volunteer Assignment", featureFlag: true },
          { id: "v-att", label: "Volunteer Attendance", route: "/coming-soon?module=Volunteer Attendance", featureFlag: true },
          { id: "v-rep", label: "Volunteer Reports", route: "/reports?tab=volunteers" }
        ]
      },
      {
        id: "folder-ms",
        label: "MS Management",
        icon: HandHeart,
        children: [
          { id: "ms-profiles", label: "MS Profiles", route: "/monks" },
          { id: "ms-hierarchy", label: "Guru Hierarchy", route: "/coming-soon?module=Guru Hierarchy", featureFlag: true },
          { id: "ms-groups", label: "MS Groups", route: "/coming-soon?module=MS Groups", featureFlag: true },
          { id: "ms-assoc", label: "MS Associations", route: "/coming-soon?module=MS Associations", featureFlag: true },
          { id: "ms-route", label: "Current Route", route: "/routes" },
          { id: "ms-planning", label: "Route Planning", route: "/coming-soon?module=Route Planning", featureFlag: true },
          { id: "ms-journey", label: "Journey History", route: "/journey-logs" },
          { id: "ms-chaturmas", label: "Chaturmas", route: "/chaturmas" },
          { id: "ms-tapasya", label: "Tapasya", route: "/coming-soon?module=Tapasya", featureFlag: true },
          { id: "ms-timeline", label: "Timeline", route: "/coming-soon?module=Timeline", featureFlag: true },
          { id: "ms-followers", label: "Followers", route: "/coming-soon?module=Followers", featureFlag: true }
        ]
      },
      {
        id: "folder-staff",
        label: "Staff",
        icon: Briefcase,
        children: [
          { id: "st-mgt", label: "Staff Management", route: "/staff" },
          { id: "st-reg", label: "Staff Registration", route: "/staff?action=register" },
          { id: "st-qr", label: "Staff QR Cards", route: "/coming-soon?module=Staff QR Cards", featureFlag: true },
          { id: "st-att", label: "Attendance", route: "/staff?tab=attendance" },
          { id: "st-leave", label: "Leave Management", route: "/staff?tab=leaves" },
          { id: "st-docs", label: "Documents", route: "/staff?tab=documents" },
          { id: "st-hours", label: "Working Hours", route: "/staff?tab=hours" }
        ]
      },
      {
        id: "folder-committee",
        label: "Committee",
        icon: UsersRound,
        featureFlag: true,
        children: [
          { id: "com-members", label: "Committee Members", route: "/coming-soon?module=Committee Members" },
          { id: "com-desig", label: "Designations", route: "/coming-soon?module=Committee Designations" },
          { id: "com-dir", label: "Contact Directory", route: "/coming-soon?module=Committee Directory" }
        ]
      }
    ]
  },

  {
    id: "group-orgs",
    label: "Organizations",
    icon: Landmark,
    children: [
      {
        id: "folder-temple",
        label: "Temple",
        icon: Landmark,
        children: [
          { id: "t-mgt", label: "Temple Management", route: "/temples" },
          { id: "t-info", label: "Temple Information", route: "/coming-soon?module=Temple Information", featureFlag: true },
          { id: "t-fac", label: "Facilities", route: "/coming-soon?module=Temple Facilities", featureFlag: true },
          { id: "t-gal", label: "Gallery", route: "/gallery" },
          { id: "t-com", label: "Committee", route: "/coming-soon?module=Temple Committee", featureFlag: true },
          { id: "t-vol", label: "Volunteers", route: "/volunteers" },
          { id: "t-not", label: "Notices", route: "/coming-soon?module=Temple Notices", featureFlag: true },
          { id: "t-rev", label: "Reviews", route: "/coming-soon?module=Temple Reviews", featureFlag: true },
          { id: "t-dhaja", label: "Dhaja", route: "/coming-soon?module=Temple Dhaja", featureFlag: true },
          { id: "t-chat", label: "Chaturmas", route: "/chaturmas" },
          { id: "t-social", label: "Social Links", route: "/coming-soon?module=Temple Social Links", featureFlag: true }
        ]
      },
      {
        id: "folder-jc",
        label: "Jain Centre",
        icon: Building2,
        children: [
          { id: "jc-mgt", label: "Jain Centre Management", route: "/jain-centers" },
          { id: "jc-info", label: "Centre Information", route: "/coming-soon?module=Centre Information", featureFlag: true },
          { id: "jc-fac", label: "Facilities", route: "/coming-soon?module=Jain Centre Facilities", featureFlag: true },
          { id: "jc-gal", label: "Gallery", route: "/gallery" },
          { id: "jc-com", label: "Committee", route: "/coming-soon?module=Jain Centre Committee", featureFlag: true },
          { id: "jc-vol", label: "Volunteers", route: "/volunteers" },
          { id: "jc-not", label: "Notices", route: "/coming-soon?module=Jain Centre Notices", featureFlag: true },
          { id: "jc-rev", label: "Reviews", route: "/coming-soon?module=Jain Centre Reviews", featureFlag: true },
          { id: "jc-social", label: "Social Links", route: "/coming-soon?module=Jain Centre Social Links", featureFlag: true }
        ]
      },
      {
        id: "folder-dharamshala",
        label: "Dharamshala",
        icon: Hotel,
        children: [
          { id: "d-mgt", label: "Dharamshala Management", route: "/dharamshalas" },
          { id: "d-build", label: "Buildings", route: "/coming-soon?module=Buildings", featureFlag: true },
          { id: "d-floor", label: "Floors", route: "/coming-soon?module=Floors", featureFlag: true },
          { id: "d-room", label: "Rooms", route: "/coming-soon?module=Dharamshala Rooms", featureFlag: true },
          { id: "d-cat", label: "Room Categories", route: "/coming-soon?module=Room Categories", featureFlag: true },
          { id: "d-am", label: "Amenities", route: "/coming-soon?module=Amenities", featureFlag: true },
          { id: "d-pr", label: "Pricing", route: "/coming-soon?module=Room Pricing", featureFlag: true },
          { id: "d-fac", label: "Facilities", route: "/coming-soon?module=Dharamshala Facilities", featureFlag: true },
          { id: "d-gal", label: "Gallery", route: "/gallery" },
          { id: "d-rule", label: "Rules", route: "/coming-soon?module=Dharamshala Rules", featureFlag: true }
        ]
      },
      {
        id: "folder-bhojanshala",
        label: "Bhojanshala",
        icon: Sigma,
        children: [
          { id: "bh-mgt", label: "Bhojanshala Management", route: "/coming-soon?module=Bhojanshala Management", featureFlag: true },
          { id: "bh-time", label: "Timings", route: "/coming-soon?module=Bhojanshala Timings", featureFlag: true },
          { id: "bh-menu", label: "Menu", route: "/coming-soon?module=Bhojanshala Menu", featureFlag: true },
          { id: "bh-pass", label: "Pass Management", route: "/coming-soon?module=Bhojanshala Pass Management", featureFlag: true }
        ]
      },
      {
        id: "folder-st",
        label: "Sthanaks",
        icon: HomeIcon,
        children: [
          { id: "st-stanak-mgt", label: "Sthanak Management", route: "/stanaks" }
        ]
      },
      {
        id: "folder-pages",
        label: "Community Pages",
        icon: Globe,
        children: [
          { id: "cp-my", label: "My Page", route: "/community-pages" },
          { id: "cp-info", label: "Page Information", route: "/coming-soon?module=Community Page Information", featureFlag: true },
          { id: "cp-gal", label: "Gallery", route: "/gallery" },
          { id: "cp-fol", label: "Followers", route: "/coming-soon?module=Community Page Followers", featureFlag: true },
          { id: "cp-rev", label: "Reviews", route: "/coming-soon?module=Community Page Reviews", featureFlag: true },
          { id: "cp-social", label: "Social Links", route: "/coming-soon?module=Community Page Social Links", featureFlag: true },
          { id: "cp-seo", label: "SEO & Sharing", route: "/coming-soon?module=Community Page SEO", featureFlag: true }
        ]
      }
    ]
  },

  {
    id: "group-community",
    label: "Community",
    icon: Newspaper,
    children: [
      {
        id: "folder-feed",
        label: "Feed",
        icon: Newspaper,
        children: [
          { id: "fe-mgt", label: "Feed Management", route: "/feed" },
          { id: "fe-create", label: "Create Post", route: "/feed/create-post" },
          { id: "fe-sched", label: "Scheduled Posts", route: "/community/scheduled-posts" },
          { id: "fe-feat", label: "Featured Posts", route: "/community/featured-posts" },
          { id: "fe-rep", label: "Reported Posts", route: "/community/reported-posts" },
          { id: "fe-an", label: "Feed Analytics", route: "/reports/feed-analytics" }
        ]
      },
      {
        id: "folder-events",
        label: "Events",
        icon: PartyPopper,
        children: [
          { id: "ev-cat", label: "Event Categories", route: "/coming-soon?module=Event Categories", featureFlag: true },
          { id: "ev-mgt", label: "Event Management", route: "/events" },
          { id: "ev-sched", label: "Event Schedule", route: "/coming-soon?module=Event Schedule", featureFlag: true },
          { id: "ev-reg", label: "Registrations", route: "/coming-soon?module=Event Registrations", featureFlag: true },
          { id: "ev-att", label: "Attendees", route: "/coming-soon?module=Event Attendees", featureFlag: true },
          { id: "ev-vol", label: "Volunteers", route: "/volunteers" },
          { id: "ev-seat", label: "Seating Layout", route: "/seating" },
          { id: "ev-tcat", label: "Ticket Categories", route: "/tickets" },
          { id: "ev-pr", label: "Pricing", route: "/coming-soon?module=Event Ticket Pricing", featureFlag: true },
          { id: "ev-coup", label: "Coupons", route: "/coming-soon?module=Event Coupons", featureFlag: true },
          { id: "ev-qr", label: "QR Check-in", route: "/coming-soon?module=Event QR Check-in", featureFlag: true },
          { id: "ev-qrep", label: "Check-in Reports", route: "/coming-soon?module=Check-in Reports", featureFlag: true },
          { id: "ev-an", label: "Event Analytics", route: "/reports/events" }
        ]
      },
      {
        id: "folder-news",
        label: "News",
        icon: ScrollText,
        children: [
          { id: "ne-mgt", label: "News Management", route: "/news" },
          { id: "ne-cat", label: "Categories", route: "/coming-soon?module=News Categories", featureFlag: true },
          { id: "ne-feat", label: "Featured News", route: "/coming-soon?module=Featured News", featureFlag: true },
          { id: "ne-sched", label: "Scheduled News", route: "/coming-soon?module=Scheduled News", featureFlag: true },
          { id: "ne-arch", label: "Archived News", route: "/coming-soon?module=Archived News", featureFlag: true }
        ]
      },
      {
        id: "folder-ann",
        label: "Announcements",
        icon: Megaphone,
        children: [
          { id: "an-mgt", label: "Announcement Management", route: "/announcements" },
          { id: "an-pri", label: "Priority Announcements", route: "/coming-soon?module=Priority Announcements", featureFlag: true },
          { id: "an-sched", label: "Scheduled Announcements", route: "/coming-soon?module=Scheduled Announcements", featureFlag: true }
        ]
      },
      {
        id: "folder-polls",
        label: "Polls",
        icon: BarChart3,
        children: [
          { id: "po-mgt", label: "Poll Management", route: "/polls" },
          { id: "po-resp", label: "Responses", route: "/coming-soon?module=Poll Responses", featureFlag: true },
          { id: "po-res", label: "Poll Results", route: "/coming-soon?module=Poll Results", featureFlag: true }
        ]
      },
      {
        id: "folder-tours",
        label: "Tours",
        icon: Route,
        children: [
          { id: "to-mgt", label: "Tour Management", route: "/tours" },
          { id: "to-sched", label: "Tour Schedule", route: "/coming-soon?module=Tour Schedule", featureFlag: true },
          { id: "to-reg", label: "Registrations", route: "/coming-soon?module=Tour Registrations", featureFlag: true },
          { id: "to-part", label: "Participants", route: "/coming-soon?module=Tour Participants", featureFlag: true }
        ]
      },
      {
        id: "folder-99",
        label: "99 Management",
        icon: GitBranch,
        featureFlag: true,
        children: [
          { id: "99-cat", label: "99 Categories", route: "/coming-soon?module=99 Categories" },
          { id: "99-mgt", label: "99 Management", route: "/coming-soon?module=99 Management" },
          { id: "99-part", label: "Participants", route: "/coming-soon?module=99 Participants" },
          { id: "99-rep", label: "Completion Reports", route: "/coming-soon?module=99 Completion Reports" }
        ]
      },
      {
        id: "folder-counter",
        label: "Spiritual Counter",
        icon: Sigma,
        children: [
          { id: "sc-cat", label: "Counter Categories", route: "/counters" },
          { id: "sc-stats", label: "Member Statistics", route: "/coming-soon?module=Member Counter Stats", featureFlag: true },
          { id: "sc-global", label: "Global Statistics", route: "/coming-soon?module=Global Counter Stats", featureFlag: true }
        ]
      },
      {
        id: "folder-tcalendar",
        label: "Tithi Calendar",
        icon: Calendar,
        children: [
          { id: "tc-mgt", label: "Calendar Management", route: "/calendar" },
          { id: "tc-types", label: "Calendar Types", route: "/coming-soon?module=Calendar Types", featureFlag: true },
          { id: "tc-tithi", label: "Tithi Management", route: "/coming-soon?module=Tithi Management", featureFlag: true }
        ]
      },
      {
        id: "folder-notif",
        label: "Notifications",
        icon: Bell,
        children: [
          { id: "nt-push", label: "Push Notifications", route: "/coming-soon?module=Push Notifications", featureFlag: true },
          { id: "nt-wa", label: "WhatsApp", route: "/coming-soon?module=WhatsApp Notifications", featureFlag: true },
          { id: "nt-sms", label: "SMS", route: "/coming-soon?module=SMS Notifications", featureFlag: true },
          { id: "nt-email", label: "Email", route: "/coming-soon?module=Email Notifications", featureFlag: true },
          { id: "nt-hist", label: "Notification History", route: "/notifications" }
        ]
      },
      { id: "folder-varshitap", label: "Varshitap Management", icon: Flame, route: "/coming-soon?module=Varshitap Management", featureFlag: true }
    ]
  },

  {
    id: "group-bookings",
    label: "Bookings",
    icon: CalendarCheck,
    children: [
      {
        id: "folder-bcat",
        label: "Booking Categories",
        icon: ClipboardList,
        children: [
          { id: "bc-mgt", label: "Category Management", route: "/coming-soon?module=Category Management", featureFlag: true },
          { id: "bc-rules", label: "Booking Rules", route: "/coming-soon?module=Booking Rules", featureFlag: true },
          { id: "bc-app", label: "Required Approvals", route: "/coming-soon?module=Required Approvals", featureFlag: true }
        ]
      },
      {
        id: "folder-bres",
        label: "Booking Resources",
        icon: Landmark,
        children: [
          { id: "br-rooms", label: "Rooms", route: "/coming-soon?module=Booking Rooms", featureFlag: true },
          { id: "br-halls", label: "Halls", route: "/coming-soon?module=Halls", featureFlag: true },
          { id: "br-bhoj", label: "Bhojanshala", route: "/coming-soon?module=Bhojanshala Resources", featureFlag: true },
          { id: "br-pooja", label: "Pooja Booking", route: "/coming-soon?module=Pooja Booking Resources", featureFlag: true },
          { id: "br-path", label: "Pathshala", route: "/coming-soon?module=Pathshala Resources", featureFlag: true },
          { id: "br-other", label: "Other Resources", route: "/coming-soon?module=Other Booking Resources", featureFlag: true }
        ]
      },
      {
        id: "folder-bmgt",
        label: "Booking Management",
        icon: CalendarCheck,
        children: [
          { id: "bm-req", label: "Booking Requests", route: "/bookings?tab=admin_bookings" },
          { id: "bm-res", label: "Reservations", route: "/bookings?tab=reservations" },
          { id: "bm-walkin", label: "Walk-in Bookings", route: "/coming-soon?module=Walk-in Bookings", featureFlag: true },
          { id: "bm-group", label: "Group Bookings", route: "/coming-soon?module=Group Bookings", featureFlag: true },
          { id: "bm-wait", label: "Waiting List", route: "/coming-soon?module=Booking Waiting List", featureFlag: true },
          { id: "bm-ext", label: "Booking Extensions", route: "/coming-soon?module=Booking Extensions", featureFlag: true },
          { id: "bm-cancel", label: "Cancellations", route: "/coming-soon?module=Cancellations", featureFlag: true }
        ]
      },
      {
        id: "folder-bprice",
        label: "Pricing & Availability",
        icon: Wallet,
        children: [
          { id: "bp-price", label: "Pricing", route: "/coming-soon?module=Pricing Setup", featureFlag: true },
          { id: "bp-seas", label: "Seasonal Pricing", route: "/coming-soon?module=Seasonal Pricing", featureFlag: true },
          { id: "bp-avail", label: "Availability", route: "/coming-soon?module=Availability Setup", featureFlag: true },
          { id: "bp-black", label: "Blackout Dates", route: "/coming-soon?module=Blackout Dates", featureFlag: true },
          { id: "bp-limits", label: "Booking Limits", route: "/coming-soon?module=Booking Limits", featureFlag: true }
        ]
      },
      {
        id: "folder-bcal",
        label: "Calendar",
        icon: Calendar,
        children: [
          { id: "bl-grid", label: "Daily, Weekly, Monthly", route: "/booking-calendar" },
          { id: "bl-res", label: "Resource Availability", route: "/bookings?tab=availability_calendar" }
        ]
      },
      {
        id: "folder-bcheck",
        label: "Check-In / Check-Out",
        icon: ScanLine,
        children: [
          { id: "bck-in", label: "Check-In", route: "/coming-soon?module=Check-In", featureFlag: true },
          { id: "bck-out", label: "Check-Out", route: "/coming-soon?module=Check-Out", featureFlag: true },
          { id: "bck-occ", label: "Current Occupancy", route: "/coming-soon?module=Current Occupancy", featureFlag: true },
          { id: "bck-over", label: "Overstay Management", route: "/coming-soon?module=Overstay Management", featureFlag: true }
        ]
      },
      {
        id: "folder-brep",
        label: "Reports",
        icon: TrendingUp,
        children: [
          { id: "brp-book", label: "Booking", route: "/reports?tab=bookings", featureFlag: true },
          { id: "brp-occ", label: "Occupancy", route: "/coming-soon?module=Occupancy Reports", featureFlag: true },
          { id: "brp-cancel", label: "Cancellation", route: "/coming-soon?module=Cancellation Reports", featureFlag: true },
          { id: "brp-rev", label: "Revenue", route: "/coming-soon?module=Revenue Reports", featureFlag: true }
        ]
      }
    ]
  },

  {
    id: "group-finance",
    label: "Finance",
    icon: HeartHandshake,
    children: [
      {
        id: "folder-fnd",
        label: "Donations",
        icon: HeartHandshake,
        children: [
          { id: "dn-cat", label: "Donation Categories", route: "/coming-soon?module=Donation Categories", featureFlag: true },
          { id: "dn-camp", label: "Donation Campaigns", route: "/coming-soon?module=Donation Campaigns", featureFlag: true },
          { id: "dn-mgt", label: "Donation Management", route: "/donations" },
          { id: "dn-verify", label: "Pending Verification", route: "/coming-soon?module=Pending Verification", featureFlag: true },
          { id: "dn-online", label: "Online Donations", route: "/donations?type=online", featureFlag: true },
          { id: "dn-offline", label: "Offline Donations", route: "/donations?type=offline", featureFlag: true },
          { id: "dn-receipt", label: "Donation Receipts", route: "/receipts" },
          { id: "dn-80g", label: "80G Receipts", route: "/coming-soon?module=80G Receipts", featureFlag: true },
          { id: "dn-rep", label: "Donation Reports", route: "/reports/donations" }
        ]
      },
      {
        id: "folder-fbank",
        label: "Bank & Payment",
        icon: Wallet,
        children: [
          { id: "bp-bank", label: "Bank Accounts", route: "/coming-soon?module=Bank Accounts", featureFlag: true },
          { id: "bp-upi", label: "UPI QR Codes", route: "/coming-soon?module=UPI QR Codes", featureFlag: true },
          { id: "bp-gw", label: "Payment Gateway", route: "/coming-soon?module=Payment Gateway", featureFlag: true },
          { id: "bp-tx", label: "Payment Transactions", route: "/coming-soon?module=Payment Transactions", featureFlag: true },
          { id: "bp-recon", label: "Payment Reconciliation", route: "/coming-soon?module=Payment Reconciliation", featureFlag: true }
        ]
      },
      {
        id: "folder-fsponsor",
        label: "Sponsors",
        icon: Wallet,
        featureFlag: true,
        children: [
          { id: "sp-mgt", label: "Sponsor Management", route: "/coming-soon?module=Sponsor Management" },
          { id: "sp-cat", label: "Sponsor Categories", route: "/coming-soon?module=Sponsor Categories" },
          { id: "sp-pack", label: "Sponsorship Packages", route: "/coming-soon?module=Sponsorship Packages" },
          { id: "sp-act", label: "Active Sponsors", route: "/coming-soon?module=Active Sponsors" },
          { id: "sp-rep", label: "Sponsor Reports", route: "/coming-soon?module=Sponsor Reports" }
        ]
      },
      {
        id: "folder-fads",
        label: "Advertisements",
        icon: Megaphone,
        children: [
          { id: "ad-mgt", label: "Advertisement Management", route: "/ads" },
          { id: "ad-cat", label: "Advertisement Categories", route: "/coming-soon?module=Ad Categories", featureFlag: true },
          { id: "ad-banner", label: "Banner Management", route: "/banners" },
          { id: "ad-sched", label: "Campaign Schedule", route: "/coming-soon?module=Campaign Schedule", featureFlag: true },
          { id: "ad-rep", label: "Advertisement Reports", route: "/coming-soon?module=Ad Reports", featureFlag: true }
        ]
      },
      {
        id: "folder-foffers",
        label: "Offers & Benefits",
        icon: Tag,
        children: [
          { id: "of-cat", label: "Offer Categories", route: "/coming-soon?module=Offer Categories", featureFlag: true },
          { id: "of-mgt", label: "Offer Management", route: "/offers" },
          { id: "of-coup", label: "Coupons", route: "/coming-soon?module=Offer Coupons", featureFlag: true },
          { id: "of-partner", label: "Partner Businesses", route: "/coming-soon?module=Partner Businesses", featureFlag: true },
          { id: "of-rep", label: "Offer Reports", route: "/coming-soon?module=Offer Reports", featureFlag: true },
          { id: "of-an", label: "Offer Analytics", route: "/coming-soon?module=Offer Analytics", featureFlag: true }
        ]
      },
      {
        id: "folder-freports",
        label: "Reports",
        icon: TrendingUp,
        children: [
          { id: "fr-don", label: "Donation", route: "/reports/donations" },
          { id: "fr-pay", label: "Payment", route: "/coming-soon?module=Payment Reports", featureFlag: true },
          { id: "fr-spon", label: "Sponsor", route: "/coming-soon?module=Sponsor Reports", featureFlag: true },
          { id: "fr-ad", label: "Advertisement", route: "/coming-soon?module=Ad Reports", featureFlag: true },
          { id: "fr-sum", label: "Financial Summary", route: "/coming-soon?module=Financial Summary", featureFlag: true }
        ]
      }
    ]
  },

  {
    id: "group-operations",
    label: "Operations",
    icon: Settings,
    children: [
      {
        id: "folder-opvis",
        label: "Visitor Management",
        icon: ScanLine,
        children: [
          { id: "vi-in", label: "Visitor Entry", route: "/visitors" },
          { id: "vi-out", label: "Visitor Exit", route: "/coming-soon?module=Visitor Exit", featureFlag: true },
          { id: "vi-hist", label: "Visitor History", route: "/coming-soon?module=Visitor History", featureFlag: true },
          { id: "vi-exp", label: "Expected Visitors", route: "/coming-soon?module=Expected Visitors", featureFlag: true },
          { id: "vi-veh", label: "Vehicle Entry", route: "/coming-soon?module=Vehicle Entry", featureFlag: true },
          { id: "vi-qr", label: "QR Check-In", route: "/coming-soon?module=Visitor QR Check-In", featureFlag: true },
          { id: "vi-vip", label: "VIP Visitors", route: "/coming-soon?module=VIP Visitors", featureFlag: true },
          { id: "vi-black", label: "Blacklisted Visitors", route: "/coming-soon?module=Blacklisted Visitors", featureFlag: true },
          { id: "vi-rep", label: "Visitor Reports", route: "/coming-soon?module=Visitor Reports", featureFlag: true }
        ]
      },
      {
        id: "folder-optracking",
        label: "MS Tracking",
        icon: MapPin,
        children: [
          { id: "tr-live", label: "Live Tracking", route: "/tracking" },
          { id: "tr-man", label: "Manual Tracking", route: "/manual-tracking" },
          { id: "tr-route", label: "Route Planning", route: "/coming-soon?module=Route Planning", featureFlag: true },
          { id: "tr-journey", label: "Journey Logs", route: "/journey-logs" },
          { id: "tr-map", label: "Live Map", route: "/live-map" },
          { id: "tr-chat", label: "Chaturmas Tracking", route: "/coming-soon?module=Chaturmas Tracking", featureFlag: true },
          { id: "tr-rep", label: "Route Reports", route: "/coming-soon?module=Route Reports", featureFlag: true }
        ]
      },
      {
        id: "folder-opstaff",
        label: "Staff Operations",
        icon: Briefcase,
        children: [
          { id: "so-man", label: "Manual Attendance", route: "/coming-soon?module=Manual Attendance", featureFlag: true },
          { id: "so-qr", label: "QR Attendance", route: "/coming-soon?module=QR Attendance", featureFlag: true },
          { id: "so-leave", label: "Leave Management", route: "/staff?tab=leaves", featureFlag: true },
          { id: "so-hours", label: "Working Hours", route: "/staff?tab=hours", featureFlag: true },
          { id: "so-salary", label: "Shift and Salary Management", route: "/coming-soon?module=Shift and Salary Management", featureFlag: true },
          { id: "so-rep", label: "Attendance Reports", route: "/coming-soon?module=Attendance Reports", featureFlag: true }
        ]
      },
      {
        id: "folder-opdocs",
        label: "Document Management",
        icon: BookOpen,
        children: [
          { id: "dm-org", label: "Organization Documents", route: "/coming-soon?module=Organization Documents", featureFlag: true },
          { id: "dm-staff", label: "Staff Documents", route: "/staff?tab=documents", featureFlag: true },
          { id: "dm-upload", label: "Upload Documents", route: "/coming-soon?module=Upload Documents", featureFlag: true },
          { id: "dm-exp", label: "Expiry Reminders", route: "/coming-soon?module=Expiry Reminders", featureFlag: true },
          { id: "dm-dl", label: "Download Documents", route: "/coming-soon?module=Download Documents", featureFlag: true }
        ]
      },
      {
        id: "folder-optasks",
        label: "Task Management",
        icon: CheckSquare,
        featureFlag: true,
        children: [
          { id: "tk-pend", label: "Pending Tasks", route: "/coming-soon?module=Pending Tasks" },
          { id: "tk-app", label: "Pending Approvals", route: "/coming-soon?module=Pending Approvals" },
          { id: "tk-follow", label: "Follow-ups", route: "/coming-soon?module=Follow-ups" },
          { id: "tk-remind", label: "Reminders", route: "/coming-soon?module=Reminders" },
          { id: "tk-comp", label: "Completed Tasks", route: "/coming-soon?module=Completed Tasks" }
        ]
      },
      {
        id: "folder-oprep",
        label: "Reports",
        icon: TrendingUp,
        children: [
          { id: "or-vis", label: "Visitor", route: "/coming-soon?module=Visitor Reports", featureFlag: true },
          { id: "or-track", label: "Tracking", route: "/coming-soon?module=Tracking Reports", featureFlag: true },
          { id: "or-att", label: "Attendance", route: "/coming-soon?module=Attendance Reports", featureFlag: true },
          { id: "or-sum", label: "Operational Summary", route: "/coming-soon?module=Operational Summary", featureFlag: true }
        ]
      }
    ]
  },

  {
    id: "group-reports",
    label: "Reports & Analytics",
    icon: TrendingUp,
    children: [
      { id: "rp-exec", label: "Executive Dashboard", route: "/reports" },
      { id: "rp-people", label: "People Reports", route: "/reports/members" },
      { id: "rp-org", label: "Organization Reports", route: "/coming-soon?module=Organization Reports", featureFlag: true },
      { id: "rp-comm", label: "Community Reports", route: "/reports/events" },
      { id: "rp-book", label: "Booking Reports", route: "/reports?tab=bookings", featureFlag: true },
      { id: "rp-fin", label: "Financial Reports", route: "/reports/donations" },
      { id: "rp-op", label: "Operations Reports", route: "/coming-soon?module=Operations Reports", featureFlag: true },
      { id: "rp-export", label: "Export Center", route: "/coming-soon?module=Export Center", featureFlag: true }
    ]
  },

  {
    id: "group-support",
    label: "Support",
    icon: LifeBuoy,
    children: [
      { id: "su-ticket", label: "Support Tickets", route: "/support-tickets" },
      { id: "su-feedback", label: "Feedback", route: "/feedback" },
      { id: "su-incorrect", label: "Incorrect Information", route: "/incorrect-reports" },
      { id: "su-contacts", label: "Contact Requests", route: "/coming-soon?module=Contact Requests", featureFlag: true },
      { id: "su-kb", label: "Knowledge Base", route: "/faq" }
    ]
  },

  {
    id: "group-settings",
    label: "Settings",
    icon: Settings,
    children: [
      { id: "se-admin", label: "Admin Management", route: "/admins", roles: ["SUPER_ADMIN"] },
      { id: "se-roles", label: "Roles & Permissions", route: "/coming-soon?module=Roles & Permissions", roles: ["SUPER_ADMIN"], featureFlag: true },
      { id: "se-master", label: "Master Data", route: "/master-data", roles: ["SUPER_ADMIN"] },
      { id: "se-notif", label: "Notification Center", route: "/notifications/preferences", featureFlag: true },
      { id: "se-platform", label: "Platform Settings", route: "/settings", roles: ["SUPER_ADMIN"] },
      { id: "se-payment", label: "Payment Settings", route: "/coming-soon?module=Payment Settings", roles: ["SUPER_ADMIN"], featureFlag: true },
      { id: "se-security", label: "Security", route: "/settings?tab=security", roles: ["SUPER_ADMIN"], featureFlag: true },
      { id: "se-sub", label: "Subscription", route: "/subscription-plans", roles: ["SUPER_ADMIN"] }
    ]
  }
];
