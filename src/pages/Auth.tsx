import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dumbbell, Eye, EyeOff, Loader2, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { authService, APIError } from "@/services/backendService";

type Mode   = "login" | "signup";
type Role   = "user" | "creator";
type Screen = "form" | "otp";

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
          type="text"
          inputMode="numeric"
          maxLength={1}
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

// ─── OTP Screen ───────────────────────────────────────────────────────────────
function OTPScreen({
  userId, maskedEmail, onSuccess, onBack,
}: {
  userId: string;
  maskedEmail: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const navigate  = useNavigate();
  const [otp, setOtp]             = useState("");
  const [loading, setLoading]     = useState(false);
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
      navigate(data.user.role === "creator" ? "/creator-dashboard" : "/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof APIError) { toast.error(err.message); if (err.status === 429) setOtp(""); }
      else toast.error("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
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
    } finally {
      setResending(false);
    }
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
        onClick={handleVerify}
        disabled={loading || otp.length < 6}
        size="lg"
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin mr-2" />Verifying…</>
          : "Verify & Create Account"
        }
      </Button>

      <div className="text-sm text-muted-foreground">
        {countdown > 0 ? (
          <p>Resend OTP in <span className="font-medium text-foreground">{countdown}s</span></p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1.5 text-accent font-medium hover:underline disabled:opacity-50"
          >
            {resending
              ? <><Loader2 size={13} className="animate-spin" />Sending…</>
              : <><RotateCcw size={13} />Resend OTP</>
            }
          </button>
        )}
      </div>

      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to signup
      </button>
    </div>
  );
}

// ─── Auth Form ────────────────────────────────────────────────────────────────
function AuthForm({ mode, role }: { mode: Mode; role: Role }) {
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
        const local = email.split("@")[0];
        setMaskedEmail(`${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 2, 1))}@${email.split("@")[1]}`);
        toast.success(data.message);
        setScreen("otp");
      } else {
        const data = await authService.login({ email, password });
        authService.saveSession(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
        // replace: true so back button can't return to login
        navigate(data.user.role === "creator" ? "/creator-dashboard" : "/dashboard", { replace: true });
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
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (key: string) =>
    errors[key] ? "border-destructive focus-visible:ring-destructive" : "";

  if (screen === "otp") {
    return (
      <OTPScreen
        userId={userId}
        maskedEmail={maskedEmail}
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
        <Label htmlFor={`pwd-${role}`}>Password</Label>
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
            : `Create account as ${role === "creator" ? "Creator" : "User"}`
        }
      </Button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Auth({ mode }: { mode: Mode }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialRole: Role = params.get("role") === "creator" ? "creator" : "user";

  // ── Redirect already-logged-in users away from /login and /signup ──────────
  useEffect(() => {
    if (authService.isLoggedIn()) {
      const user = authService.getStoredUser();
      navigate(
        user?.role === "creator" ? "/creator-dashboard" : "/dashboard",
        { replace: true }  // replaces history so back button won't return here
      );
    }
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:flex relative gradient-hero p-12 text-white items-end">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 30% 30%, hsl(222 89% 55% / 0.6), transparent 50%)",
        }} />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent shadow-glow">
              <Dumbbell size={18} />
            </span>
            <span className="font-display font-bold text-2xl">My<span className="text-accent">Fit</span></span>
          </Link>
          <h2 className="font-display font-bold text-4xl mt-12 leading-tight">
            Your transformation<br />starts here.
          </h2>
          <p className="text-white/70 mt-3 max-w-md">
            Join thousands of users training with India's best fitness creators.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-background min-h-screen lg:min-h-0">
        <Card className="w-full max-w-md p-8 border-border/60 shadow-card">
          <h1 className="font-display font-bold text-2xl">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Sign in with your email and password"
              : "Choose how you want to use MyFit"}
          </p>

          {mode === "login" ? (
            <div className="mt-6">
              <AuthForm mode="login" role="user" />
            </div>
          ) : (
            <Tabs defaultValue={initialRole} className="mt-6">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="user">As a User</TabsTrigger>
                <TabsTrigger value="creator">As a Creator</TabsTrigger>
              </TabsList>
              {(["user", "creator"] as const).map((role) => (
                <TabsContent key={role} value={role}>
                  <AuthForm mode="signup" role={role} />
                </TabsContent>
              ))}
            </Tabs>
          )}

          <p className="text-sm text-center text-muted-foreground mt-6">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <Link to="/signup" className="text-accent font-medium hover:underline">Sign up</Link>
              </>
            ) : (
              <>Already have an account?{" "}
                <Link to="/login" className="text-accent font-medium hover:underline">Login</Link>
              </>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}