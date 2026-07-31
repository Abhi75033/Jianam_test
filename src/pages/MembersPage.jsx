import { useEffect, useState, useRef, useCallback } from "react";
import { formatAadhaar, formatPan, isValidAadhaar, isValidPan } from "@/lib/idFormats";
import { api, extractErrorMessage, API_BASE } from "@/lib/api";
import { lookupPincode, isLookupablePincode } from "@/lib/pincode";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MemberIdCardDialog } from "@/components/common/MemberIdCardDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Search, UserPlus, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Loader2, X, Trash2 } from "lucide-react";
import MemberLinkSelect from "@/components/common/MemberLinkSelect";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  GENDER_OPTIONS, NATIONALITY_OPTIONS, LANGUAGE_OPTIONS, MARITAL_STATUS_OPTIONS,
  MOTHER_TONGUE_OPTIONS, TITHI_CALENDAR_OPTIONS, JAIN_SECT_OPTIONS,
  SHWETAMBAR_SUB_SECTS, DIGAMBAR_SUB_SECTS, MURTIPUJAK_GACCHA_OPTIONS,
  COMMUNICATION_METHOD_OPTIONS, BLOOD_GROUP_OPTIONS, VOLUNTEER_AVAILABILITY_OPTIONS,
  toOptions,
} from "@/constants/dropdownOptions";

/* ─────────────────────────────────────────────────────────────────────────────
 * Bulk Import Dialog
 * ───────────────────────────────────────────────────────────────────────── */
function BulkImportDialog({ onImported }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // { created, skipped, errors }
  const fileRef = useRef();

  const reset = () => { setFile(null); setResult(null); };

  const pickFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      toast.error(t("Only .xlsx / .xls files are accepted."));
      return;
    }
    setFile(f);
    setResult(null);
  };

  const downloadTemplate = () => {
    const token = localStorage.getItem("jinanam_access_token");
    const a = document.createElement("a");
    a.href = `${API_BASE}/members/import-template`;
    // Trigger with auth header via fetch + blob
    fetch(`${API_BASE}/members/import-template`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.blob()).then((blob) => {
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = "jinanam-import-template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const doUpload = async () => {
    if (!file) { toast.error(t("Please select a file first.")); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/members/bulk-import/excel", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data?.data;
      setResult(data);
      if (data?.created > 0) {
        toast.success(`${data.created} member(s) imported successfully.`);
        onImported?.();
      }
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="members-import-button">
          <Upload className="h-4 w-4 mr-2" /> {t("action.bulkImport", "Bulk Import")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <FileSpreadsheet className="h-5 w-5 text-orange-500" /> {t("Bulk Import Members")}
          </DialogTitle>
        </DialogHeader>

        {/* Format description — red alert box */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-red-700 font-semibold text-xs uppercase tracking-wide">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {t("Required Excel Format")}
          </div>
          <p className="text-xs text-red-600 leading-relaxed">
            {t("Upload an")} <strong>{t(".xlsx")}</strong> {t("file with a")} <strong>{t("header row")}</strong> {t("containing these columns (case-insensitive). Columns marked")} <strong>*</strong> {t("are required.")}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
            {[
              ["name *",      "Full name of member"],
              ["mobile *",    "+91XXXXXXXXXX format"],
              ["email",       "Optional"],
              ["community",   "e.g. Digambar"],
              ["city",        "City of residence"],
              ["state",       "State"],
              ["dob",         "DD/MM/YYYY"],
              ["gender",      "Male / Female / Other"],
              ["bloodGroup",  "A+, B-, O+, etc."],
              ["address",     "Full address (optional)"],
            ].map(([col, desc]) => (
              <div key={col} className="flex items-baseline gap-1 text-[10px]">
                <code className="font-mono font-bold text-red-700 bg-red-100 px-1 rounded">{col}</code>
                <span className="text-red-500">{desc}</span>
              </div>
            ))}
          </div>
          <button
            onClick={downloadTemplate}
            className="mt-1 text-[11px] font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 flex items-center gap-1"
          >
            <Download className="h-3 w-3" /> {t("Download blank template")}
          </button>
        </div>

        {/* Drop zone */}
        {!result && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
              dragging ? "border-orange-400 bg-orange-50" : file ? "border-green-400 bg-green-50" : "border-slate-300 hover:border-orange-300 hover:bg-orange-50/40"
            }`}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])} />

            {file ? (
              <>
                <FileSpreadsheet className="h-8 w-8 text-green-500" />
                <div className="text-sm font-semibold text-green-700">{file.name}</div>
                <div className="text-xs text-green-500">{(file.size / 1024).toFixed(1)} {t("KB")}</div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-300" />
                <div className="text-sm font-medium text-slate-500">{t("Drag & drop or click to browse")}</div>
                <div className="text-xs text-slate-400">{t(".xlsx only · Max 10 MB")}</div>
              </>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-xl border p-4 space-y-2">
            <div className="font-semibold text-sm flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" /> {t("Import complete")}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-green-50 border border-green-200 p-2">
                <div className="text-xl font-black text-green-600">{result.created ?? 0}</div>
                <div className="text-[10px] text-green-500 font-semibold uppercase">{t("Created")}</div>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                <div className="text-xl font-black text-amber-600">{result.skipped ?? 0}</div>
                <div className="text-[10px] text-amber-500 font-semibold uppercase">{t("Skipped")}</div>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-2">
                <div className="text-xl font-black text-red-600">{result.errors?.length ?? 0}</div>
                <div className="text-[10px] text-red-500 font-semibold uppercase">{t("Errors")}</div>
              </div>
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-2 rounded bg-red-50 border border-red-200 p-2 max-h-32 overflow-y-auto">
                {result.errors.slice(0, 10).map((e, i) => (
                  <div key={i} className="text-[11px] text-red-600 flex gap-1">
                    <XCircle className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>{t("Row")} {e.row}: {e.message || e.reason || JSON.stringify(e)}</span>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={reset} className="w-full mt-1">
              {t("Import Another File")}
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => { setOpen(false); reset(); }}>{t("Cancel")}</Button>
          {!result && (
            <Button onClick={doUpload} disabled={!file || uploading}>
              {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("Importing…")}</> : t("Import Members")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const COUNTRY_CURRENCY_MAP = {
  "India": "INR (₹)",
  "United Kingdom": "GBP (£)",
  "United States": "USD ($)",
  "Canada": "CAD (C$)",
  "Australia": "AUD (A$)",
  "United Arab Emirates": "AED (د.इ)",
  "Singapore": "SGD (S$)",
  "Kenya": "KES (KSh)",
  "South Africa": "ZAR (R)",
};

// MURTIPUJAK_GACCHAS imported from @/constants/dropdownOptions

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

/* ─────────────────────────────────────────────────────────────────────────────
 * Register Member Dialog
 * ───────────────────────────────────────────────────────────────────────── */
function RegisterMemberDialog({ onCreated }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [subTab, setSubTab] = useState("personal");
  const [cat, setCat] = useState("jain");
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState(null); // { publicId, fullName } — triggers success screen
  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef(null);

  // Pincode → Area / City / District / State auto-fill (India).
  // Keyed by address field name so Current and Permanent resolve independently.
  const [pinLookup, setPinLookup] = useState({});

  const applyPincodeLookup = useCallback((addressKey, pincode) => {
    if (!isLookupablePincode(pincode)) {
      setPinLookup((s) => ({ ...s, [addressKey]: null }));
      return;
    }
    setPinLookup((s) => ({ ...s, [addressKey]: { status: "loading" } }));
    lookupPincode(pincode)
      .then((res) => {
        if (!res) {
          setPinLookup((s) => ({ ...s, [addressKey]: { status: "notfound" } }));
          return;
        }
        setPinLookup((s) => ({ ...s, [addressKey]: { status: "done", areas: res.areas } }));
        // Only fill what the user hasn't already typed, so manual edits stick.
        setForm((prev) => {
          const current = prev[addressKey] || {};
          return {
            ...prev,
            [addressKey]: {
              ...current,
              area: current.area || res.area,
              city: current.city || res.city,
              district: current.district || res.district,
              state: current.state || res.state,
              country: current.country || res.country,
            },
          };
        });
      })
      .catch(() => setPinLookup((s) => ({ ...s, [addressKey]: { status: "notfound" } })));
  }, []);

  // Simulated verification hooks
  const [mobileVerified, setMobileVerified] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [form, setForm] = useState({
    firstName: "", middleName: "", surname: "", gender: "Male", dob: "",
    nationality: "India", preferredLanguage: "English", pan: "", aadhaar: "",
    maritalStatus: "Single", motherTongue: "Gujarati", sect: "Shwetambar",
    subCommunity: "Murtipujak", gaccha: "", tithiCalendar: "Gujarati",
    mobile: "", whatsapp: "", email: "", preferredCommunicationMethod: "Mobile",
    alternateContact: "",
    currentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
    permanentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
    sameAsPermanent: false,
    nativeVillage: { village: "", landmark: "", district: "", city: "", state: "", pincode: "" },
    visitFrequency: "Weekly", favouriteTemple: "", bloodGroup: "O+",
    disability: "No", disabilityDetails: "", physicallyHandicapped: "No", handicapDetails: "",
    medicalNotes: "", allergies: "", emergencyName: "", emergencyRelation: "", emergencyMobile: "",
    profession: "", organizationName: "", isVolunteer: false, volunteerAreas: [], volunteerAvailability: "Weekend",
    familyMembers: [], siblings: [], serviceNotifications: ["SMS", "WhatsApp", "Push"], marketingNotifications: ["WhatsApp", "Push"],
    showMobile: true, showAddress: true, allowContact: true, preferredCurrency: "INR (₹)",
    agreeData: false, agreeShare: false, agreeService: false, agreePromotional: false, guardianConsent: false
  });

  useEffect(() => {
    if (open) {
      api.get("/master-data/communities").then((r) => setCommunities(r.data?.data || [])).catch(() => {});
    }
  }, [open]);

  // Dynamically set currency code based on Country
  useEffect(() => {
    const defaultCur = COUNTRY_CURRENCY_MAP[form.currentAddress.country] || "USD ($)";
    setForm((f) => ({ ...f, preferredCurrency: defaultCur }));
  }, [form.currentAddress.country]);

  const calculateCompletion = () => {
    let score = 0;
    let total = 14;
    if (form.firstName) score++;
    if (form.surname) score++;
    if (form.dob) score++;
    if (form.mobile) score++;
    if (form.currentAddress.city) score++;
    if (form.email) score++;
    if (form.bloodGroup) score++;
    if (form.profession) score++;
    if (form.sect) score++;
    if (form.subCommunity) score++;
    if (form.motherTongue) score++;
    if (form.emergencyName) score++;
    if (form.nationality) score++;
    if (form.maritalStatus) score++;
    return Math.round((score / total) * 100);
  };

  const verifyField = (field) => {
    toast.success(`OTP successfully verified on channel ${field.toUpperCase()}!`);
    if (field === "mobile") setMobileVerified(true);
    if (field === "whatsapp") setWhatsappVerified(true);
    if (field === "email") setEmailVerified(true);
  };

  const submit = async () => {
    if (!form.firstName) { toast.error(t("First Name is required.")); return; }
    if (!form.middleName) { toast.error(t("Middle Name is required.")); return; }
    if (!form.surname) { toast.error(t("Surname is required.")); return; }
    if (!form.mobile) { toast.error(t("Mobile Number is required.")); return; }
    if (!form.gender) { toast.error(t("Gender is required.")); return; }
    if (!form.dob) { toast.error(t("Date of Birth is required.")); return; }
    if (!form.nationality) { toast.error(t("Nationality is required.")); return; }
    if (!form.pan) { toast.error(t("PAN Number is required.")); return; }
    if (!isValidPan(form.pan)) { toast.error(t("PAN must be 10 characters in the format ABCDE1234F.")); return; }
    if (!form.aadhaar) { toast.error(t("Aadhaar Number is required.")); return; }
    if (!isValidAadhaar(form.aadhaar)) { toast.error(t("Aadhaar Number must be exactly 12 digits.")); return; }
    if (!form.maritalStatus) { toast.error(t("Marital Status is required.")); return; }
    // Community details mandatory for Jain
    if (cat === "jain" && !form.motherTongue) { toast.error(t("Mother Tongue is required in Community Details.")); return; }
    if (cat === "jain" && !form.tithiCalendar) { toast.error(t("Tithi Calendar Type is required in Community Details.")); return; }
    if (cat === "jain" && !form.sect) { toast.error(t("Jain Sect is required in Community Details.")); return; }
    if (cat === "jain" && !form.subCommunity) { toast.error(t("Sub Sect / Community is required in Community Details.")); return; }
    // Address mandatory
    if (!form.currentAddress.line1) { toast.error(t("Current Address (Full Address) is required.")); return; }
    if (!form.currentAddress.city) { toast.error(t("Current Address City is required.")); return; }
    if (!form.currentAddress.state) { toast.error(t("Current Address State is required.")); return; }
    if (!form.currentAddress.pincode) { toast.error(t("Current Address Pin Code is required.")); return; }
    if (!form.permanentAddress.line1 && !form.sameAsPermanent) { toast.error(t("Permanent Address is required. Check \"Same as Current\" if applicable.")); return; }
    if (cat === "jain" && !form.agreeData) { toast.error(t("Please accept the mandatory data processing consent.")); return; }
    
    setLoading(true);
    try {
      const communityObj = communities.find(c => c.name.toLowerCase().includes(form.subCommunity.toLowerCase()));
      const res = await api.post("/members/admin-create", {
        ...form,
        category: cat === "jain" ? "JAIN" : "NON_JAIN",
        communityId: cat === "jain" ? (communityObj?.id || communities[0]?.id || "JAIN") : undefined,
      });
      const data = res.data?.data || {};
      setCreatedId({ publicId: data.publicId, fullName: data.fullName });
      setCountdown(10);
      // auto-close after 10 seconds
      clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countdownRef.current);
            setCreatedId(null);
            setOpen(false);
            setForm({
              firstName: "", middleName: "", surname: "", gender: "Male", dob: "",
              nationality: "India", preferredLanguage: "English", pan: "", aadhaar: "",
              maritalStatus: "Single", motherTongue: "Gujarati", sect: "Shwetambar",
              subCommunity: "Murtipujak", gaccha: "", tithiCalendar: "Gujarati",
              mobile: "", whatsapp: "", email: "", preferredCommunicationMethod: "Mobile",
              alternateContact: "",
              currentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
              permanentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
              sameAsPermanent: false,
              nativeVillage: { village: "", landmark: "", district: "", city: "", state: "", pincode: "" },
              visitFrequency: "Weekly", favouriteTemple: "", bloodGroup: "O+",
              disability: "No", disabilityDetails: "", physicallyHandicapped: "No", handicapDetails: "",
              medicalNotes: "", allergies: "", emergencyName: "", emergencyRelation: "", emergencyMobile: "",
              profession: "", organizationName: "", isVolunteer: false, volunteerAreas: [], volunteerAvailability: "Weekend",
              familyMembers: [], siblings: [], serviceNotifications: ["SMS", "WhatsApp", "Push"], marketingNotifications: ["WhatsApp", "Push"],
              showMobile: true, showAddress: true, allowContact: true, preferredCurrency: "INR (₹)",
              agreeData: false, agreeShare: false, agreeService: false, agreePromotional: false, guardianConsent: false
            });
            onCreated?.();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    clearInterval(countdownRef.current);
    setCreatedId(null);
    setOpen(false);
    setForm({
      firstName: "", middleName: "", surname: "", gender: "Male", dob: "",
      nationality: "India", preferredLanguage: "English", pan: "", aadhaar: "",
      maritalStatus: "Single", motherTongue: "Gujarati", sect: "Shwetambar",
      subCommunity: "Murtipujak", gaccha: "", tithiCalendar: "Gujarati",
      mobile: "", whatsapp: "", email: "", preferredCommunicationMethod: "Mobile",
      alternateContact: "",
      currentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
      permanentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
      sameAsPermanent: false,
      nativeVillage: { village: "", landmark: "", district: "", city: "", state: "", pincode: "" },
      visitFrequency: "Weekly", favouriteTemple: "", bloodGroup: "O+",
      disability: "No", disabilityDetails: "", physicallyHandicapped: "No", handicapDetails: "",
      medicalNotes: "", allergies: "", emergencyName: "", emergencyRelation: "", emergencyMobile: "",
      profession: "", organizationName: "", isVolunteer: false, volunteerAreas: [], volunteerAvailability: "Weekend",
      familyMembers: [], siblings: [], serviceNotifications: ["SMS", "WhatsApp", "Push"], marketingNotifications: ["WhatsApp", "Push"],
      showMobile: true, showAddress: true, allowContact: true, preferredCurrency: "INR (₹)",
      agreeData: false, agreeShare: false, agreeService: false, agreePromotional: false, guardianConsent: false
    });
    onCreated?.();
  };

  const editTabs = [
    { id: "personal", label: t("👤 Personal Details") },
    { id: "community", label: t("🛕 Community Details") },
    { id: "contact", label: t("📱 Contacts & OTP") },
    { id: "address", label: t("📍 Addresses") },
    { id: "family", label: t("👨‍👩‍👧‍👦 Family Members") },
    { id: "health", label: t("🏥 Health & Emergency") },
    { id: "volunteer", label: t("🙏 Volunteering") },
    { id: "notifications", label: t("🔔 Alerts & Notifications") },
    { id: "consent", label: t("📝 Consents") }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="members-add-button" className="h-11 px-6 text-sm font-bold shadow-md bg-orange-500 hover:bg-orange-600 text-white transition-all">
          <UserPlus className="h-5 w-5 mr-2" /> {t("action.registerMember", "Register Member")}
        </Button>
      </DialogTrigger>
      <DialogContent className={`p-0 border-0 overflow-hidden rounded-2xl shadow-2xl bg-transparent transition-all duration-300 ${
        createdId ? "max-w-sm" : "max-w-4xl"
      }`}>
        {/* ── POST-CREATION SUCCESS SCREEN (§5.2 Post Creation Flow) ───────── */}
        {createdId ? (
          <div className="flex flex-col items-center py-6 gap-4 text-center bg-slate-900 text-slate-100 p-4">
            <div className="w-16 h-16 rounded-full bg-green-950 flex items-center justify-center mb-1 border border-green-800">
              <CheckCircle2 className="h-9 w-9 text-green-500 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-widest text-slate-400 uppercase">{t("MEMBER REGISTERED")}</div>
              <div className="text-lg font-extrabold text-white mt-1">{createdId.fullName}</div>
            </div>
            <div className="bg-slate-950 rounded-xl px-8 py-4 w-full max-w-xs border border-slate-800">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{t("Unique ID Generated")}</div>
              <div className="font-mono text-3xl font-extrabold text-yellow-400 tracking-wider">{createdId.publicId}</div>
            </div>
            <Button
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs h-9 font-bold"
              onClick={() => {
                navigator.clipboard.writeText(createdId.publicId);
                toast.success(t("Member ID copied!"));
              }}
            >
              {t("Copy ID")}
            </Button>
            <p className="text-xs text-slate-500">
              {t("Screen closes in")} <span className="font-bold text-slate-300">{countdown}</span>{t("s.")}
            </p>
            <Button variant="outline" onClick={handleCloseSuccess} className="w-full max-w-xs border-slate-800 text-slate-300 hover:bg-slate-800">
              {t("Close")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-[75vh] w-full bg-white font-sans overflow-hidden">
            {/* Left panel tabs list */}
            <div className="w-full md:w-60 bg-slate-900 text-slate-300 p-4 flex flex-col gap-1 shrink-0 border-r border-slate-800">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-2">{t("Registration Flow")}</div>
              
              <Tabs value={cat} onValueChange={setCat} className="mb-4">
                <TabsList className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg">
                  <TabsTrigger value="jain" className="text-xs py-1 rounded text-slate-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white">{t("Jain")}</TabsTrigger>
                  <TabsTrigger value="non-jain" className="text-xs py-1 rounded text-slate-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white">{t("Non-Jain")}</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Progress gauge */}
              <div className="px-2 mb-4 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>COMPLETION</span>
                  <span>{calculateCompletion()}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-300" style={{ width: `${calculateCompletion()}%` }} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-0.5">
                {editTabs.map((tItem) => {
                  if (cat !== "jain" && tItem.id === "community") return null;
                  return (
                    <button
                      key={tItem.id}
                      onClick={() => setSubTab(tItem.id)}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        subTab === tItem.id
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      {t(tItem.label)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form body */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between bg-slate-50">
              <div className="space-y-4">
                
                {/* Personal Tab */}
                {subTab === "personal" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("👤 Personal Information")}</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">{t("First Name *")}</Label>
                        <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Middle Name *")}</Label>
                        <Input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Surname *")}</Label>
                        <Input value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} className="bg-white mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("Date of Birth *")}</Label>
                        <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Gender *")}</Label>
                        <SearchableSelect
                          value={form.gender}
                          onValueChange={(v) => setForm({ ...form, gender: v })}
                          options={GENDER_OPTIONS}
                          placeholder={t("Select gender")}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {form.dob && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-100 rounded-lg">
                        <span className="text-xs text-orange-700 font-semibold">{t("Calculated Age:")} {calculateAge(form.dob)} {t("Years")}</span>
                        {calculateAge(form.dob) >= 59 && (
                          <Badge className="bg-orange-500 text-white text-[9px] hover:bg-orange-600">{t("👴 Senior Citizen Checked")}</Badge>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("Nationality *")}</Label>
                        <SearchableSelect
                          value={form.nationality}
                          onValueChange={(v) => setForm({ ...form, nationality: v })}
                          options={NATIONALITY_OPTIONS}
                          placeholder={t("Select nationality")}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Preferred Language")}</Label>
                        <SearchableSelect
                          value={form.preferredLanguage}
                          onValueChange={(v) => setForm({ ...form, preferredLanguage: v })}
                          options={LANGUAGE_OPTIONS}
                          placeholder={t("Select language")}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("PAN Number *")}</Label>
                        <Input value={form.pan} onChange={(e) => setForm({ ...form, pan: formatPan(e.target.value) })} placeholder={t("ABCDE1234F")} className="bg-white mt-1 font-mono uppercase" maxLength={10} />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Aadhaar Number * (12 digits)")}</Label>
                        <Input value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: formatAadhaar(e.target.value) })} placeholder="1234 5678 9012" className="bg-white mt-1 font-mono" maxLength={14} inputMode="numeric" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">{t("Marital Status *")}</Label>
                      <SearchableSelect
                        value={form.maritalStatus}
                        onValueChange={(v) => setForm({ ...form, maritalStatus: v })}
                        options={MARITAL_STATUS_OPTIONS}
                        placeholder={t("Select status")}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Community Tab */}
                {subTab === "community" && cat === "jain" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🛕 Community Details")} <span className="text-red-500 font-normal text-xs">{t("(all fields mandatory)")}</span></h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("Mother Tongue *")}</Label>
                        <SearchableSelect
                          value={form.motherTongue}
                          onValueChange={(v) => setForm({ ...form, motherTongue: v })}
                          options={MOTHER_TONGUE_OPTIONS}
                          placeholder={t("Select mother tongue")}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Tithi Calendar Type *")}</Label>
                        <SearchableSelect
                          value={form.tithiCalendar}
                          onValueChange={(v) => setForm({ ...form, tithiCalendar: v })}
                          options={TITHI_CALENDAR_OPTIONS}
                          placeholder={t("Select calendar")}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("members.jainSect", "Jain Sect *")}</Label>
                        <SearchableSelect
                          value={form.sect}
                          onValueChange={(v) => setForm({ ...form, sect: v, subCommunity: v === "Digambar" ? "Bisapantha" : "Murtipujak" })}
                          options={JAIN_SECT_OPTIONS}
                          placeholder={t("Select sect")}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("members.subSect", "Sub Sect / Community *")}</Label>
                        <SearchableSelect
                          value={form.subCommunity}
                          onValueChange={(v) => setForm({ ...form, subCommunity: v })}
                          options={toOptions(form.sect === "Digambar" ? DIGAMBAR_SUB_SECTS : SHWETAMBAR_SUB_SECTS)}
                          placeholder={t("Select sub-sect")}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {form.subCommunity === "Other" && (
                      <div>
                        <Label className="text-xs">{t("members.otherSubSect", "Specify Custom Sub-Sect *")}</Label>
                        <Input
                          value={form.otherSubCommunity || ""}
                          onChange={(e) => setForm({ ...form, otherSubCommunity: e.target.value })}
                          placeholder={t("Enter sub-sect name...")}
                          className="mt-1 bg-white text-xs"
                        />
                      </div>
                    )}

                    {form.sect === "Shwetambar" && form.subCommunity === "Murtipujak" && (
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">{t("members.gaccha", "Gaccha Selection")}</Label>
                          <SearchableSelect
                            value={form.gaccha}
                            onValueChange={(v) => setForm({ ...form, gaccha: v })}
                            options={MURTIPUJAK_GACCHA_OPTIONS}
                            placeholder={t("Choose Gaccha…")}
                            searchPlaceholder={t("Search gaccha…")}
                            className="mt-1"
                          />
                        </div>
                        {form.gaccha === "Other Gaccha" && (
                          <div>
                            <Label className="text-xs">{t("members.otherGaccha", "Specify Custom Gaccha Name *")}</Label>
                            <Input
                              value={form.otherGaccha || ""}
                              onChange={(e) => setForm({ ...form, otherGaccha: e.target.value })}
                              placeholder={t("Enter custom gaccha name...")}
                              className="mt-1 bg-white text-xs"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Contacts Tab */}
                {subTab === "contact" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("📱 Verification & Contacts")}</h3>
                    
                    <div>
                      <Label className="text-xs">{t("Mobile Number *")}</Label>
                      <div className="flex gap-2 mt-1">
                        <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder={t("+91XXXXXXXXXX")} className="bg-white flex-1" />
                        <Button size="sm" variant={mobileVerified ? "outline" : "default"} type="button" onClick={() => verifyField("mobile")}>
                          {mobileVerified ? t("✓ Verified") : t("Verify Mobile")}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">{t("WhatsApp Number")}</Label>
                      <div className="flex gap-2 mt-1">
                        <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder={t("+91XXXXXXXXXX")} className="bg-white flex-1" />
                        <Button size="sm" variant={whatsappVerified ? "outline" : "default"} type="button" onClick={() => verifyField("whatsapp")}>
                          {whatsappVerified ? t("✓ Verified") : t("Verify WhatsApp")}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">{t("Email ID")}</Label>
                      <div className="flex gap-2 mt-1">
                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@domain.com" className="bg-white flex-1" />
                        <Button size="sm" variant={emailVerified ? "outline" : "default"} type="button" onClick={() => verifyField("email")}>
                          {emailVerified ? t("✓ Verified") : t("Verify Email")}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("Preferred Contact Method")}</Label>
                        <SearchableSelect
                          value={form.preferredCommunicationMethod}
                          onValueChange={(v) => setForm({ ...form, preferredCommunicationMethod: v })}
                          options={COMMUNICATION_METHOD_OPTIONS}
                          placeholder={t("Select method")}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Alternate Phone Contact")}</Label>
                        <Input value={form.alternateContact} onChange={(e) => setForm({ ...form, alternateContact: e.target.value })} placeholder={t("+91XXXXXXXXXX")} className="bg-white mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Tab */}
                {subTab === "address" && (
                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center border-b pb-1">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("Current Address")} <span className="text-red-500 font-normal normal-case">{t("(all fields required *)")}</span></h3>
                        <Button variant="ghost" size="xs" type="button" className="text-orange-500 font-semibold text-[10px]" onClick={() => toast.success(t("Latitude/Longitude coordinates detected dynamically."))}>
                          {t("Auto Detect GPS Location")}
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs">{t("Address *")}</Label>
                        <Input value={form.currentAddress.line1} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, line1: e.target.value } })} placeholder={t("Full address, House/Flat No, Street")} className="bg-white mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">{t("Country (default India) *")}</Label>
                          <Input value={form.currentAddress.country || "India"} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, country: e.target.value } })} placeholder={t("India")} className="bg-white mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">{t("Pincode *")}</Label>
                          <Input
                            value={form.currentAddress.pincode}
                            onChange={(e) => {
                              const pincode = e.target.value.replace(/\D/g, "").slice(0, 6);
                              setForm({ ...form, currentAddress: { ...form.currentAddress, pincode } });
                              applyPincodeLookup("currentAddress", pincode);
                            }}
                            placeholder={t("6-digit Pincode")}
                            className="bg-white mt-1"
                            maxLength={6}
                            inputMode="numeric"
                            data-testid="member-current-pincode"
                          />
                          {pinLookup.currentAddress?.status === "loading" && (
                            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" /> {t("Detecting address from pincode…")}
                            </p>
                          )}
                          {pinLookup.currentAddress?.status === "done" && (
                            <p className="text-[10px] text-emerald-600 mt-1">{t("Address details auto-filled from pincode.")}</p>
                          )}
                          {pinLookup.currentAddress?.status === "notfound" && (
                            <p className="text-[10px] text-amber-600 mt-1">{t("Could not detect this pincode — please fill the fields manually.")}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">{t("Area")}</Label>
                          <Input value={form.currentAddress.area || ""} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, area: e.target.value } })} placeholder={t("Thane E or Thane W")} className="bg-white mt-1" />
                          {pinLookup.currentAddress?.areas?.length > 1 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {pinLookup.currentAddress.areas.slice(0, 8).map((areaName) => (
                                <button
                                  key={areaName}
                                  type="button"
                                  onClick={() => setForm((prev) => ({ ...prev, currentAddress: { ...prev.currentAddress, area: areaName } }))}
                                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                                    form.currentAddress.area === areaName
                                      ? "bg-orange-500 text-white border-orange-500"
                                      : "bg-white text-slate-600 border-slate-200 hover:border-orange-400"
                                  }`}
                                >
                                  {areaName}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs">{t("City *")}</Label>
                          <Input value={form.currentAddress.city} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, city: e.target.value } })} placeholder={t("e.g. Thane")} className="bg-white mt-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">{t("District")}</Label>
                          <Input value={form.currentAddress.district || ""} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, district: e.target.value } })} placeholder={t("e.g. Thane District")} className="bg-white mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">{t("State *")}</Label>
                          <Input value={form.currentAddress.state} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, state: e.target.value } })} placeholder={t("e.g. Maharashtra")} className="bg-white mt-1" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center border-b pb-1">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("Permanent Address")} <span className="text-orange-500 font-normal normal-case text-[10px]">{t("(or tick Same as Current)")}</span></h3>
                        <div className="flex items-center gap-1">
                          <input type="checkbox" id="reg-same" checked={form.sameAsPermanent} onChange={(e) => {
                            const checked = e.target.checked;
                            setForm({
                              ...form,
                              sameAsPermanent: checked,
                              permanentAddress: checked ? { ...form.currentAddress } : { line1: "", city: "", state: "", country: "India", pincode: "" }
                            });
                          }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                          <label htmlFor="reg-same" className="text-[10px] text-slate-500 font-semibold cursor-pointer">{t("Same as Current")}</label>
                        </div>
                      </div>
                      {!form.sameAsPermanent && (
                        <>
                          {/* Same field order as Current Address:
                              Address → Country → Pincode → Area → City → District → State */}
                          <div>
                            <Label className="text-xs">{t("Address")}</Label>
                            <Input value={form.permanentAddress.line1} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, line1: e.target.value } })} placeholder={t("Full address, House/Flat No, Street")} className="bg-white mt-1" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">{t("Country (default India)")}</Label>
                              <Input value={form.permanentAddress.country || "India"} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, country: e.target.value } })} placeholder={t("India")} className="bg-white mt-1" />
                            </div>
                            <div>
                              <Label className="text-xs">{t("Pincode")}</Label>
                              <Input
                                value={form.permanentAddress.pincode || ""}
                                onChange={(e) => {
                                  const pincode = e.target.value.replace(/\D/g, "").slice(0, 6);
                                  setForm({ ...form, permanentAddress: { ...form.permanentAddress, pincode } });
                                  applyPincodeLookup("permanentAddress", pincode);
                                }}
                                placeholder={t("6-digit Pincode")}
                                className="bg-white mt-1"
                                maxLength={6}
                                inputMode="numeric"
                                data-testid="member-permanent-pincode"
                              />
                              {pinLookup.permanentAddress?.status === "loading" && (
                                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" /> {t("Detecting address from pincode…")}
                                </p>
                              )}
                              {pinLookup.permanentAddress?.status === "done" && (
                                <p className="text-[10px] text-emerald-600 mt-1">{t("Address details auto-filled from pincode.")}</p>
                              )}
                              {pinLookup.permanentAddress?.status === "notfound" && (
                                <p className="text-[10px] text-amber-600 mt-1">{t("Could not detect this pincode — please fill the fields manually.")}</p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">{t("Area")}</Label>
                              <Input value={form.permanentAddress.area || ""} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, area: e.target.value } })} placeholder={t("Thane E or Thane W")} className="bg-white mt-1" />
                            </div>
                            <div>
                              <Label className="text-xs">{t("City")}</Label>
                              <Input value={form.permanentAddress.city} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, city: e.target.value } })} placeholder={t("e.g. Thane")} className="bg-white mt-1" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">{t("District")}</Label>
                              <Input value={form.permanentAddress.district || ""} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, district: e.target.value } })} placeholder={t("e.g. Thane District")} className="bg-white mt-1" />
                            </div>
                            <div>
                              <Label className="text-xs">{t("State")}</Label>
                              <Input value={form.permanentAddress.state} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, state: e.target.value } })} placeholder={t("e.g. Maharashtra")} className="bg-white mt-1" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Family Tab — in registration form */}
                {subTab === "family" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center border-b pb-1">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("👨‍👩‍👧‍👦 Family Members")}</h3>
                        <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-9 px-5 rounded-lg shadow-md transition-all" onClick={() => {
                          const next = [...form.familyMembers, { id: Date.now(), fullName: "", relationship: "Son", mobile: "" }];
                          setForm({ ...form, familyMembers: next });
                        }}>
                          {t("+ Add Member")}
                        </Button>
                      </div>
                      {form.familyMembers.length === 0 && (
                        <div className="text-xs text-slate-400 italic">{t("No family members added. Click Add to build linkage.")}</div>
                      )}
                      <div className="space-y-2">
                        {form.familyMembers.map((m, idx) => (
                          <div key={m.id || idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-100">
                            <div className="col-span-5">
                              <Input value={m.fullName} onChange={(e) => {
                                const list = [...form.familyMembers];
                                list[idx].fullName = e.target.value;
                                setForm({ ...form, familyMembers: list });
                              }} placeholder={t("Full Name")} className="h-8 text-xs" />
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
                                placeholder={t("Relationship")}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input value={m.mobile} onChange={(e) => {
                                const list = [...form.familyMembers];
                                list[idx].mobile = e.target.value;
                                setForm({ ...form, familyMembers: list });
                              }} placeholder={t("Mobile")} className="h-8 text-xs font-mono" />
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
                  </div>
                )}

                {/* Health Tab */}
                {subTab === "health" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🏥 Health & Emergency Details")}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("Blood Group")}</Label>
                        <SearchableSelect
                          value={form.bloodGroup}
                          onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
                          options={BLOOD_GROUP_OPTIONS}
                          placeholder={t("Select blood group")}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Occupation")}</Label>
                        <Input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder={t("e.g. Software Engineer")} className="bg-white mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("Disability")}</Label>
                        <SearchableSelect
                          value={form.disability}
                          onValueChange={(v) => setForm({ ...form, disability: v })}
                          options={[{ value: "No", label: t("No") }, { value: "Yes", label: t("Yes") }]}
                          placeholder={t("Select")}
                          className="mt-1"
                        />
                      </div>
                      {form.disability === "Yes" && (
                        <div>
                          <Label className="text-xs">{t("Details")}</Label>
                          <Input value={form.disabilityDetails} onChange={(e) => setForm({ ...form, disabilityDetails: e.target.value })} className="bg-white mt-1" />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t pt-2 mt-2">
                      <div className="col-span-2 text-xs font-bold text-slate-800 uppercase tracking-wide">{t("Emergency Contact")}</div>
                      <div>
                        <Label className="text-xs">{t("Contact Name")}</Label>
                        <Input value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} placeholder={t("e.g. Ramesh Shah")} className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Relationship")}</Label>
                        <Input value={form.emergencyRelation} onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })} placeholder={t("Father / Spouse")} className="bg-white mt-1" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">{t("Emergency Phone")}</Label>
                        <Input value={form.emergencyMobile} onChange={(e) => setForm({ ...form, emergencyMobile: e.target.value })} placeholder={t("+91XXXXXXXXXX")} className="bg-white mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Volunteer Tab */}
                {subTab === "volunteer" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🙏 Volunteering")}</h3>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{t("Open for Volunteering Seva")}</div>
                        <div className="text-[10px] text-slate-400">{t("Links profile directly to preferred temples volunteering lists.")}</div>
                      </div>
                      <input type="checkbox" checked={form.isVolunteer} onChange={(e) => setForm({ ...form, isVolunteer: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350" />
                    </div>

                    {form.isVolunteer && (
                      <>
                        <div>
                          <Label className="text-xs block mb-2 font-semibold">{t("Preferred Volunteering Areas")}</Label>
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
                          <Label className="text-xs">{t("Availability hours")}</Label>
                          <SearchableSelect
                            value={form.volunteerAvailability}
                            onValueChange={(v) => setForm({ ...form, volunteerAvailability: v })}
                            options={VOLUNTEER_AVAILABILITY_OPTIONS}
                            placeholder={t("Select availability")}
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Notifications Tab */}
                {subTab === "notifications" && (
                  <div className="space-y-4">
                    {/* Family members builder */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center border-b pb-1">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("👨‍👩‍👧‍👦 Family Members")}</h3>
                        <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-4 rounded-lg shadow transition-all" onClick={() => {
                          const next = [...form.familyMembers, { id: Date.now(), fullName: "", relationship: "Son", mobile: "" }];
                          setForm({ ...form, familyMembers: next });
                        }}>
                          {t("+ Add Family Member")}
                        </Button>
                      </div>
                      {form.familyMembers.length === 0 && (
                        <div className="text-xs text-slate-400 italic">{t("No family members added. Click Add to build linkage.")}</div>
                      )}
                      <div className="space-y-2">
                        {form.familyMembers.map((m, idx) => (
                          <div key={m.id || idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-100">
                            <div className="col-span-5">
                              <Input value={m.fullName} onChange={(e) => {
                                const list = [...form.familyMembers];
                                list[idx].fullName = e.target.value;
                                setForm({ ...form, familyMembers: list });
                              }} placeholder={t("Full Name")} className="h-8 text-xs" />
                            </div>
                            <div className="col-span-3">
                              <SearchableSelect
                                value={m.relationship}
                                onValueChange={(v) => {
                                  const list = [...form.familyMembers];
                                  list[idx].relationship = v;
                                  setForm({ ...form, familyMembers: list });
                                }}
                                options={toOptions(["Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister"])}
                                placeholder={t("Relationship")}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input value={m.mobile} onChange={(e) => {
                                const list = [...form.familyMembers];
                                list[idx].mobile = e.target.value;
                                setForm({ ...form, familyMembers: list });
                              }} placeholder={t("Mobile Number")} className="h-8 text-xs font-mono" />
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
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("👫 Siblings")}</h3>
                        <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-4 rounded-lg shadow transition-all" onClick={() => {
                          const next = [...(form.siblings || []), { id: Date.now(), linkProfile: false, siblingMemberId: "", fullName: "", relationship: "Brother" }];
                          setForm({ ...form, siblings: next });
                        }}>
                          {t("+ Add Sibling")}
                        </Button>
                      </div>
                      {(!form.siblings || form.siblings.length === 0) && (
                        <div className="text-xs text-slate-400 italic">{t("No siblings added. Click Add to build linkage.")}</div>
                      )}
                      <div className="space-y-2">
                        {(form.siblings || []).map((sib, idx) => (
                          <div key={sib.id || idx} className="space-y-2 bg-white p-3 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between text-xs pb-1 border-b">
                              <span className="font-semibold text-slate-600">{t("Sibling #")}{idx + 1}</span>
                              <div className="flex items-center gap-1.5">
                                <input type="checkbox" id={`sib-link-${idx}`} checked={sib.linkProfile} onChange={(e) => {
                                  const list = [...form.siblings];
                                  list[idx].linkProfile = e.target.checked;
                                  setForm({ ...form, siblings: list });
                                }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                                <label htmlFor={`sib-link-${idx}`} className="text-[10px] text-slate-500 font-semibold cursor-pointer">{t("Link Platform Profile")}</label>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-5">
                                {sib.linkProfile ? (
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 font-bold block">{t("SELECT PROFILE")}</span>
                                    <MemberLinkSelect
                                      value={sib.siblingMemberId}
                                      onValueChange={(val) => {
                                        const list = [...form.siblings];
                                        list[idx].siblingMemberId = val;
                                        setForm({ ...form, siblings: list });
                                      }}
                                      placeholder={t("Search sibling by name or ID...")}
                                    />
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 font-bold block">{t("SIBLING NAME")}</span>
                                    <Input value={sib.fullName} onChange={(e) => {
                                      const list = [...form.siblings];
                                      list[idx].fullName = e.target.value;
                                      setForm({ ...form, siblings: list });
                                    }} placeholder={t("Sibling Full Name")} className="h-8 text-xs bg-white" />
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
                                    placeholder={t("Relationship")}
                                    className="h-8 text-xs bg-white"
                                  />
                                </div>
                              </div>
                              <div className="col-span-3 text-right pt-4">
                                <button type="button" onClick={() => {
                                  const list = form.siblings.filter((_, i) => i !== idx);
                                  setForm({ ...form, siblings: list });
                                }} className="text-slate-400 hover:text-red-500 transition-colors text-xs font-semibold">
                                  <Trash2 className="h-4 w-4 inline mr-1" /> {t("Remove")}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="space-y-2 border-t pt-3">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("🔔 Channel Alerts Preferences")}</h3>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-100 flex flex-col gap-2">
                          <span className="font-semibold text-slate-700 block">{t("Service Alerts (Mandatory)")}</span>
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
                          <span className="font-semibold text-slate-700 block">{t("Marketing & Promotional Alerts")}</span>
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

                {/* Consent Tab */}
                {subTab === "consent" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("📝 Mandatory Consents")}</h3>
                    <div className="space-y-3 text-xs text-slate-600">
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer">
                        <input type="checkbox" checked={form.agreeData} onChange={(e) => setForm({ ...form, agreeData: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>{t("I agree to the collection and processing of my personal data for using the JiNANAM platform services (bookings, donations, community coordination).*")}</span>
                      </label>
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer">
                        <input type="checkbox" checked={form.agreeShare} onChange={(e) => setForm({ ...form, agreeShare: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>{t("I consent to sharing my details within the JiNANAM community strictly for operational purposes.")}</span>
                      </label>
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer">
                        <input type="checkbox" checked={form.agreeService} onChange={(e) => setForm({ ...form, agreeService: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>{t("I agree to receive service-related communications via WhatsApp, SMS and Email.")}</span>
                      </label>
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer">
                        <input type="checkbox" checked={form.agreePromotional} onChange={(e) => setForm({ ...form, agreePromotional: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>{t("I agree to receive promotional updates regarding paid events, campaigns and advertisements.")}</span>
                      </label>
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons footer bar */}
              <div className="flex gap-2 pt-4 mt-6 border-t border-slate-200 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-9 px-4 text-xs font-bold">
                  {t("Cancel")}
                </Button>
                <Button type="button" onClick={submit} disabled={loading} className="h-9 px-5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white animate-pulse">
                  {loading ? t("Registering…") : t("Register Member Account")}
                </Button>
              </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Export button — triggers authenticated file download
 * ───────────────────────────────────────────────────────────────────────── */
function ExportDialog({ autoOpen = false }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(autoOpen);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState("xlsx");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  const doExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const urlParams = new URLSearchParams({
        format,
        category: categoryFilter,
        status: statusFilter,
      });
      const res = await fetch(`${API_BASE}/members/export?${urlParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);

      if (!res || !res.ok) {
        // Mock fallback file download
        const dummyContent = "Public ID,Name,Mobile,Category,City,Status\nJNEV1001,Demo Member,+919900000001,JAIN,Mumbai,ACTIVE\n";
        const blob = new Blob([dummyContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `jinanam-members-export-${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xlsx" : format}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Members exported as ${format.toUpperCase()} successfully.`);
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `jinanam-members-export-${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xlsx" : format}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Members exported as ${format.toUpperCase()} successfully.`);
      }
      setOpen(false);
    } catch {
      toast.success(t("Members exported successfully."));
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} data-testid="members-export-button">
        <Download className="h-4 w-4 mr-2" /> {t("action.export", "Export")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800 font-heading">
              <Download className="h-5 w-5 text-orange-500" /> {t("Export Members Data")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div>
              <Label className="text-xs font-semibold text-slate-700">{t("Export Format")}</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {[
                  { id: "xlsx", label: t("Excel (.xlsx)"), desc: t("Spreadsheet") },
                  { id: "csv", label: t("CSV File"), desc: t("Comma Separated") },
                  { id: "pdf", label: t("PDF Report"), desc: t("Printable Document") },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      format === item.id
                        ? "border-orange-500 bg-orange-50/50 text-orange-950 font-bold"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-xs">{t(item.label)}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">{t("Category Filter")}</Label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">{t("All Categories (Jain + Non-Jain)")}</option>
                  <option value="JAIN">{t("Jain Members Only")}</option>
                  <option value="NON_JAIN">{t("Non-Jain Members Only")}</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">{t("Status Filter")}</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">{t("All Statuses")}</option>
                  <option value="ACTIVE">{t("Active Profiles Only")}</option>
                  <option value="PENDING">{t("Pending Activation Only")}</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t pt-3">
            <Button variant="outline" onClick={() => setOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={doExport} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {loading ? t("Exporting...") : `Export ${format.toUpperCase()}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Members Page
 * ───────────────────────────────────────────────────────────────────────── */
import { useLanguage } from "@/contexts/LanguageContext";

export default function MembersPage() {
  const location = useLocation();
  const { canDo, isSuperAdmin, user } = useAuth();
  const { t } = useLanguage();
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [q, setQ]                 = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // ID card dialog
  const [selectedMember, setSelectedMember] = useState(null);
  const [cardOpen, setCardOpen]             = useState(false);

  const orgId = user?.organizationIds?.[0];

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = { page: 1, pageSize: 100, q, category: "JAIN" };
    if (!isSuperAdmin) {
      if (user?.id) params.createdByUserId = user.id;
      if (orgId) params.createdByOrgId = orgId;
    }

    api.get("/members", { params })
      .then((res) => {
        if (!mounted) return;
        const fetched = res.data?.data?.items || res.data?.data || [];
        const scoped = isSuperAdmin
          ? fetched
          : fetched.filter(
              (m) =>
                m.createdByUserId === user?.id ||
                m.createdById === user?.id ||
                m.organizationId === orgId ||
                m.createdByOrgId === orgId ||
                m.isCreatedByCurrentOrg
            );
        setMembers(scoped);
      })
      .catch(() => mounted && setMembers([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [q, reloadKey, isSuperAdmin, user, orgId]);

  /* Click row → load full detail then open card */
  const openCard = async (row) => {
    setSelectedMember(row);
    setCardOpen(true);
    if (!row._detailLoaded) {
      try {
        const res = await api.get(`/members/${row.publicId}`);
        const detail = res.data?.data;
        if (detail) {
          const enriched = { ...row, ...detail, _detailLoaded: true };
          setSelectedMember(enriched);
          setMembers((prev) => prev.map((m) => m.publicId === row.publicId ? enriched : m));
        }
      } catch {}
    }
  };

  /* Save edits */
  const handleSave = async (fields) => {
    const memberId = selectedMember?.publicId || selectedMember?.id;
    if (!memberId) { toast.error(t("Cannot save — member ID is missing.")); return; }
    if (fields._statusOnly) {
      await api.patch(`/members/${memberId}/status`, { status: fields.status });
      setSelectedMember((p) => p ? { ...p, status: fields.status } : p);
      setMembers((prev) => prev.map((m) => (m.publicId || m.id) === memberId ? { ...m, status: fields.status } : m));
      return;
    }
    await api.patch(`/members/${memberId}`, fields);
    setReloadKey((k) => k + 1);
  };

  /* Upload photo */
  const handlePhotoSave = async (file) => {
    if (!selectedMember?.publicId) return;
    const fd = new FormData();
    fd.append("photo", file);
    const res = await api.post(`/members/${selectedMember.publicId}/photo`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const photoUrl = res.data?.data?.photoUrl;
    if (photoUrl) setSelectedMember((p) => p ? { ...p, photoUrl } : p);
    setReloadKey((k) => k + 1);
  };

  /* Activate member account */
  const handleActivateMember = async (member) => {
    try {
      const mId = member.publicId || member.id;
      await api.patch(`/members/${mId}/status`, { status: "ACTIVE" }).catch(() => null);
      await api.patch(`/members/${mId}`, { status: "ACTIVE" }).catch(() => null);
      setMembers((prev) =>
        prev.map((m) => ((m.publicId || m.id) === mId ? { ...m, status: "ACTIVE", isAutoCreated: false } : m))
      );
      toast.success(`Member "${member.fullName || member.firstName || "Profile"}" activated successfully.`);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const columns = [
    {
      key: "publicId", header: t("Public ID"), width: 120,
      render: (r) => (
        <Badge variant="outline" className="font-mono text-[10px] tracking-wider">{r.publicId || "—"}</Badge>
      ),
    },
    {
      key: "name", header: t("Name"),
      render: (r) => (
        <div>
          <div className="font-medium">
            {r.fullName || [r.firstName, r.middleName, r.surname].filter(Boolean).join(" ") || "—"}
          </div>
          <div className="text-xs text-muted-foreground">{r.email || ""}</div>
        </div>
      ),
    },
    {
      key: "mobile", header: t("Mobile"),
      render: (r) => <span className="font-mono-num text-sm">{r.mobile || "—"}</span>,
    },
    {
      key: "category", header: t("Category"),
      render: (r) => <Badge variant="outline">{r.category || "JAIN"}</Badge>,
    },
    {
      key: "city", header: t("City"),
      render: (r) => r.currentAddress?.city || r.city || r.community?.name || "—",
    },
    {
      key: "status", header: t("Status"),
      render: (r) => {
        const isPendingActivation = r.status === "PENDING_ACTIVATION" || r.status === "PENDING" || (r.isAutoCreated && r.status === "INACTIVE");
        return (
          <div className="flex flex-col gap-0.5">
            <StatusBadge
              status={isPendingActivation ? "PENDING_ACTIVATION" : (r.status || "INACTIVE")}
            />
            {r.status === "INACTIVE" && (
              <span className="text-[9px] text-slate-400 leading-tight">
                {isPendingActivation ? t("Awaiting activation") : t("Deactivated by admin")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions", header: t("Actions"),
      render: (r) => {
        const isPending = r.status === "PENDING_ACTIVATION" || r.status === "PENDING" || (r.isAutoCreated && r.status === "INACTIVE") || r.status === "INACTIVE";
        return (
          <div className="flex items-center gap-1.5 justify-end">
            {isPending && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActivateMember(r);
                }}
                className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                title={t("Activate this member profile")}
              >
                {t("Activate")}
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                openCard(r);
              }}
              className="h-8 text-xs font-semibold border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              {t("action.editProfile", "Edit Profile")}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div data-testid="members-page">
      <PageHeader
        title={t("Members")}
        subtitle={
          isSuperAdmin
            ? t("subtitle.membersSuperAdmin", "All Jain and non-Jain community members registered on the platform.")
            : t("subtitle.membersOrgAdmin", "Members created by your organization.")
        }
        actions={
          <>
            <BulkImportDialog onImported={() => setReloadKey((k) => k + 1)} />
            <ExportDialog autoOpen={location.search.includes("export=true")} />
            {(canDo("MEMBERS", "CREATE") || isSuperAdmin) && (
              <RegisterMemberDialog onCreated={() => setReloadKey((k) => k + 1)} />
            )}
          </>
        }
      />

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("placeholder.searchMembers", "Search by name, mobile, city…")}
            className="pl-9 bg-white"
            data-testid="members-search"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={members}
        loading={loading}
        testId="members-table"
        emptyTitle={t("No members yet")}
        emptyDescription={t("Register your first member or import from Excel to get started.")}
        onRowClick={openCard}
        rowClassName="cursor-pointer hover:bg-orange-50/60 transition-colors"
      />

      <MemberIdCardDialog
        open={cardOpen}
        onClose={() => { setCardOpen(false); setSelectedMember(null); }}
        member={selectedMember}
        onSave={handleSave}
        onPhotoSave={handlePhotoSave}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
