import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreatorCard } from "@/components/CreatorCard";
import { VideoCallButton } from "@/components/VideoCallButton";
import { creators, userBookings } from "@/data/mock";
import { Calendar, CheckCircle2, Heart, Clock } from "lucide-react";
import { format } from "date-fns";
import { Routes, Route } from "react-router-dom";
import { toast } from "sonner";

function Overview() {
  const upcoming = userBookings.filter((b) => b.status === "upcoming");
  const completed = userBookings.filter((b) => b.status === "completed");
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <KpiCard label="Upcoming sessions" value={String(upcoming.length)} icon={Calendar} />
        <KpiCard label="Completed" value={String(completed.length)} icon={CheckCircle2} trend="+2 this month" />
        <KpiCard label="Saved creators" value="3" icon={Heart} />
      </div>

      <div>
        <h2 className="font-display font-semibold text-lg mb-3">Upcoming sessions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {upcoming.map((b) => {
            const c = creators.find((x) => x.id === b.creatorId);
            return (
              <Card key={b.id} className="p-5 border-border/60 shadow-card flex items-center gap-4">
                {c && <img src={c.image} alt={c.name} className="h-14 w-14 rounded-xl object-cover" />}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{b.creatorName}</div>
                  <div className="text-sm text-muted-foreground inline-flex items-center gap-1.5"><Clock size={12} />{format(new Date(b.date), "PP")} · {b.time}</div>
                </div>
                <VideoCallButton label="Join" />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MyBookings() {
  return (
    <Tabs defaultValue="upcoming">
      <TabsList>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      {(["upcoming", "completed"] as const).map((status) => (
        <TabsContent key={status} value={status} className="space-y-3">
          {userBookings.filter((b) => b.status === status).map((b) => (
            <Card key={b.id} className="p-5 border-border/60 shadow-card flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-semibold">{b.creatorName}</div>
                <div className="text-sm text-muted-foreground">{format(new Date(b.date), "PPP")} · {b.time}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold">₹{b.price}</span>
                {status === "upcoming" ? <VideoCallButton label="Join Session" /> : <Button variant="outline">Leave Review</Button>}
              </div>
            </Card>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function Saved() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {creators.slice(0, 3).map((c) => <CreatorCard key={c.id} creator={c} />)}
    </div>
  );
}

function Profile() {
  return (
    <Card className="p-6 max-w-2xl border-border/60 shadow-card">
      <h2 className="font-display font-semibold text-lg mb-4">Your profile</h2>
      <form
        onSubmit={(e) => { e.preventDefault(); toast.success("Profile updated"); }}
        className="grid sm:grid-cols-2 gap-4"
      >
        <div><Label>Name</Label><Input defaultValue="Riya Patel" className="mt-1.5" /></div>
        <div><Label>Email</Label><Input type="email" defaultValue="riya@example.com" className="mt-1.5" /></div>
        <div className="sm:col-span-2"><Label>Fitness goal</Label><Input defaultValue="Lose 5kg & build core strength" className="mt-1.5" /></div>
        <Button type="submit" className="bg-accent text-accent-foreground sm:col-span-2 w-fit">Save changes</Button>
      </form>
    </Card>
  );
}

export default function UserDashboardRoutes() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="bookings" element={<MyBookings />} />
      <Route path="saved" element={<Saved />} />
      <Route path="profile" element={<Profile />} />
    </Routes>
  );
}
