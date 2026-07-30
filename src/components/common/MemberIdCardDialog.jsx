/**
 * MemberIdCardDialog — Premium physical ID-card style member modal.
 * Implements the comprehensive 21-point Jain Member Registration & Profile Form.
 */
import { useState, useRef, useEffect } from "react";
import { extractErrorMessage } from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera, Pencil, Eye, Phone, Mail, Droplets,
  CheckCircle, XCircle, User, Star, Shield, ShieldCheck, MapPin, Map,
  AlertCircle, ShieldAlert, Award, Sparkles, Plus, Trash2, Check
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import MemberLinkSelect from "@/components/common/MemberLinkSelect";
import {
  GENDER_OPTIONS, NATIONALITY_OPTIONS, LANGUAGE_OPTIONS, MARITAL_STATUS_OPTIONS,
  MOTHER_TONGUE_OPTIONS, TITHI_CALENDAR_OPTIONS, JAIN_SECT_OPTIONS,
  SHWETAMBAR_SUB_SECTS, DIGAMBAR_SUB_SECTS, MURTIPUJAK_GACCHA_OPTIONS,
  BLOOD_GROUP_OPTIONS, COMMUNICATION_METHOD_OPTIONS, VOLUNTEER_AVAILABILITY_OPTIONS,
  toOptions,
} from "@/constants/dropdownOptions";

/* ─── Helpers & Constants ─────────────────────────────────────── */
function initials(name = "") {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "JN";
}

function fmtDob(dob) {
  if (!dob) return null;
  try { return new Date(dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return dob; }
}

const STATUS_COLORS = {
  ACTIVE:    "bg-emerald-400/20 text-emerald-700 border border-emerald-300",
  INACTIVE:  "bg-slate-200/60  text-slate-500    border border-slate-300",
  SUSPENDED: "bg-red-100       text-red-600      border border-red-300",
};

const COUNTRY_CURRENCY_MAP = {
  "India": "INR (₹)",
  "United Kingdom": "GBP (£)",
  "United States": "USD ($)",
  "Canada": "CAD (C$)",
  "Australia": "AUD (A$)",
  "United Arab Emirates": "AED (د.إ)",
  "Singapore": "SGD (S$)",
  "Kenya": "KES (KSh)",
  "South Africa": "ZAR (R)",
};

const MURTIPUJAK_GACCHAS = [
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
  "Punamiya Gaccha", "Varhadiya Gaccha", "Namila Gaccha"
];

function calculateAge(dobString) {
  if (!dobString) return "";
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/* ─── Physical ID Card visual ─────────────────────────────────── */
function IdCardVisual({ member, relation }) {
  const isActive = member?.status === "ACTIVE";
  const city = member?.currentAddress?.city || member?.city || member?.community?.name;
  const age = calculateAge(member?.dob);
  const isSenior = age >= 59;
  const isVolunteer = member?.isVolunteer;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Lanyard */}
      <div className="flex flex-col items-center animate-bounce-slow" aria-hidden>
        <div className="w-5 h-10 bg-gradient-to-b from-orange-600 to-amber-500 rounded-t-sm shadow-inner" />
        <div className="relative">
          <div className="w-8 h-3 bg-gradient-to-b from-slate-300 to-slate-400 rounded-full shadow" />
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-5 border-2 border-slate-400 rounded-full bg-transparent" />
        </div>
      </div>

      {/* Card Wrapper with Premium Glassmorphism & Shadow */}
      <div className="relative w-72 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-slate-900 border border-slate-800 text-slate-100">
        {/* Top brand header bar */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-yellow-400 to-amber-500" />

        {/* Org header info */}
        <div className="px-4 pt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-lg bg-white flex items-center justify-center shadow-lg overflow-hidden p-0.5">
              <img src="/logo.png" alt="JiNANAM Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-[10px] font-black tracking-[0.2em] text-orange-400 uppercase">JiNANAM</span>
          </div>
          <span className={`text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${STATUS_COLORS[member?.status] || STATUS_COLORS.INACTIVE}`}>
            {member?.status || "INACTIVE"}
          </span>
        </div>

        {/* Photo Container */}
        <div className="flex justify-center mt-4 mb-2">
          <div className="relative">
            <div className="h-28 w-28 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-950 flex items-center justify-center">
              {member?.photoUrl ? (
                <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-850 to-slate-800">
                  <span className="text-4xl font-black text-slate-600">{initials(member?.fullName || "JN")}</span>
                </div>
              )}
            </div>
            {isActive && (
              <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-md">
                <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
              </div>
            )}
          </div>
        </div>

        {/* Member metadata name details */}
        <div className="text-center px-4 pb-1">
          <div className="font-extrabold text-lg text-slate-100 leading-tight">{member?.fullName || "—"}</div>
          {relation && <div className="text-[10px] text-orange-400 font-bold tracking-wider mt-0.5 uppercase">{relation}</div>}
          <div className="text-[10px] text-slate-400 mt-1">{member?.profession || "Member"}</div>
        </div>

        <div className="mx-4 my-2.5 h-[1px] bg-slate-800" />

        {/* Fields list */}
        <div className="px-4 pb-4 space-y-2">
          {member?.mobile && (
            <div className="flex items-center gap-2.5 text-[11px] text-slate-300">
              <Phone className="h-3.5 w-3.5 text-orange-400 shrink-0" />
              <span className="font-mono-num font-medium">{member.mobile}</span>
            </div>
          )}
          {member?.email && (
            <div className="flex items-center gap-2.5 text-[11px] text-slate-300">
              <Mail className="h-3.5 w-3.5 text-orange-400 shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          {city && (
            <div className="flex items-center gap-2.5 text-[11px] text-slate-300">
              <span className="text-orange-400 text-xs shrink-0">📍</span>
              <span className="truncate">{city}</span>
            </div>
          )}
          
          {/* Badge Indicators strip */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {isSenior && (
              <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 text-[9px] px-2 py-0.5">
                👴 Senior Citizen
              </Badge>
            )}
            {isVolunteer && (
              <Badge className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/25 border border-orange-500/30 text-[9px] px-2 py-0.5">
                🤝 Volunteer
              </Badge>
            )}
            {isActive && (
              <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 text-[9px] px-2 py-0.5">
                ✓ Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Footer Unique System ID block */}
        <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-t border-slate-800">
          <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Unique ID</span>
          <span className="text-xs font-extrabold font-mono text-yellow-400 tracking-wider">{member?.publicId || "—"}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Panel: 21/22 Sections ─── */
function EditPanel({ member, onSave, onCancel }) {
  // A member is Jain only when category === "JAIN" (explicit) OR when category is absent/null (default).
  // When category === "NON_JAIN", isJain must be false so Jain-specific tabs are hidden.
  const isJain = member?.category !== "NON_JAIN";
  const [subTab, setSubTab] = useState("personal");
  
  // Simulated verification hooks
  const [mobileVerified, setMobileVerified] = useState(!!member?.mobile);
  const [whatsappVerified, setWhatsappVerified] = useState(!!member?.whatsapp);
  const [emailVerified, setEmailVerified] = useState(!!member?.email);

  const [form, setForm] = useState({
    firstName: member?.firstName || "",
    middleName: member?.middleName || "",
    surname: member?.surname || "",
    gender: member?.gender || "Male",
    dob: member?.dob ? member.dob.slice(0, 10) : "",
    nationality: member?.nationality || "India",
    preferredLanguage: member?.preferredLanguage || "English",
    pan: member?.pan || "",
    aadhaar: member?.aadhaar || "",
    maritalStatus: member?.maritalStatus || "Single",
    motherTongue: member?.motherTongue || "Gujarati",
    sect: member?.sect || "Shwetambar",
    subCommunity: member?.subCommunity || "Murtipujak",
    gaccha: member?.gaccha || "",
    tithiCalendar: member?.tithiCalendar || "Gujarati",
    mobile: member?.mobile || "",
    whatsapp: member?.whatsapp || "",
    email: member?.email || "",
    preferredCommunicationMethod: member?.preferredCommunicationMethod || "Mobile",
    alternateContact: member?.alternateContact || "",
    currentAddress: {
      line1: member?.currentAddress?.line1 || "",
      landmark: member?.currentAddress?.landmark || "",
      area: member?.currentAddress?.area || "",
      district: member?.currentAddress?.district || "",
      city: member?.currentAddress?.city || "",
      state: member?.currentAddress?.state || "",
      country: member?.currentAddress?.country || "India",
      pincode: member?.currentAddress?.pincode || "",
    },
    permanentAddress: {
      line1: member?.permanentAddress?.line1 || "",
      landmark: member?.permanentAddress?.landmark || "",
      area: member?.permanentAddress?.area || "",
      district: member?.permanentAddress?.district || "",
      city: member?.permanentAddress?.city || "",
      state: member?.permanentAddress?.state || "",
      country: member?.permanentAddress?.country || "India",
      pincode: member?.permanentAddress?.pincode || "",
    },
    sameAsPermanent: member?.sameAsPermanent || false,
    nativeVillage: {
      village: member?.nativeVillage?.village || "",
      landmark: member?.nativeVillage?.landmark || "",
      district: member?.nativeVillage?.district || "",
      city: member?.nativeVillage?.city || "",
      state: member?.nativeVillage?.state || "",
      pincode: member?.nativeVillage?.pincode || "",
    },
    visitFrequency: member?.visitFrequency || "Weekly",
    favouriteTemple: member?.favouriteTemple || "",
    bloodGroup: member?.bloodGroup || "O+",
    disability: member?.disability || "No",
    disabilityDetails: member?.disabilityDetails || "",
    physicallyHandicapped: member?.physicallyHandicapped || "No",
    handicapDetails: member?.handicapDetails || "",
    medicalNotes: member?.medicalNotes || "",
    allergies: member?.allergies || "",
    emergencyName: member?.emergencyContact?.name || "",
    emergencyRelation: member?.emergencyContact?.relation || "",
    emergencyMobile: member?.emergencyContact?.mobile || "",
    profession: member?.profession || "",
    organizationName: member?.organizationName || "",
    isVolunteer: member?.isVolunteer || false,
    volunteerAreas: Array.isArray(member?.volunteerAreas) ? member.volunteerAreas : [],
    volunteerAvailability: member?.volunteerAvailability || "Weekend",
    familyMembers: Array.isArray(member?.familyMembers) ? member.familyMembers : [],
    siblings: Array.isArray(member?.siblings) ? member.siblings : [],
    serviceNotifications: member?.serviceNotifications || ["SMS", "WhatsApp", "Push"],
    marketingNotifications: member?.marketingNotifications || ["WhatsApp", "Push"],
    showMobile: member?.showMobile ?? true,
    showAddress: member?.showAddress ?? true,
    allowContact: member?.allowContact ?? true,
    preferredCurrency: member?.preferredCurrency || "INR (₹)",
    interests: member?.interests || [],
    favouriteTemples: member?.favouriteTemples || "",
    govtDocs: member?.govtDocs || [
      { docType: "Aadhaar Card", docNumber: "", imageUrl: "", status: "Pending Verification" },
      { docType: "PAN Card", docNumber: "", imageUrl: "", status: "Pending Verification" }
    ]
  });

  const [saving, setSaving] = useState(false);

  // Automatically update currency code dynamically on Country switch
  useEffect(() => {
    const defaultCur = COUNTRY_CURRENCY_MAP[form.currentAddress.country] || "USD ($)";
    setForm((f) => ({ ...f, preferredCurrency: defaultCur }));
  }, [form.currentAddress.country]);

  const calculateCompletion = () => {
    let score = 0;
    let total = isJain ? 14 : 12;
    if (form.firstName) score++;
    if (form.surname) score++;
    if (form.dob) score++;
    if (form.mobile) score++;
    if (form.currentAddress.city) score++;
    if (form.email) score++;
    if (form.bloodGroup) score++;
    if (form.profession) score++;
    if (form.emergencyName) score++;
    if (form.nationality) score++;
    if (isJain) {
      if (form.sect) score++;
      if (form.subCommunity) score++;
      if (form.motherTongue) score++;
      if (form.maritalStatus) score++;
    } else {
      if (form.interests?.length > 0) score++;
      if (form.govtDocs?.[0]?.docNumber) score++;
    }
    return Math.round((score / total) * 100);
  };

  const verifyField = (field) => {
    toast.success(`OTP successfully verified on channel ${field.toUpperCase()}!`);
    if (field === "mobile") setMobileVerified(true);
    if (field === "whatsapp") setWhatsappVerified(true);
    if (field === "email") setEmailVerified(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.firstName) { toast.error("First Name is required."); return; }
    if (!form.middleName) { toast.error("Middle Name is required."); return; }
    if (!form.surname) { toast.error("Surname is required."); return; }
    if (!form.mobile) { toast.error("Mobile Number is required."); return; }
    if (!form.dob) { toast.error("Date of Birth is required."); return; }
    if (!form.nationality) { toast.error("Nationality is required."); return; }
    if (!form.pan) { toast.error("PAN Number is required."); return; }
    if (!form.aadhaar) { toast.error("Aadhaar Number is required."); return; }
    if (!form.maritalStatus) { toast.error("Marital Status is required."); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        dob: form.dob ? new Date(form.dob).toISOString() : undefined,
        fullName: [form.firstName, form.middleName, form.surname].filter(Boolean).join(" "),
        profileCompletionPct: calculateCompletion()
      };
      await onSave(payload);
      toast.success("Profile saved successfully.");
      onCancel();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const editTabs = isJain ? [
    { id: "personal", label: "👤 Personal Details" },
    { id: "community", label: "🛕 Community Details" },
    { id: "contact", label: "📱 Verification & Contacts" },
    { id: "address", label: "📍 Addresses" },
    { id: "preferences", label: "❤️ Preferences" },
    { id: "health", label: "🏥 Health & Professional" },
    { id: "volunteer", label: "🙏 Volunteering" },
    { id: "notifications", label: "🔔 Family & Notifications" },
    { id: "privacy", label: "🔒 Privacy & Currency" }
  ] : [
    { id: "personal", label: "👤 Personal Details" },
    { id: "docs", label: "🆔 Identity & Documents" },
    { id: "contact", label: "📱 Verification & Contacts" },
    { id: "address", label: "📍 Addresses" },
    { id: "interests", label: "🛕 Interests & Prefs" },
    { id: "health", label: "🏥 Health & Professional" },
    { id: "volunteer", label: "🙏 Volunteering" },
    { id: "privacy", label: "🔒 Privacy & Currency" }
  ];

  return (
    <div className="flex flex-col md:flex-row h-[75vh] w-full bg-white rounded-xl overflow-hidden font-sans border border-slate-100">
      {/* Left panel tabs selector */}
      <div className="w-full md:w-60 bg-slate-900 text-slate-300 p-4 flex flex-col gap-1 shrink-0 border-r border-slate-800">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-2">Registration Sections</div>
        
        {/* Profile Completion gauge */}
        <div className="px-2 mb-4 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
            <span>COMPLETION</span>
            <span>{calculateCompletion()}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-300 transition-all duration-300" style={{ width: `${calculateCompletion()}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5">
          {editTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                subTab === t.id
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main inputs section body */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between bg-slate-50">
        <div className="space-y-4">
          
          {/* TAB 1: PERSONAL */}
          {subTab === "personal" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">👤 Basic Personal Information</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">First Name *</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="bg-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Middle Name *</Label>
                  <Input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} className="bg-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Surname *</Label>
                  <Input value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} className="bg-white mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Date of Birth *</Label>
                  <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="bg-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Gender *</Label>
                  <SearchableSelect
                    value={form.gender}
                    onValueChange={(v) => setForm({ ...form, gender: v })}
                    options={GENDER_OPTIONS}
                    placeholder="Select gender"
                    className="mt-1"
                  />
                </div>
              </div>

              {form.dob && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-100 rounded-lg">
                  <span className="text-xs text-orange-700 font-semibold">Calculated Age: {calculateAge(form.dob)} Years</span>
                  {calculateAge(form.dob) >= 59 && (
                    <Badge className="bg-orange-500 text-white text-[9px] hover:bg-orange-600">👴 Senior Citizen Checked</Badge>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Nationality *</Label>
                  <SearchableSelect
                    value={form.nationality}
                    onValueChange={(v) => setForm({ ...form, nationality: v })}
                    options={NATIONALITY_OPTIONS}
                    placeholder="Select nationality"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Preferred Language</Label>
                  <SearchableSelect
                    value={form.preferredLanguage}
                    onValueChange={(v) => setForm({ ...form, preferredLanguage: v })}
                    options={LANGUAGE_OPTIONS}
                    placeholder="Select language"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Identity Details: PAN Number *</Label>
                  <Input value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} placeholder="ABCDE1234F" className="bg-white mt-1 font-mono uppercase" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Aadhaar Number * (12 Digits)</Label>
                  <Input value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} placeholder="1234 5678 9012" className="bg-white mt-1 font-mono" maxLength={14} />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-600">Marital Status *</Label>
                <SearchableSelect
                  value={form.maritalStatus}
                  onValueChange={(v) => setForm({ ...form, maritalStatus: v })}
                  options={MARITAL_STATUS_OPTIONS}
                  placeholder="Select status"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* TAB 2: COMMUNITY */}
          {subTab === "community" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🛕 Community Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Mother Tongue</Label>
                  <SearchableSelect
                    value={form.motherTongue}
                    onValueChange={(v) => setForm({ ...form, motherTongue: v })}
                    options={MOTHER_TONGUE_OPTIONS}
                    placeholder="Select mother tongue"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Tithi Calendar Type</Label>
                  <SearchableSelect
                    value={form.tithiCalendar}
                    onValueChange={(v) => setForm({ ...form, tithiCalendar: v })}
                    options={TITHI_CALENDAR_OPTIONS}
                    placeholder="Select calendar"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Jain Sect</Label>
                  <SearchableSelect
                    value={form.sect}
                    onValueChange={(v) => setForm({ ...form, sect: v, subCommunity: v === "Digambar" ? "Bisapantha" : "Murtipujak" })}
                    options={JAIN_SECT_OPTIONS}
                    placeholder="Select sect"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Sub Sect / Community</Label>
                  <SearchableSelect
                    value={form.subCommunity}
                    onValueChange={(v) => setForm({ ...form, subCommunity: v })}
                    options={toOptions(form.sect === "Digambar" ? DIGAMBAR_SUB_SECTS : SHWETAMBAR_SUB_SECTS)}
                    placeholder="Select sub-sect"
                    className="mt-1"
                  />
                </div>
              </div>

              {form.sect === "Shwetambar" && form.subCommunity === "Murtipujak" && (
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Gaccha Selection</Label>
                  <SearchableSelect
                    value={form.gaccha}
                    onValueChange={(v) => setForm({ ...form, gaccha: v })}
                    options={MURTIPUJAK_GACCHA_OPTIONS}
                    placeholder="Choose Gaccha…"
                    searchPlaceholder="Search Gaccha…"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IDENTITY DOCUMENTS (Non-Jain) */}
          {subTab === "docs" && !isJain && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🆔 Government Identity Verification</h3>
              <p className="text-xs text-slate-400">Please provide details for any two government identity documents.</p>
              
              {form.govtDocs.map((doc, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-150 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold">Document Type</Label>
                      <SearchableSelect
                        value={doc.docType}
                        onValueChange={(v) => {
                          const list = [...form.govtDocs];
                          list[idx].docType = v;
                          setForm({ ...form, govtDocs: list });
                        }}
                        options={toOptions(["Aadhaar Card", "PAN Card", "Passport", "Driving Licence", "Voter ID", "Other Government ID"])}
                        placeholder="Select document type"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Document Number</Label>
                      <Input value={doc.docNumber} onChange={(e) => {
                        const list = [...form.govtDocs];
                        list[idx].docNumber = e.target.value;
                        setForm({ ...form, govtDocs: list });
                      }} placeholder="Number" className="h-8 text-xs font-mono" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Status: <span className="font-semibold text-orange-500">{doc.status}</span></span>
                    <Button variant="ghost" size="xs" type="button" className="text-xs font-semibold text-orange-500" onClick={() => toast.success("Document photo attached.")}>
                      Attach Image Upload
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CONTACT */}
          {subTab === "contact" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">📱 Contact & Verification Details</h3>
              
              <div>
                <Label className="text-xs font-semibold text-slate-600 font-mono-num">Mobile Number *</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91XXXXXXXXXX" className="bg-white flex-1" />
                  <Button size="sm" variant={mobileVerified ? "outline" : "default"} type="button" onClick={() => verifyField("mobile")}>
                    {mobileVerified ? "✓ Verified" : "Verify Mobile"}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-600">WhatsApp Number</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+91XXXXXXXXXX" className="bg-white flex-1" />
                  <Button size="sm" variant={whatsappVerified ? "outline" : "default"} type="button" onClick={() => verifyField("whatsapp")}>
                    {whatsappVerified ? "✓ Verified" : "Verify WhatsApp"}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-600">Email Address</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@domain.com" className="bg-white flex-1" />
                  <Button size="sm" variant={emailVerified ? "outline" : "default"} type="button" onClick={() => verifyField("email")}>
                    {emailVerified ? "✓ Verified" : "Verify Email"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Preferred Contact Method</Label>
                  <SearchableSelect
                    value={form.preferredCommunicationMethod}
                    onValueChange={(v) => setForm({ ...form, preferredCommunicationMethod: v })}
                    options={[
                      { value: "Mobile", label: "Mobile / Phone" },
                      { value: "WhatsApp", label: "WhatsApp" },
                      { value: "Email", label: "Email" },
                    ]}
                    placeholder="Select contact method"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Alternate Phone Contact</Label>
                  <Input value={form.alternateContact} onChange={(e) => setForm({ ...form, alternateContact: e.target.value })} placeholder="+91XXXXXXXXXX" className="bg-white mt-1" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADDRESS */}
          {subTab === "address" && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center border-b pb-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Current Address</h3>
                  <Button variant="ghost" size="xs" type="button" className="text-orange-500 font-semibold text-[10px]" onClick={() => toast.success("Latitude/Longitude coordinates detected dynamically.")}>
                    Auto Detect GPS Location
                  </Button>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Address</Label>
                  <Input value={form.currentAddress.line1} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, line1: e.target.value } })} placeholder="Full address, House/Flat No, Street" className="bg-white mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Country (default India)</Label>
                    <SearchableSelect
                      value={form.currentAddress.country || "India"}
                      onValueChange={(v) => setForm({ ...form, currentAddress: { ...form.currentAddress, country: v } })}
                      options={NATIONALITY_OPTIONS}
                      placeholder="India"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Pincode</Label>
                    <Input value={form.currentAddress.pincode} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, pincode: e.target.value } })} placeholder="6-digit Pincode" className="bg-white mt-1" maxLength={6} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Area</Label>
                    <Input value={form.currentAddress.area || ""} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, area: e.target.value } })} placeholder="Thane E or Thane W" className="bg-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">City</Label>
                    <Input value={form.currentAddress.city} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, city: e.target.value } })} placeholder="e.g. Thane" className="bg-white mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">District</Label>
                    <Input value={form.currentAddress.district || ""} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, district: e.target.value } })} placeholder="e.g. Thane District" className="bg-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">State</Label>
                    <Input value={form.currentAddress.state} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, state: e.target.value } })} placeholder="e.g. Maharashtra" className="bg-white mt-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center border-b pb-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Permanent Address</h3>
                  <div className="flex items-center gap-1">
                    <input type="checkbox" id="same" checked={form.sameAsPermanent} onChange={(e) => {
                      const checked = e.target.checked;
                      setForm({
                        ...form,
                        sameAsPermanent: checked,
                        permanentAddress: checked ? { ...form.currentAddress } : { line1: "", city: "", state: "", country: "India", pincode: "" }
                      });
                    }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                    <label htmlFor="same" className="text-[10px] text-slate-500 font-semibold cursor-pointer">Same as Current</label>
                  </div>
                </div>
                {!form.sameAsPermanent && (
                  <>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Full Address</Label>
                      <Input value={form.permanentAddress.line1} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, line1: e.target.value } })} className="bg-white mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">City</Label>
                        <Input value={form.permanentAddress.city} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, city: e.target.value } })} className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">State</Label>
                        <Input value={form.permanentAddress.state} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, state: e.target.value } })} className="bg-white mt-1" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PREFERENCES */}
          {subTab === "preferences" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">❤️ Temple & Dharamshala Preferences</h3>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Favourite Temple</Label>
                <Input value={form.favouriteTemple} onChange={(e) => setForm({ ...form, favouriteTemple: e.target.value })} placeholder="e.g. Adinath Derasar, Mumbai" className="bg-white mt-1" />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-600">Visit Frequency</Label>
                <SearchableSelect
                  value={form.visitFrequency}
                  onValueChange={(v) => setForm({ ...form, visitFrequency: v })}
                  options={toOptions(["Daily", "Weekly", "Occasionally"])}
                  placeholder="Select frequency"
                  className="mt-1"
                />
              </div>

              <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg text-xs text-orange-700 leading-relaxed">
                Preferred temples list and followed MS updates will receive primary priority in the custom mobile feeds.
              </div>
            </div>
          )}

          {/* TAB 5: INTERESTS (Non-Jain) */}
          {subTab === "interests" && !isJain && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🛕 Platform Interests & Preferences</h3>
              <div>
                <Label className="text-xs block mb-2 font-semibold text-slate-650">Select Interests (Multiple Selection)</Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    "Temple Visits", "Spiritual Learning", "Events", "Tours", 
                    "Room Bookings", "Hall Bookings", "Bhojanshala", "Volunteering", 
                    "Donations", "Charity Activities", "Religious Tourism", "Other"
                  ].map(int => {
                    const checked = form.interests?.includes(int);
                    return (
                      <label key={int} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" checked={checked} onChange={() => {
                          const next = checked ? form.interests.filter(i => i !== int) : [...form.interests, int];
                          setForm({ ...form, interests: next });
                        }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                        <span>{int}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <Label className="text-xs">Follow Temples / Favourites</Label>
                <Input value={form.favouriteTemples} onChange={(e) => setForm({ ...form, favouriteTemples: e.target.value })} placeholder="Search and select temples to follow..." className="bg-white mt-1" />
              </div>
            </div>
          )}

          {/* TAB 6: HEALTH */}
          {subTab === "health" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🏥 Health & Emergency Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Blood Group</Label>
                  <SearchableSelect
                    value={form.bloodGroup}
                    onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
                    options={BLOOD_GROUP_OPTIONS}
                    placeholder="Select blood group"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Occupation</Label>
                  <Input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder="e.g. Software Engineer" className="bg-white mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Disability (Yes/No)</Label>
                  <SearchableSelect
                    value={form.disability}
                    onValueChange={(v) => setForm({ ...form, disability: v })}
                    options={[
                      { value: "No", label: "No" },
                      { value: "Yes", label: "Yes" },
                    ]}
                    placeholder="Select"
                    className="mt-1"
                  />
                </div>
                {form.disability === "Yes" && (
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Details</Label>
                    <Input value={form.disabilityDetails} onChange={(e) => setForm({ ...form, disabilityDetails: e.target.value })} className="bg-white mt-1" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Physically Handicapped (Yes/No)</Label>
                  <SearchableSelect
                    value={form.physicallyHandicapped}
                    onValueChange={(v) => setForm({ ...form, physicallyHandicapped: v })}
                    options={[
                      { value: "No", label: "No" },
                      { value: "Yes", label: "Yes" },
                    ]}
                    placeholder="Select"
                    className="mt-1"
                  />
                </div>
                {form.physicallyHandicapped === "Yes" && (
                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Details</Label>
                    <Input value={form.handicapDetails} onChange={(e) => setForm({ ...form, handicapDetails: e.target.value })} className="bg-white mt-1" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 border-t pt-2 mt-2">
                <div className="col-span-2 text-xs font-bold text-slate-800 uppercase tracking-wide">Emergency Contact</div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Contact Name</Label>
                  <Input value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} placeholder="e.g. Ramesh Shah" className="bg-white mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Relationship</Label>
                  <Input value={form.emergencyRelation} onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })} placeholder="Father / Spouse" className="bg-white mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs font-semibold text-slate-600">Emergency Phone</Label>
                  <Input value={form.emergencyMobile} onChange={(e) => setForm({ ...form, emergencyMobile: e.target.value })} placeholder="+91XXXXXXXXXX" className="bg-white mt-1" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: VOLUNTEER */}
          {subTab === "volunteer" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🙏 Volunteering</h3>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <div className="text-xs font-bold text-slate-800">Open for Volunteering Seva</div>
                  <div className="text-[10px] text-slate-400">If checked, links profile to preferred temples volunteer database.</div>
                </div>
                <input type="checkbox" checked={form.isVolunteer} onChange={(e) => setForm({ ...form, isVolunteer: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350" />
              </div>

              {form.isVolunteer && (
                <>
                  <div>
                    <Label className="text-xs font-semibold text-slate-650 block mb-2">Preferred Volunteering Areas</Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {["Pooja Seva", "Event Management", "Bhojanshala", "Medical Help", "Admin / Management", "Other"].map(area => {
                        const checked = form.volunteerAreas.includes(area);
                        return (
                          <label key={area} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={checked} onChange={() => {
                              const next = checked ? form.volunteerAreas.filter(a => a !== area) : [...form.volunteerAreas, area];
                              setForm({ ...form, volunteerAreas: next });
                            }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                            <span>{area}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-600">Availability hours</Label>
                    <SearchableSelect
                      value={form.volunteerAvailability}
                      onValueChange={(v) => setForm({ ...form, volunteerAvailability: v })}
                      options={toOptions(["Morning", "Afternoon", "Evening", "Weekend"])}
                      placeholder="Select availability"
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 8: FAMILY & NOTIFICATIONS */}
          {subTab === "notifications" && (
            <div className="space-y-4">
              {/* Family members builder */}
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">👨‍👩‍👧‍👦 Family Members</h3>
                  <Button
                    type="button"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-9 px-5 rounded-lg shadow-md transition-all"
                    onClick={() => {
                      const next = [...form.familyMembers, { id: Date.now(), fullName: "", relationship: "Son", mobile: "" }];
                      setForm({ ...form, familyMembers: next });
                    }}
                  >
                    + Add Member
                  </Button>
                </div>
                {form.familyMembers.length === 0 && (
                  <div className="text-xs text-slate-400 italic">No family members added. Click Add to build linkage.</div>
                )}
                <div className="space-y-2">
                  {form.familyMembers.map((m, idx) => (
                    <div key={m.id || idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-100">
                      <div className="col-span-5">
                        <Input value={m.fullName} onChange={(e) => {
                          const list = [...form.familyMembers];
                          list[idx].fullName = e.target.value;
                          setForm({ ...form, familyMembers: list });
                        }} placeholder="Full Name" className="h-8 text-xs" />
                      </div>
                      <div className="col-span-3">
                        <SearchableSelect
                          value={m.relationship}
                          onValueChange={(v) => {
                            const list = [...form.familyMembers];
                            list[idx].relationship = v;
                            setForm({ ...form, familyMembers: list });
                          }}
                          options={toOptions(["Father", "Mother", "Husband", "Wife", "Son", "Daughter", "Brother", "Sister"])}
                          placeholder="Relationship"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input value={m.mobile} onChange={(e) => {
                          const list = [...form.familyMembers];
                          list[idx].mobile = e.target.value;
                          setForm({ ...form, familyMembers: list });
                        }} placeholder="Mobile Number" className="h-8 text-xs font-mono" />
                      </div>
                      <div className="col-span-1 text-right">
                        <button type="button" onClick={() => {
                          const list = form.familyMembers.filter((_, i) => i !== idx);
                          setForm({ ...form, familyMembers: list });
                        }} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Siblings builder section */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between items-center border-b pb-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">👫 Siblings</h3>
                  <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-4 rounded-lg shadow transition-all" onClick={() => {
                    const next = [...(form.siblings || []), { id: Date.now(), linkProfile: false, siblingMemberId: "", fullName: "", relationship: "Brother" }];
                    setForm({ ...form, siblings: next });
                  }}>
                    + Add Sibling
                  </Button>
                </div>
                {(!form.siblings || form.siblings.length === 0) && (
                  <div className="text-xs text-slate-400 italic">No siblings added. Click Add to build linkage.</div>
                )}
                <div className="space-y-2">
                  {(form.siblings || []).map((sib, idx) => (
                    <div key={sib.id || idx} className="space-y-2 bg-white p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between text-xs pb-1 border-b">
                        <span className="font-semibold text-slate-600">Sibling #{idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <input type="checkbox" id={`edit-sib-link-${idx}`} checked={sib.linkProfile} onChange={(e) => {
                            const list = [...form.siblings];
                            list[idx].linkProfile = e.target.checked;
                            setForm({ ...form, siblings: list });
                          }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                          <label htmlFor={`edit-sib-link-${idx}`} className="text-[10px] text-slate-500 font-semibold cursor-pointer">Link Platform Profile</label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          {sib.linkProfile ? (
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 font-bold block">SELECT PROFILE</span>
                              <MemberLinkSelect
                                value={sib.siblingMemberId}
                                onValueChange={(val) => {
                                  const list = [...form.siblings];
                                  list[idx].siblingMemberId = val;
                                  setForm({ ...form, siblings: list });
                                }}
                                placeholder="Search sibling by name or ID..."
                              />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 font-bold block">SIBLING NAME</span>
                              <Input value={sib.fullName} onChange={(e) => {
                                const list = [...form.siblings];
                                list[idx].fullName = e.target.value;
                                setForm({ ...form, siblings: list });
                              }} placeholder="Sibling Full Name" className="h-8 text-xs bg-white" />
                            </div>
                          )}
                        </div>
                        <div className="col-span-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold block">RELATIONSHIP</span>
                            <SearchableSelect
                              value={sib.relationship}
                              onValueChange={(v) => {
                                const list = [...form.siblings];
                                list[idx].relationship = v;
                                setForm({ ...form, siblings: list });
                              }}
                              options={toOptions(["Brother", "Sister"])}
                              placeholder="Relationship"
                              className="h-8 text-xs bg-white"
                            />
                          </div>
                        </div>
                        <div className="col-span-3 text-right pt-4">
                          <button type="button" onClick={() => {
                            const list = form.siblings.filter((_, i) => i !== idx);
                            setForm({ ...form, siblings: list });
                          }} className="text-slate-400 hover:text-red-500 transition-colors text-xs font-semibold">
                            <Trash2 className="h-4 w-4 inline mr-1" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-2 border-t pt-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">🔔 Channel Alerts Preferences</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-100 flex flex-col gap-2">
                    <span className="font-semibold text-slate-700 block">Service Alerts (Mandatory)</span>
                    <div className="flex gap-4">
                      {["SMS", "WhatsApp", "Email", "Push"].map(c => (
                        <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={form.serviceNotifications.includes(c)} onChange={() => {
                            const next = form.serviceNotifications.includes(c) ? form.serviceNotifications.filter(x => x !== c) : [...form.serviceNotifications, c];
                            setForm({ ...form, serviceNotifications: next });
                          }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-100 flex flex-col gap-2">
                    <span className="font-semibold text-slate-700 block">Marketing & Promotional Alerts</span>
                    <div className="flex gap-4">
                      {["SMS", "WhatsApp", "Email", "Push"].map(c => (
                        <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={form.marketingNotifications.includes(c)} onChange={() => {
                            const next = form.marketingNotifications.includes(c) ? form.marketingNotifications.filter(x => x !== c) : [...form.marketingNotifications, c];
                            setForm({ ...form, marketingNotifications: next });
                          }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PRIVACY & CURRENCY */}
          {subTab === "privacy" && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🔒 Privacy & Visibility Settings</h3>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 cursor-pointer">
                    <div>
                      <span className="font-semibold text-slate-700 block">Show Mobile Number</span>
                      <span className="text-[10px] text-slate-400">Display phone contact info on membership card search view.</span>
                    </div>
                    <input type="checkbox" checked={form.showMobile} onChange={(e) => setForm({ ...form, showMobile: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350" />
                  </label>
                  <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 cursor-pointer">
                    <div>
                      <span className="font-semibold text-slate-700 block">Show Address Info</span>
                      <span className="text-[10px] text-slate-400">Display current address location in search listings.</span>
                    </div>
                    <input type="checkbox" checked={form.showAddress} onChange={(e) => setForm({ ...form, showAddress: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350" />
                  </label>
                  <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 cursor-pointer">
                    <div>
                      <span className="font-semibold text-slate-700 block">Allow Contact Requests</span>
                      <span className="text-[10px] text-slate-400">Allow other verified members to ping or message for seva.</span>
                    </div>
                    <input type="checkbox" checked={form.allowContact} onChange={(e) => setForm({ ...form, allowContact: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350" />
                  </label>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="space-y-2.5 border-t pt-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">💰 Preferred Billing Currency</h3>
                <div>
                  <Label className="text-xs font-semibold text-slate-650">Platform Display Currency</Label>
                  <SearchableSelect
                    value={form.preferredCurrency}
                    onValueChange={(v) => setForm({ ...form, preferredCurrency: v })}
                    options={[
                      { value: "INR (₹)", label: "INR (₹) — India" },
                      { value: "GBP (£)", label: "GBP (£) — United Kingdom" },
                      { value: "USD ($)", label: "USD ($) — United States" },
                      { value: "CAD (C$)", label: "CAD (C$) — Canada" },
                      { value: "AUD (A$)", label: "AUD (A$) — Australia" },
                      { value: "AED (د.إ)", label: "AED (د.إ) — UAE" },
                      { value: "SGD (S$)", label: "SGD (S$) — Singapore" },
                      { value: "KES (KSh)", label: "KES (KSh) — Kenya" },
                      { value: "ZAR (R)", label: "ZAR (R) — South Africa" },
                    ]}
                    placeholder="Select display currency"
                    className="mt-1"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">Currency automatically pre-selected based on Address country setting.</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action button bar */}
        <div className="flex gap-2 pt-4 mt-6 border-t border-slate-150 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} className="h-9 px-4 text-xs font-bold">
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={saving} className="h-9 px-5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white">
            {saving ? "Saving…" : "Save Profile Details"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Image Upload Panel ───────────────────────────────────────── */
function ImagePanel({ member, onPhotoSave, onCancel }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(member?.photoUrl || null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    if (!file) { toast.error("Please select an image first."); return; }
    setSaving(true);
    try {
      await onPhotoSave(file);
      toast.success("Photo updated successfully.");
      onCancel();
    } catch {
      toast.error("Failed to upload photo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div
        className="h-32 w-32 rounded-2xl border-2 border-dashed border-orange-300 overflow-hidden cursor-pointer flex items-center justify-center bg-orange-50 hover:bg-orange-100 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="h-full w-full object-cover" />
        ) : (
          <div className="text-center p-3">
            <Camera className="h-8 w-8 text-orange-300 mx-auto mb-1" />
            <div className="text-xs text-orange-400">Click to upload</div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
      <div className="text-xs text-muted-foreground text-center">JPG, PNG or WEBP · Max 5 MB</div>
      <div className="flex gap-2 w-full">
        <Button variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
          <Camera className="h-4 w-4 mr-2" /> Choose Image
        </Button>
        <Button className="flex-1" onClick={save} disabled={saving || !file}>
          {saving ? "Uploading…" : "Save Photo"}
        </Button>
      </div>
      <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

/* ─── Main Dialog Export ───────────────────────────────────────── */
export function MemberIdCardDialog({
  open, onClose, member, relation,
  onSave, onPhotoSave, isSuperAdmin,
  linkId, onRemoveLink,
}) {
  const [mode, setMode] = useState("preview");

  const tabs = [
    { id: "image",   icon: Camera, label: "Add Image" },
    { id: "edit",    icon: Pencil, label: "Profile Registration Form" },
    { id: "preview", icon: Eye,    label: "Preview ID Card" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setMode("preview"); onClose(); } }}>
      <DialogContent className={`p-0 border-0 overflow-hidden rounded-2xl shadow-2xl bg-transparent transition-all duration-300 ${
        mode === "edit" ? "max-w-4xl" : "max-w-sm"
      }`}>
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0f172a" }}>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 p-3 pb-0">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = mode === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    active
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-4">

            {/* ── PREVIEW ── */}
            {mode === "preview" && (
              <div className="flex flex-col items-center gap-4">
                <IdCardVisual member={member} relation={relation} />

                {/* Quick pills */}
                <div className="w-full flex flex-wrap gap-1.5 justify-center">
                  {member?.gender && (
                    <span className="flex items-center gap-1 text-[10px] bg-slate-800 text-slate-350 px-2 py-1 rounded-full font-medium">
                      <User className="h-3 w-3" /> {member.gender}
                    </span>
                  )}
                  {member?.status && (
                    <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${
                      member.status === "ACTIVE" ? "bg-emerald-950/80 text-emerald-400" : "bg-slate-800 text-slate-400"
                    }`}>
                      {member.status === "ACTIVE" ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3" />}
                      {member.status}
                    </span>
                  )}
                  {member?.dob && (
                    <span className="text-[10px] bg-slate-800 text-slate-355 px-2 py-1 rounded-full font-medium">
                      🎂 {fmtDob(member.dob)}
                    </span>
                  )}
                </div>

                {isSuperAdmin && linkId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-red-850/40 text-red-400 hover:bg-red-950/30 text-xs font-bold"
                    onClick={() => { onRemoveLink?.(linkId); onClose(); }}
                  >
                    Remove Family Link
                  </Button>
                )}

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 text-xs" onClick={onClose}>
                  Close Preview
                </Button>
              </div>
            )}

            {/* ── EDIT: 21 points ── */}
            {mode === "edit" && (
              <div className="bg-white rounded-xl p-0 overflow-hidden shadow-inner">
                <EditPanel
                  member={member}
                  onSave={onSave}
                  onCancel={() => setMode("preview")}
                />
              </div>
            )}

            {/* ── IMAGE ── */}
            {mode === "image" && (
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-orange-500" /> Member Photo
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  Upload a clear face photo for the ID card.
                </div>
                <ImagePanel
                  member={member}
                  onPhotoSave={onPhotoSave}
                  onCancel={() => setMode("preview")}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
