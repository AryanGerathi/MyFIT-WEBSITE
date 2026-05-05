import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dumbbell, Eye, EyeOff, Loader2, ShieldCheck, RotateCcw, Home, Compass, KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { authService, APIError } from "@/services/backendService";

type Mode   = "login" | "signup";
type Role   = "user" | "creator";
type Screen = "form" | "otp";

// ─── Forgot-password sub-screens ─────────────────────────────────────────────
type FPStep = "email" | "otp" | "newPassword";

const COUNTRY_CODES = [
  { code: "+91",  flag: "🇮🇳" },
  { code: "+1",   flag: "🇺🇸" },
  { code: "+44",  flag: "🇬🇧" },
  { code: "+61",  flag: "🇦🇺" },
  { code: "+971", flag: "🇦🇪" },
  { code: "+65",  flag: "🇸🇬" },
];

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = value.split("");
    arr[i] = digit;
    const next = arr.join("").slice(0, 6);
    onChange(next);
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center mt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-lg font-semibold border-2 rounded-lg
                     border-border focus:border-accent focus:outline-none
                     bg-background transition-colors"
        />
      ))}
    </div>
  );
}

// ─── Signup OTP Screen ────────────────────────────────────────────────────────
function OTPScreen({
  userId, maskedEmail, returnTo, onSuccess, onBack,
}: {
  userId: string;
  maskedEmail: string;
  returnTo: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [otp,       setOtp]       = useState("");
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length < 6) { toast.error("Please enter the full 6-digit OTP."); return; }
    setLoading(true);
    try {
      const data = await authService.verifyOTP({ userId, otp, purpose: "signup" });
      authService.saveSession(data.token, data.user);
      toast.success("Account created! Welcome 🎉");
      onSuccess();
      const destination = returnTo || (data.user.role === "creator" ? "/creator-dashboard" : "/dashboard");
      navigate(destination, { replace: true });
    } catch (err) {
      if (err instanceof APIError) { toast.error(err.message); if (err.status === 429) setOtp(""); }
      else toast.error("Cannot connect to server.");
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const data = await authService.resendOTP({ userId, purpose: "signup" });
      toast.success(data.message);
      setOtp("");
      setCountdown(60);
    } catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Cannot connect to server.");
    } finally { setResending(false); }
  };

  return (
    <div className="space-y-6 mt-4 text-center">
      <div className="flex justify-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
          <ShieldCheck size={28} />
        </span>
      </div>
      <div>
        <h2 className="font-display font-bold text-xl">Verify your email</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We sent a 6-digit OTP to{" "}
          <span className="font-medium text-foreground">{maskedEmail}</span>
        </p>
      </div>

      <OTPInput value={otp} onChange={setOtp} />

      <Button
        onClick={handleVerify} disabled={loading || otp.length < 6}
        size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin mr-2" />Verifying…</>
          : "Verify & Create Account"}
      </Button>

      <div className="text-sm text-muted-foreground">
        {countdown > 0 ? (
          <p>Resend OTP in <span className="font-medium text-foreground">{countdown}s</span></p>
        ) : (
          <button
            onClick={handleResend} disabled={resending}
            className="inline-flex items-center gap-1.5 text-accent font-medium hover:underline disabled:opacity-50"
          >
            {resending
              ? <><Loader2 size={13} className="animate-spin" />Sending…</>
              : <><RotateCcw size={13} />Resend OTP</>}
          </button>
        )}
      </div>

      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to signup
      </button>
    </div>
  );
}

// ─── Forgot Password Flow ─────────────────────────────────────────────────────
function ForgotPasswordFlow({ onBack }: { onBack: () => void }) {
  const [step,        setStep]        = useState<FPStep>("email");
  const [email,       setEmail]       = useState("");
  const [userId,      setUserId]      = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp,         setOtp]         = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [resending,   setResending]   = useState(false);
  const [countdown,   setCountdown]   = useState(0);
  const [emailErr,    setEmailErr]    = useState("");
  const [pwErr,       setPwErr]       = useState("");

  // Countdown for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const getMaskedEmail = (em: string) => {
    const [local, domain] = em.split("@");
    return `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
  };

  // ── Step 1: Email ──────────────────────────────────────────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr("Enter a valid email address");
      return;
    }
    setEmailErr("");
    setLoading(true);
    try {
      const data = await authService.forgotPassword({ email });
      setUserId(data.userId);
      setMaskedEmail(getMaskedEmail(email));
      toast.success(data.message);
      setCountdown(60);
      setStep("otp");
    } catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Cannot connect to server.");
    } finally { setLoading(false); }
  };

  // ── Step 2: OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    try {
      const data = await authService.resendOTP({ userId, purpose: "forgot-password" });
      toast.success(data.message);
      setOtp("");
      setCountdown(60);
    } catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Cannot connect to server.");
    } finally { setResending(false); }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) { toast.error("Please enter the full 6-digit OTP."); return; }
    // We don't fully verify here — the backend verifies OTP + new password atomically
    // in reset-password. We just move to the next step.
    setStep("newPassword");
  };

  // ── Step 3: New Password ───────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) { setPwErr("Password must be at least 6 characters"); return; }
    if (newPw !== confirmPw) { setPwErr("Passwords do not match"); return; }
    setPwErr("");
    setLoading(true);
    try {
      const data = await authService.resetPassword({ userId, otp, newPassword: newPw });
      toast.success(data.message || "Password reset! Please log in.");
      onBack(); // return to login form
    } catch (err) {
      if (err instanceof APIError) {
        // If OTP was wrong/expired, send user back to OTP step
        if (err.status === 400 || err.status === 410) {
          toast.error(err.message);
          setStep("otp");
          setOtp("");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Cannot connect to server.");
      }
    } finally { setLoading(false); }
  };

  // ── Render: Email step ─────────────────────────────────────────────────────
  if (step === "email") {
    return (
      <div className="space-y-6 mt-4">
        <div className="flex justify-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
            <Mail size={28} />
          </span>
        </div>
        <div className="text-center">
          <h2 className="font-display font-bold text-xl">Forgot password?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your registered email and we'll send you a reset OTP.
          </p>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="fp-email">Email address</Label>
            <Input
              id="fp-email" type="email" placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
              className={`mt-1.5 ${emailErr ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {emailErr && <p className="text-xs text-destructive mt-1">{emailErr}</p>}
          </div>

          <Button
            type="submit" size="lg" disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin mr-2" />Sending OTP…</>
              : "Send Reset OTP"}
          </Button>
        </form>

        <button
          onClick={onBack}
          className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to login
        </button>
      </div>
    );
  }

  // ── Render: OTP step ───────────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="space-y-6 mt-4 text-center">
        <div className="flex justify-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
            <ShieldCheck size={28} />
          </span>
        </div>
        <div>
          <h2 className="font-display font-bold text-xl">Check your inbox</h2>
          <p className="text-sm text-muted-foreground mt-1">
            We sent a 6-digit OTP to{" "}
            <span className="font-medium text-foreground">{maskedEmail}</span>
          </p>
        </div>

        <OTPInput value={otp} onChange={setOtp} />

        <Button
          onClick={handleVerifyOTP} disabled={otp.length < 6}
          size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Continue
        </Button>

        <div className="text-sm text-muted-foreground">
          {countdown > 0 ? (
            <p>Resend OTP in <span className="font-medium text-foreground">{countdown}s</span></p>
          ) : (
            <button
              onClick={handleResend} disabled={resending}
              className="inline-flex items-center gap-1.5 text-accent font-medium hover:underline disabled:opacity-50"
            >
              {resending
                ? <><Loader2 size={13} className="animate-spin" />Sending…</>
                : <><RotateCcw size={13} />Resend OTP</>}
            </button>
          )}
        </div>

        <button
          onClick={() => setStep("email")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Change email
        </button>
      </div>
    );
  }

  // ── Render: New Password step ──────────────────────────────────────────────
  return (
    <div className="space-y-6 mt-4">
      <div className="flex justify-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
          <KeyRound size={28} />
        </span>
      </div>
      <div className="text-center">
        <h2 className="font-display font-bold text-xl">Set new password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="fp-new-pw">New password</Label>
          <div className="relative mt-1.5">
            <Input
              id="fp-new-pw"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={newPw}
              onChange={(e) => { setNewPw(e.target.value); setPwErr(""); }}
              className={`pr-10 ${pwErr ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            <button
              type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="fp-confirm-pw">Confirm new password</Label>
          <div className="relative mt-1.5">
            <Input
              id="fp-confirm-pw"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); setPwErr(""); }}
              className={`pr-10 ${pwErr ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            <button
              type="button" onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pwErr && <p className="text-xs text-destructive mt-1">{pwErr}</p>}
        </div>

        <Button
          type="submit" size="lg" disabled={loading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin mr-2" />Resetting…</>
            : "Reset Password"}
        </Button>
      </form>

      <button
        onClick={() => setStep("otp")}
        className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to OTP
      </button>
    </div>
  );
}

// ─── Auth Form ────────────────────────────────────────────────────────────────
function AuthForm({
  mode, role, returnTo, onForgotPassword,
}: {
  mode: Mode;
  role: Role;
  returnTo: string;
  onForgotPassword: () => void;
}) {
  const navigate = useNavigate();

  const [screen,      setScreen]      = useState<Screen>("form");
  const [userId,      setUserId]      = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [password,    setPassword]    = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const clearError = (key: string) => setErrors((prev) => ({ ...prev, [key]: "" }));

  const getMaskedEmail = (em: string) => {
    const local = em.split("@")[0];
    return `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 2, 1))}@${em.split("@")[1]}`;
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (mode === "signup" && !name.trim())
      errs.name = "Full name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address";
    if (mode === "signup" && phone.replace(/\D/g, "").length < 10)
      errs.phone = "Enter a valid 10-digit mobile number";
    if (password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (mode === "signup" && password !== confirmPw)
      errs.confirmPw = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        const data = await authService.signup({ name, email, phone, countryCode, password, role });
        setUserId(data.userId);
        setMaskedEmail(getMaskedEmail(email));
        toast.success(data.message);
        setScreen("otp");
      } else {
        const data = await authService.login({ email, password });
        authService.saveSession(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
        const destination = returnTo || (data.user.role === "creator" ? "/creator-dashboard" : "/dashboard");
        navigate(destination, { replace: true });
      }
    } catch (err) {
      if (err instanceof APIError) {
        if (err.fieldErrors.length > 0) {
          const fe: Record<string, string> = {};
          err.fieldErrors.forEach(({ field, message }) => { fe[field] = message; });
          setErrors(fe);
          toast.error("Please fix the errors below.");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Cannot connect to server. Is the backend running?");
      }
    } finally { setLoading(false); }
  };

  const inputCls = (key: string) =>
    errors[key] ? "border-destructive focus-visible:ring-destructive" : "";

  if (screen === "otp") {
    return (
      <OTPScreen
        userId={userId}
        maskedEmail={maskedEmail}
        returnTo={returnTo}
        onSuccess={() => setScreen("form")}
        onBack={() => setScreen("form")}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>
      {mode === "signup" && (
        <div>
          <Label htmlFor={`name-${role}`}>Full name</Label>
          <Input
            id={`name-${role}`} placeholder="Your name" value={name}
            onChange={(e) => { setName(e.target.value); clearError("name"); }}
            className={`mt-1.5 ${inputCls("name")}`}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>
      )}

      <div>
        <Label htmlFor={`email-${role}`}>Email</Label>
        <Input
          id={`email-${role}`} type="email" placeholder="you@example.com" value={email}
          onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
          className={`mt-1.5 ${inputCls("email")}`}
        />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
      </div>

      {mode === "signup" && (
        <div>
          <Label htmlFor={`phone-${role}`}>Mobile number</Label>
          <div className="flex gap-2 mt-1.5">
            <select
              value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <div className="flex-1">
              <Input
                id={`phone-${role}`} type="tel" inputMode="numeric"
                placeholder="98765 43210" maxLength={10} value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); clearError("phone"); }}
                className={inputCls("phone")}
              />
            </div>
          </div>
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`pwd-${role}`}>Password</Label>
          {/* ── Forgot password link — login mode only ── */}
          {mode === "login" && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-accent font-medium hover:underline"
            >
              Forgot password?
            </button>
          )}
        </div>
        <div className="relative mt-1.5">
          <Input
            id={`pwd-${role}`} type={showPw ? "text" : "password"} placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
            className={`pr-10 ${inputCls("password")}`}
          />
          <button type="button" onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
      </div>

      {mode === "signup" && (
        <div>
          <Label htmlFor={`confirm-${role}`}>Confirm password</Label>
          <div className="relative mt-1.5">
            <Input
              id={`confirm-${role}`} type={showConfirm ? "text" : "password"} placeholder="••••••••"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); clearError("confirmPw"); }}
              className={`pr-10 ${inputCls("confirmPw")}`}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPw && <p className="text-xs text-destructive mt-1">{errors.confirmPw}</p>}
        </div>
      )}

      <Button
        type="submit" size="lg" disabled={loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin mr-2" />Please wait…</>
          : mode === "login"
            ? "Login"
            : `Create account as ${role === "creator" ? "Creator" : "User"}`}
      </Button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Auth({ mode }: { mode: Mode }) {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const location  = useLocation();

  const initialRole: Role = params.get("role") === "creator" ? "creator" : "user";
  const returnTo: string  = (location.state as { returnTo?: string })?.returnTo ?? "";

  // Controls whether the forgot-password flow overlays the card
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (authService.isLoggedIn()) {
      const user = authService.getStoredUser();
      const destination = returnTo || (user?.role === "creator" ? "/creator-dashboard" : "/dashboard");
      navigate(destination, { replace: true });
    }
  }, [navigate, returnTo]);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Navbar ── */}
      <header className="h-16 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 relative">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent shadow-glow">
              <Dumbbell size={16} className="text-accent-foreground" />
            </span>
            <span className="font-display font-bold text-xl">
              My<span className="text-accent">Fit</span>
            </span>
          </Link>

          {/* Nav links — centered */}
          <nav className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/"><Home size={15} /></Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/explore"><Compass size={15} /></Link>
            </Button>
          </nav>

          {/* Auth button — stays right */}
          <div className="ml-auto">
            {mode === "login" ? (
              <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/signup" state={{ returnTo }}>Sign up</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/login" state={{ returnTo }}>Login</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Two-column layout ── */}
      <div className="flex-1 grid lg:grid-cols-2">

        {/* Left decorative panel */}
        <div className="hidden lg:flex relative gradient-hero p-12 text-white items-end">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: "radial-gradient(circle at 30% 30%, hsl(222 89% 55% / 0.6), transparent 50%)",
          }} />
          <div className="relative">
            <h2 className="font-display font-bold text-4xl leading-tight">
              Your transformation<br />starts here.
            </h2>
            <p className="text-white/70 mt-3 max-w-md">
              Join thousands of users training with India's best fitness creators.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
          <Card className="w-full max-w-md p-8 border-border/60 shadow-card">

            {/* ── Forgot Password overlay inside the same card ── */}
            {showForgotPassword ? (
              <ForgotPasswordFlow onBack={() => setShowForgotPassword(false)} />
            ) : (
              <>
                <h1 className="font-display font-bold text-2xl">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === "login"
                    ? "Sign in with your email and password"
                    : "Choose how you want to use MyFit"}
                </p>

                {returnTo && (
                  <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                    You'll be returned to your previous page after {mode === "login" ? "logging in" : "signing up"}.
                  </div>
                )}

                {mode === "login" ? (
                  <div className="mt-6">
                    <AuthForm
                      mode="login"
                      role="user"
                      returnTo={returnTo}
                      onForgotPassword={() => setShowForgotPassword(true)}
                    />
                  </div>
                ) : (
                  <Tabs defaultValue={initialRole} className="mt-6">
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="user">As a User</TabsTrigger>
                      <TabsTrigger value="creator">As a Creator</TabsTrigger>
                    </TabsList>
                    {(["user", "creator"] as const).map((role) => (
                      <TabsContent key={role} value={role}>
                        <AuthForm
                          mode="signup"
                          role={role}
                          returnTo={returnTo}
                          onForgotPassword={() => {}}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                )}

                <p className="text-sm text-center text-muted-foreground mt-6">
                  {mode === "login" ? (
                    <>Don't have an account?{" "}
                      <Link to="/signup" state={{ returnTo }} className="text-accent font-medium hover:underline">Sign up</Link>
                    </>
                  ) : (
                    <>Already have an account?{" "}
                      <Link to="/login" state={{ returnTo }} className="text-accent font-medium hover:underline">Login</Link>
                    </>
                  )}
                </p>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}