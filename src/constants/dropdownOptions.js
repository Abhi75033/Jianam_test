/**
 * dropdownOptions.js
 * ─────────────────────────────────────────────────────────────
 * Centralised source of truth for all static dropdown options.
 * Every option set is exported as:
 *   1. A plain array of strings (for legacy <select> compatibility)
 *   2. A { value, label } array (for SearchableSelect compatibility)
 *
 * Convention: toOptions(arr) converts a string array → [{value, label}]
 * ─────────────────────────────────────────────────────────────
 */

/** Helper: converts a string[] into [{value, label}] pairs */
export function toOptions(arr, placeholderLabel = null) {
  const opts = arr.map((item) => ({ value: item, label: item }));
  if (placeholderLabel) return [{ value: "", label: placeholderLabel }, ...opts];
  return opts;
}

/** Helper: converts [{id, name}] API objects into [{value, label}] */
export function toApiOptions(arr, valueKey = "id", labelKey = "name") {
  return arr.map((item) => ({ value: item[valueKey], label: item[labelKey] }));
}

// ─── Personal ────────────────────────────────────────────────

export const GENDERS = ["Male", "Female", "Other"];
export const GENDER_OPTIONS = toOptions(GENDERS);

export const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed", "Other"];
export const MARITAL_STATUS_OPTIONS = toOptions(MARITAL_STATUSES);

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
export const BLOOD_GROUP_OPTIONS = toOptions(BLOOD_GROUPS);

export const DISABILITY_OPTIONS_LIST = ["No", "Yes – Visual", "Yes – Hearing", "Yes – Physical", "Yes – Cognitive", "Yes – Other"];
export const DISABILITY_OPTIONS = toOptions(DISABILITY_OPTIONS_LIST);

// ─── Nationality & Language ───────────────────────────────────

export const NATIONALITIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Singapore", "United Arab Emirates", "New Zealand", "South Africa",
  "Kenya", "Germany", "France", "Netherlands", "Japan", "Other"
];
export const NATIONALITY_OPTIONS = toOptions(NATIONALITIES);

export const ALL_COUNTRIES = [
  "India", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belgium", "Bhutan", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Cambodia", "Canada", "Chile", "China", "Colombia", "Croatia", "Cyprus", "Czech Republic",
  "Denmark", "Egypt", "Ethiopia", "Fiji", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece",
  "Hong Kong", "Hungary", "Iceland", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Laos", "Lebanon", "Luxembourg", "Malaysia", "Maldives",
  "Mauritius", "Mexico", "Mongolia", "Morocco", "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand",
  "Nigeria", "Norway", "Oman", "Pakistan", "Panama", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain", "Sri Lanka",
  "Sudan", "Sweden", "Switzerland", "Taiwan", "Tanzania", "Thailand", "Turkey", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uzbekistan", "Vietnam", "Zambia", "Zimbabwe", "Other"
];
export const COUNTRY_OPTIONS = toOptions(ALL_COUNTRIES);

export const LANGUAGES = ["English", "Hindi", "Gujarati", "Marathi", "Rajasthani", "Kutchi", "Punjabi", "Tamil", "Telugu", "Kannada", "Bengali", "Other"];
export const LANGUAGE_OPTIONS = toOptions(LANGUAGES);

export const COMMUNICATION_METHODS = ["Mobile", "WhatsApp", "Email"];
export const COMMUNICATION_METHOD_OPTIONS = toOptions(COMMUNICATION_METHODS);

// ─── Jain Community ──────────────────────────────────────────

export const JAIN_SECTS = ["Shwetambar", "Digambar"];
export const JAIN_SECT_OPTIONS = toOptions(JAIN_SECTS);

export const SHWETAMBAR_SUB_SECTS = ["Murtipujak", "Sthanakvasi", "Terapanth", "Other"];
export const DIGAMBAR_SUB_SECTS = ["Bisapantha", "Terapantha", "Taranapantha", "Gumanapantha", "Totapantha", "Other"];

export const MOTHER_TONGUES = ["Gujarati", "Hindi", "Kutchi", "Marathi", "Marwari", "English", "Others"];
export const MOTHER_TONGUE_OPTIONS = toOptions(MOTHER_TONGUES);

export const TITHI_CALENDAR_TYPES = ["Gujarati", "Hindi", "Kutchi", "Marathi", "Marwari", "Other"];
export const TITHI_CALENDAR_OPTIONS = toOptions(TITHI_CALENDAR_TYPES);

export const VOLUNTEER_AVAILABILITY_LIST = ["Morning", "Afternoon", "Evening", "Weekend", "Anytime"];
export const VOLUNTEER_AVAILABILITY_OPTIONS = toOptions(VOLUNTEER_AVAILABILITY_LIST);

export const MURTIPUJAK_GACCHAS = [
  "Upkeśa Gaccha", "Achal Gaccha", "Jiravala Gaccha", "Kharatara Gaccha", "Lonka (Richmati) Gaccha",
  "Tapa Gaccha", "Gangeshvara Gaccha", "Korantavala Gaccha", "Anandapura Gaccha", "Bharavali Gaccha",
  "Udhaviya Gaccha", "Gudava Gaccha", "Dekawa Gaccha", "Bhinmala Gaccha", "Mahudiya Gaccha",
  "Gachhapala Gaccha", "Goshavala Gaccha", "Magatragada Gaccha", "Vrihmaniya Gaccha", "Talara Gaccha",
  "Vikadiya Gaccha", "Munjhiya Gaccha", "Chitroda Gaccha", "Sachora Gaccha", "Jachandiya Gaccha",
  "Sidhalava Gaccha", "Miyanniya Gaccha", "Agamiya Gaccha", "Maladhari Gaccha", "Bhavariya Gaccha",
  "Paliwala Gaccha", "Nagadigeshvara Gaccha", "Dharmaghosha Gaccha", "Nagapura Gaccha", "Uchatavala Gaccha",
  "Nannavala Gaccha", "Sadera Gaccha", "Mandovara Gaccha", "Surani Gaccha", "Khambhavati Gaccha",
  "Panchanda Gaccha", "Sopariya Gaccha", "Mandaliya Gaccha", "Kochhipana Gaccha", "Jaganna Gaccha",
  "Laparavala Gaccha", "Vosarada Gaccha", "Duivandaniya Gaccha", "Chitravala Gaccha", "Vegada Gaccha",
  "Vapada Gaccha", "Vijahara Gaccha", "Kapuri Gaccha", "Kachala Gaccha", "Handaliya Gaccha",
  "Mahukara Gaccha", "Putaliya Gaccha", "Kannariseya Gaccha", "Revardiya Gaccha", "Dhandhuka Gaccha",
  "Thambhanipana Gaccha", "Panchivala Gaccha", "Palanpura Gaccha", "Gandhariya Gaccha", "Veliya Gaccha",
  "Sadhapunamiya Gaccha", "Nagarakotiya Gaccha", "Hasora Gaccha", "Bhatanera Gaccha", "Janahara Gaccha",
  "Jagayana Gaccha", "Bhimasena Gaccha", "Takadiya Gaccha", "Kamboja Gaccha", "Senata Gaccha",
  "Vaghera Gaccha", "Vahediya Gaccha", "Siddhapura Gaccha", "Ghoghari Gaccha", "Nigamiya Gaccha",
  "Punamiya Gaccha", "Varhadiya Gaccha", "Namila Gaccha", "Other Gaccha"
];
export const MURTIPUJAK_GACCHA_OPTIONS = toOptions(MURTIPUJAK_GACCHAS, "Choose Gaccha...");

// ─── Documents ───────────────────────────────────────────────

export const DOC_TYPES = ["Aadhaar Card", "PAN Card", "Passport", "Driving License", "Voter ID", "Other"];
export const DOC_TYPE_OPTIONS = toOptions(DOC_TYPES);

// ─── Staff / HR ──────────────────────────────────────────────

export const WORK_CATEGORIES = [
  "Temple Staff", "Dharamshala Staff", "Bhojanshala Staff", "Security Guard",
  "Housekeeping", "Pujari", "Manager", "Office Staff", "Maintenance",
  "Driver", "Gardener", "Electrician", "Plumber", "Volunteer Staff", "Other"
];
export const WORK_CATEGORY_OPTIONS = toOptions(WORK_CATEGORIES);

export const LEAVE_TYPES = ["Casual Leave", "Sick Leave", "Paid Leave", "Unpaid Leave", "Emergency Leave"];
export const LEAVE_TYPE_OPTIONS = toOptions(LEAVE_TYPES);

export const ATTENDANCE_STATUSES = [
  { value: "PRESENT", label: "Full Day Present" },
  { value: "HALF_DAY", label: "Half Day Present" },
  { value: "ABSENT", label: "Absent Today" },
  { value: "LEAVE", label: "On Approved Leave" },
  { value: "HOLIDAY", label: "Official Holiday" },
];

export const BULK_ATTENDANCE_STATUSES = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
];

// ─── Tours / Events ──────────────────────────────────────────

export const TOUR_TYPES = ["Pilgrimage", "Cultural", "Educational", "Adventure", "Heritage", "Other"];
export const TOUR_TYPE_OPTIONS = toOptions(TOUR_TYPES);

export const SPONSOR_CATEGORIES = ["Platinum", "Gold", "Silver", "Bronze", "Patron", "Other"];
export const SPONSOR_CATEGORY_OPTIONS = toOptions(SPONSOR_CATEGORIES);

export const ROOM_TYPES = ["Single", "Double", "Triple", "Dormitory", "Suite", "Other"];
export const ROOM_TYPE_OPTIONS = toOptions(ROOM_TYPES);

export const EVENT_CATEGORIES = ["Religious", "Cultural", "Social", "Educational", "Pilgrimage", "Fundraiser", "Other"];
export const EVENT_CATEGORY_OPTIONS = toOptions(EVENT_CATEGORIES);

// ─── News / Feed / Offers ─────────────────────────────────────

export const NEWS_CATEGORIES = ["Religion", "Culture", "Community", "National", "International", "Health", "Other"];
export const NEWS_CATEGORY_OPTIONS = toOptions(NEWS_CATEGORIES);

export const OFFER_CATEGORIES = ["Food & Dining", "Travel", "Shopping", "Health & Wellness", "Education", "Services", "Other"];
export const OFFER_CATEGORY_OPTIONS = toOptions(OFFER_CATEGORIES);

// ─── Bookings ─────────────────────────────────────────────────

export const BOOKING_ITEM_CATEGORIES = ["Room", "Hall", "Equipment", "Service", "Other"];
export const BOOKING_ITEM_CATEGORY_OPTIONS = toOptions(BOOKING_ITEM_CATEGORIES);

export const BOOKING_DURATIONS = ["Hours", "Days", "Nights", "Months"];
export const BOOKING_DURATION_OPTIONS = toOptions(BOOKING_DURATIONS);

export const BOOKING_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CHECKED_IN", label: "Checked In" },
  { value: "CHECKED_OUT", label: "Checked Out" },
  { value: "CANCELLED", label: "Cancelled" },
];

// ─── Support Tickets ─────────────────────────────────────────

export const TICKET_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

// ─── Donations ───────────────────────────────────────────────

export const DONATION_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

// ─── Visitors ────────────────────────────────────────────────

export const VISIT_PURPOSES = ["Darshan", "Meeting", "Stay / Accommodation", "Event Attendance", "Volunteering", "Other"];
export const VISIT_PURPOSE_OPTIONS = toOptions(VISIT_PURPOSES);

export const ID_PROOF_TYPES = ["Aadhaar Card", "PAN Card", "Passport", "Driving License", "Voter ID", "Other"];
export const ID_PROOF_TYPE_OPTIONS = toOptions(ID_PROOF_TYPES);

export const VISITOR_STATUSES = [
  { value: "", label: "All Visitors" },
  { value: "CHECKED_IN", label: "Checked In" },
  { value: "CHECKED_OUT", label: "Checked Out" },
];

// ─── Seating ─────────────────────────────────────────────────

export const SEATING_MODES = [
  { value: "OPEN", label: "Open Seating" },
  { value: "RESERVED", label: "Reserved Seating" },
];

// ─── Calendar ────────────────────────────────────────────────

export const MONTHS = [
  { value: "1", label: "January" }, { value: "2", label: "February" },
  { value: "3", label: "March" }, { value: "4", label: "April" },
  { value: "5", label: "May" }, { value: "6", label: "June" },
  { value: "7", label: "July" }, { value: "8", label: "August" },
  { value: "9", label: "September" }, { value: "10", label: "October" },
  { value: "11", label: "November" }, { value: "12", label: "December" },
];

export function getYearOptions(rangeBack = 5, rangeForward = 2) {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = current - rangeBack; y <= current + rangeForward; y++) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
}

// ─── Reports ─────────────────────────────────────────────────

export const REPORT_KEYS = [
  { value: "members", label: "Member Reports" },
  { value: "donations", label: "Donation Reports" },
  { value: "events", label: "Event Reports" },
  { value: "feed", label: "Feed Engagement" },
  { value: "app_usage", label: "App Usage Analytics" },
];

export const REPORT_SCOPES = [
  { value: "org", label: "My Organisation" },
  { value: "platform", label: "Platform-wide (SuperAdmin)" },
];

// ─── Audit Logs ──────────────────────────────────────────────

export const AUDIT_MODULES = [
  { value: "", label: "All Modules" },
  { value: "members", label: "Members" },
  { value: "organizations", label: "Organizations" },
  { value: "donations", label: "Donations" },
  { value: "events", label: "Events" },
  { value: "bookings", label: "Bookings" },
  { value: "staff", label: "Staff" },
  { value: "monks", label: "Monks" },
  { value: "tours", label: "Tours" },
  { value: "feed", label: "Feed" },
  { value: "news", label: "News" },
  { value: "offers", label: "Offers" },
  { value: "auth", label: "Authentication" },
];

export const AUDIT_ACTIONS = [
  { value: "", label: "All Actions" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "EXPORT", label: "Export" },
];

export const CRITICALITY_OPTIONS = [
  { value: "", label: "All Logs" },
  { value: "true", label: "Critical Only" },
  { value: "false", label: "Non-Critical" },
];

// ─── Org / Temple ────────────────────────────────────────────

export const ORG_TYPES = ["Temple", "Dharamshala", "Jain Centre", "Upashraya", "Pathshala", "Other"];
export const ORG_TYPE_OPTIONS = toOptions(ORG_TYPES);

export const ORG_STATUSES = ["ACTIVE", "INACTIVE", "PENDING_APPROVAL"];
export const ORG_STATUS_OPTIONS = toOptions(ORG_STATUSES);

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Other"
];
export const INDIAN_STATE_OPTIONS = toOptions(INDIAN_STATES);
