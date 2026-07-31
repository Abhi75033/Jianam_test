import { useEffect, useState, useRef } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MemberIdCardDialog } from "@/components/common/MemberIdCardDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, ShieldAlert, CheckCircle2, UserX } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  GENDER_OPTIONS, NATIONALITY_OPTIONS, LANGUAGE_OPTIONS, DOC_TYPE_OPTIONS,
  COMMUNICATION_METHOD_OPTIONS, BLOOD_GROUP_OPTIONS,
} from "@/constants/dropdownOptions";

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

function RegisterNonJainDialog({ onCreated }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [subTab, setSubTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef(null);

  // Simulated OTP verifications
  const [mobileVerified, setMobileVerified] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [form, setForm] = useState({
    firstName: "", middleName: "", surname: "", gender: "Male", dob: "",
    nationality: "India", preferredLanguage: "English", mobile: "", whatsapp: "",
    email: "", preferredCommunicationMethod: "Mobile", alternateContact: "",
    currentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
    permanentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
    sameAsPermanent: false,
    nativeVillage: { village: "", landmark: "", district: "", city: "", state: "", pincode: "" },
    interests: [], favouriteTemples: "", isVolunteer: false, volunteerAreas: [],
    volunteerAvailability: "Weekend", bloodGroup: "O+", medicalConditions: "",
    allergies: "", emergencyName: "", emergencyRelation: "", emergencyMobile: "",
    profession: "", organizationName: "", serviceNotifications: ["SMS", "WhatsApp", "Push"],
    marketingNotifications: ["WhatsApp", "Push"], showMobile: true, showAddress: true,
    allowContact: true, preferredCurrency: "INR (₹)", agreeData: false, agreeTerms: false,
    agreePrivacy: false, agreeService: false, agreePromotional: false,
    govtDocs: [
      { docType: "Aadhaar Card", docNumber: "", imageUrl: "", status: "Pending Verification" },
      { docType: "PAN Card", docNumber: "", imageUrl: "", status: "Pending Verification" }
    ]
  });

  // Automatically update currency code dynamically on Country switch
  useEffect(() => {
    const defaultCur = COUNTRY_CURRENCY_MAP[form.currentAddress.country] || "USD ($)";
    setForm((f) => ({ ...f, preferredCurrency: defaultCur }));
  }, [form.currentAddress.country]);

  const calculateCompletion = () => {
    let score = 0;
    let total = 12;
    if (form.firstName) score++;
    if (form.surname) score++;
    if (form.dob) score++;
    if (form.mobile) score++;
    if (form.currentAddress.city) score++;
    if (form.email) score++;
    if (form.interests.length > 0) score++;
    if (form.bloodGroup) score++;
    if (form.profession) score++;
    if (form.emergencyName) score++;
    if (form.nationality) score++;
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
    if (!form.mobile)    { toast.error(t("Mobile Number is required.")); return; }
    if (!form.currentAddress.country) { toast.error(t("Country is required.")); return; }
    if (!form.agreeData || !form.agreeTerms || !form.agreePrivacy) {
      toast.error(t("Please accept the mandatory consents & terms."));
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/members/admin-create", {
        firstName: form.firstName,
        surname: form.surname || undefined,
        mobile: form.mobile,
        email: form.email || undefined,
        gender: form.gender || undefined,
        category: "NON_JAIN",
        dob: form.dob ? new Date(form.dob).toISOString() : undefined,
        currentAddress: (form.currentAddress.city || form.currentAddress.state) ? { city: form.currentAddress.city || undefined, state: form.currentAddress.state || undefined } : undefined,
      });
      const data = res.data?.data || {};
      setCreatedId({ publicId: data.publicId, fullName: data.fullName });
      setCountdown(10);
      clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countdownRef.current);
            setCreatedId(null);
            setOpen(false);
            setForm({
              firstName: "", middleName: "", surname: "", gender: "Male", dob: "",
              nationality: "India", preferredLanguage: "English", mobile: "", whatsapp: "",
              email: "", preferredCommunicationMethod: "Mobile", alternateContact: "",
              currentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
              permanentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
              sameAsPermanent: false,
              nativeVillage: { village: "", landmark: "", district: "", city: "", state: "", pincode: "" },
              interests: [], favouriteTemples: "", isVolunteer: false, volunteerAreas: [],
              volunteerAvailability: "Weekend", bloodGroup: "O+", medicalConditions: "",
              allergies: "", emergencyName: "", emergencyRelation: "", emergencyMobile: "",
              profession: "", organizationName: "", serviceNotifications: ["SMS", "WhatsApp", "Push"],
              marketingNotifications: ["WhatsApp", "Push"], showMobile: true, showAddress: true,
              allowContact: true, preferredCurrency: "INR (₹)", agreeData: false, agreeTerms: false,
              agreePrivacy: false, agreeService: false, agreePromotional: false,
              govtDocs: [
                { docType: "Aadhaar Card", docNumber: "", imageUrl: "", status: "Pending Verification" },
                { docType: "PAN Card", docNumber: "", imageUrl: "", status: "Pending Verification" }
              ]
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
      nationality: "India", preferredLanguage: "English", mobile: "", whatsapp: "",
      email: "", preferredCommunicationMethod: "Mobile", alternateContact: "",
      currentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
      permanentAddress: { line1: "", city: "", state: "", country: "India", pincode: "" },
      sameAsPermanent: false,
      nativeVillage: { village: "", landmark: "", district: "", city: "", state: "", pincode: "" },
      interests: [], favouriteTemples: "", isVolunteer: false, volunteerAreas: [],
      volunteerAvailability: "Weekend", bloodGroup: "O+", medicalConditions: "",
      allergies: "", emergencyName: "", emergencyRelation: "", emergencyMobile: "",
      profession: "", organizationName: "", serviceNotifications: ["SMS", "WhatsApp", "Push"],
      marketingNotifications: ["WhatsApp", "Push"], showMobile: true, showAddress: true,
      allowContact: true, preferredCurrency: "INR (₹)", agreeData: false, agreeTerms: false,
      agreePrivacy: false, agreeService: false, agreePromotional: false,
      govtDocs: [
        { docType: "Aadhaar Card", docNumber: "", imageUrl: "", status: "Pending Verification" },
        { docType: "PAN Card", docNumber: "", imageUrl: "", status: "Pending Verification" }
      ]
    });
    onCreated?.();
  };

  const editTabs = [
    { id: "personal", label: t("👤 Personal Details") },
    { id: "docs", label: t("🆔 Identity & Documents") },
    { id: "contact", label: t("📱 Contacts & OTP") },
    { id: "address", label: t("📍 Addresses") },
    { id: "interests", label: t("🛕 Interests & Prefs") },
    { id: "health", label: t("🏥 Health & Volunteering") },
    { id: "consent", label: t("📝 Consents") }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="non-jain-add-button">
          <UserPlus className="h-4 w-4 mr-2" /> {t("Register Non-Jain Member")}
        </Button>
      </DialogTrigger>
      <DialogContent className={`p-0 border-0 overflow-hidden rounded-2xl shadow-2xl bg-transparent transition-all duration-300 ${
        createdId ? "max-w-sm" : "max-w-4xl"
      }`}>
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
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-2">{t("Non-Jain Flow")}</div>

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
                {editTabs.map((tItem) => (
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
                ))}
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
                        <Label className="text-xs">{t("Middle Name")}</Label>
                        <Input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Surname")}</Label>
                        <Input value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} className="bg-white mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("Date of Birth")}</Label>
                        <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Gender")}</Label>
                        <SearchableSelect
                          value={form.gender}
                          onValueChange={(v) => setForm({ ...form, gender: v })}
                          options={GENDER_OPTIONS}
                          placeholder={t("Select gender")}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
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
                  </div>
                )}

                {/* Identity & Docs Tab */}
                {subTab === "docs" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🆔 Government Identity Verification")}</h3>
                    <p className="text-xs text-slate-400">{t("Please provide details for any two government identity documents.")}</p>
                    
                    {form.govtDocs.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-white border border-slate-150 rounded-lg space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-semibold">{t("Document Type")}</Label>
                            <SearchableSelect
                              value={doc.docType}
                              onValueChange={(v) => {
                                const list = [...form.govtDocs];
                                list[idx].docType = v;
                                setForm({ ...form, govtDocs: list });
                              }}
                              options={DOC_TYPE_OPTIONS}
                              placeholder={t("Select document type")}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold">{t("Document Number")}</Label>
                            <Input value={doc.docNumber} onChange={(e) => {
                              const list = [...form.govtDocs];
                              list[idx].docNumber = e.target.value;
                              setForm({ ...form, govtDocs: list });
                            }} placeholder={t("Number")} className="h-8 text-xs font-mono" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>{t("Status:")} <span className="font-semibold text-orange-500">{doc.status}</span></span>
                          <Button variant="ghost" size="xs" type="button" className="text-xs font-semibold text-orange-500" onClick={() => toast.success(t("Document photo attached."))}>
                            {t("Attach Image Upload")}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contacts Tab */}
                {subTab === "contact" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("📱 Contact & Verification")}</h3>
                    
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
                        <SearchableSelect
                          value={form.preferredCommunicationMethod}
                          onValueChange={(v) => setForm({ ...form, preferredCommunicationMethod: v })}
                          options={COMMUNICATION_METHOD_OPTIONS}
                          placeholder={t("Select contact method")}
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
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("Current Address")}</h3>
                        <Button variant="ghost" size="xs" type="button" className="text-orange-500 font-semibold text-[10px]" onClick={() => toast.success(t("GPS Location auto-detected dynamically."))}>
                          {t("Auto Detect GPS Location")}
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs">{t("Full Address")}</Label>
                        <Input value={form.currentAddress.line1} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, line1: e.target.value } })} className="bg-white mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">{t("City")}</Label>
                          <Input value={form.currentAddress.city} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, city: e.target.value } })} className="bg-white mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">{t("State")}</Label>
                          <Input value={form.currentAddress.state} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, state: e.target.value } })} className="bg-white mt-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <SearchableSelect
                            value={form.currentAddress.country}
                            onValueChange={(v) => setForm({ ...form, currentAddress: { ...form.currentAddress, country: v } })}
                            options={NATIONALITY_OPTIONS}
                            placeholder={t("Select country")}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t("Pin Code")}</Label>
                          <Input value={form.currentAddress.pincode} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, pincode: e.target.value } })} className="bg-white mt-1" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center border-b pb-1">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("Permanent Address")}</h3>
                        <div className="flex items-center gap-1">
                          <input type="checkbox" id="reg-nonjain-same" checked={form.sameAsPermanent} onChange={(e) => {
                            const checked = e.target.checked;
                            setForm({
                              ...form,
                              sameAsPermanent: checked,
                              permanentAddress: checked ? { ...form.currentAddress } : { line1: "", city: "", state: "", country: "India", pincode: "" }
                            });
                          }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                          <label htmlFor="reg-nonjain-same" className="text-[10px] text-slate-500 font-semibold cursor-pointer">{t("Same as Current")}</label>
                        </div>
                      </div>
                      {!form.sameAsPermanent && (
                        <>
                          <div>
                            <Label className="text-xs">{t("Full Address")}</Label>
                            <Input value={form.permanentAddress.line1} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, line1: e.target.value } })} className="bg-white mt-1" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">{t("City")}</Label>
                              <Input value={form.permanentAddress.city} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, city: e.target.value } })} className="bg-white mt-1" />
                            </div>
                            <div>
                              <Label className="text-xs">{t("State")}</Label>
                              <Input value={form.permanentAddress.state} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, state: e.target.value } })} className="bg-white mt-1" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Interests Tab */}
                {subTab === "interests" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🛕 Platform Interests & Preferences")}</h3>
                    <div>
                      <Label className="text-xs block mb-2 font-semibold text-slate-650">{t("Select Interests (Multiple Selection)")}</Label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          "Temple Visits", "Spiritual Learning", "Events", "Tours", 
                          "Room Bookings", "Hall Bookings", "Bhojanshala", "Volunteering", 
                          "Donations", "Charity Activities", "Religious Tourism", "Other"
                        ].map(int => {
                          const checked = form.interests.includes(int);
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
                      <Label className="text-xs">{t("Follow Temples / Favourites")}</Label>
                      <Input value={form.favouriteTemples} onChange={(e) => setForm({ ...form, favouriteTemples: e.target.value })} placeholder={t("Search and select temples to follow...")} className="bg-white mt-1" />
                    </div>
                  </div>
                )}

                {/* Health & Volunteering Tab */}
                {subTab === "health" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🏥 Health, Emergency & Volunteering")}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <SearchableSelect
                          value={form.bloodGroup}
                          onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
                          options={BLOOD_GROUP_OPTIONS}
                          placeholder={t("Select blood group")}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Occupation / Profession")}</Label>
                        <Input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder={t("e.g. Doctor")} className="bg-white mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t pt-2 mt-2">
                      <div className="col-span-2 text-xs font-bold text-slate-800 uppercase tracking-wide">{t("Emergency Contact")}</div>
                      <div>
                        <Label className="text-xs">{t("Contact Name")}</Label>
                        <Input value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} placeholder={t("Ramesh Shah")} className="bg-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t("Emergency Phone")}</Label>
                        <Input value={form.emergencyMobile} onChange={(e) => setForm({ ...form, emergencyMobile: e.target.value })} placeholder={t("+91XXXXXXXXXX")} className="bg-white mt-1" />
                      </div>
                    </div>

                    <div className="border-t pt-3 flex items-center justify-between p-3 bg-white rounded-xl border border-slate-205 shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{t("Open for Volunteering")}</div>
                        <div className="text-[10px] text-slate-400">{t("Join helper teams for event and crowd coordination.")}</div>
                      </div>
                      <input type="checkbox" checked={form.isVolunteer} onChange={(e) => setForm({ ...form, isVolunteer: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350" />
                    </div>

                    {form.isVolunteer && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {["Event Management", "Medical Help", "Crowd Management", "Hospitality", "Food Distribution", "Administration", "Other"].map(v => {
                          const checked = form.volunteerAreas.includes(v);
                          return (
                            <label key={v} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50">
                              <input type="checkbox" checked={checked} onChange={() => {
                                const next = checked ? form.volunteerAreas.filter(a => a !== v) : [...form.volunteerAreas, v];
                                setForm({ ...form, volunteerAreas: next });
                              }} className="h-3.5 w-3.5 text-orange-500 rounded border-slate-350" />
                              <span>{v}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Consents Tab */}
                {subTab === "consent" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("📝 Mandatory Consents")}</h3>
                    <div className="space-y-3 text-xs text-slate-650">
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer font-medium">
                        <input type="checkbox" checked={form.agreeData} onChange={(e) => setForm({ ...form, agreeData: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>{t("I agree to the collection and processing of my personal data for using the JiNANAM platform.*")}</span>
                      </label>
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer">
                        <input type="checkbox" checked={form.agreeTerms} onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>{t("I agree to the Terms & Conditions of the platform.*")}</span>
                      </label>
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer">
                        <input type="checkbox" checked={form.agreePrivacy} onChange={(e) => setForm({ ...form, agreePrivacy: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>{t("I agree to the Privacy Policy.*")}</span>
                      </label>
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer">
                        <input type="checkbox" checked={form.agreeService} onChange={(e) => setForm({ ...form, agreeService: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>{t("I agree to receive service-related communications via SMS, WhatsApp, Email and Push.")}</span>
                      </label>
                      <label className="flex gap-2.5 items-start bg-white p-2.5 rounded-lg border border-slate-150 cursor-pointer font-medium">
                        <input type="checkbox" checked={form.agreePromotional} onChange={(e) => setForm({ ...form, agreePromotional: e.target.checked })} className="h-4 w-4 text-orange-500 rounded border-slate-350 shrink-0 mt-0.5" />
                        <span>{t("I agree to receive promotional updates regarding events, offers, and campaigns.")}</span>
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
                  {loading ? t("Registering…") : t("Register Non-Jain Account")}
                </Button>
              </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function NonJainMembersPage() {
  const { t } = useLanguage();
  const { isSuperAdmin, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedMember, setSelectedMember] = useState(null);
  const [cardOpen, setCardOpen] = useState(false);

  const orgId = user?.organizationIds?.[0];

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = { page: 1, pageSize: 100, q, category: "NON_JAIN" };
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

  const handleSave = async (fields) => {
    if (!selectedMember?.publicId) return;
    if (fields._statusOnly) {
      await api.patch(`/members/${selectedMember.publicId}/status`, { status: fields.status });
      setReloadKey((k) => k + 1);
      return;
    }
    await api.patch(`/members/${selectedMember.publicId}`, fields);
    setReloadKey((k) => k + 1);
  };

  const handlePhotoSave = async (file) => {
    if (!selectedMember?.publicId) return;
    const fd = new FormData();
    fd.append("photo", file);
    await api.post(`/members/${selectedMember.publicId}/photo`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setReloadKey((k) => k + 1);
  };

  const columns = [
    {
      key: "publicId", header: t("Public ID"), width: 120,
      render: (r) => <Badge variant="outline" className="font-mono text-[10px] tracking-wider">{r.publicId || "—"}</Badge>
    },
    {
      key: "name", header: t("Name"),
      render: (r) => (
        <div>
          <div className="font-medium">{r.fullName || [r.firstName, r.surname].filter(Boolean).join(" ") || "—"}</div>
          <div className="text-xs text-muted-foreground">{r.email || ""}</div>
        </div>
      )
    },
    {
      key: "mobile", header: t("Mobile"),
      render: (r) => <span className="font-mono-num text-sm">{r.mobile || "—"}</span>
    },
    {
      key: "city", header: t("Location"),
      render: (r) => r.currentAddress?.city || r.city || "—"
    },
    {
      key: "status", header: t("Status"),
      render: (r) => (
        <StatusBadge
          status={r.isAutoCreated && r.status === "INACTIVE" ? "PENDING_ACTIVATION" : (r.status || "INACTIVE")}
        />
      )
    },
    {
      key: "dob", header: "DOB",
      render: (r) => r.dob ? formatDate(r.dob) : "—"
    }
  ];

  return (
    <div data-testid="non-jain-members-page">
      <PageHeader
        title={t("Non-Jain Members")}
        subtitle={t("Manage all registered Non-Jain community users and digital membership references.")}
        actions={<RegisterNonJainDialog onCreated={() => setReloadKey((k) => k + 1)} />}
      />

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search non-jain members…")}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={members}
        loading={loading}
        testId="non-jain-members-table"
        onRowClick={openCard}
        rowClassName="cursor-pointer hover:bg-orange-50/60 transition-colors"
        emptyTitle={t("No non-jain members yet")}
        emptyDescription={t("Register a non-jain member to get started.")}
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
