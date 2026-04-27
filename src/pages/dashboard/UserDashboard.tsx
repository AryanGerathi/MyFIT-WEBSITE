import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoCallButton } from "@/components/VideoCallButton";
import { userBookings } from "@/data/mock";
import { Calendar, CheckCircle2, Heart, Clock, Search, X, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Routes, Route } from "react-router-dom";
import { toast } from "sonner";
import { authService, creatorService, type PublicCreator } from "@/services/backendService";
import { useState, useMemo, useEffect } from "react";
import CreatorProfile from "@/pages/CreatorProfile";
import Booking from "@/pages/Booking";
import Payment from "@/pages/Payment";
import { CreatorCard } from "@/components/CreatorCard";

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview() {
  const upcoming  = userBookings.filter((b) => b.status === "upcoming");
  const completed = userBookings.filter((b) => b.status === "completed");
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <KpiCard label="Upcoming sessions" value={String(upcoming.length)}  icon={Calendar} />
        <KpiCard label="Completed"         value={String(completed.length)} icon={CheckCircle2} trend="+2 this month" />
        <KpiCard label="Saved creators"    value="3"                        icon={Heart} />
      </div>
      <div>
        <h2 className="font-display font-semibold text-lg mb-3">Upcoming sessions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {upcoming.map((b) => (
            <Card key={b.id} className="p-5 border-border/60 shadow-card flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{b.creatorName}</div>
                <div className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
                  <Clock size={12} />{format(new Date(b.date), "PP")} · {b.time}
                </div>
              </div>
              <VideoCallButton label="Join" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Find Creators ─────────────────────────────────────────────────────────────
function FindCreators() {
  const [creators,  setCreators]  = useState<PublicCreator[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All");
  const [maxPrice,  setMaxPrice]  = useState(5000);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    creatorService.getVerifiedCreators()
      .then(({ creators }) => setCreators(creators))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const seen = new Set(
      creators
        .map((c) => c.creatorProfile?.specialization)
        .filter(Boolean) as string[]
    );
    return ["All", ...Array.from(seen)];
  }, [creators]);

  const filtered = useMemo(() => creators.filter((c) => {
    const name    = c.name.toLowerCase();
    const spec    = (c.creatorProfile?.specialization ?? "").toLowerCase();
    const price   = c.creatorProfile?.dailyPrice ?? 0;
    const rating  = c.creatorProfile?.rating     ?? 0;

    const matchSearch   = name.includes(search.toLowerCase()) || spec.includes(search.toLowerCase());
    const matchCategory = category === "All" || c.creatorProfile?.specialization === category;
    const matchPrice    = price === 0 || price <= maxPrice;
    const matchRating   = rating >= minRating;
    return matchSearch && matchCategory && matchPrice && matchRating;
  }), [creators, search, category, maxPrice, minRating]);

  const hasActive = search || category !== "All" || maxPrice < 5000 || minRating > 0;
  const clearAll  = () => { setSearch(""); setCategory("All"); setMaxPrice(5000); setMinRating(0); };

  if (loading) return (
    <div className="flex items-center justify-center h-60 gap-3 text-muted-foreground">
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm">Loading verified creators…</span>
    </div>
  );

  if (error) return (
    <Card className="p-10 flex flex-col items-center gap-3 text-center border-destructive/30">
      <AlertCircle size={32} className="text-destructive" />
      <p className="font-semibold">Could not load creators</p>
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
    </Card>
  );

  return (
    <div className="flex gap-6">
      {/* ── Sidebar Filters ── */}
      <aside className="hidden lg:block w-56 shrink-0">
        <Card className="p-5 sticky top-24 border-border/60 shadow-card space-y-6">
          <h2 className="font-display font-semibold text-base">Filters</h2>

          {/* Search */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Search
            </Label>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Name or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-7 text-sm h-8"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Category
            </Label>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                    category === cat
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Max Price: ₹{maxPrice}
            </Label>
            <input
              type="range" min={300} max={5000} step={50} value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>₹300</span><span>₹5,000</span>
            </div>
          </div>

          {/* Min Rating */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Min Rating: {minRating > 0 ? `${minRating}★` : "Any"}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {[0, 4, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    minRating === r
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                  }`}
                >
                  {r === 0 ? "Any" : `${r}★`}
                </button>
              ))}
            </div>
          </div>

          {hasActive && (
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </Card>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-display font-bold text-xl">Find Creators</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} trainer{filtered.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {/* Mobile search */}
        <div className="relative lg:hidden">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No creators found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={clearAll}>Clear filters</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <CreatorCard key={c._id} creator={c} variant="dashboard" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── My Bookings ───────────────────────────────────────────────────────────────
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
                {status === "upcoming"
                  ? <VideoCallButton label="Join Session" />
                  : <Button variant="outline">Leave Review</Button>}
              </div>
            </Card>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// ── Saved ─────────────────────────────────────────────────────────────────────
function Saved() {
  const [creators, setCreators] = useState<PublicCreator[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    creatorService.getVerifiedCreators()
      .then(({ creators }) => setCreators(creators.slice(0, 3)))
      .catch(() => {/* silently fail */})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm">Loading saved creators…</span>
    </div>
  );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {creators.map((c) => (
        <CreatorCard key={c._id} creator={c} variant="dashboard" />
      ))}
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function Profile() {
  const user = authService.getStoredUser();
  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-6 border-border/60 shadow-card flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-display font-bold text-xl flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-display font-bold text-lg">{user?.name || "—"}</p>
          <p className="text-sm text-muted-foreground">{user?.email || "—"}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium capitalize">
            {user?.role || "user"}
          </span>
        </div>
      </Card>

      <Card className="p-6 border-border/60 shadow-card">
        <h2 className="font-display font-semibold text-lg mb-5">Your profile</h2>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Profile updated"); }} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Full name</Label>
              <Input defaultValue={user?.name || ""} className="mt-1.5" placeholder="Your name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" defaultValue={user?.email || ""} className="mt-1.5 bg-muted/40 cursor-not-allowed" readOnly />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Mobile number</Label>
              <div className="flex gap-2 mt-1.5">
                <span className="inline-flex items-center px-3 rounded-md border border-input bg-muted/40 text-sm text-muted-foreground">
                  {user?.phone?.countryCode || "+91"}
                </span>
                <Input defaultValue={user?.phone?.number || ""} placeholder="Phone number" className="flex-1" />
              </div>
            </div>
            <div>
              <Label>Account type</Label>
              <Input
                value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
                className="mt-1.5 bg-muted/40 cursor-not-allowed capitalize"
                readOnly
              />
            </div>
          </div>
          <div>
            <Label>Fitness goal</Label>
            <Input defaultValue="Lose 5kg & build core strength" className="mt-1.5" />
          </div>
          <div className="pt-1">
            <Label className="text-xs text-muted-foreground">Member since</Label>
            <p className="text-sm mt-0.5">
              {user?.createdAt ? format(new Date(user.createdAt), "PPP") : "—"}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" className="bg-accent text-accent-foreground">Save changes</Button>
            <Button type="button" variant="outline"
              onClick={() => { authService.clearSession(); window.location.href = "/login"; }}>
              Logout
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────
export default function UserDashboardRoutes() {
  return (
    <Routes>
      <Route index                element={<Overview />}       />
      <Route path="bookings"      element={<MyBookings />}     />
      <Route path="find-creators" element={<FindCreators />}   />
      <Route path="saved"         element={<Saved />}          />
      <Route path="profile"       element={<Profile />}        />
      <Route path="creator/:id"   element={<CreatorProfile />} />
      <Route path="booking"       element={<Booking />}        />
      <Route path="payment"       element={<Payment />}        />
    </Routes>
  );
}