import { Routes, Route } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminUsers, pendingCreators, transactions, revenueData, creators, userBookings } from "@/data/mock";
import { Users, Briefcase, Wallet, CalendarCheck, Check, X } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total users" value="1,284" icon={Users} trend="+48 this week" />
        <KpiCard label="Total creators" value={String(creators.length * 12)} icon={Briefcase} trend="+5 this week" />
        <KpiCard label="Revenue (MTD)" value="₹1,04,000" icon={Wallet} trend="+18% MoM" />
        <KpiCard label="Bookings" value="412" icon={CalendarCheck} />
      </div>

      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-4">Revenue trend</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
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

function UsersPage() {
  return (
    <Card className="border-border/60 shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Bookings</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {adminUsers.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>{u.joined}</TableCell>
              <TableCell className="text-right">{u.bookings}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function CreatorsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-card overflow-hidden">
        <div className="p-5 border-b border-border/60">
          <h2 className="font-display font-semibold">Pending approvals</h2>
          <p className="text-sm text-muted-foreground">Review and approve new trainer applications</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Specialty</TableHead><TableHead>Experience</TableHead><TableHead>Applied</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {pendingCreators.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.specialty}</TableCell>
                <TableCell>{c.experience}y</TableCell>
                <TableCell className="text-muted-foreground">{c.applied}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => toast.success(`${c.name} approved`)}><Check size={14} /></Button>
                    <Button size="sm" variant="outline" onClick={() => toast.error(`${c.name} rejected`)}><X size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="border-border/60 shadow-card overflow-hidden">
        <div className="p-5 border-b border-border/60">
          <h2 className="font-display font-semibold">Active creators</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Rating</TableHead><TableHead className="text-right">Price</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {creators.slice(0, 6).map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name} {c.verified && <Badge variant="secondary" className="ml-1">Verified</Badge>}</TableCell>
                <TableCell>{c.category}</TableCell>
                <TableCell>{c.rating}★ ({c.reviews})</TableCell>
                <TableCell className="text-right">₹{c.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function PaymentsPage() {
  const statusColor = (s: string) =>
    s === "success" ? "bg-success/10 text-success" :
    s === "pending" ? "bg-warning/10 text-warning" :
    "bg-destructive/10 text-destructive";
  return (
    <Card className="border-border/60 shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow><TableHead>Date</TableHead><TableHead>User</TableHead><TableHead>Creator</TableHead><TableHead>Amount</TableHead><TableHead>Commission</TableHead><TableHead>Status</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="text-muted-foreground">{t.date}</TableCell>
              <TableCell>{t.user}</TableCell>
              <TableCell>{t.creator}</TableCell>
              <TableCell className="font-medium">₹{t.amount}</TableCell>
              <TableCell>₹{t.commission}</TableCell>
              <TableCell><span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(t.status)}`}>{t.status}</span></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function BookingsPage() {
  return (
    <Card className="border-border/60 shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow><TableHead>Date</TableHead><TableHead>Creator</TableHead><TableHead>Time</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {userBookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.date}</TableCell>
              <TableCell className="font-medium">{b.creatorName}</TableCell>
              <TableCell>{b.time}</TableCell>
              <TableCell>₹{b.price}</TableCell>
              <TableCell><Badge variant={b.status === "upcoming" ? "default" : "secondary"} className={b.status === "upcoming" ? "bg-accent" : ""}>{b.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function ReportsPage() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {[
        { label: "Monthly revenue", value: "₹1,04,000" },
        { label: "Avg session price", value: "₹685" },
        { label: "New users (30d)", value: "+184" },
        { label: "Refund rate", value: "1.2%" },
      ].map((s, i) => (
        <Card key={i} className="p-6 border-border/60 shadow-card">
          <p className="text-sm text-muted-foreground">{s.label}</p>
          <p className="font-display font-bold text-3xl mt-2">{s.value}</p>
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboardRoutes() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="creators" element={<CreatorsPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="bookings" element={<BookingsPage />} />
      <Route path="reports" element={<ReportsPage />} />
    </Routes>
  );
}
