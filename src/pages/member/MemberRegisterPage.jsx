import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Check, ArrowLeft, ShieldCheck, Heart, Sparkles, User,
  Calendar, MapPin, Globe, CreditCard, FileText, Lock, Phone, ArrowRight,
  UserPlus, CheckCircle2, Shield
} from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { PhoneField } from "@/components/common/PhoneInput";
import { cn } from "@/lib/utils";
import { memberAuthApi } from "@/lib/memberApi";
import { memberClient as api } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

/**
 * 75+ Murtipujak Gacchas Master List (§2)
 */
const MURTIPUJAK_GACCHAS = [
  "Tapa Gaccha", "Achal Gaccha", "Kharatara Gaccha", "Upkeśa Gaccha", "Jiravala Gaccha", "Lonka (Richmati) Gaccha",
  "Gangeshvara Gaccha", "Korantavala Gaccha", "Anandapura Gaccha", "Bharavali Gaccha", "Udhaviya Gaccha", "Gudava Gaccha",
  "Dekawa Gaccha", "Bhinmala Gaccha", "Mahudiya Gaccha", "Gachhapala Gaccha", "Goshavala Gaccha", "Magatragada Gaccha",
  "Vrihmaniya Gaccha", "Talara Gaccha", "Vikadiya Gaccha", "Munjhiya Gaccha", "Chitroda Gaccha", "Sachora Gaccha",
  "Jachandiya Gaccha", "Sidhalava Gaccha", "Miyanniya Gaccha", "Agamiya Gaccha", "Maladhari Gaccha", "Bhavariya Gaccha",
  "Paliwala Gaccha", "Nagadigeshvara Gaccha", "Dharmaghosha Gaccha", "Nagapura Gaccha", "Uchatavala Gaccha", "Nannavala Gaccha",
  "Sadera Gaccha", "Mandovara Gaccha", "Surani Gaccha", "Khambhavati Gaccha", "Panchanda Gaccha", "Sopariya Gaccha",
  "Mandaliya Gaccha", "Kochhipana Gaccha", "Jaganna Gaccha", "Laparavala Gaccha", "Vosarada Gaccha", "Duivandaniya Gaccha",
  "Chitravala Gaccha", "Vegada Gaccha", "Vapada Gaccha", "Vijahara Gaccha", "Kapuri Gaccha", "Kachala Gaccha",
  "Handaliya Gaccha", "Mahukara Gaccha", "Putaliya Gaccha", "Kannariseya Gaccha", "Revardiya Gaccha", "Dhandhuka Gaccha",
  "Thambhanipana Gaccha", "Panchivala Gaccha", "Palanpura Gaccha", "Gandhariya Gaccha", "Veliya Gaccha", "Sadhapunamiya Gaccha",
  "Nagarakotiya Gaccha", "Hasora Gaccha", "Bhatanera Gaccha", "Janahara Gaccha", "Jagayana Gaccha", "Bhimasena Gaccha",
  "Takadiya Gaccha", "Kamboja Gaccha", "Senata Gaccha", "Vaghera Gaccha", "Vahediya Gaccha", "Siddhapura Gaccha",
  "Ghoghari Gaccha", "Nigamiya Gaccha", "Punamiya Gaccha", "Varhadiya Gaccha", "Namila Gaccha"
];

/**
 * Currency Mapping by Country (§14)
 */
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

/**
 * Non-Jain Interests Checklist (§5)
 */
const NON_JAIN_INTERESTS = [
  "Temple Visits", "Spiritual Learning", "Events", "Tours",
  "Room Bookings", "Hall Bookings", "Bhojanshala", "Volunteering",
  "Donations", "Charity Activities", "Religious Tourism"
];

/**
 * Government Identity Document Options (§3)
 */
const GOV_ID_TYPES = [
  "Aadhaar Card", "PAN Card", "Passport", "Driving Licence", "Voter ID", "Other Gov ID"
];

const STEPS = ["Verify Mobile", "Member Type", "Profile & Identity", "Consents & ID"];

export default function MemberRegisterPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { requestOtp, verifyOtp } = useMemberAuth();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  // Step 1: Verification
  const [mobile, setMobile] = useState(location.state?.identifier || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [registrationToken, setRegistrationToken] = useState(null);

  // Step 2: Member Type
  const [memberType, setMemberType] = useState("JAIN"); // "JAIN" or "NON_JAIN"

  // Step 3: Personal Details
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surname, setSurname] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappSameAsMobile, setWhatsappSameAsMobile] = useState(true);
  const [calendarTypes, setCalendarTypes] = useState([{ name: "Gujarati" }, { name: "Kutchi" }, { name: "Marwari" }]);
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [country, setCountry] = useState("India");

  // Non-Jain Identity Verification (§3)
  const [govIdType1, setGovIdType1] = useState("Aadhaar Card");
  const [govIdNum1, setGovIdNum1] = useState("");
  const [govIdType2, setGovIdType2] = useState("PAN Card");
  const [govIdNum2, setGovIdNum2] = useState("");
  const [selectedInterests, setSelectedInterests] = useState(["Room Bookings", "Bhojanshala"]);

  // Jain Community Details (§2)
  const [sect, setSect] = useState("Shwetambar");
  const [subCommunity, setSubCommunity] = useState("Murtipujak (Deravasi / Mandirmargi)");
  const [gaccha, setGaccha] = useState("Tapa Gaccha");
  const [motherTongue, setMotherTongue] = useState("Gujarati");
  const [tithiCalendar, setTithiCalendar] = useState("Gujarati");

  // Address
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [area, setArea] = useState("Thane West");

  // Auto-calculated variables (§1 & §10)
  const fullName = [firstName, middleName, surname].filter(Boolean).join(" ");
  const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const birth = new Date(dobString);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };
  const age = calculateAge(dob);
  const isSeniorCitizen = age >= 59;
  const defaultCurrency = COUNTRY_CURRENCY_MAP[country] || "USD ($)";

  // Mandatory Consents (§17)
  const [consentTerms, setConsentTerms] = useState(true);
  const [consentPrivacy, setConsentPrivacy] = useState(true);
  const [consentServices, setConsentServices] = useState(true);
  const [consentPromotional, setConsentPromotional] = useState(true);
  const [consentGuardian, setConsentGuardian] = useState(false);

  useEffect(() => {
    api.get("/calendar/types")
      .then((r) => {
        const list = r.data?.data?.items || r.data?.data || [];
        if (Array.isArray(list) && list.length) setCalendarTypes(list);
      })
      .catch(() => {});
  }, []);

  const [createdMemberId, setCreatedMemberId] = useState(null);

  const toggleInterest = (item) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const sendOtp = async () => {
    if (!mobile.trim()) { toast.error(t("Mobile Number is required.")); return; }
    setBusy(true);
    try {
      await requestOtp(mobile.trim());
      setOtpSent(true);
      toast.success(t("MSG91 OTP sent to your mobile."));
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setBusy(false); }
  };

  const onVerify = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await verifyOtp({ mobile: mobile.trim(), otp });
      setRegistrationToken(res?.registrationToken || res?.registration_token || null);
      toast.success(t("Mobile number verified successfully."));
      setStep(1);
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setBusy(false); }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) { toast.error(t("First Name is required.")); return; }
    if (!consentTerms || !consentPrivacy || !consentServices) {
      toast.error(t("Mandatory Terms & Consents must be accepted.")); return;
    }
    if (age > 0 && age < 18 && !consentGuardian) {
      toast.error(t("Guardian consent required for members under 18 years of age.")); return;
    }

    setBusy(true);
    try {
      const payload = {
        registrationToken,
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        surname: surname.trim(),
        fullName,
        gender,
        dob,
        age,
        isSeniorCitizen,
        country,
        currency: defaultCurrency,
        mobile: mobile.trim(),
        memberType,
        govDocuments: memberType === "NON_JAIN" ? [
          { type: govIdType1, number: govIdNum1 },
          { type: govIdType2, number: govIdNum2 }
        ] : [],
        interests: memberType === "NON_JAIN" ? selectedInterests : [],
        sect: memberType === "JAIN" ? sect : null,
        subCommunity: memberType === "JAIN" ? subCommunity : null,
        gaccha: (memberType === "JAIN" && subCommunity.includes("Murtipujak")) ? gaccha : null,
        motherTongue,
        tithiCalendar,
        whatsapp: whatsappSameAsMobile ? mobile : whatsapp,
        city,
        state,
        area,
        consentTerms,
        consentPrivacy,
        consentServices,
        consentPromotional,
      };

      const res = await memberAuthApi.register(payload);
      const generatedId = res?.public_id || res?.member_id || (memberType === "JAIN" ? "JFJM108" : "JFNJM108");
      
      setCreatedMemberId(generatedId);
      toast.success(t("Account created successfully! Unique Member ID: {0}", [generatedId]));

    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF2FF] via-[#F4F7FF] to-[#E9F0FD] flex items-center justify-center p-3 md:p-6 lg:p-10 font-sans text-slate-800" data-testid="member-register-page">
      
      {/* Master Main Container Window */}
      <div className="w-full max-w-[1240px] bg-gradient-to-br from-[#F5F8FF]/90 via-white/80 to-[#EDF3FF]/90 backdrop-blur-xl rounded-[32px] border border-white/80 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12)] overflow-hidden flex flex-col justify-between min-h-[680px]">
        
        {/* Top Content Row: Left Visual + Right Form */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 items-center p-6 md:p-10 gap-8">
          
          {/* ======================================================================= */}
          {/* LEFT SIDE: Brand, Tagline, Central Artwork & Orbiting Nodes             */}
          {/* ======================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
            
            {/* Top Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0F2B68] to-[#1E40AF] flex items-center justify-center shadow-md shadow-indigo-900/20">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 17.5L6 21L7 14L2 9L9 8L12 2Z" fill="url(#star-grad-reg)" stroke="none" />
                  <defs>
                    <linearGradient id="star-grad-reg" x1="2" y1="2" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F97316" />
                      <stop offset="1" stopColor="#EAB308" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-2xl tracking-tight text-[#0B1A48]">Ji</span>
                  <span className="font-extrabold text-2xl tracking-tight text-[#0B1A48]">NANAM</span>
                </div>
                <div className="text-[9px] font-bold tracking-[0.25em] text-slate-400 uppercase -mt-1">
                  CONNECTING JAIN LIFE.
                </div>
              </div>
            </div>

            {/* Tagline & Subtitle */}
            <div className="space-y-2 text-center lg:text-left max-w-xl">
              <h1 className="text-3xl md:text-4xl font-black text-[#0B1A48] tracking-tight leading-tight">
                One Community. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED]">
                  Infinite Possibilities.
                </span>
              </h1>
              <p className="text-xs md:text-sm font-medium text-slate-500 leading-relaxed max-w-md">
                Connecting Temples, Monks, Families, Pathshalas, Youth, Events, Donations, Learning and Communities across the globe.
              </p>
            </div>

            {/* Central Graphic Container with Orbit Nodes */}
            <div className="relative w-full max-w-[480px] h-[300px] mx-auto flex items-center justify-center my-2">
              
              {/* Background Glow Ring */}
              <div className="absolute w-[260px] h-[260px] rounded-full bg-gradient-to-tr from-sky-400/20 via-indigo-400/20 to-purple-400/20 blur-2xl animate-pulse" />
              
              {/* Animated Spiritual Mandala */}
              <div className="relative w-[240px] h-[240px] rounded-full border-4 border-white/80 shadow-[0_15px_35px_rgba(37,99,235,0.15)] bg-gradient-to-br from-[#0B1A48] via-[#1E3A8A] to-[#0B1A48] flex items-center justify-center overflow-hidden">
                {/* Outer slow spin ring */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ animation: "spin 18s linear infinite" }}>
                  <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
                    <circle cx="110" cy="110" r="104" stroke="url(#g1-reg)" strokeWidth="1.5" strokeDasharray="8 5" opacity="0.6"/>
                    <circle cx="110" cy="110" r="88" stroke="#F97316" strokeWidth="0.8" strokeDasharray="4 8" opacity="0.4"/>
                    <defs>
                      <linearGradient id="g1-reg" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F97316"/>
                        <stop offset="1" stopColor="#EAB308"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                {/* Counter-spin inner ring */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ animation: "spin 10s linear infinite reverse" }}>
                  <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
                    <circle cx="80" cy="80" r="74" stroke="#EAB308" strokeWidth="1" strokeDasharray="6 6" opacity="0.5"/>
                    {[0,45,90,135,180,225,270,315].map((deg, i) => (
                      <circle key={i}
                        cx={80 + 68 * Math.cos((deg * Math.PI) / 180)}
                        cy={80 + 68 * Math.sin((deg * Math.PI) / 180)}
                        r="4" fill="#F97316" opacity="0.7"
                      />
                    ))}
                  </svg>
                </div>
                {/* Static petal SVG */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    {[0,60,120,180,240,300].map((deg, i) => (
                      <ellipse key={i}
                        cx="60" cy="60" rx="18" ry="36"
                        fill="url(#petal-reg)"
                        opacity="0.22"
                        transform={`rotate(${deg} 60 60)`}
                      />
                    ))}
                    <defs>
                      <linearGradient id="petal-reg" x1="60" y1="24" x2="60" y2="96" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F97316"/>
                        <stop offset="1" stopColor="#EAB308" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                {/* Centre Star symbol */}
                <div className="relative z-10 flex flex-col items-center gap-1.5">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15 8L22 9L17 14L18 21L12 17.5L6 21L7 14L2 9L9 8L12 2Z" fill="url(#starG-reg)" />
                    <defs>
                      <linearGradient id="starG-reg" x1="2" y1="2" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F97316"/>
                        <stop offset="1" stopColor="#EAB308"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">JiNANAM</span>
                </div>
              </div>

              {/* Orbiting Category Nodes */}
              <div className="absolute top-2 left-4 md:left-8 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 shadow-md flex items-center justify-center text-orange-500">
                  <span className="text-lg">🛕</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Temples</span>
              </div>

              <div className="absolute top-4 right-4 md:right-8 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 shadow-md flex items-center justify-center text-blue-500">
                  <span className="text-lg">📖</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Learning</span>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 left-0 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 shadow-md flex items-center justify-center text-purple-500">
                  <span className="text-lg">🙏</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Monks</span>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 right-0 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 shadow-md flex items-center justify-center text-emerald-500">
                  <span className="text-lg">👥</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Community</span>
              </div>

              <div className="absolute bottom-4 left-6 md:left-12 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-pink-50 border border-pink-200 shadow-md flex items-center justify-center text-pink-500">
                  <span className="text-lg">💖</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Donations</span>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 shadow-md flex items-center justify-center text-amber-500">
                  <span className="text-lg">📅</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Events</span>
              </div>

              <div className="absolute bottom-4 right-6 md:right-12 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200 shadow-md flex items-center justify-center text-sky-500">
                  <span className="text-lg">👨‍👩‍👧</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Youth</span>
              </div>
            </div>

            {/* Floating Glass Stats Bar */}
            <div className="w-full max-w-lg mx-auto bg-white/80 backdrop-blur-md rounded-2xl border border-white p-3 shadow-[0_8px_25px_rgba(37,99,235,0.06)] grid grid-cols-4 gap-2 text-center">
              <div className="flex flex-col items-center">
                <span className="text-xs font-black text-[#0B1A48] flex items-center gap-1">
                  <span className="text-purple-500 text-sm">👥</span> 5M+
                </span>
                <span className="text-[9px] font-bold text-slate-400">Members</span>
              </div>

              <div className="flex flex-col items-center border-l border-slate-200/60">
                <span className="text-xs font-black text-[#0B1A48] flex items-center gap-1">
                  <span className="text-orange-500 text-sm">🛕</span> 10K+
                </span>
                <span className="text-[9px] font-bold text-slate-400">Temples</span>
              </div>

              <div className="flex flex-col items-center border-l border-slate-200/60">
                <span className="text-xs font-black text-[#0B1A48] flex items-center gap-1">
                  <span className="text-emerald-500 text-sm">🌐</span> 75+
                </span>
                <span className="text-[9px] font-bold text-slate-400">Countries</span>
              </div>

              <div className="flex flex-col items-center border-l border-slate-200/60">
                <span className="text-xs font-black text-[#0B1A48] flex items-center gap-1">
                  <span className="text-blue-500 text-sm">🏛️</span> 1000+
                </span>
                <span className="text-[9px] font-bold text-slate-400">Communities</span>
              </div>
            </div>

          </div>

          {/* ======================================================================= */}
          {/* RIGHT SIDE: Floating White Card with Form                               */}
          {/* ======================================================================= */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-md bg-white rounded-[28px] shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-100 p-6 sm:p-7 flex flex-col justify-between">
              
              <div>
                {/* Top Icon Badge */}
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F2B68] to-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Card Title & Subtitle */}
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-[#0B1A48] tracking-tight">{t("Create Account")}</h2>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{t("Join the Global JiNANAM Community")}</p>
                </div>

                {/* Step Indicator Bar */}
                <div className="flex items-center gap-1.5 mb-5">
                  {STEPS.map((label, i) => (
                    <div key={label} className="flex-1">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          i < step ? "bg-emerald-500" : i === step ? "bg-[#0B1A48] shadow-xs" : "bg-slate-100"
                        )}
                      />
                      <span className={cn(
                        "text-[9px] mt-1 block font-bold truncate text-center",
                        i === step ? "text-[#0B1A48]" : "text-slate-400"
                      )}>
                        {t(label)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── STEP 0: Mobile OTP Verification ────────────────────────── */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t("Mobile Number *")}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="e.g. +91 90000 00001"
                          disabled={otpSent}
                          className="w-full pl-10 pr-4 py-3 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {t("OTP verification ensures unique digital membership pass.")}
                      </p>
                    </div>

                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={busy}
                        className="w-full py-3 px-4 bg-[#0B1A48] hover:bg-[#1E3A8A] text-white text-xs font-black rounded-xl shadow-md shadow-blue-900/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        <span>{t("Send Verification OTP")}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <form onSubmit={onVerify} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {t("Enter 6-Digit OTP")}
                          </label>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="• • • • • •"
                            autoFocus
                            className="w-full py-3 text-center text-lg font-black font-mono tracking-[0.3em] text-slate-900 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={busy || otp.length < 6}
                          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          <span>{t("Verify OTP & Continue")}</span>
                          <Check className="h-4 w-4" />
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* ── STEP 1: Member Type Selection ──────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{t("Mobile Verified")}</span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        {t("Select Member Category")}
                      </label>
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { key: "JAIN", label: "🛕 Jain Member", desc: "Full access to Derasars, Gaccha, Monks & Seva" },
                          { key: "NON_JAIN", label: "👤 Non-Jain Devotee / Guest", desc: "Access to Dharamshalas, Bookings & Facilities" },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setMemberType(opt.key)}
                            className={cn(
                              "p-3.5 rounded-2xl border text-left transition-all active:scale-99",
                              memberType === opt.key
                                ? "bg-blue-50/80 border-[#0B1A48] ring-2 ring-blue-500/20 shadow-xs"
                                : "bg-white border-slate-200/80 hover:border-slate-300"
                            )}
                          >
                            <div className="font-black text-xs text-slate-900">{opt.label}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        {t("Back")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-2/3 py-2.5 bg-[#0B1A48] hover:bg-[#1E3A8A] text-white text-xs font-black rounded-xl shadow-md active:scale-98 transition-all"
                      >
                        {t("Continue")}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Personal & Identity Details ─────────────────────── */}
                {step === 2 && (
                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
                    
                    {/* Name Fields */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[10px] font-extrabold">{t("First Name *")}</Label>
                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 text-xs h-9 rounded-xl" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-extrabold">{t("Middle Name")}</Label>
                        <Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="mt-1 text-xs h-9 rounded-xl" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-extrabold">{t("Surname")}</Label>
                        <Input value={surname} onChange={(e) => setSurname(e.target.value)} className="mt-1 text-xs h-9 rounded-xl" />
                      </div>
                    </div>

                    {/* DOB & Gender */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] font-extrabold">{t("Date of Birth")}</Label>
                        <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 text-xs h-9 rounded-xl" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-extrabold">{t("Gender")}</Label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full mt-1 p-2 h-9 rounded-xl border text-xs font-bold bg-white">
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <Label className="text-[10px] font-extrabold">{t("WhatsApp Number")}</Label>
                      <PhoneField value={whatsapp} onChange={setWhatsapp} placeholder={t("WhatsApp Number")} />
                      <label className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={whatsappSameAsMobile}
                          onChange={(e) => {
                            setWhatsappSameAsMobile(e.target.checked);
                            if (e.target.checked) setWhatsapp(mobile);
                          }}
                          className="h-3 w-3 rounded border-slate-300 accent-blue-600"
                        />
                        <span>{t("Same as mobile number")}</span>
                      </label>
                    </div>

                    {/* Jain Details */}
                    {memberType === "JAIN" && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] font-extrabold">{t("Sect")}</Label>
                            <select value={sect} onChange={(e) => setSect(e.target.value)} className="w-full mt-1 p-2 h-9 rounded-xl border text-xs font-bold bg-white">
                              <option>Shwetambar</option>
                              <option>Digambar</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-[10px] font-extrabold">{t("Sub-Community")}</Label>
                            <select value={subCommunity} onChange={(e) => setSubCommunity(e.target.value)} className="w-full mt-1 p-2 h-9 rounded-xl border text-xs font-bold bg-white">
                              <option>Murtipujak (Deravasi)</option>
                              <option>Sthanakvasi</option>
                              <option>Terapanth</option>
                            </select>
                          </div>
                        </div>

                        {subCommunity.includes("Murtipujak") && (
                          <div>
                            <Label className="text-[10px] font-extrabold">{t("Gaccha (75+ Options)")}</Label>
                            <select value={gaccha} onChange={(e) => setGaccha(e.target.value)} className="w-full mt-1 p-2 h-9 rounded-xl border text-xs font-bold bg-white">
                              {MURTIPUJAK_GACCHAS.map((g) => (
                                <option key={g}>{g}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Non-Jain Documents */}
                    {memberType === "NON_JAIN" && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <Label className="text-[10px] font-extrabold">{t("Government ID Verification")}</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <select value={govIdType1} onChange={(e) => setGovIdType1(e.target.value)} className="w-full p-2 h-9 rounded-xl border text-xs bg-white">
                            {GOV_ID_TYPES.map((d) => <option key={d}>{d}</option>)}
                          </select>
                          <Input placeholder="ID Number" value={govIdNum1} onChange={(e) => setGovIdNum1(e.target.value)} className="text-xs h-9 rounded-xl" />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        {t("Back")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="w-2/3 py-2.5 bg-[#0B1A48] hover:bg-[#1E3A8A] text-white text-xs font-black rounded-xl shadow-md active:scale-98 transition-all"
                      >
                        {t("Next: Consents")}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Consents & ID Generation ───────────────────────── */}
                {step === 3 && (
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2 text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={consentTerms} onChange={(e) => setConsentTerms(e.target.checked)} className="mt-0.5 accent-blue-600" />
                        <span className="text-[11px] font-medium leading-tight">I agree to the Terms &amp; Privacy Policy of JiNANAM.</span>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={consentServices} onChange={(e) => setConsentServices(e.target.checked)} className="mt-0.5 accent-blue-600" />
                        <span className="text-[11px] font-medium leading-tight">I agree to receive booking, donation and event passes on WhatsApp &amp; SMS.</span>
                      </label>

                      {age > 0 && age < 18 && (
                        <label className="flex items-start gap-2 cursor-pointer text-rose-700 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200">
                          <input type="checkbox" checked={consentGuardian} onChange={(e) => setConsentGuardian(e.target.checked)} className="mt-0.5 accent-rose-600" />
                          <span className="text-[10px]">Guardian consent required for members under 18.</span>
                        </label>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        {t("Back")}
                      </button>
                      <button
                        type="submit"
                        disabled={busy}
                        className="w-2/3 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        <span>{t("Complete Registration")}</span>
                      </button>
                    </div>
                  </form>
                )}

              </div>

              {/* Bottom Sign-In Link */}
              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  {t("Already have an account?")}{" "}
                  <Link to="/member/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                    {t("Sign In")}
                  </Link>
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Unique ID Overlay Modal */}
      {createdMemberId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-5 shadow-2xl border border-orange-200 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
              ✓
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-orange-600 uppercase">REGISTRATION SUCCESSFUL</span>
              <h2 className="text-2xl font-black text-slate-900">{t("Welcome to JiNANAM")}</h2>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-xs font-bold text-slate-500">
                {memberType === "NON_JAIN" ? "Non-Jain Unique Member ID:" : "Jain Unique Member ID:"}
              </span>
              <div className="text-3xl font-black font-mono text-orange-600 tracking-wider">
                {createdMemberId}
              </div>
            </div>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(createdMemberId);
                toast.success(t("Unique Member ID copied to clipboard!"));
                navigate("/member/home");
              }}
              className="w-full font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl py-3 shadow-lg"
            >
              {t("Copy Unique ID & Open Dashboard")}
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
