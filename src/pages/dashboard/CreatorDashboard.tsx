import { Routes, Route } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { VideoCallButton } from "@/components/VideoCallButton";
import { creatorBookings } from "@/data/mock";
import {
  Wallet, Users, Calendar as CalIcon, TrendingUp,
  Plus, Check, IndianRupee, Pencil, Camera, Trash2, Loader2,
  ShieldCheck, Clock,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { authService, APIError, Pricing } from "@/services/backendService";

// ── All possible time slots ───────────────────────────────────────────────────
const ALL_SLOTS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM",
  "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM",
  "2:00 PM",  "3:00 PM",  "4:00 PM",  "5:00 PM",
  "6:00 PM",  "7:00 PM",  "8:00 PM",
];

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total earnings"    value="₹84,200" icon={Wallet}     trend="+12% MoM" />
        <KpiCard label="Total clients"     value="48"       icon={Users}      trend="+5 this week" />
        <KpiCard label="Upcoming sessions" value={String(creatorBookings.filter(b => b.status === "upcoming").length)} icon={CalIcon} />
        <KpiCard label="Avg rating"        value="4.9★"     icon={TrendingUp} />
      </div>
      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-4">Today's sessions</h2>
        <div className="space-y-3">
          {creatorBookings.filter(b => b.status === "upcoming").slice(0, 3).map((b) => (
            <div key={b.id} className="flex items-center justify-between p-4 rounded-lg border border-border/60 gap-3">
              <div>
                <div className="font-semibold">{b.creatorName}</div>
                <div className="text-sm text-muted-foreground">{format(new Date(b.date), "PP")} · {b.time}</div>
              </div>
              <VideoCallButton label="Start Session" clientName={b.creatorName} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Schedule ──────────────────────────────────────────────────────────────────
function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (t: string) =>
    setSelected((s) => s.includes(t) ? s.filter(x => x !== t) : [...s, t]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-4">Pick a date</h2>
        <Calendar mode="single" selected={date} onSelect={setDate}
          className={cn("p-3 pointer-events-auto rounded-lg border")} />
      </Card>
      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-4">Time slots</h2>
        <div className="grid grid-cols-2 gap-2">
          {ALL_SLOTS.map((t) => {
            const on = selected.includes(t);
            return (
              <Button key={t} variant={on ? "default" : "outline"}
                className={cn(on && "bg-accent text-accent-foreground hover:bg-accent/90")}
                onClick={() => toggle(t)}>
                {on && <Check size={14} className="mr-1" />}{t}
              </Button>
            );
          })}
        </div>
        <Button
          onClick={() => toast.success(`${selected.length} slots added for ${date ? format(date, "PP") : ""}`)}
          className="w-full mt-5 bg-accent text-accent-foreground">
          <Plus size={16} className="mr-1" /> Add slots
        </Button>
      </Card>
    </div>
  );
}

// ── Bookings ──────────────────────────────────────────────────────────────────
function Bookings() {
  return (
    <div className="space-y-3">
      {creatorBookings.map((b) => (
        <Card key={b.id} className="p-5 border-border/60 shadow-card flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-semibold">{b.creatorName}</div>
            <div className="text-sm text-muted-foreground">{format(new Date(b.date), "PPP")} · {b.time}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display font-bold">₹{b.price}</span>
            {b.status === "upcoming"
              ? <VideoCallButton label="Start Session" clientName={b.creatorName} />
              : <span className="text-sm px-3 py-1.5 rounded-md bg-success/10 text-success font-medium">Completed</span>}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Editable price field ──────────────────────────────────────────────────────
function EditablePrice({ label, subLabel, icon: Icon, value, onSave, min, prefix = "₹" }: {
  label: string; subLabel: string; icon: React.ElementType;
  value: number; onSave: (v: number) => Promise<void>; min: number; prefix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [tmp, setTmp]         = useState(String(value));

  useEffect(() => {
    if (!editing) setTmp(String(value));
  }, [value, editing]);

  const save = async () => {
    const v = Number(tmp);
    if (!v || v < min) { toast.error(`Minimum is ${prefix}${min}`); return; }
    setSaving(true);
    try {
      await onSave(v);
      setEditing(false);
    } catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 border-border/60 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon size={16} className="text-accent" />
          </div>
          <div>
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs text-muted-foreground">{subLabel}</p>
          </div>
        </div>
        {!editing && (
          <button onClick={() => { setTmp(String(value)); setEditing(true); }}
            className="text-muted-foreground hover:text-accent transition-colors">
            <Pencil size={15} />
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">{prefix}</span>
            <Input type="number" value={tmp} onChange={(e) => setTmp(e.target.value)}
              className="pl-7" min={min} autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving} className="flex-1 bg-accent text-accent-foreground">
              {saving ? <Loader2 size={13} className="animate-spin mr-1" /> : null}
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="outline" className="flex-1" disabled={saving} onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <p className="font-display font-bold text-3xl text-primary">{prefix}{value.toLocaleString()}</p>
      )}
    </Card>
  );
}

// ── Time Slot Manager (used inside Profile) ───────────────────────────────────
function TimeSlotManager() {
  const [selected,  setSelected]  = useState<string[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);

  // Load saved slots from backend on mount
  useEffect(() => {
    authService.getSlots()
      .then(({ timeSlots }) => setSelected(timeSlots))
      .catch(() => {/* silently keep empty */})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (slot: string) =>
    setSelected((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      const { timeSlots } = await authService.saveSlots(selected);
      setSelected(timeSlots);
      toast.success(`${timeSlots.length} time slot${timeSlots.length !== 1 ? "s" : ""} saved`);
    } catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Failed to save slots. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6 border-border/60 shadow-card">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display font-semibold text-lg">Available Time Slots</h2>
        {selected.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
            {selected.length} selected
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Select the time slots when you're available for sessions. These will be shown to clients on your profile.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-6 justify-center">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-sm">Loading saved slots…</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {ALL_SLOTS.map((slot) => {
              const active = selected.includes(slot);
              return (
                <button
                  key={slot}
                  onClick={() => toggle(slot)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium border transition-colors text-center ${
                    active
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                  }`}
                >
                  {active && <Check size={10} className="inline mr-0.5 -mt-0.5" />}
                  {slot}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mt-5">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-accent text-accent-foreground"
            >
              {saving
                ? <><Loader2 size={13} className="animate-spin mr-1.5" />Saving…</>
                : <><Check size={14} className="mr-1.5" />Save slots</>}
            </Button>
            {selected.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setSelected([])}
                disabled={saving}
                className="text-muted-foreground"
              >
                Clear all
              </Button>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {selected.length === 0 ? "No slots selected" : `${selected.length} of ${ALL_SLOTS.length} slots`}
            </span>
          </div>
        </>
      )}
    </Card>
  );
}

// ── Earnings ──────────────────────────────────────────────────────────────────
function Earnings({
  pricing,
  onSaveField,
}: {
  pricing: Pricing;
  onSaveField: (p: Pricing) => Promise<void>;
}) {
  const { dailyPrice, monthlyPrice, monthlySessions } = pricing;
  const perSession  = monthlySessions > 0 ? Math.round(monthlyPrice / monthlySessions) : 0;
  const saves       = Math.max(0, dailyPrice * monthlySessions - monthlyPrice);
  const discountPct = dailyPrice * monthlySessions > 0
    ? Math.round((1 - monthlyPrice / (dailyPrice * monthlySessions)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <KpiCard label="Total earnings" value="₹84,200" icon={Wallet} />
        <KpiCard label="This month"     value="₹18,400" icon={TrendingUp} trend="+12%" />
        <KpiCard label="Available"      value="₹14,200" icon={Wallet} />
      </div>

      <div>
        <h2 className="font-display font-semibold text-lg mb-3">Session Charges</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <EditablePrice
            label="Daily Session"    subLabel="Per session charge"       icon={IndianRupee}
            value={dailyPrice}       min={100}
            onSave={async (v) => {
              await onSaveField({ ...pricing, dailyPrice: v });
              toast.success("Daily price updated");
            }}
          />
          <EditablePrice
            label="Monthly Package"  subLabel="Total monthly charge"     icon={CalIcon}
            value={monthlyPrice}     min={1000}
            onSave={async (v) => {
              await onSaveField({ ...pricing, monthlyPrice: v });
              toast.success("Monthly price updated");
            }}
          />
          <EditablePrice
            label="Sessions / Month" subLabel="Included in monthly plan" icon={Users}
            value={monthlySessions}  min={1}    prefix=""
            onSave={async (v) => {
              await onSaveField({ ...pricing, monthlySessions: v });
              toast.success("Sessions per month updated");
            }}
          />
        </div>

        <Card className="mt-4 p-4 border-border/60 shadow-card bg-muted/30">
          <div className="grid sm:grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Per session (monthly)</p>
              <p className="font-display font-bold text-lg text-primary mt-0.5">₹{perSession.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Client saves vs daily</p>
              <p className="font-display font-bold text-lg text-green-600 mt-0.5">₹{saves.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Effective discount</p>
              <p className="font-display font-bold text-lg text-accent mt-0.5">{discountPct > 0 ? `${discountPct}%` : "—"}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 border-border/60 shadow-card flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-semibold text-lg">Withdraw earnings</h2>
          <p className="text-sm text-muted-foreground">Transfer to your linked bank account (HDFC ••4521)</p>
        </div>
        <Button onClick={() => toast.success("Withdrawal initiated — funds in 1-2 days")} className="bg-accent text-accent-foreground">
          Withdraw ₹14,200
        </Button>
      </Card>
    </div>
  );
}

// ── Profile Image Upload Widget ───────────────────────────────────────────────
function ProfileImageUpload({
  currentUrl, initials, onUploaded,
}: {
  currentUrl: string; initials: string; onUploaded: (url: string) => void;
}) {
  const fileRef                   = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [preview,   setPreview]   = useState(currentUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const data = await authService.uploadProfileImage(file);
      authService.updateStoredUser(data.user);
      setPreview(data.imageUrl);
      onUploaded(data.imageUrl);
      toast.success("Profile photo updated!");
    } catch (err) {
      setPreview(currentUrl);
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const data = await authService.deleteProfileImage();
      authService.updateStoredUser(data.user);
      setPreview("");
      onUploaded("");
      toast.success("Profile photo removed.");
    } catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Could not remove photo.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <div className="h-24 w-24 rounded-2xl overflow-hidden bg-accent/10 flex items-center justify-center border-2 border-border">
          {preview
            ? <img src={preview} alt="Profile" className="h-full w-full object-cover" />
            : <span className="font-display font-bold text-2xl text-accent">{initials}</span>}
        </div>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-accent text-accent-foreground
                     flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors disabled:opacity-60">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
        </button>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Profile photo</p>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP · max 5 MB · auto-cropped to 400×400</p>
        <div className="flex gap-2 mt-1">
          <Button type="button" size="sm" variant="outline" disabled={uploading}
            onClick={() => fileRef.current?.click()} className="gap-1.5">
            {uploading
              ? <><Loader2 size={13} className="animate-spin" />Uploading…</>
              : <><Camera size={13} />{preview ? "Change photo" : "Upload photo"}</>}
          </Button>
          {preview && (
            <Button type="button" size="sm" variant="outline" disabled={deleting}
              onClick={handleDelete}
              className="gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive">
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Remove
            </Button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden" onChange={handleFileChange} />
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function Profile({
  pricing,
  onSaveField,
}: {
  pricing: Pricing;
  onSaveField: (p: Pricing) => Promise<void>;
}) {
  const storedUser = authService.getStoredUser();
  const initials   = storedUser?.name
    ? storedUser.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "C";

  const [profileImageUrl, setProfileImageUrl] = useState(storedUser?.profileImage?.url || "");
  const [saving,          setSaving]          = useState(false);

  const [isVerified,    setIsVerified]    = useState(storedUser?.creatorProfile?.verified ?? false);
  const [verifyLoading, setVerifyLoading] = useState(true);

  useEffect(() => {
    authService.getMe()
      .then(({ user }) => {
        setIsVerified(user.creatorProfile?.verified ?? false);
        authService.updateStoredUser(user);
      })
      .catch(() => {})
      .finally(() => setVerifyLoading(false));
  }, []);

  const [name,           setName]           = useState(storedUser?.name || "");
  const [phone,          setPhone]          = useState(storedUser?.phone?.number || "");
  const [specialization, setSpecialization] = useState(storedUser?.creatorProfile?.specialization || "");
  const [bio,            setBio]            = useState(storedUser?.creatorProfile?.bio || "");

  const [localDaily,    setLocalDaily]    = useState(String(pricing.dailyPrice));
  const [localMonthly,  setLocalMonthly]  = useState(String(pricing.monthlyPrice));
  const [localSessions, setLocalSessions] = useState(String(pricing.monthlySessions));

  useEffect(() => {
    setLocalDaily(String(pricing.dailyPrice));
    setLocalMonthly(String(pricing.monthlyPrice));
    setLocalSessions(String(pricing.monthlySessions));
  }, [pricing.dailyPrice, pricing.monthlyPrice, pricing.monthlySessions]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = Number(localDaily);
    const m = Number(localMonthly);
    const s = Number(localSessions);

    if (!name.trim())   { toast.error("Name is required");                      return; }
    if (!d || d < 100)  { toast.error("Daily price minimum is ₹100");           return; }
    if (!m || m < 1000) { toast.error("Monthly price minimum is ₹1,000");       return; }
    if (!s || s < 1)    { toast.error("Sessions per month must be at least 1"); return; }

    setSaving(true);
    try {
      const [updatedUser] = await Promise.all([
        authService.updateProfile({
          name: name.trim(),
          phone,
          countryCode: storedUser?.phone?.countryCode || "+91",
          specialization,
          bio,
        }),
        onSaveField({ dailyPrice: d, monthlyPrice: m, monthlySessions: s }),
      ]);
      authService.updateStoredUser(updatedUser.user);
      toast.success("Profile saved successfully");
    } catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Verification banner */}
      {verifyLoading ? null : isVerified ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800">
          <ShieldCheck size={20} className="text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">Account Verified</p>
            <p className="text-xs text-green-600/80 dark:text-green-500">Your trainer profile has been verified by MyFit admin.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
          <Clock size={20} className="text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Verification Pending</p>
            <p className="text-xs text-amber-600/80 dark:text-amber-500">Our team will review and verify your profile within 1–2 business days.</p>
          </div>
        </div>
      )}

      {/* Avatar card */}
      <Card className="p-6 border-border/60 shadow-card">
        <ProfileImageUpload
          currentUrl={profileImageUrl}
          initials={initials}
          onUploaded={(url) => setProfileImageUrl(url)}
        />
        <div className="mt-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold text-lg">{name || "—"}</p>
            {isVerified && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium dark:bg-green-900/40 dark:text-green-400">
                <ShieldCheck size={11} /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{storedUser?.email || "—"}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Creator</span>
        </div>
      </Card>

      {/* Profile form */}
      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-5">Trainer profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Display name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1.5" placeholder="Your name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={storedUser?.email || ""} readOnly
                className="mt-1.5 bg-muted/40 cursor-not-allowed" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Mobile number</Label>
              <div className="flex gap-2 mt-1.5">
                <span className="inline-flex items-center px-3 rounded-md border border-input bg-muted/40 text-sm text-muted-foreground">
                  {storedUser?.phone?.countryCode || "+91"}
                </span>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number" className="flex-1" />
              </div>
            </div>
            <div>
              <Label>Verified status</Label>
              <div className={`mt-1.5 h-10 px-3 flex items-center gap-2 rounded-md border text-sm font-medium
                ${isVerified
                  ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
                  : "border-input bg-muted/40 text-muted-foreground"}`}>
                {verifyLoading
                  ? <><Loader2 size={13} className="animate-spin" /> Checking…</>
                  : isVerified
                    ? <><ShieldCheck size={14} /> Verified</>
                    : <><Clock size={14} /> Pending verification</>}
              </div>
            </div>
          </div>

          <div>
            <Label>Specialty</Label>
            <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Strength & Muscle Gain" className="mt-1.5" />
          </div>

          <div className="rounded-xl border border-border/60 p-4 space-y-4 bg-muted/20">
            <p className="font-semibold text-sm">Pricing</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Daily session (₹)</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input type="number" min={100} value={localDaily}
                    onChange={(e) => setLocalDaily(e.target.value)} className="pl-7" />
                </div>
              </div>
              <div>
                <Label>Monthly package (₹)</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input type="number" min={1000} value={localMonthly}
                    onChange={(e) => setLocalMonthly(e.target.value)} className="pl-7" />
                </div>
              </div>
              <div>
                <Label>Sessions / month</Label>
                <Input type="number" min={1} className="mt-1.5" value={localSessions}
                  onChange={(e) => setLocalSessions(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients about yourself..." className="mt-1.5" />
          </div>

          <div className="pt-1">
            <Label className="text-xs text-muted-foreground">Member since</Label>
            <p className="text-sm mt-0.5">{storedUser?.createdAt ? format(new Date(storedUser.createdAt), "PPP") : "—"}</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving} className="bg-accent text-accent-foreground">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1.5" />Saving…</> : "Save profile"}
            </Button>
            <Button type="button" variant="outline"
              onClick={() => { authService.clearSession(); window.location.href = "/login"; }}>
              Logout
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Time Slot Manager — separate card below form ── */}
      <TimeSlotManager />
    </div>
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────
export default function CreatorDashboardRoutes() {
  const [pricing, setPricingState] = useState<Pricing>({
    dailyPrice:      800,
    monthlyPrice:    12000,
    monthlySessions: 20,
  });
  const [pricingLoaded, setPricingLoaded] = useState(false);

  useEffect(() => {
    authService.getPricing()
      .then(({ pricing: db }) => {
        if (db && typeof db.dailyPrice === "number") setPricingState(db);
      })
      .catch(() => {})
      .finally(() => setPricingLoaded(true));
  }, []);

  const persistPricing = useCallback(async (p: Pricing): Promise<void> => {
    const res = await authService.savePricing(p);
    if (res?.pricing && typeof res.pricing.dailyPrice === "number") {
      setPricingState(res.pricing);
    } else {
      setPricingState(p);
    }
  }, []);

  if (!pricingLoaded) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground gap-2">
        <Loader2 className="animate-spin" size={18} />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route index           element={<Overview />} />
      <Route path="schedule" element={<Schedule />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="earnings" element={<Earnings   pricing={pricing} onSaveField={persistPricing} />} />
      <Route path="profile"  element={<Profile    pricing={pricing} onSaveField={persistPricing} />} />
    </Routes>
  );
}