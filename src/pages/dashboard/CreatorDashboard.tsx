import { Routes, Route } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VideoCallButton } from "@/components/VideoCallButton";
import {
  Wallet, Users, Calendar as CalIcon, TrendingUp,
  Check, IndianRupee, Pencil, Camera, Trash2, Loader2,
  ShieldCheck, Clock, AlertCircle, XCircle, CheckCircle2, History,
  Building2, CreditCard, BadgeCheck, Lock,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  authService, paymentService, APIError, Pricing,
  type UserBooking, type MyWithdrawal, type BankDetails,
} from "@/services/backendService";

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview() {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    paymentService.getMyCreatorBookings()
      .then(({ bookings: b }) => setBookings(b))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming      = bookings.filter((b) => b.status === "upcoming" || b.status === "success");
  const totalEarnings = bookings.reduce((sum, b) => {
    const basePrice  = Math.round(b.amount / 1.02);
    const commission = Math.round(basePrice * 0.20);
    return sum + (basePrice - commission);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total earnings"    value={loading ? "—" : `₹${totalEarnings.toLocaleString()}`} icon={Wallet} trend="+12% MoM" />
        <KpiCard label="Total clients"     value={loading ? "—" : String(bookings.length)}              icon={Users} />
        <KpiCard label="Upcoming sessions" value={loading ? "—" : String(upcoming.length)}              icon={CalIcon} />
        <KpiCard label="Avg rating"        value="4.9★"                                                 icon={TrendingUp} />
      </div>

      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-4">Today's sessions</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="animate-spin" size={16} /> Loading…
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((b) => (
              <div key={b._id} className="flex items-center justify-between p-4 rounded-lg border border-border/60 gap-3">
                <div>
                  <div className="font-semibold">{b.userId?.name ?? "Client"}</div>
                  <div className="text-sm text-muted-foreground">
                    {b.date ? format(new Date(b.date), "PP") : "Monthly plan"} · {b.time ?? "—"}
                  </div>
                </div>
                <VideoCallButton label="Start Session" clientName={b.userId?.name ?? "Client"} bookingId={b._id} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Bookings ──────────────────────────────────────────────────────────────────
function Bookings() {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    paymentService.getMyCreatorBookings()
      .then(({ bookings: b }) => setBookings(b))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
      <Loader2 className="animate-spin" size={18} />
      <span className="text-sm">Loading bookings…</span>
    </div>
  );

  if (error) return (
    <Card className="p-10 flex flex-col items-center gap-3 text-center border-destructive/30">
      <AlertCircle size={32} className="text-destructive" />
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
    </Card>
  );

  if (bookings.length === 0) return (
    <p className="text-sm text-muted-foreground py-10 text-center">No bookings yet.</p>
  );

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <Card key={b._id} className="p-5 border-border/60 shadow-card flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-semibold">{b.userId?.name ?? "Client"}</div>
            <div className="text-sm text-muted-foreground">
              {b.date ? format(new Date(b.date), "PPP") : "Monthly plan"} · {b.time ?? "—"}
            </div>
            <span className="text-xs text-muted-foreground capitalize">{b.sessionType}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display font-bold">₹{b.amount.toLocaleString()}</span>
            {(b.status === "upcoming" || b.status === "success")
              ? <VideoCallButton label="Start Session" clientName={b.userId?.name ?? "Client"} bookingId={b._id} />
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

  useEffect(() => { if (!editing) setTmp(String(value)); }, [value, editing]);

  const save = async () => {
    const v = Number(tmp);
    if (!v || v < min) { toast.error(`Minimum is ${prefix}${min}`); return; }
    setSaving(true);
    try { await onSave(v); setEditing(false); }
    catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Failed to save. Please try again.");
    } finally { setSaving(false); }
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

// ── Withdrawal Status Badge ───────────────────────────────────────────────────
function WithdrawalBadge({ status }: { status: string }) {
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">
      <Clock size={11} /> Pending
    </span>
  );
  if (status === "approved") return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium">
      <CheckCircle2 size={11} /> Approved
    </span>
  );
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-medium">
      <XCircle size={11} /> Rejected
    </span>
  );
  return null;
}

// ── Earnings ──────────────────────────────────────────────────────────────────
function Earnings({ pricing, onSaveField }: { pricing: Pricing; onSaveField: (p: Pricing) => Promise<void>; }) {
  const [bookings,    setBookings]    = useState<UserBooking[]>([]);
  const [withdrawals, setWithdrawals] = useState<MyWithdrawal[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      paymentService.getMyCreatorBookings(),
      paymentService.getMyWithdrawals(),
    ])
      .then(([{ bookings: b }, { withdrawals: w }]) => {
        setBookings(b);
        setWithdrawals(w);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { dailyPrice, monthlyPrice, monthlySessions } = pricing;
  const perSession  = monthlySessions > 0 ? Math.round(monthlyPrice / monthlySessions) : 0;
  const saves       = Math.max(0, dailyPrice * monthlySessions - monthlyPrice);
  const discountPct = dailyPrice * monthlySessions > 0
    ? Math.round((1 - monthlyPrice / (dailyPrice * monthlySessions)) * 100) : 0;

  const totalEarnings = bookings.reduce((sum, b) => {
    const basePrice  = Math.round(b.amount / 1.02);
    const commission = Math.round(basePrice * 0.20);
    return sum + (basePrice - commission);
  }, 0);

  const withdrawnAmount = withdrawals
    .filter((w) => w.status === "approved" || w.status === "pending")
    .reduce((sum, w) => sum + w.amount, 0);
  const availableForWithdrawal = Math.max(0, totalEarnings - withdrawnAmount);

  const latestWithdrawal = withdrawals.length > 0 ? withdrawals[0] : null;
  const hasPending       = latestWithdrawal?.status === "pending";
  const canRequest       = availableForWithdrawal > 0 && !hasPending;

  const handleWithdraw = async () => {
    if (!canRequest) return;
    setWithdrawing(true);
    try {
      await paymentService.requestWithdrawal(availableForWithdrawal);
      toast.success("Withdrawal request submitted — admin will review shortly.");
      fetchData();
    } catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Failed to submit withdrawal request. Please try again.");
    } finally { setWithdrawing(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <KpiCard label="Total earnings"        value={loading ? "—" : `₹${totalEarnings.toLocaleString()}`}           icon={Wallet} />
        <KpiCard label="Available to withdraw" value={loading ? "—" : `₹${availableForWithdrawal.toLocaleString()}`}  icon={Wallet} />
        <KpiCard label="Total clients"         value={loading ? "—" : String(bookings.length)}                        icon={Users}  />
      </div>

      <div>
        <h2 className="font-display font-semibold text-lg mb-3">Session Charges</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <EditablePrice
            label="Daily Session" subLabel="Per session charge" icon={IndianRupee}
            value={dailyPrice} min={100}
            onSave={async (v) => { await onSaveField({ ...pricing, dailyPrice: v }); toast.success("Daily price updated"); }}
          />
          <EditablePrice
            label="Monthly Package" subLabel="Total monthly charge" icon={CalIcon}
            value={monthlyPrice} min={1000}
            onSave={async (v) => { await onSaveField({ ...pricing, monthlyPrice: v }); toast.success("Monthly price updated"); }}
          />
          <EditablePrice
            label="Sessions / Month" subLabel="Included in monthly plan" icon={Users}
            value={monthlySessions} min={1} prefix=""
            onSave={async (v) => { await onSaveField({ ...pricing, monthlySessions: v }); toast.success("Sessions per month updated"); }}
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

      {!loading && bookings.length > 0 && (
        <Card className="border-border/60 shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/60">
            <h2 className="font-display font-semibold">Earnings breakdown</h2>
            <p className="text-sm text-muted-foreground">
              MyFit retains a <span className="font-medium text-foreground">20% platform commission</span> on each booking.
            </p>
          </div>
          <div className="divide-y divide-border/60">
            {bookings.map((b) => {
              const basePrice    = Math.round(b.amount / 1.02);
              const commission   = Math.round(basePrice * 0.20);
              const creatorEarns = basePrice - commission;
              return (
                <div key={b._id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap text-sm">
                  <div>
                    <div className="font-medium">{b.userId?.name ?? "Client"}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {b.sessionType} · {b.date ? format(new Date(b.date), "PP") : "Monthly plan"}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <div className="text-right">
                      <p>MyFit commission (20%)</p>
                      <p className="font-medium text-foreground">₹{commission.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p>You receive</p>
                      <p className="font-display font-bold text-green-600 text-sm">₹{creatorEarns.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="border-border/60 shadow-card overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <History size={18} className="text-accent" /> Withdrawal Requests
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {hasPending
                ? "A request is pending admin approval. You can submit another once it's resolved."
                : availableForWithdrawal > 0
                  ? `₹${availableForWithdrawal.toLocaleString()} is ready to withdraw.`
                  : "No balance available to withdraw right now."}
            </p>
          </div>
          {hasPending ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium shrink-0">
              <Clock size={14} /> Pending approval
            </div>
          ) : (
            <Button
              onClick={handleWithdraw}
              className="bg-accent text-accent-foreground shrink-0"
              disabled={loading || withdrawing || !canRequest}
            >
              {withdrawing
                ? <><Loader2 size={14} className="animate-spin mr-1.5" />Submitting…</>
                : `Request Withdrawal  ₹${loading ? "…" : availableForWithdrawal.toLocaleString()}`}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 p-6 text-muted-foreground text-sm">
            <Loader2 className="animate-spin" size={15} /> Loading history…
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No withdrawal requests yet.</div>
        ) : (
          <>
            <div className="px-5 py-2.5 grid grid-cols-3 text-xs font-medium text-muted-foreground bg-muted/30 border-b border-border/40">
              <span>Date &amp; Time</span>
              <span className="text-center">Amount</span>
              <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-border/60">
              {withdrawals.map((w) => (
                <div key={w._id} className="px-5 py-4 grid grid-cols-3 items-center text-sm">
                  <div>
                    <p className="font-medium">{format(new Date(w.createdAt), "PP")}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(w.createdAt), "p")}</p>
                  </div>
                  <div className="text-center">
                    <span className="font-display font-bold text-base">₹{w.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-end">
                    <WithdrawalBadge status={w.status} />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
              <span>{withdrawals.length} request{withdrawals.length !== 1 ? "s" : ""} total</span>
              <span>
                Total approved: ₹{withdrawals
                  .filter((w) => w.status === "approved")
                  .reduce((s, w) => s + w.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

// ── Time Slot Manager ─────────────────────────────────────────────────────────
const ALL_SLOTS = [
  "6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  "6:00 PM","7:00 PM","8:00 PM",
];

function TimeSlotManager() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    authService.getSlots()
      .then(({ timeSlots }) => setSelected(timeSlots))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (slot: string) =>
    setSelected((prev) => prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { timeSlots } = await authService.saveSlots(selected);
      setSelected(timeSlots);
      toast.success(`${timeSlots.length} time slot${timeSlots.length !== 1 ? "s" : ""} saved`);
    } catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Failed to save slots.");
    } finally { setSaving(false); }
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
      <p className="text-sm text-muted-foreground mb-4">Select your available slots. These are shown to clients on your profile.</p>
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
                <button key={slot} onClick={() => toggle(slot)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium border transition-colors text-center ${
                    active ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                  }`}>
                  {active && <Check size={10} className="inline mr-0.5 -mt-0.5" />}
                  {slot}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-5">
            <Button onClick={handleSave} disabled={saving} className="bg-accent text-accent-foreground">
              {saving ? <><Loader2 size={13} className="animate-spin mr-1.5" />Saving…</> : <><Check size={14} className="mr-1.5" />Save slots</>}
            </Button>
            {selected.length > 0 && (
              <Button variant="outline" onClick={() => setSelected([])} disabled={saving} className="text-muted-foreground">Clear all</Button>
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

// ── Bank Details Manager ──────────────────────────────────────────────────────
// ── Bank Details Manager ──────────────────────────────────────────────────────
const EMPTY_BANK: BankDetails = {
  accountHolderName: "",
  accountNumber:     "",
  ifscCode:          "",
  bankName:          "",
  accountType:       "savings",
  upiId:             "",
};

function BankDetailsManager() {
  const [form,    setForm]    = useState<BankDetails>(EMPTY_BANK);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    authService.getBankDetails()
      .then((res) => {
        const bd = res?.bankDetails;
        if (
          bd &&
          typeof bd === "object" &&
          bd.accountNumber &&
          bd.accountHolderName
        ) {
          setForm({
            accountHolderName: bd.accountHolderName ?? "",
            accountNumber:     bd.accountNumber     ?? "",
            ifscCode:          bd.ifscCode          ?? "",
            bankName:          bd.bankName          ?? "",
            accountType:       bd.accountType === "current" ? "current" : "savings",
            upiId:             bd.upiId             ?? "",
          });
          setSaved(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof BankDetails, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountHolderName.trim()) { toast.error("Account holder name is required"); return; }
    if (!form.accountNumber.trim())     { toast.error("Account number is required");       return; }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(form.ifscCode.trim())) {
      toast.error("Enter a valid IFSC code (e.g. SBIN0001234)"); return;
    }
    if (!form.bankName.trim()) { toast.error("Bank name is required"); return; }

    setSaving(true);
    try {
      const res = await authService.saveBankDetails({
        accountHolderName: form.accountHolderName.trim(),
        accountNumber:     form.accountNumber.trim(),
        ifscCode:          form.ifscCode.trim().toUpperCase(),
        bankName:          form.bankName.trim(),
        accountType:       form.accountType,
        upiId:             form.upiId?.trim() || undefined,
      });

      const bd = res?.bankDetails;
      if (bd) {
        setForm({
          accountHolderName: bd.accountHolderName ?? "",
          accountNumber:     bd.accountNumber     ?? "",
          ifscCode:          bd.ifscCode          ?? "",
          bankName:          bd.bankName          ?? "",
          accountType:       bd.accountType === "current" ? "current" : "savings",
          upiId:             bd.upiId             ?? "",
        });
      }
      setSaved(true);
      toast.success("Bank details saved successfully");
    } catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Failed to save bank details.");
    } finally { setSaving(false); }
  };

  return (
    <Card className="p-6 border-border/60 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg">Bank Details</h2>
            <p className="text-sm text-muted-foreground">Used for processing withdrawal payments to your account.</p>
          </div>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium shrink-0">
            <BadgeCheck size={12} /> Saved
          </span>
        )}
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-2 px-3 py-2.5 mb-5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs">
        <Lock size={13} className="shrink-0" />
        Your bank details are encrypted and only used for processing withdrawals. They are never shared with clients.
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-sm">Loading bank details…</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          {/* Row 1 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank-holder">Account Holder Name</Label>
              <Input
                id="bank-holder"
                value={form.accountHolderName}
                onChange={(e) => set("accountHolderName", e.target.value)}
                placeholder="As per bank records"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                value={form.bankName}
                onChange={(e) => set("bankName", e.target.value)}
                placeholder="e.g. State Bank of India"
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank-account">Account Number</Label>
              <div className="relative mt-1.5">
                <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="bank-account"
                  value={form.accountNumber}
                  onChange={(e) => set("accountNumber", e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter account number"
                  className="pl-9"
                  maxLength={18}
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bank-ifsc">IFSC Code</Label>
              <Input
                id="bank-ifsc"
                value={form.ifscCode}
                onChange={(e) => set("ifscCode", e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                className="mt-1.5 font-mono tracking-wider"
                maxLength={11}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank-type">Account Type</Label>
              <select
                id="bank-type"
                value={form.accountType}
                onChange={(e) => set("accountType", e.target.value as "savings" | "current")}
                className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="savings">Savings</option>
                <option value="current">Current</option>
              </select>
            </div>
            <div>
              <Label htmlFor="bank-upi">
                UPI ID <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="bank-upi"
                value={form.upiId ?? ""}
                onChange={(e) => set("upiId", e.target.value)}
                placeholder="yourname@upi"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="pt-1">
            <Button type="submit" disabled={saving} className="bg-accent text-accent-foreground">
              {saving
                ? <><Loader2 size={14} className="animate-spin mr-1.5" />Saving…</>
                : <><Check size={14} className="mr-1.5" />{saved ? "Update bank details" : "Save bank details"}</>}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

// ── Profile Image Upload ──────────────────────────────────────────────────────
function ProfileImageUpload({ currentUrl, initials, onUploaded }: {
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
      else toast.error("Upload failed.");
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
    } finally { setDeleting(false); }
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
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP · max 5 MB</p>
        <div className="flex gap-2 mt-1">
          <Button type="button" size="sm" variant="outline" disabled={uploading}
            onClick={() => fileRef.current?.click()} className="gap-1.5">
            {uploading
              ? <><Loader2 size={13} className="animate-spin" />Uploading…</>
              : <><Camera size={13} />{preview ? "Change photo" : "Upload photo"}</>}
          </Button>
          {preview && (
            <Button type="button" size="sm" variant="outline" disabled={deleting} onClick={handleDelete}
              className="gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive">
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Remove
            </Button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function Profile({ pricing, onSaveField }: { pricing: Pricing; onSaveField: (p: Pricing) => Promise<void>; }) {
  const storedUser = authService.getStoredUser();
  const initials   = storedUser?.name
    ? storedUser.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "C";

  const [profileImageUrl, setProfileImageUrl] = useState(storedUser?.profileImage?.url || "");
  const [saving,          setSaving]          = useState(false);
  const [isVerified,      setIsVerified]      = useState(storedUser?.creatorProfile?.verified ?? false);
  const [verifyLoading,   setVerifyLoading]   = useState(true);

  useEffect(() => {
    authService.getMe()
      .then(({ user }) => { setIsVerified(user.creatorProfile?.verified ?? false); authService.updateStoredUser(user); })
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
        authService.updateProfile({ name: name.trim(), phone, countryCode: storedUser?.phone?.countryCode || "+91", specialization, bio }),
        onSaveField({ dailyPrice: d, monthlyPrice: m, monthlySessions: s }),
      ]);
      authService.updateStoredUser(updatedUser.user);
      toast.success("Profile saved successfully");
    } catch (err) {
      if (err instanceof APIError) toast.error(err.message);
      else toast.error("Failed to save profile.");
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {!verifyLoading && (
        isVerified ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800">
            <ShieldCheck size={20} className="text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">Account Verified</p>
              <p className="text-xs text-green-600/80">Your trainer profile has been verified by MyFit admin.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <Clock size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Verification Pending</p>
              <p className="text-xs text-amber-600/80">Our team will review your profile within 1–2 business days.</p>
            </div>
          </div>
        )
      )}

      <Card className="p-6 border-border/60 shadow-card">
        <ProfileImageUpload currentUrl={profileImageUrl} initials={initials} onUploaded={(url) => setProfileImageUrl(url)} />
        <div className="mt-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold text-lg">{name || "—"}</p>
            {isVerified && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                <ShieldCheck size={11} /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{storedUser?.email || "—"}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Creator</span>
        </div>
      </Card>

      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-5">Trainer profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Display name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Your name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={storedUser?.email || ""} readOnly className="mt-1.5 bg-muted/40 cursor-not-allowed" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Mobile number</Label>
              <div className="flex gap-2 mt-1.5">
                <span className="inline-flex items-center px-3 rounded-md border border-input bg-muted/40 text-sm text-muted-foreground">
                  {storedUser?.phone?.countryCode || "+91"}
                </span>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="flex-1" />
              </div>
            </div>
            <div>
              <Label>Verified status</Label>
              <div className={`mt-1.5 h-10 px-3 flex items-center gap-2 rounded-md border text-sm font-medium
                ${isVerified ? "border-green-200 bg-green-50 text-green-700" : "border-input bg-muted/40 text-muted-foreground"}`}>
                {verifyLoading
                  ? <><Loader2 size={13} className="animate-spin" /> Checking…</>
                  : isVerified ? <><ShieldCheck size={14} /> Verified</> : <><Clock size={14} /> Pending verification</>}
              </div>
            </div>
          </div>
          <div>
            <Label>Specialty</Label>
            <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Strength & Muscle Gain" className="mt-1.5" />
          </div>
          <div className="rounded-xl border border-border/60 p-4 space-y-4 bg-muted/20">
            <p className="font-semibold text-sm">Pricing</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Daily session (₹)</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input type="number" min={100} value={localDaily} onChange={(e) => setLocalDaily(e.target.value)} className="pl-7" />
                </div>
              </div>
              <div>
                <Label>Monthly package (₹)</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input type="number" min={1000} value={localMonthly} onChange={(e) => setLocalMonthly(e.target.value)} className="pl-7" />
                </div>
              </div>
              <div>
                <Label>Sessions / month</Label>
                <Input type="number" min={1} className="mt-1.5" value={localSessions} onChange={(e) => setLocalSessions(e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell clients about yourself..." className="mt-1.5" />
          </div>
          <div className="pt-1">
            <Label className="text-xs text-muted-foreground">Member since</Label>
            <p className="text-sm mt-0.5">{storedUser?.createdAt ? format(new Date(storedUser.createdAt), "PPP") : "—"}</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving} className="bg-accent text-accent-foreground">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1.5" />Saving…</> : "Save profile"}
            </Button>
            <Button type="button" variant="outline" onClick={() => { authService.clearSession(); window.location.href = "/login"; }}>
              Logout
            </Button>
          </div>
        </form>
      </Card>

      <TimeSlotManager />

      {/* ── Bank Details ─────────────────────────────────────────────────── */}
      <BankDetailsManager />
    </div>
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────
export default function CreatorDashboardRoutes() {
  const [pricing, setPricingState] = useState<Pricing>({
    dailyPrice: 0, monthlyPrice: 0, monthlySessions: 0,
  });
  const [pricingLoaded, setPricingLoaded] = useState(false);

  useEffect(() => {
    authService.getPricing()
      .then(({ pricing: db }) => {
        if (db && db.dailyPrice != null) {
          setPricingState({
            dailyPrice:      Number(db.dailyPrice),
            monthlyPrice:    Number(db.monthlyPrice),
            monthlySessions: Number(db.monthlySessions),
          });
        } else {
          setPricingState({ dailyPrice: 800, monthlyPrice: 12000, monthlySessions: 20 });
        }
      })
      .catch(() => {
        setPricingState({ dailyPrice: 800, monthlyPrice: 12000, monthlySessions: 20 });
      })
      .finally(() => setPricingLoaded(true));
  }, []);

  const persistPricing = useCallback(async (p: Pricing): Promise<void> => {
    const res = await authService.savePricing(p);
    if (res?.pricing && res.pricing.dailyPrice != null) {
      setPricingState({
        dailyPrice:      Number(res.pricing.dailyPrice),
        monthlyPrice:    Number(res.pricing.monthlyPrice),
        monthlySessions: Number(res.pricing.monthlySessions),
      });
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
      <Route path="bookings" element={<Bookings />} />
      <Route path="earnings" element={<Earnings  pricing={pricing} onSaveField={persistPricing} />} />
      <Route path="profile"  element={<Profile   pricing={pricing} onSaveField={persistPricing} />} />
    </Routes>
  );
}