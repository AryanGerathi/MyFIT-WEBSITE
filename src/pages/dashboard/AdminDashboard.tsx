import { Routes, Route } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { revenueData, userBookings } from "@/data/mock";
import {
  Users, Briefcase, Wallet, CalendarCheck,
  Check, X, ShieldCheck, Loader2, RefreshCw,
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
} from "@/services/backendService";

// ── Shared helpers ────────────────────────────────────────────────────────────

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={cols} className="text-center text-muted-foreground py-10">
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

// ── Phone helper ──────────────────────────────────────────────────────────────

function PhoneCell({ phone }: { phone?: { countryCode?: string; number?: string } }) {
  if (!phone?.number) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="text-muted-foreground">
      {phone.countryCode} {phone.number}
    </span>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

function Overview() {
  const [stats, setStats]   = useState<{ users: number; creators: number; revenue: number; bookings: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [{ users }, { creators }, { payments }] = await Promise.all([
        adminService.getUsers(),
        adminService.getCreators(),
        adminService.getPayments(),
      ]);
      const revenue  = payments.reduce((sum, p) => sum + p.amount, 0);
      const bookings = payments.length;
      setStats({ users: users.length, creators: creators.length, revenue, bookings });
    } catch {
      // silently fall back to dashes
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total users"
          value={loading ? "—" : String(stats?.users ?? "—")}
          icon={Users}
          trend="+48 this week"
        />
        <KpiCard
          label="Total creators"
          value={loading ? "—" : String(stats?.creators ?? "—")}
          icon={Briefcase}
          trend="+5 this week"
        />
        <KpiCard
          label="Revenue (total)"
          value={loading ? "—" : `₹${(stats?.revenue ?? 0).toLocaleString()}`}
          icon={Wallet}
          trend="+18% MoM"
        />
        <KpiCard
          label="Bookings"
          value={loading ? "—" : String(stats?.bookings ?? "—")}
          icon={CalendarCheck}
        />
      </div>

      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-4">Revenue trend</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────────────────────

function UsersPage() {
  const [users,   setUsers]   = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { users: u } = await adminService.getUsers();
      setUsers(u);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not load users.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  if (loading) return <LoadingState message="Loading users…" />;
  if (error)   return <ErrorState  message={error} onRetry={fetchUsers} />;

  return (
    <Card className="border-border/60 shadow-card overflow-hidden">
      <div className="p-5 border-b border-border/60 flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold">All users</h2>
          <p className="text-sm text-muted-foreground">{users.length} registered</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
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
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u._id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell><PhoneCell phone={u.phone} /></TableCell>
              <TableCell>
                {new Date(u.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
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
          ))}
          {users.length === 0 && <EmptyRow cols={5} message="No users found." />}
        </TableBody>
      </Table>
    </Card>
  );
}

// ── Creators ──────────────────────────────────────────────────────────────────

function CreatorsPage() {
  const [creators, setCreators] = useState<AdminCreator[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { creators: c } = await adminService.getCreators();
      setCreators(c);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not load creators.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

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
      const msg = err instanceof Error ? err.message : "Failed to update verification.";
      toast.error(msg);
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <LoadingState message="Loading creators…" />;
  if (error)   return <ErrorState  message={error} onRetry={fetchCreators} />;

  const pending  = creators.filter((c) => !c.creatorProfile.verified);
  const verified = creators.filter((c) =>  c.creatorProfile.verified);

  return (
    <div className="space-y-6">
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
            <p className="text-sm text-muted-foreground">Review and verify new trainer profiles</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCreators} className="gap-2">
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
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((c) => (
              <TableRow key={c._id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell><PhoneCell phone={c.phone} /></TableCell>
                <TableCell>{c.creatorProfile.specialization || "—"}</TableCell>
                <TableCell>
                  {new Date(c.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
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
            ))}
            {pending.length === 0 && <EmptyRow cols={6} message="No pending approvals." />}
          </TableBody>
        </Table>
      </Card>

      <Card className="border-border/60 shadow-card overflow-hidden">
        <div className="p-5 border-b border-border/60">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-600" />
            Verified creators
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              {verified.length}
            </span>
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Daily / Monthly</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verified.map((c) => (
              <TableRow key={c._id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell><PhoneCell phone={c.phone} /></TableCell>
                <TableCell>{c.creatorProfile.specialization || "—"}</TableCell>
                <TableCell>
                  ₹{c.creatorProfile.dailyPrice ?? "—"} / ₹{c.creatorProfile.monthlyPrice ?? "—"}
                </TableCell>
                <TableCell className="text-right">
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
            ))}
            {verified.length === 0 && <EmptyRow cols={6} message="No verified creators yet." />}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ── Payments ──────────────────────────────────────────────────────────────────

function PaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { payments: p } = await adminService.getPayments();
      setPayments(p);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not load payments.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const statusColor = (s: string) =>
    s === "success" ? "bg-green-100 text-green-700" :
    s === "pending" ? "bg-amber-100 text-amber-700" :
    "bg-red-100 text-red-700";

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
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((t) => (
            <TableRow key={t._id}>
              <TableCell className="text-muted-foreground">
                {new Date(t.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </TableCell>
              <TableCell>{t.userId?.name ?? "—"}</TableCell>
              <TableCell>{t.creatorId?.name ?? "—"}</TableCell>
              <TableCell className="capitalize">{t.sessionType}</TableCell>
              <TableCell className="font-medium">₹{t.amount.toLocaleString()}</TableCell>
              <TableCell>₹{t.commission.toLocaleString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(t.status)}`}>
                  {t.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
          {payments.length === 0 && <EmptyRow cols={7} message="No transactions found." />}
        </TableBody>
      </Table>
    </Card>
  );
}

// ── Bookings ──────────────────────────────────────────────────────────────────

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
            <TableHead>Date</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userBookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.date}</TableCell>
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

// ── Reports ───────────────────────────────────────────────────────────────────

function ReportsPage() {
  const [stats, setStats]     = useState<{ revenue: number; avgPrice: number; bookings: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getPayments().then(({ payments }) => {
      const revenue  = payments.reduce((s, p) => s + p.amount, 0);
      const avgPrice = payments.length ? Math.round(revenue / payments.length) : 0;
      setStats({ revenue, avgPrice, bookings: payments.length });
    }).catch(() => {}).finally(() => setLoading(false));
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
      <Route index           element={<Overview />}     />
      <Route path="users"    element={<UsersPage />}    />
      <Route path="creators" element={<CreatorsPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="bookings" element={<BookingsPage />} />
      <Route path="reports"  element={<ReportsPage />}  />
    </Routes>
  );
}