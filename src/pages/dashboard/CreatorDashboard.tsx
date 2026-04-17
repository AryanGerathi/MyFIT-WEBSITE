import { Routes, Route } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { VideoCallButton } from "@/components/VideoCallButton";
import { creatorBookings, timeSlots } from "@/data/mock";
import { Wallet, Users, Calendar as CalIcon, TrendingUp, Plus, Check } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total earnings" value="₹84,200" icon={Wallet} trend="+12% MoM" />
        <KpiCard label="Total clients" value="48" icon={Users} trend="+5 this week" />
        <KpiCard label="Upcoming sessions" value={String(creatorBookings.filter(b => b.status === "upcoming").length)} icon={CalIcon} />
        <KpiCard label="Avg rating" value="4.9★" icon={TrendingUp} />
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

function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (t: string) => setSelected((s) => s.includes(t) ? s.filter(x => x !== t) : [...s, t]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-4">Pick a date</h2>
        <Calendar mode="single" selected={date} onSelect={setDate} className={cn("p-3 pointer-events-auto rounded-lg border")} />
      </Card>
      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-4">Time slots</h2>
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map((t) => {
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
        <Button onClick={() => toast.success(`${selected.length} slots added for ${date ? format(date, "PP") : ""}`)}
          className="w-full mt-5 bg-accent text-accent-foreground">
          <Plus size={16} className="mr-1" /> Add slots
        </Button>
      </Card>
    </div>
  );
}

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

function Earnings() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <KpiCard label="Total earnings" value="₹84,200" icon={Wallet} />
        <KpiCard label="This month" value="₹18,400" icon={TrendingUp} trend="+12%" />
        <KpiCard label="Available" value="₹14,200" icon={Wallet} />
      </div>
      <Card className="p-6 border-border/60 shadow-card flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-semibold text-lg">Withdraw earnings</h2>
          <p className="text-sm text-muted-foreground">Transfer to your linked bank account (HDFC ••4521)</p>
        </div>
        <Button onClick={() => toast.success("Withdrawal initiated — funds in 1-2 days")}
          className="bg-accent text-accent-foreground">Withdraw ₹14,200</Button>
      </Card>
    </div>
  );
}

function Profile() {
  return (
    <Card className="p-6 max-w-2xl border-border/60 shadow-card">
      <h2 className="font-display font-semibold text-lg mb-4">Trainer profile</h2>
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Profile saved"); }} className="space-y-4">
        <div><Label>Display name</Label><Input defaultValue="Arjun Mehta" className="mt-1.5" /></div>
        <div><Label>Specialty</Label><Input defaultValue="Strength & Muscle Gain" className="mt-1.5" /></div>
        <div><Label>Price per session (₹)</Label><Input type="number" defaultValue={800} className="mt-1.5" /></div>
        <div><Label>Bio</Label><Textarea rows={4} defaultValue="Certified strength coach helping you build sustainable muscle." className="mt-1.5" /></div>
        <Button type="submit" className="bg-accent text-accent-foreground">Save profile</Button>
      </form>
    </Card>
  );
}

export default function CreatorDashboardRoutes() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="schedule" element={<Schedule />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="earnings" element={<Earnings />} />
      <Route path="profile" element={<Profile />} />
    </Routes>
  );
}
