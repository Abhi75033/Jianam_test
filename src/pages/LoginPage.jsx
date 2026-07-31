import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, Lock, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const {
    loginWithPassword,
    requestOtp,
    verifyOtp,
    requestEmailOtp,
    verifyEmailOtp,
    loginWithEmailPassword,
    loginWithGoogle,
    isAuthenticated
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [mode, setMode] = useState("otp"); // Default to Mobile OTP
  const [mobile, setMobile] = useState("+919999900000");
  const [email, setEmail] = useState("admin@jinanam.app");
  const [password, setPassword] = useState("ChangeMe@108");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mobile.includes("@")) {
        await loginWithEmailPassword({ email: mobile, password });
      } else {
        await loginWithPassword({ mobile, password });
      }
      toast.success(t("Welcome back!"));
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onRequestOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await requestOtp(mobile);
      setOtpSent(true);
      if (res?.devOtp) {
        toast.info(`DEV OTP Code: ${res.devOtp}`, { duration: 10000 });
      } else {
        toast.success(t("MSG91 OTP sent to your Indian mobile number (+91)."));
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp({ mobile, otp });
      toast.success(t("Signed in successfully."));
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onRequestEmailOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await requestEmailOtp(email);
      setEmailOtpSent(true);
      if (res?.devOtp) {
        toast.info(`DEV Email OTP Code: ${res.devOtp}`, { duration: 10000 });
      } else {
        toast.success(t("Verification OTP sent to your Email address."));
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onVerifyEmailOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyEmailOtp({ email, otp });
      toast.success(t("Email verified. Signed in successfully."));
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      // Execute Google OAuth Sign-In flow
      const dummyEmail = prompt("Enter your Google Account email for Google Sign-In simulation:", "user.international@gmail.com");
      if (!dummyEmail) {
        setLoading(false);
        return;
      }
      await loginWithGoogle({
        email: dummyEmail,
        googleId: "google-oauth-108",
        firstName: "International",
        lastName: "Member",
      });
      toast.success(t("Signed in with Google."));
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden p-1">
              <img src="/logo.png" alt={t("JiNANAM Logo")} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-brand text-2xl leading-none">{t("JiNANAM")}</div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
                {t("Admin & Member Portal")}
              </div>
            </div>
          </div>

          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t("Welcome back.")}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t("Choose your preferred authentication method to continue.")}
          </p>

          <Card className="mt-8 p-6 rounded-md border-border space-y-6">
            <Tabs value={mode} onValueChange={(m) => { setMode(m); setError(""); }}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="otp" data-testid="login-tab-otp" className="text-xs">
                  📱 {t("Mobile OTP")}
                </TabsTrigger>
                <TabsTrigger value="email" data-testid="login-tab-email" className="text-xs">
                  📧 {t("Email OTP")}
                </TabsTrigger>
                <TabsTrigger value="password" data-testid="login-tab-password" className="text-xs">
                  🔒 {t("Password")}
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: MSG91 Mobile OTP (+91 India) */}
              <TabsContent value="otp">
                <form onSubmit={otpSent ? onVerifyOtp : (e) => { e.preventDefault(); onRequestOtp(); }} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                    🇮🇳 <strong>MSG91 SMS OTP</strong> is configured for Indian (+91) mobile numbers to optimize messaging costs.
                  </div>
                  <div>
                    <Label htmlFor="mobile-otp" className="text-xs font-medium">
                      {t("Indian Mobile Number (+91)")}
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="mobile-otp"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder={t("+91XXXXXXXXXX")}
                        className="pl-9"
                        disabled={otpSent}
                        required
                        data-testid="login-otp-mobile-input"
                      />
                    </div>
                  </div>
                  {otpSent && (
                    <div>
                      <Label htmlFor="otp" className="text-xs font-medium">
                        {t("One-Time Password (OTP)")}
                      </Label>
                      <div className="relative mt-1">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder={t("6-digit code")}
                          className="pl-9 tracking-widest font-mono"
                          maxLength={6}
                          required
                          data-testid="login-otp-code-input"
                        />
                      </div>
                    </div>
                  )}
                  {error && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-10 bg-orange-600 hover:bg-orange-700 text-white font-bold"
                    disabled={loading}
                    data-testid={otpSent ? "login-otp-verify-button" : "login-otp-request-button"}
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {otpSent ? t("Verify & Sign In") : t("Send MSG91 Mobile OTP")}
                  </Button>
                  {otpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      {t("Change mobile number")}
                    </button>
                  )}
                </form>
              </TabsContent>

              {/* Tab 2: Email OTP / International Authentication */}
              <TabsContent value="email">
                <form onSubmit={emailOtpSent ? onVerifyEmailOtp : (e) => { e.preventDefault(); onRequestEmailOtp(); }} className="space-y-4">
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sky-900 text-xs">
                    🌐 <strong>International & Email Login:</strong> Recommended for users outside India or non-+91 numbers to avoid international SMS charges.
                  </div>
                  <div>
                    <Label htmlFor="email-input" className="text-xs font-medium">
                      {t("Email Address")}
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@domain.com"
                        className="bg-white"
                        disabled={emailOtpSent}
                        required
                      />
                    </div>
                  </div>
                  {emailOtpSent && (
                    <div>
                      <Label htmlFor="email-otp-input" className="text-xs font-medium">
                        {t("Email Verification Code")}
                      </Label>
                      <div className="relative mt-1">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email-otp-input"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder={t("6-digit email code")}
                          className="pl-9 tracking-widest font-mono"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>
                  )}
                  {error && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-10 bg-sky-600 hover:bg-sky-700 text-white font-bold"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {emailOtpSent ? t("Verify Email Code") : t("Send Email Verification OTP")}
                  </Button>
                  {emailOtpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setEmailOtpSent(false);
                        setOtp("");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      {t("Change email address")}
                    </button>
                  )}
                </form>
              </TabsContent>

              {/* Tab 3: Password Authentication (Admin & Staff) */}
              <TabsContent value="password">
                <form onSubmit={onPasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="mobile-pw" className="text-xs font-medium">
                      {t("Mobile Number or Email")}
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="mobile-pw"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder={t("+91XXXXXXXXXX or email@domain.com")}
                        className="pl-9"
                        required
                        data-testid="login-mobile-input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-xs font-medium">
                      {t("Password")}
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("Your password")}
                        className="pl-9"
                        required
                        data-testid="login-password-input"
                      />
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-10"
                    disabled={loading}
                    data-testid="login-submit-button"
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t("Sign In with Password")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span></div>
            </div>

            {/* Google Sign-In Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-10 border-slate-300 hover:bg-slate-50 font-bold flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {t("Sign in with Google")}
            </Button>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2">
                {t("Demo Credentials")}
              </div>
              <div className="text-xs text-foreground/70 space-y-0.5 font-mono">
                <div><span className="text-muted-foreground">{t("Super Admin:")}</span> +919999900000 / ChangeMe@108</div>
                <div><span className="text-muted-foreground">{t("Temple Admin:")}</span> +919999900001 / ChangeMe@108</div>
              </div>
            </div>
          </Card>

          <p className="text-[11px] text-muted-foreground text-center mt-6">
            {t("By signing in you agree to our terms of use and privacy policy.")}
          </p>
        </div>
      </div>

      {/* Right: Hero */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1524443169398-9aa1ceab67d5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHxqYWluJTIwdGVtcGxlJTIwYXJjaGl0ZWN0dXJlJTIwcGVhY2VmdWx8ZW58MHx8fHwxNzgzMzM1OTQ4fDA&ixlib=rb-4.1.0&q=85"
          alt={t("Jain temple")}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 login-hero-overlay" />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <div className="text-[11px] tracking-[0.28em] uppercase text-white/80 mb-3">
            {t("Serving the Jain community")}
          </div>
          <h2 className="font-brand text-4xl xl:text-5xl leading-tight mb-4">
            {t("One platform. Every temple, monk & seva — beautifully organised.")}
          </h2>
          <p className="text-white/85 text-sm max-w-md leading-relaxed">
            {t("Bookings, donations, events, tracking and reports for temples, dharamshalas & Jain centers — all in one refined admin experience.")}
          </p>
          <div className="mt-8 flex items-center gap-6 text-xs text-white/80">
            <div>
              <div className="font-mono-num text-2xl text-white">83</div>
              <div className="uppercase tracking-widest text-[10px]">{t("Gacchas")}</div>
            </div>
            <div>
              <div className="font-mono-num text-2xl text-white">23</div>
              <div className="uppercase tracking-widest text-[10px]">{t("Tirthankaras")}</div>
            </div>
            <div>
              <div className="font-mono-num text-2xl text-white">11</div>
              <div className="uppercase tracking-widest text-[10px]">{t("Roles")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
