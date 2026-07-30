import { useEffect, useState, useRef } from "react";
import { api, extractErrorMessage, API_BASE } from "@/lib/api";
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
      toast.error("Only .xlsx / .xls files are accepted.");
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
    if (!file) { toast.error("Please select a file first."); return; }
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
          <Upload className="h-4 w-4 mr-2" /> Bulk Import
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <FileSpreadsheet className="h-5 w-5 text-orange-500" /> Bulk Import Members
          </DialogTitle>
        </DialogHeader>

        {/* Format description — red alert box */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-red-700 font-semibold text-xs uppercase tracking-wide">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Required Excel Format
          </div>
          <p className="text-xs text-red-600 leading-relaxed">
            Upload an <strong>.xlsx</strong> file with a <strong>header row</strong> containing these columns
            (case-insensitive). Columns marked <strong>*</strong> are required.
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
            <Download className="h-3 w-3" /> Download blank template
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
                <div className="text-xs text-green-500">{(file.size / 1024).toFixed(1)} KB</div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-300" />
                <div className="text-sm font-medium text-slate-500">Drag & drop or click to browse</div>
                <div className="text-xs text-slate-400">.xlsx only · Max 10 MB</div>
              </>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-xl border p-4 space-y-2">
            <div className="font-semibold text-sm flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" /> Import complete
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-green-50 border border-green-200 p-2">
                <div className="text-xl font-black text-green-600">{result.created ?? 0}</div>
                <div className="text-[10px] text-green-500 font-semibold uppercase">Created</div>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                <div className="text-xl font-black text-amber-600">{result.skipped ?? 0}</div>
                <div className="text-[10px] text-amber-500 font-semibold uppercase">Skipped</div>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-2">
                <div className="text-xl font-black text-red-600">{result.errors?.length ?? 0}</div>
                <div className="text-[10px] text-red-500 font-semibold uppercase">Errors</div>
              </div>
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-2 rounded bg-red-50 border border-red-200 p-2 max-h-32 overflow-y-auto">
                {result.errors.slice(0, 10).map((e, i) => (
                  <div key={i} className="text-[11px] text-red-600 flex gap-1">
                    <XCircle className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>Row {e.row}: {e.message || e.reason || JSON.stringify(e)}</span>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={reset} className="w-full mt-1">
              Import Another File
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
          {!result && (
            <Button onClick={doUpload} disabled={!file || uploading}>
              {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing…</> : "Import Members"}
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
  const [open, setOpen] = useState(false);
  const [subTab, setSubTab] = useState("personal");
  const [cat, setCat] = useState("jain");
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState(null); // { publicId, fullName } — triggers success screen
  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef(null);

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
    if (!form.firstName) { toast.error("First Name is required."); return; }
    if (!form.middleName) { toast.error("Middle Name is required."); return; }
    if (!form.surname) { toast.error("Surname is required."); return; }
    if (!form.mobile) { toast.error("Mobile Number is required."); return; }
    if (!form.gender) { toast.error("Gender is required."); return; }
    if (!form.dob) { toast.error("Date of Birth is required."); return; }
    if (!form.nationality) { toast.error("Nationality is required."); return; }
    if (!form.pan) { toast.error("PAN Number is required."); return; }
    if (!form.aadhaar) { toast.error("Aadhaar Number is required."); return; }
    if (!form.maritalStatus) { toast.error("Marital Status is required."); return; }
    // Community details mandatory for Jain
    if (cat === "jain" && !form.motherTongue) { toast.error("Mother Tongue is required in Community Details."); return; }
    if (cat === "jain" && !form.tithiCalendar) { toast.error("Tithi Calendar Type is required in Community Details."); return; }
    if (cat === "jain" && !form.sect) { toast.error("Jain Sect is required in Community Details."); return; }
    if (cat === "jain" && !form.subCommunity) { toast.error("Sub Sect / Community is required in Community Details."); return; }
    // Address mandatory
    if (!form.currentAddress.line1) { toast.error("Current Address (Full Address) is required."); return; }
    if (!form.currentAddress.city) { toast.error("Current Address City is required."); return; }
    if (!form.currentAddress.state) { toast.error("Current Address State is required."); return; }
    if (!form.currentAddress.pincode) { toast.error("Current Address Pin Code is required."); return; }
    if (!form.permanentAddress.line1 && !form.sameAsPermanent) { toast.error("Permanent Address is required. Check \"Same as Current\" if applicable."); return; }
    if (cat === "jain" && !form.agreeData) { toast.error("Please accept the mandatory data processing consent."); return; }
    
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
    { id: "personal", label: "👤 Personal Details" },
    { id: "community", label: "🛕 Community Details" },
    { id: "contact", label: "📱 Contacts & OTP" },
    { id: "address", label: "📍 Addresses" },
    { id: "family", label: "👨‍👩‍👧‍👦 Family Members" },
    { id: "health", label: "🏥 Health & Emergency" },
    { id: "volunteer", label: "🙏 Volunteering" },
    { id: "notifications", label: "🔔 Alerts & Notifications" },
    { id: "consent", label: "📝 Consents" }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="members-add-button" className="h-11 px-6 text-sm font-bold shadow-md bg-orange-500 hover:bg-orange-600 text-white transition-all">
          <UserPlus className="h-5 w-5 mr-2" /> Register Member
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
              <div className="text-sm font-bold tracking-widest text-slate-400 uppercase">MEMBER REGISTERED</div>
              <div className="text-lg font-extrabold text-white mt-1">{createdId.fullName}</div>
            </div>
            <div className="bg-slate-950 rounded-xl px-8 py-4 w-full max-w-xs border border-slate-800">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Unique ID Generated</div>
              <div className="font-mono text-3xl font-extrabold text-yellow-400 tracking-wider">{createdId.publicId}</div>
            </div>
            <Button
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs h-9 font-bold"
              onClick={() => {
                navigator.clipboard.writeText(createdId.publicId);
                toast.success("Member ID copied!");
              }}
            >
              Copy ID
            </Button>
            <p className="text-xs text-slate-500">
              Screen closes in <span className="font-bold text-slate-300">{countdown}</span>s.
            </p>
            <Button variant="outline" onClick={handleCloseSuccess} className="w-full max-w-xs border-slate-800 text-slate-300 hover:bg-slate-800">
              Close
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-[75vh] w-full bg-white font-sans overflow-hidden">
            {/* Left panel tabs list */}
            <div className="w-full md:w-60 bg-slate-900 text-slate-300 p-4 flex flex-col gap-1 shrink-0 border-r border-slate-800">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-2">Registration Flow</div>
              
              <Tabs value={cat} onValueChange={setCat} className="mb-4">
                <TabsList className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg">
                  <TabsTrigger value="jain" className="text-xs py-1 rounded text-slate-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white">Jain</TabsTrigger>
                  <TabsTrigger value="non-jain" className="text-xs py-1 rounded text-slate-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white">Non-Jain</TabsTrigger>
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
                {editTabs.map((t) => {
                  if (cat !== "jain" && t.id === "community") return null;
                  return (
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
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">👤 Personal Information</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">First Name *</Label>
                        <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Middle Name *</Label>
                        <Input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Surname *</Label>
                        <Input value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} className="bg-white mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Date of Birth *</Label>
                        <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Gender *</Label>
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
                        <Label className="text-xs">Nationality *</Label>
                        <SearchableSelect
                          value={form.nationality}
                          onValueChange={(v) => setForm({ ...form, nationality: v })}
                          options={NATIONALITY_OPTIONS}
                          placeholder="Select nationality"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Preferred Language</Label>
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
                        <Label className="text-xs">PAN Number *</Label>
                        <Input value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} placeholder="ABCDE1234F" className="bg-white mt-1 font-mono uppercase" />
                      </div>
                      <div>
                        <Label className="text-xs">Aadhaar Number * (12 digits)</Label>
                        <Input value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} placeholder="1234 5678 9012" className="bg-white mt-1 font-mono" maxLength={14} />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Marital Status *</Label>
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

                {/* Community Tab */}
                {subTab === "community" && cat === "jain" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🛕 Community Details <span className="text-red-500 font-normal text-xs">(all fields mandatory)</span></h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Mother Tongue *</Label>
                        <SearchableSelect
                          value={form.motherTongue}
                          onValueChange={(v) => setForm({ ...form, motherTongue: v })}
                          options={MOTHER_TONGUE_OPTIONS}
                          placeholder="Select mother tongue"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Tithi Calendar Type *</Label>
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
                        <Label className="text-xs">Jain Sect *</Label>
                        <SearchableSelect
                          value={form.sect}
                          onValueChange={(v) => setForm({ ...form, sect: v, subCommunity: v === "Digambar" ? "Bisapantha" : "Murtipujak" })}
                          options={JAIN_SECT_OPTIONS}
                          placeholder="Select sect"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Sub Sect / Community *</Label>
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
                        <Label className="text-xs">Gaccha Selection</Label>
                        <SearchableSelect
                          value={form.gaccha}
                          onValueChange={(v) => setForm({ ...form, gaccha: v })}
                          options={MURTIPUJAK_GACCHA_OPTIONS}
                          placeholder="Choose Gaccha…"
                          searchPlaceholder="Search gaccha…"
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Contacts Tab */}
                {subTab === "contact" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">📱 Verification & Contacts</h3>
                    
                    <div>
                      <Label className="text-xs">Mobile Number *</Label>
                      <div className="flex gap-2 mt-1">
                        <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91XXXXXXXXXX" className="bg-white flex-1" />
                        <Button size="sm" variant={mobileVerified ? "outline" : "default"} type="button" onClick={() => verifyField("mobile")}>
                          {mobileVerified ? "✓ Verified" : "Verify Mobile"}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">WhatsApp Number</Label>
                      <div className="flex gap-2 mt-1">
                        <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+91XXXXXXXXXX" className="bg-white flex-1" />
                        <Button size="sm" variant={whatsappVerified ? "outline" : "default"} type="button" onClick={() => verifyField("whatsapp")}>
                          {whatsappVerified ? "✓ Verified" : "Verify WhatsApp"}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Email ID</Label>
                      <div className="flex gap-2 mt-1">
                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@domain.com" className="bg-white flex-1" />
                        <Button size="sm" variant={emailVerified ? "outline" : "default"} type="button" onClick={() => verifyField("email")}>
                          {emailVerified ? "✓ Verified" : "Verify Email"}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Preferred Contact Method</Label>
                        <SearchableSelect
                          value={form.preferredCommunicationMethod}
                          onValueChange={(v) => setForm({ ...form, preferredCommunicationMethod: v })}
                          options={COMMUNICATION_METHOD_OPTIONS}
                          placeholder="Select method"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Alternate Phone Contact</Label>
                        <Input value={form.alternateContact} onChange={(e) => setForm({ ...form, alternateContact: e.target.value })} placeholder="+91XXXXXXXXXX" className="bg-white mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Tab */}
                {subTab === "address" && (
                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center border-b pb-1">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Current Address <span className="text-red-500 font-normal normal-case">(all fields required *)</span></h3>
                        <Button variant="ghost" size="xs" type="button" className="text-orange-500 font-semibold text-[10px]" onClick={() => toast.success("Latitude/Longitude coordinates detected dynamically.")}>
                          Auto Detect GPS Location
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs">Address *</Label>
                        <Input value={form.currentAddress.line1} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, line1: e.target.value } })} placeholder="Full address, House/Flat No, Street" className="bg-white mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Country (default India) *</Label>
                          <Input value={form.currentAddress.country || "India"} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, country: e.target.value } })} placeholder="India" className="bg-white mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">Pincode *</Label>
                          <Input value={form.currentAddress.pincode} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, pincode: e.target.value } })} placeholder="6-digit Pincode" className="bg-white mt-1" maxLength={6} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Area</Label>
                          <Input value={form.currentAddress.area || ""} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, area: e.target.value } })} placeholder="Thane E or Thane W" className="bg-white mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">City *</Label>
                          <Input value={form.currentAddress.city} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, city: e.target.value } })} placeholder="e.g. Thane" className="bg-white mt-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">District</Label>
                          <Input value={form.currentAddress.district || ""} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, district: e.target.value } })} placeholder="e.g. Thane District" className="bg-white mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">State *</Label>
                          <Input value={form.currentAddress.state} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, state: e.target.value } })} placeholder="e.g. Maharashtra" className="bg-white mt-1" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center border-b pb-1">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Permanent Address <span className="text-orange-500 font-normal normal-case text-[10px]">(or tick Same as Current)</span></h3>
                        <div className="flex items-center gap-1">
                          <input type="checkbox" id="reg-same" checked={form.sameAsPermanent} onChange={(e) => {
                            const checked = e.target.checked;
                            setForm({
                              ...form,
                              sameAsPermanent: checked,
                              permanentAddress: checked ? { ...form.currentAddress } : { line1: "", city: "", state: "", country: "India", pincode: "" }
                            });
                          }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                          <label htmlFor="reg-same" className="text-[10px] text-slate-500 font-semibold cursor-pointer">Same as Current</label>
                        </div>
                      </div>
                      {!form.sameAsPermanent && (
                        <>
                          <div>
                            <Label className="text-xs">Full Address</Label>
                            <Input value={form.permanentAddress.line1} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, line1: e.target.value } })} className="bg-white mt-1" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">City</Label>
                              <Input value={form.permanentAddress.city} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, city: e.target.value } })} className="bg-white mt-1" />
                            </div>
                            <div>
                              <Label className="text-xs">State</Label>
                              <Input value={form.permanentAddress.state} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, state: e.target.value } })} className="bg-white mt-1" />
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
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">👨‍👩‍👧‍👦 Family Members</h3>
                        <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-9 px-5 rounded-lg shadow-md transition-all" onClick={() => {
                          const next = [...form.familyMembers, { id: Date.now(), fullName: "", relationship: "Son", mobile: "" }];
                          setForm({ ...form, familyMembers: next });
                        }}>
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
                              }} placeholder="Mobile" className="h-8 text-xs font-mono" />
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
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🏥 Health & Emergency Details</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Blood Group</Label>
                        <SearchableSelect
                          value={form.bloodGroup}
                          onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
                          options={BLOOD_GROUP_OPTIONS}
                          placeholder="Select blood group"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Occupation</Label>
                        <Input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder="e.g. Software Engineer" className="bg-white mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Disability</Label>
                        <SearchableSelect
                          value={form.disability}
                          onValueChange={(v) => setForm({ ...form, disability: v })}
                          options={[{ value: "No", label: "No" }, { value: "Yes", label: "Yes" }]}
                          placeholder="Select"
                          className="mt-1"
                        />
                      </div>
                      {form.disability === "Yes" && (
                        <div>
                          <Label className="text-xs">Details</Label>
                          <Input value={form.disabilityDetails} onChange={(e) => setForm({ ...form, disabilityDetails: e.target.value })} className="bg-white mt-1" />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t pt-2 mt-2">
                      <div className="col-span-2 text-xs font-bold text-slate-800 uppercase tracking-wide">Emergency Contact</div>
                      <div>
                        <Label className="text-xs">Contact Name</Label>
                        <Input value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} placeholder="e.g. Ramesh Shah" className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Relationship</Label>
                        <Input value={form.emergencyRelation} onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })} placeholder="Father / Spouse" className="bg-white mt-1" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Emergency Phone</Label>
                        <Input value={form.emergencyMobile} onChange={(e) => setForm({ ...form, emergencyMobile: e.target.value })} placeholder="+91XXXXXXXXXX" className="bg-white mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Volunteer Tab */}
                {subTab === "volunteer" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🙏 Volunteering</h3>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Open for Volunteering Seva</div>
                        <div className="text-[10px] text-slate-400">Links profile directly to preferred temples volunteering lists.</div>
                      </div>
                      <input type="checkbox" checked={form.isVolunteer} onChange={(e) => setForm({ ...form, isVolunteer: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350" />
                    </div>

                    {form.isVolunteer && (
                      <>
                        <div>
                          <Label className="text-xs block mb-2 font-semibold">Preferred Volunteering Areas</Label>
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
                          <Label className="text-xs">Availability hours</Label>
                          <SearchableSelect
                            value={form.volunteerAvailability}
                            onValueChange={(v) => setForm({ ...form, volunteerAvailability: v })}
                            options={VOLUNTEER_AVAILABILITY_OPTIONS}
                            placeholder="Select availability"
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
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">👨‍👩‍👧‍👦 Family Members</h3>
                        <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-4 rounded-lg shadow transition-all" onClick={() => {
                          const next = [...form.familyMembers, { id: Date.now(), fullName: "", relationship: "Son", mobile: "" }];
                          setForm({ ...form, familyMembers: next });
                        }}>
                          + Add Family Member
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
                                options={toOptions(["Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister"])}
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
                                <input type="checkbox" id={`sib-link-${idx}`} checked={sib.linkProfile} onChange={(e) => {
                                  const list = [...form.siblings];
                                  list[idx].linkProfile = e.target.checked;
                                  setForm({ ...form, siblings: list });
                                }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                                <label htmlFor={`sib-link-${idx}`} className="text-[10px] text-slate-500 font-semibold cursor-pointer">Link Platform Profile</label>
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

                {/* Consent Tab */}
                {subTab === "consent" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">📝 Mandatory Consents</h3>
                    <div className="space-y-3 text-xs text-slate-600">
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer">
                        <input type="checkbox" checked={form.agreeData} onChange={(e) => setForm({ ...form, agreeData: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>I agree to the collection and processing of my personal data for using the JiNANAM platform services (bookings, donations, community coordination).*</span>
                      </label>
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer">
                        <input type="checkbox" checked={form.agreeShare} onChange={(e) => setForm({ ...form, agreeShare: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>I consent to sharing my details within the JiNANAM community strictly for operational purposes.</span>
                      </label>
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer">
                        <input type="checkbox" checked={form.agreeService} onChange={(e) => setForm({ ...form, agreeService: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>I agree to receive service-related communications via WhatsApp, SMS and Email.</span>
                      </label>
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer">
                        <input type="checkbox" checked={form.agreePromotional} onChange={(e) => setForm({ ...form, agreePromotional: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>I agree to receive promotional updates regarding paid events, campaigns and advertisements.</span>
                      </label>
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons footer bar */}
              <div className="flex gap-2 pt-4 mt-6 border-t border-slate-200 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-9 px-4 text-xs font-bold">
                  Cancel
                </Button>
                <Button type="button" onClick={submit} disabled={loading} className="h-9 px-5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white animate-pulse">
                  {loading ? "Registering…" : "Register Member Account"}
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
function ExportButton() {
  const [loading, setLoading] = useState(false);

  const doExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const res = await fetch(`${API_BASE}/members/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `jinanam-members-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Members exported as Excel.");
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={doExport} disabled={loading} data-testid="members-export-button">
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      Export
    </Button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Members Page
 * ───────────────────────────────────────────────────────────────────────── */
export default function MembersPage() {
  const { canDo, isSuperAdmin } = useAuth();
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [q, setQ]                 = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // ID card dialog
  const [selectedMember, setSelectedMember] = useState(null);
  const [cardOpen, setCardOpen]             = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get("/members", { params: { page: 1, pageSize: 100, q, category: "JAIN" } })
      .then((res) => { if (mounted) setMembers(res.data?.data?.items || res.data?.data || []); })
      .catch(() => mounted && setMembers([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [q, reloadKey]);

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
    if (!memberId) { toast.error("Cannot save — member ID is missing."); return; }
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
      key: "publicId", header: "Public ID", width: 120,
      render: (r) => (
        <Badge variant="outline" className="font-mono text-[10px] tracking-wider">{r.publicId || "—"}</Badge>
      ),
    },
    {
      key: "name", header: "Name",
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
      key: "mobile", header: "Mobile",
      render: (r) => <span className="font-mono-num text-sm">{r.mobile || "—"}</span>,
    },
    {
      key: "category", header: "Category",
      render: (r) => <Badge variant="outline">{r.category || "JAIN"}</Badge>,
    },
    {
      key: "city", header: "City",
      render: (r) => r.currentAddress?.city || r.city || r.community?.name || "—",
    },
    {
      key: "status", header: "Status",
      render: (r) => {
        const isPendingActivation = r.status === "PENDING_ACTIVATION" || r.status === "PENDING" || (r.isAutoCreated && r.status === "INACTIVE");
        return (
          <div className="flex flex-col gap-0.5">
            <StatusBadge
              status={isPendingActivation ? "PENDING_ACTIVATION" : (r.status || "INACTIVE")}
            />
            {r.status === "INACTIVE" && (
              <span className="text-[9px] text-slate-400 leading-tight">
                {isPendingActivation ? "Awaiting activation" : "Deactivated by admin"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions", header: "Actions",
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
                title="Activate this member profile"
              >
                Activate
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
              Edit Profile
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div data-testid="members-page">
      <PageHeader
        title="Members"
        subtitle="All Jain and non-Jain community members registered on the platform."
        actions={
          <>
            <BulkImportDialog onImported={() => setReloadKey((k) => k + 1)} />
            <ExportButton />
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
            placeholder="Search by name, mobile, city…"
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
        emptyTitle="No members yet"
        emptyDescription="Register your first member or import from Excel to get started."
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
