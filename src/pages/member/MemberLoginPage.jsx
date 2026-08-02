import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Phone, Shield,
  HelpCircle, Loader2
} from "lucide-react";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Users are stored against an exact E.164 string, so anything a person types
 * naturally — "+ 91 90000-00001", "(+91) 9000000001" — has to be collapsed
 * before it is sent, or the lookup silently misses and the API reports invalid
 * credentials. A bare 10-digit Indian number is given the +91 prefix.
 */
function normalizeMobile(raw) {
  const s = String(raw || "").replace(/[^\d+]/g, "");
  if (!s) return "";
  if (s.startsWith("+")) return `+${s.slice(1).replace(/\+/g, "")}`;
  if (/^[6-9]\d{9}$/.test(s)) return `+91${s}`;      // bare Indian mobile
  if (/^91[6-9]\d{9}$/.test(s)) return `+${s}`;      // 91XXXXXXXXXX
  if (/^0[6-9]\d{9}$/.test(s)) return `+91${s.slice(1)}`; // leading 0
  return `+${s}`;
}

/**
 * Exact JiNANAM Member Login Page — matches the official design spec & mockup.
 */
export default function MemberLoginPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    loginWithPassword,
    requestOtp,
    verifyOtp,
    isAuthenticated
  } = useMemberAuth();

  // Mode: "password" | "mobile_otp"
  const [loginMode, setLoginMode] = useState("password");

  // Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Mode State
  const [otpMobile, setOtpMobile] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/member/home" replace />;
  }

  // Handle Phone / Email + Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      // Show it inline as well as in a toast — a toast alone made the Login
      // button look dead when both fields were empty.
      const msg = t("Please enter your mobile number and password.");
      setError(msg);
      toast.error(msg);
      return;
    }
    setError("");
    setLoading(true);
    try {
      {
        // Mobile + Password → /auth/login/password.
        // The user record is keyed on the exact E.164 string, so "+ 91 90000-00001"
        // must be normalised to "+919000000001" or the lookup misses and the API
        // answers "Invalid mobile number or password". trim() alone left the
        // space after the "+".
        await loginWithPassword({ mobile: normalizeMobile(identifier), password });
      }
      toast.success(t("Welcome back! Jai Jinendra 🙏"));
      navigate("/member/home", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Mobile OTP Login
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpMobile.trim()) {
      toast.error(t("Please enter your mobile number."));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await requestOtp(otpMobile.trim());
      setOtpSent(true);
      toast.success(t("Verification OTP sent via MSG91."));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpValue.trim()) {
      toast.error(t("Please enter the OTP."));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await verifyOtp({ mobile: otpMobile.trim(), otp: otpValue.trim() });
      toast.success(t("Login successful! Jai Jinendra 🙏"));
      navigate("/member/home", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF2FF] via-[#F4F7FF] to-[#E9F0FD] flex items-center justify-center p-3 md:p-6 lg:p-10 font-sans text-slate-800">
      {/* Master Main Container Window */}
      <div className="w-full max-w-[1240px] bg-gradient-to-br from-[#F5F8FF]/90 via-white/80 to-[#EDF3FF]/90 backdrop-blur-xl rounded-[32px] border border-white/80 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12)] overflow-hidden flex flex-col justify-between min-h-[680px]">
        
        {/* Top Content Row: Left Visual + Right Form */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 items-center p-6 md:p-10 gap-8">
          
          {/* ======================================================================= */}
          {/* LEFT SIDE: Brand, Tagline, Central Temple Artwork & Orbiting Icons      */}
          {/* ======================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
            
            {/* Top Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0F2B68] to-[#1E40AF] flex items-center justify-center shadow-md shadow-indigo-900/20">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 17.5L6 21L7 14L2 9L9 8L12 2Z" fill="url(#star-grad)" stroke="none" />
                  <defs>
                    <linearGradient id="star-grad" x1="2" y1="2" x2="22" y2="21" gradientUnits="userSpaceOnUse">
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
              
              {/* Temple Artwork Image */}
              <div className="relative w-[240px] h-[240px] rounded-full overflow-hidden border-4 border-white/80 shadow-[0_15px_35px_rgba(37,99,235,0.15)] bg-gradient-to-b from-sky-100 to-indigo-50 flex items-center justify-center">
                <img 
                  src="/images/login_temple_bg.png" 
                  alt="JiNANAM Jain Temple" 
                  className="w-full h-full object-cover scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden flex-col items-center justify-center text-center p-4">
                  <span className="text-6xl">🛕</span>
                  <span className="text-xs font-bold text-indigo-900 mt-2">JiNANAM Temple</span>
                </div>
              </div>

              {/* Orbiting Category Nodes */}
              {/* 1. Temples (Top Left) */}
              <div className="absolute top-2 left-4 md:left-8 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 shadow-md flex items-center justify-center text-orange-500">
                  <span className="text-lg">🛕</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Temples</span>
              </div>

              {/* 2. Learning (Top Right) */}
              <div className="absolute top-4 right-4 md:right-8 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 shadow-md flex items-center justify-center text-blue-500">
                  <span className="text-lg">📖</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Learning</span>
              </div>

              {/* 3. Monks (Mid Left) */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 shadow-md flex items-center justify-center text-purple-500">
                  <span className="text-lg">🙏</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Monks</span>
              </div>

              {/* 4. Community (Mid Right) */}
              <div className="absolute top-1/2 -translate-y-1/2 right-0 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 shadow-md flex items-center justify-center text-emerald-500">
                  <span className="text-lg">👥</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Community</span>
              </div>

              {/* 5. Donations (Bottom Left) */}
              <div className="absolute bottom-4 left-6 md:left-12 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-pink-50 border border-pink-200 shadow-md flex items-center justify-center text-pink-500">
                  <span className="text-lg">💖</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Donations</span>
              </div>

              {/* 6. Events (Bottom Mid) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 shadow-md flex items-center justify-center text-amber-500">
                  <span className="text-lg">📅</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">Events</span>
              </div>

              {/* 7. Youth (Bottom Right) */}
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
            <div className="w-full max-w-md bg-white rounded-[28px] shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-100 p-7 md:p-8 flex flex-col justify-between">
              
              <div>
                {/* Top Icon Badge */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F2B68] to-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2L15 8L22 9L17 14L18 21L12 17.5L6 21L7 14L2 9L9 8L12 2Z" fill="#F97316" stroke="none" />
                    </svg>
                  </div>
                </div>

                {/* Card Title & Subtitle */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-[#0B1A48] tracking-tight">Welcome Back</h2>
                  <p className="text-xs font-medium text-slate-400 mt-1">Continue your journey with JiNANAM</p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* ================================================================= */}
                {/* MODE 1: PHONE / EMAIL + PASSWORD LOGIN                           */}
                {/* ================================================================= */}
                {loginMode === "password" && (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    {/* Identifier Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="e.g. +91 90000 00001"
                          className="w-full pl-10 pr-4 py-3 text-xs font-medium text-slate-800 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-10 pr-10 py-3 text-xs font-medium text-slate-800 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password Row */}
                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Remember Me
                      </label>
                      <button
                        type="button"
                        onClick={() => toast.info(t("Password reset link sent to your registered contact."))}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* Main Dark Navy Login Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-[#0B1A48] hover:bg-[#071234] text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span>Login</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ================================================================= */}
                {/* MODE 2: MOBILE OTP LOGIN                                         */}
                {/* ================================================================= */}
                {loginMode === "mobile_otp" && (
                  <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          value={otpMobile}
                          onChange={(e) => setOtpMobile(e.target.value)}
                          placeholder="+91 9999900000"
                          disabled={otpSent}
                          className="w-full pl-10 pr-4 py-3 text-xs font-medium text-slate-800 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-60"
                        />
                      </div>
                    </div>

                    {otpSent && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Enter 6-Digit OTP
                        </label>
                        <input
                          type="text"
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value)}
                          placeholder="Enter 6-digit OTP code"
                          maxLength={6}
                          className="w-full px-4 py-3 text-center text-sm font-bold tracking-widest text-slate-800 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-[#0B1A48] hover:bg-[#071234] text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span>{otpSent ? "Verify OTP & Login" : "Send Mobile OTP"}</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    {otpSent && (
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpValue(""); }}
                        className="w-full text-center text-xs font-medium text-blue-600 hover:underline"
                      >
                        ← Change Mobile Number
                      </button>
                    )}
                  </form>
                )}

                {/* §4.2.2 specifies two login methods only: Mobile+OTP (primary)
                    and Mobile+Password (secondary). Google and Apple were neither in
                    the spec nor on the API (/auth/google returns 404), so they are
                    removed rather than left as buttons that cannot work. */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/80" />
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="bg-white px-3 text-slate-400 font-medium uppercase tracking-wider">
                      or
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* Mode Toggle Button: Mobile OTP / Password toggle */}
                  {loginMode === "password" ? (
                    <button
                      type="button"
                      onClick={() => { setLoginMode("mobile_otp"); setError(""); }}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-3 transition-all hover:border-slate-300 active:scale-[0.995]"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Continue with Mobile OTP</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setLoginMode("password"); setError(""); }}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-3 transition-all hover:border-slate-300 active:scale-[0.995]"
                    >
                      <Lock className="w-4 h-4 text-indigo-600" />
                      <span>Login with Password</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Register Link */}
              <div className="pt-6 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Don't have an account?{" "}
                  <Link to="/member/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                    Create Account
                  </Link>
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* BOTTOM FOOTER BAR (Matches mock specification)                           */}
        {/* ======================================================================= */}
        <div className="border-t border-slate-200/60 bg-white/40 backdrop-blur-md px-6 md:px-10 py-3.5 flex flex-col md:flex-row items-center justify-between text-[11px] font-medium text-slate-500 gap-2">
          
          {/* Left Footer: Secure Login */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-700">Secure Login</span>
              <span className="mx-1.5 text-slate-300">|</span>
              <span>Your data is protected with enterprise-grade security</span>
            </div>
          </div>

          {/* Center Footer: Foundation Text */}
          <div className="text-center font-semibold text-slate-600">
            <span className="font-bold text-[#0B1A48]">JiNANAM Foundation</span>
            <span className="hidden lg:inline text-slate-400 font-normal"> — Building a united, empowered and compassionate Jain community.</span>
          </div>

          {/* Right Footer: Support Link */}
          <div className="flex items-center gap-1.5 text-blue-600 font-semibold hover:underline cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need Help? Contact our support team</span>
          </div>

        </div>

      </div>
    </div>
  );
}
