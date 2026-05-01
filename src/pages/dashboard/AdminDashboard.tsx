import { Routes, Route } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { revenueData, userBookings } from "@/data/mock";
import {
  Users, Briefcase, Wallet, CalendarCheck,
  Check, X, ShieldCheck, Loader2, RefreshCw,
  ArrowDownToLine, Phone, Mail, Clock, Calendar,
  CreditCard, Star, IndianRupee, User,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import {
  adminService,
  AdminCreator,
  AdminUser,
  AdminPayment,
  AdminWithdrawal,
} from "@/services/backendService";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

function DateTimeCell({ value }: { value: string }) {
  const { date, time } = formatDateTime(value);
  return (
    <TableCell>
      <div className="text-sm">{date}</div>
      <div className="text-xs text-muted-foreground">{time}</div>
    </TableCell>
  );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={cols} className="text-center text-muted-foreground py-8">
        {message}
      </TableCell>
    </TableRow>
  );
}

function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
      <Loader2 className="animate-spin" size={18} />
      <span className="text-sm">{message}</span>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-3">
      <p className="text-sm text-destructive">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
        <RefreshCw size={14} /> Retry
      </Button>
    </div>
  );
}

function PhoneCell({ phone }: { phone?: { countryCode?: string; number?: string } }) {
  if (!phone?.number) return <span className="text-muted-foreground">—</span>;
  return <span className="text-muted-foreground">{phone.countryCode} {phone.number}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success:   "bg-green-100 text-green-700",
    approved:  "bg-green-100 text-green-700",
    upcoming:  "bg-blue-100 text-blue-700",
    pending:   "bg-amber-100 text-amber-700",
    failed:    "bg-red-100 text-red-700",
    rejected:  "bg-red-100 text-red-700",
    completed: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon size={13} className="text-muted-foreground" />
      </div>
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="text-sm font-medium truncate">{value || "—"}</span>
    </div>
  );
}

// ── User Detail Drawer ────────────────────────────────────────────────────────

function UserDetailDrawer({
  user,
  open,
  onClose,
  allPayments,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  allPayments: AdminPayment[];
}) {
  if (!user) return null;

  const { date: joinDate, time: joinTime } = formatDateTime(user.createdAt);
  const userPayments  = allPayments.filter((p) => p.userId?.email === user.email);
  const totalSpent    = userPayments.reduce((s, p) => s + p.amount, 0);
  const uniqueCreators = new Set(userPayments.map((p) => p.creatorId?.email)).size;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        {/* Hero header */}
        <div className="bg-gradient-to-br from-accent/10 to-accent/5 border-b border-border/60 p-6">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left">User Profile</SheetTitle>
          </SheetHeader>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-accent/20 flex items-center justify-center text-accent font-bold text-xl shrink-0">
              {user.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </div>
            <div>
              <p className="font-semibold text-lg leading-tight">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-1.5">
                <Badge
                  variant={user.isVerified ? "default" : "secondary"}
                  className={user.isVerified ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                >
                  {user.isVerified ? "Email Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Total spent",  value: `₹${totalSpent.toLocaleString()}` },
              { label: "Sessions",     value: String(userPayments.length) },
              { label: "Creators used", value: String(uniqueCreators) },
            ].map((s) => (
              <div key={s.label} className="bg-background/70 rounded-xl p-3 text-center border border-border/40">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-bold text-base mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="p-5">
          <TabsList className="w-full mb-5">
            <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
            <TabsTrigger value="payments" className="flex-1">
              Payments{userPayments.length > 0 ? ` (${userPayments.length})` : ""}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Contact Information
            </p>
            <div className="rounded-xl border border-border/60 overflow-hidden bg-card px-4">
              <InfoRow icon={User}         label="Full name" value={user.name} />
              <InfoRow icon={Mail}         label="Email"     value={user.email} />
              <InfoRow icon={Phone}        label="Phone"     value={`${user.phone?.countryCode || ""} ${user.phone?.number || ""}`.trim()} />
              <InfoRow icon={Calendar}     label="Joined"    value={`${joinDate} at ${joinTime}`} />
              <InfoRow icon={CheckCircle2} label="Status"    value={user.isVerified ? "Email Verified" : "Not Verified"} />
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-0">
            {userPayments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No payment records found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userPayments.map((p) => {
                  const { date, time } = formatDateTime(p.createdAt);
                  return (
                    <div key={p._id} className="rounded-xl border border-border/60 p-4 bg-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm">Session with {p.creatorId?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {p.sessionType} · {date} at {time}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold">₹{p.amount.toLocaleString()}</p>
                          <div className="mt-1"><StatusBadge status={p.status} /></div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/40 flex gap-6 text-xs text-muted-foreground">
                        <span>Commission: <span className="text-amber-600 font-medium">₹{p.commission.toLocaleString()}</span></span>
                        <span>Creator gets: <span className="text-green-600 font-medium">₹{(p.amount - p.commission).toLocaleString()}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// ── Creator Detail Drawer ─────────────────────────────────────────────────────

function CreatorDetailDrawer({
  creator,
  open,
  onClose,
  allPayments,
  allWithdrawals,
}: {
  creator: AdminCreator | null;
  open: boolean;
  onClose: () => void;
  allPayments: AdminPayment[];
  allWithdrawals: AdminWithdrawal[];
}) {
  if (!creator) return null;

  const { date: joinDate, time: joinTime } = formatDateTime(creator.createdAt);

  const creatorPayments    = allPayments.filter((p) => p.creatorId?.email === creator.email);
  const creatorWithdrawals = allWithdrawals.filter((w) => w.creatorId?.email === creator.email);

  const grossRevenue    = creatorPayments.reduce((s, p) => s + p.amount, 0);
  const totalCommission = creatorPayments.reduce((s, p) => s + p.commission, 0);
  const netEarnings     = grossRevenue - totalCommission;
  const totalWithdrawn  = creatorWithdrawals
    .filter((w) => w.status === "approved")
    .reduce((s, w) => s + w.amount, 0);
  const pendingWithdrawal = creatorWithdrawals
    .filter((w) => w.status === "pending")
    .reduce((s, w) => s + w.amount, 0);

  const slots: string[] = (creator as any).creatorProfile?.timeSlots ?? [];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {/* Hero header */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-b border-border/60 p-6">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left">Creator Profile</SheetTitle>
          </SheetHeader>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl shrink-0">
              {creator.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-lg leading-tight">{creator.name}</p>
                {creator.creatorProfile.verified && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    <ShieldCheck size={11} /> Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{creator.email}</p>
              {creator.creatorProfile.specialization && (
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                  {creator.creatorProfile.specialization}
                </span>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            {[
              { label: "Gross",      value: `₹${grossRevenue.toLocaleString()}` },
              { label: "Net earned", value: `₹${netEarnings.toLocaleString()}` },
              { label: "Clients",    value: String(creatorPayments.length) },
              { label: "Withdrawn",  value: `₹${totalWithdrawn.toLocaleString()}` },
            ].map((s) => (
              <div key={s.label} className="bg-background/70 rounded-xl p-3 text-center border border-border/40">
                <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                <p className="font-bold text-sm mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="p-5">
          <TabsList className="w-full mb-5">
            <TabsTrigger value="profile"     className="flex-1">Profile</TabsTrigger>
            <TabsTrigger value="clients"     className="flex-1">
              Clients{creatorPayments.length > 0 ? ` (${creatorPayments.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="earnings"    className="flex-1">Earnings</TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex-1">
              Withdrawals{creatorWithdrawals.length > 0 ? ` (${creatorWithdrawals.length})` : ""}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-5 mt-0">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Contact Information
              </p>
              <div className="rounded-xl border border-border/60 overflow-hidden bg-card px-4">
                <InfoRow icon={User}         label="Full name"  value={creator.name} />
                <InfoRow icon={Mail}         label="Email"      value={creator.email} />
                <InfoRow icon={Phone}        label="Phone"      value={`${creator.phone?.countryCode || ""} ${creator.phone?.number || ""}`.trim()} />
                <InfoRow icon={Star}         label="Specialty"  value={creator.creatorProfile.specialization || "—"} />
                <InfoRow icon={Calendar}     label="Joined"     value={`${joinDate} at ${joinTime}`} />
                <InfoRow icon={ShieldCheck}  label="Verified"   value={creator.creatorProfile.verified ? "Yes" : "Pending"} />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Pricing
              </p>
              <div className="rounded-xl border border-border/60 overflow-hidden bg-card px-4">
                <InfoRow icon={IndianRupee}  label="Daily session"   value={creator.creatorProfile.dailyPrice ? `₹${creator.creatorProfile.dailyPrice.toLocaleString()}` : "—"} />
                <InfoRow icon={IndianRupee}  label="Monthly package" value={creator.creatorProfile.monthlyPrice ? `₹${creator.creatorProfile.monthlyPrice.toLocaleString()}` : "—"} />
                <InfoRow icon={CalendarCheck} label="Sessions/month" value={creator.creatorProfile.monthlySessions ? String(creator.creatorProfile.monthlySessions) : "—"} />
              </div>
            </div>

            {slots.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Available Time Slots
                </p>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <span key={slot} className="text-xs px-2.5 py-1 rounded-lg border border-border bg-muted text-muted-foreground">
                      <Clock size={10} className="inline mr-1 -mt-0.5" />{slot}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-0">
            {creatorPayments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No clients yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {creatorPayments.map((p) => {
                  const { date, time } = formatDateTime(p.createdAt);
                  return (
                    <div key={p._id} className="rounded-xl border border-border/60 p-4 bg-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                            {(p.userId?.name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{p.userId?.name ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">{p.userId?.email ?? "—"}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold">₹{p.amount.toLocaleString()}</p>
                          <div className="mt-1"><StatusBadge status={p.status} /></div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground flex gap-4">
                        <span className="capitalize">{p.sessionType}</span>
                        <span>{date} at {time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Gross revenue",    value: `₹${grossRevenue.toLocaleString()}`,    color: "text-foreground" },
                { label: "Platform fee (20%)", value: `₹${totalCommission.toLocaleString()}`, color: "text-amber-600" },
                { label: "Net earnings",     value: `₹${netEarnings.toLocaleString()}`,      color: "text-green-600" },
                { label: "Total withdrawn",  value: `₹${totalWithdrawn.toLocaleString()}`,   color: "text-blue-600" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/60 p-4 bg-card">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`font-bold text-lg mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {pendingWithdrawal > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                <Clock size={14} />
                <span>₹{pendingWithdrawal.toLocaleString()} withdrawal pending admin approval</span>
              </div>
            )}

            {creatorPayments.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Per-session breakdown
                </p>
                <div className="rounded-xl border border-border/60 overflow-hidden bg-card divide-y divide-border/40">
                  {creatorPayments.map((p) => {
                    const { date, time } = formatDateTime(p.createdAt);
                    return (
                      <div key={p._id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-medium">{p.userId?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {p.sessionType} · {date} at {time}
                          </p>
                        </div>
                        <div className="text-right shrink-0 text-xs space-y-0.5">
                          <p className="text-muted-foreground">Gross: <span className="text-foreground font-medium">₹{p.amount.toLocaleString()}</span></p>
                          <p className="text-muted-foreground">Commission: <span className="text-amber-600 font-medium">₹{p.commission.toLocaleString()}</span></p>
                          <p className="text-muted-foreground">Net: <span className="text-green-600 font-medium">₹{(p.amount - p.commission).toLocaleString()}</span></p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No earnings yet</p>
              </div>
            )}
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="mt-0">
            {creatorWithdrawals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ArrowDownToLine size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No withdrawal requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Summary */}
                <div className="rounded-xl bg-muted/40 border border-border/40 p-4 grid grid-cols-3 gap-3 text-center text-xs">
                  {[
                    { label: "Pending",  value: creatorWithdrawals.filter((w) => w.status === "pending").length,  color: "text-amber-600" },
                    { label: "Approved", value: creatorWithdrawals.filter((w) => w.status === "approved").length, color: "text-green-600" },
                    { label: "Rejected", value: creatorWithdrawals.filter((w) => w.status === "rejected").length, color: "text-red-600" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-muted-foreground">{s.label}</p>
                      <p className={`font-bold text-lg mt-0.5 ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* List */}
                {creatorWithdrawals.map((w) => {
                  const { date, time } = formatDateTime(w.createdAt);
                  return (
                    <div key={w._id} className="rounded-xl border border-border/60 p-4 bg-card flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-base">₹{w.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{date} at {time}</p>
                      </div>
                      <StatusBadge status={w.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

function Overview() {
  const [stats, setStats] = useState<{ users: number; creators: number; revenue: number; bookings: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [{ users }, { creators }, { payments }] = await Promise.all([
        adminService.getUsers(),
        adminService.getCreators(),
        adminService.getPayments(),
      ]);
      setStats({
        users: users.length,
        creators: creators.length,
        revenue: payments.reduce((s, p) => s + p.amount, 0),
        bookings: payments.length,
      });
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total users"     value={loading ? "—" : String(stats?.users ?? "—")}                        icon={Users}         trend="+48 this week" />
        <KpiCard label="Total creators"  value={loading ? "—" : String(stats?.creators ?? "—")}                     icon={Briefcase}     trend="+5 this week" />
        <KpiCard label="Revenue (total)" value={loading ? "—" : `₹${(stats?.revenue ?? 0).toLocaleString()}`}       icon={Wallet}        trend="+18% MoM" />
        <KpiCard label="Bookings"        value={loading ? "—" : String(stats?.bookings ?? "—")}                     icon={CalendarCheck} />
      </div>
      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-4">Revenue trend</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ── Users Page ────────────────────────────────────────────────────────────────

function UsersPage() {
  const [users,    setUsers]    = useState<AdminUser[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [{ users: u }, { payments: p }] = await Promise.all([
        adminService.getUsers(),
        adminService.getPayments(),
      ]);
      setUsers(u);
      setPayments(p);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not load users.";
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <LoadingState message="Loading users…" />;
  if (error)   return <ErrorState  message={error} onRetry={fetchAll} />;

  return (
    <>
      <Card className="border-border/60 shadow-card overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold">All users</h2>
            <p className="text-sm text-muted-foreground">
              {users.length} registered · click any row to view full details
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Total spent</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const uPayments  = payments.filter((p) => p.userId?.email === u.email);
              const totalSpent = uPayments.reduce((s, p) => s + p.amount, 0);
              return (
                <TableRow
                  key={u._id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelected(u)}
                >
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><PhoneCell phone={u.phone} /></TableCell>
                  <DateTimeCell value={u.createdAt} />
                  <TableCell>
                    {uPayments.length > 0
                      ? uPayments.length
                      : <span className="text-muted-foreground">0</span>}
                  </TableCell>
                  <TableCell className="font-medium">
                    {totalSpent > 0
                      ? `₹${totalSpent.toLocaleString()}`
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.isVerified ? "default" : "secondary"}
                      className={u.isVerified ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                    >
                      {u.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {users.length === 0 && <EmptyRow cols={7} message="No users found." />}
          </TableBody>
        </Table>
      </Card>

      <UserDetailDrawer
        user={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        allPayments={payments}
      />
    </>
  );
}

// ── Creators Page ─────────────────────────────────────────────────────────────

function CreatorsPage() {
  const [creators,    setCreators]    = useState<AdminCreator[]>([]);
  const [payments,    setPayments]    = useState<AdminPayment[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [actionId,    setActionId]    = useState<string | null>(null);
  const [selected,    setSelected]    = useState<AdminCreator | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [{ creators: c }, { payments: p }, { withdrawals: w }] = await Promise.all([
        adminService.getCreators(),
        adminService.getPayments(),
        adminService.getWithdrawals(),
      ]);
      setCreators(c);
      setPayments(p);
      setWithdrawals(w);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not load creators.";
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleVerify = async (id: string, verify: boolean) => {
    setActionId(id);
    try {
      const { user } = await adminService.verifyCreator(id, verify);
      setCreators((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, creatorProfile: { ...c.creatorProfile, verified: user.creatorProfile.verified } }
            : c
        )
      );
      toast.success(verify ? "Creator verified successfully." : "Verification removed.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update verification.");
    } finally { setActionId(null); }
  };

  if (loading) return <LoadingState message="Loading creators…" />;
  if (error)   return <ErrorState  message={error} onRetry={fetchAll} />;

  const pending  = creators.filter((c) => !c.creatorProfile.verified);
  const verified = creators.filter((c) =>  c.creatorProfile.verified);

  return (
    <>
      <div className="space-y-6">
        {/* Pending approvals */}
        <Card className="border-border/60 shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/60 flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold flex items-center gap-2">
                Pending approvals
                {pending.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                    {pending.length}
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground">
                Click a row to view details · use the button to verify
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
              <RefreshCw size={13} /> Refresh
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead>Net earned</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((c) => {
                const cp      = payments.filter((p) => p.creatorId?.email === c.email);
                const revenue = cp.reduce((s, p) => s + p.amount - p.commission, 0);
                return (
                  <TableRow
                    key={c._id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium" onClick={() => setSelected(c)}>{c.name}</TableCell>
                    <TableCell className="text-muted-foreground" onClick={() => setSelected(c)}>{c.email}</TableCell>
                    <TableCell onClick={() => setSelected(c)}><PhoneCell phone={c.phone} /></TableCell>
                    <TableCell onClick={() => setSelected(c)}>{c.creatorProfile.specialization || "—"}</TableCell>
                    <DateTimeCell value={c.createdAt} />
                    <TableCell onClick={() => setSelected(c)}>
                      {cp.length > 0 ? cp.length : <span className="text-muted-foreground">0</span>}
                    </TableCell>
                    <TableCell onClick={() => setSelected(c)} className="font-medium">
                      {revenue > 0 ? `₹${revenue.toLocaleString()}` : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        disabled={actionId === c._id}
                        className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                        onClick={() => handleVerify(c._id, true)}
                      >
                        {actionId === c._id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <><Check size={13} /> Verify</>}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {pending.length === 0 && <EmptyRow cols={8} message="No pending approvals." />}
            </TableBody>
          </Table>
        </Card>

        {/* Verified creators */}
        <Card className="border-border/60 shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/60">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-600" /> Verified creators
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                {verified.length}
              </span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Click any row to view full profile, clients &amp; earnings
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead>Net earned</TableHead>
                <TableHead>Daily / Monthly</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verified.map((c) => {
                const cp      = payments.filter((p) => p.creatorId?.email === c.email);
                const revenue = cp.reduce((s, p) => s + p.amount - p.commission, 0);
                return (
                  <TableRow
                    key={c._id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium" onClick={() => setSelected(c)}>{c.name}</TableCell>
                    <TableCell className="text-muted-foreground" onClick={() => setSelected(c)}>{c.email}</TableCell>
                    <TableCell onClick={() => setSelected(c)}><PhoneCell phone={c.phone} /></TableCell>
                    <TableCell onClick={() => setSelected(c)}>{c.creatorProfile.specialization || "—"}</TableCell>
                    <DateTimeCell value={c.createdAt} />
                    <TableCell onClick={() => setSelected(c)}>
                      {cp.length > 0 ? cp.length : <span className="text-muted-foreground">0</span>}
                    </TableCell>
                    <TableCell onClick={() => setSelected(c)} className="font-medium">
                      {revenue > 0 ? `₹${revenue.toLocaleString()}` : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell onClick={() => setSelected(c)}>
                      ₹{c.creatorProfile.dailyPrice ?? "—"} / ₹{c.creatorProfile.monthlyPrice ?? "—"}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionId === c._id}
                        className="gap-1.5 text-destructive hover:text-destructive border-destructive/30"
                        onClick={() => handleVerify(c._id, false)}
                      >
                        {actionId === c._id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <><X size={13} /> Revoke</>}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {verified.length === 0 && <EmptyRow cols={9} message="No verified creators yet." />}
            </TableBody>
          </Table>
        </Card>
      </div>

      <CreatorDetailDrawer
        creator={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        allPayments={payments}
        allWithdrawals={withdrawals}
      />
    </>
  );
}

// ── Payments Page ─────────────────────────────────────────────────────────────

function PaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { payments: p } = await adminService.getPayments();
      setPayments(p);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not load payments.";
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  if (loading) return <LoadingState message="Loading payments…" />;
  if (error)   return <ErrorState  message={error} onRetry={fetchPayments} />;

  return (
    <Card className="border-border/60 shadow-card overflow-hidden">
      <div className="p-5 border-b border-border/60 flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold">Transactions</h2>
          <p className="text-sm text-muted-foreground">{payments.length} records</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPayments} className="gap-2">
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date &amp; Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Creator gets</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((t) => (
            <TableRow key={t._id}>
              <DateTimeCell value={t.createdAt} />
              <TableCell>{t.userId?.name ?? "—"}</TableCell>
              <TableCell>{t.creatorId?.name ?? "—"}</TableCell>
              <TableCell className="capitalize">{t.sessionType}</TableCell>
              <TableCell className="font-medium">₹{t.amount.toLocaleString()}</TableCell>
              <TableCell className="text-amber-600">₹{t.commission.toLocaleString()}</TableCell>
              <TableCell className="text-green-600 font-medium">
                ₹{(t.amount - t.commission).toLocaleString()}
              </TableCell>
              <TableCell><StatusBadge status={t.status} /></TableCell>
            </TableRow>
          ))}
          {payments.length === 0 && <EmptyRow cols={8} message="No transactions found." />}
        </TableBody>
      </Table>
    </Card>
  );
}

// ── Bookings Page ─────────────────────────────────────────────────────────────

function BookingsPage() {
  return (
    <Card className="border-border/60 shadow-card overflow-hidden">
      <div className="p-5 border-b border-border/60">
        <h2 className="font-display font-semibold">All bookings</h2>
        <p className="text-sm text-muted-foreground">{userBookings.length} sessions</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date &amp; Time</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Time slot</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userBookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <div className="text-sm">{b.date}</div>
                <div className="text-xs text-muted-foreground">{b.time}</div>
              </TableCell>
              <TableCell className="font-medium">{b.creatorName}</TableCell>
              <TableCell>{b.time}</TableCell>
              <TableCell>₹{b.price}</TableCell>
              <TableCell>
                <Badge
                  variant={b.status === "upcoming" ? "default" : "secondary"}
                  className={b.status === "upcoming" ? "bg-accent" : ""}
                >
                  {b.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {userBookings.length === 0 && <EmptyRow cols={5} message="No bookings found." />}
        </TableBody>
      </Table>
    </Card>
  );
}

// ── Withdrawals Page ──────────────────────────────────────────────────────────

function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [actionId,    setActionId]    = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { withdrawals: w } = await adminService.getWithdrawals();
      setWithdrawals(w);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not load withdrawal requests.";
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionId(id);
    try {
      await adminService.updateWithdrawal(id, action);
      setWithdrawals((prev) =>
        prev.map((w) =>
          w._id === id ? { ...w, status: action === "approve" ? "approved" : "rejected" } : w
        )
      );
      toast.success(action === "approve" ? "Withdrawal approved." : "Withdrawal rejected.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed.");
    } finally { setActionId(null); }
  };

  const pending  = withdrawals.filter((w) => w.status === "pending");
  const resolved = withdrawals.filter((w) => w.status !== "pending");

  if (loading) return <LoadingState message="Loading withdrawal requests…" />;
  if (error)   return <ErrorState  message={error} onRetry={fetchWithdrawals} />;

  return (
    <div className="space-y-6">
      {/* Pending */}
      <Card className="border-border/60 shadow-card overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold flex items-center gap-2">
              <ArrowDownToLine size={16} className="text-amber-600" />
              Pending withdrawal requests
              {pending.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                  {pending.length}
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              Review and approve creator payout requests
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchWithdrawals} className="gap-2">
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requested on</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((w) => (
              <TableRow key={w._id}>
                <DateTimeCell value={w.createdAt} />
                <TableCell className="font-medium">{w.creatorId?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{w.creatorId?.email ?? "—"}</TableCell>
                <TableCell className="font-display font-bold">₹{w.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      disabled={actionId === w._id}
                      className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                      onClick={() => handleAction(w._id, "approve")}
                    >
                      {actionId === w._id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <><Check size={13} /> Approve</>}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionId === w._id}
                      className="gap-1.5 text-destructive hover:text-destructive border-destructive/30"
                      onClick={() => handleAction(w._id, "reject")}
                    >
                      {actionId === w._id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <><X size={13} /> Reject</>}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pending.length === 0 && <EmptyRow cols={5} message="No pending withdrawal requests." />}
          </TableBody>
        </Table>
      </Card>

      {/* Resolved */}
      {resolved.length > 0 && (
        <Card className="border-border/60 shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/60">
            <h2 className="font-display font-semibold">Resolved requests</h2>
            <p className="text-sm text-muted-foreground">
              Previously approved or rejected withdrawals
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date &amp; Time</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resolved.map((w) => (
                <TableRow key={w._id}>
                  <DateTimeCell value={w.createdAt} />
                  <TableCell className="font-medium">{w.creatorId?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{w.creatorId?.email ?? "—"}</TableCell>
                  <TableCell className="font-display font-bold">₹{w.amount.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={w.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────

function ReportsPage() {
  const [stats, setStats]     = useState<{ revenue: number; avgPrice: number; bookings: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getPayments()
      .then(({ payments }) => {
        const revenue  = payments.reduce((s, p) => s + p.amount, 0);
        const avgPrice = payments.length ? Math.round(revenue / payments.length) : 0;
        setStats({ revenue, avgPrice, bookings: payments.length });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total revenue",     value: loading ? "—" : `₹${(stats?.revenue ?? 0).toLocaleString()}` },
    { label: "Avg session price", value: loading ? "—" : `₹${(stats?.avgPrice ?? 0).toLocaleString()}` },
    { label: "Total bookings",    value: loading ? "—" : String(stats?.bookings ?? "—") },
    { label: "Refund rate",       value: "0%" },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {cards.map((s, i) => (
        <Card key={i} className="p-6 border-border/60 shadow-card">
          <p className="text-sm text-muted-foreground">{s.label}</p>
          <p className="font-display font-bold text-3xl mt-2">{s.value}</p>
        </Card>
      ))}
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function AdminDashboardRoutes() {
  return (
    <Routes>
      <Route index              element={<Overview />}        />
      <Route path="users"       element={<UsersPage />}       />
      <Route path="creators"    element={<CreatorsPage />}    />
      <Route path="payments"    element={<PaymentsPage />}    />
      <Route path="bookings"    element={<BookingsPage />}    />
      <Route path="withdrawals" element={<WithdrawalsPage />} />
      <Route path="reports"     element={<ReportsPage />}     />
    </Routes>
  );
}