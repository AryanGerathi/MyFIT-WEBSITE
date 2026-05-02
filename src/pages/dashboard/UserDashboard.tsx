import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { useRef } from "react";  // add ref to the existing useState/useMemo/useEffect import
import { Camera, Trash2 } from "lucide-react";  // add to existing lucide import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoCallButton } from "@/components/VideoCallButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, CheckCircle2, Heart, Clock,
  Search, X, Loader2, AlertCircle, Filter,
} from "lucide-react";
import { format } from "date-fns";
import { Routes, Route, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  authService, creatorService, paymentService,
  type PublicCreator,
} from "@/services/backendService";
import { useState, useMemo, useEffect } from "react";
import CreatorProfile from "@/pages/CreatorProfile";
import Booking from "@/pages/Booking";
import Payment from "@/pages/Payment";
import { CreatorCard } from "@/components/CreatorCard";
import { ChatList } from "@/components/ChatList";
import { getSavedIds } from "@/lib/savedCreators";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserBooking {
  _id:          string;
  creatorId:    { name: string; email: string } | null;
  amount:       number;
  commission:   number;
  sessionType:  string;
  date?:        string | null;
  time?:        string | null;
  status:       string;
  jitsiRoomId?: string | null;
  createdAt:    string;
}

// ── Overview ──────────────────────────────────────────────────────────────────

function Overview() {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const savedCount = getSavedIds().length;

  useEffect(() => {
    paymentService.getMyBookings()
      .then(({ bookings: b }) => setBookings(b))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

const upcoming = bookings.filter((b) => {
  if (b.status === "completed") return false;
  // If booking has a date, only show if it's today or future
  if (b.date) return new Date(b.date) >= new Date(new Date().toDateString());
  // Monthly plans (no date) — always show as upcoming
  return b.status === "upcoming" || b.status === "success";
});

const completed = bookings.filter((b) => {
  if (b.status === "completed") return true;
  // Past dated bookings count as completed
  if (b.date) return new Date(b.date) < new Date(new Date().toDateString());
  return false;
});

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <KpiCard label="Upcoming sessions" value={loading ? "—" : String(upcoming.length)}  icon={Calendar} />
        <KpiCard label="Completed"         value={loading ? "—" : String(completed.length)} icon={CheckCircle2} trend="+2 this month" />
        <KpiCard label="Saved creators"    value={String(savedCount)}                       icon={Heart} />
      </div>

      <div>
        <h2 className="font-display font-semibold text-lg mb-3">Upcoming sessions</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="animate-spin" size={16} /> Loading…
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming sessions yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {upcoming.map((b) => (
              <Card key={b._id} className="p-5 border-border/60 shadow-card flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{b.creatorId?.name ?? "—"}</div>
                  <div className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
                    <Clock size={12} />
                    {b.date ? format(new Date(b.date), "PP") : "Monthly plan"} · {b.time ?? "—"}
                  </div>
                </div>
                {/* ✅ bookingId passed */}
                <VideoCallButton label="Join" bookingId={b._id} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared Filter Panel ───────────────────────────────────────────────────────

function FilterPanel({
  categories,
  search, setSearch,
  category, setCategory,
  maxPrice, setMaxPrice,
  minRating, setMinRating,
  priceType, setPriceType,
  hasActive, clearAll,
}: {
  categories: string[];
  search: string;       setSearch:    (v: string) => void;
  category: string;     setCategory:  (v: string) => void;
  maxPrice: number;     setMaxPrice:  (v: number) => void;
  minRating: number;    setMinRating: (v: number) => void;
  priceType: "monthly" | "session"; setPriceType: (v: "monthly" | "session") => void;
  hasActive: boolean;   clearAll: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Search</Label>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-7 text-sm h-8"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Category</Label>
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

      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Price Type</Label>
        <div className="flex rounded-md border border-border overflow-hidden text-xs font-medium">
          <button
            onClick={() => { setPriceType("monthly"); setMaxPrice(5000); }}
            className={`flex-1 py-1.5 transition-colors ${priceType === "monthly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => { setPriceType("session"); setMaxPrice(5000); }}
            className={`flex-1 py-1.5 transition-colors ${priceType === "session" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            Per Session
          </button>
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
          Max {priceType === "monthly" ? "Monthly" : "Per Session"} Price: ₹{maxPrice.toLocaleString()}
        </Label>
        <input
          type="range" min={300} max={100000} step={50} value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>₹300</span><span>₹1,00,000</span>
        </div>
      </div>

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
        <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
          <X size={12} /> Clear all
        </button>
      )}
    </div>
  );
}

// ── Find Creators ─────────────────────────────────────────────────────────────

function FindCreators() {
  const [creators, setCreators] = useState<PublicCreator[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All");
  const [maxPrice,  setMaxPrice]  = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [priceType, setPriceType] = useState<"monthly" | "session">("monthly");

  useEffect(() => {
    creatorService.getVerifiedCreators()
      .then(({ creators }) => setCreators(creators))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const seen = new Set(creators.map((c) => c.creatorProfile?.specialization).filter(Boolean) as string[]);
    return ["All", ...Array.from(seen)];
  }, [creators]);

  const filtered = useMemo(() => creators.filter((c) => {
    const name       = c.name.toLowerCase();
    const spec       = (c.creatorProfile?.specialization ?? "").toLowerCase();
    const monthly    = c.creatorProfile?.monthlyPrice ?? 0;
    const sessions   = c.creatorProfile?.monthlySessions ?? 1;
    const perSession = sessions > 0 ? Math.round(monthly / sessions) : 0;
    const price      = priceType === "monthly" ? monthly : perSession;
    const rating     = c.creatorProfile?.rating ?? 0;

    return (
      (name.includes(search.toLowerCase()) || spec.includes(search.toLowerCase())) &&
      (category === "All" || c.creatorProfile?.specialization === category) &&
      (price === 0 || price <= maxPrice) &&
      rating >= minRating
    );
  }), [creators, search, category, maxPrice, minRating, priceType]);

  const hasActive = !!(search || category !== "All" || maxPrice < 5000 || minRating > 0);
  const clearAll  = () => { setSearch(""); setCategory("All"); setMaxPrice(5000); setMinRating(0); setPriceType("monthly"); };
  const filterProps = { categories, search, setSearch, category, setCategory, maxPrice, setMaxPrice, minRating, setMinRating, priceType, setPriceType, hasActive, clearAll };

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
      <aside className="hidden lg:block w-56 shrink-0">
        <Card className="p-5 sticky top-24 border-border/60 shadow-card space-y-6">
          <h2 className="font-display font-semibold text-base">Filters</h2>
          <FilterPanel {...filterProps} />
        </Card>
      </aside>

      <div className="flex-1 min-w-0 space-y-4">
  <div className="flex items-center justify-between flex-wrap gap-2">
    <div>
      <h2 className="font-display font-bold text-xl">Find Creators</h2>
      <p className="text-sm text-muted-foreground mt-0.5">
        {filtered.length} trainer{filtered.length !== 1 ? "s" : ""} available
      </p>
    </div>
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden gap-2">
          <Filter size={16} /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <h2 className="font-display font-semibold mb-5 mt-4">Filters</h2>
        <FilterPanel {...filterProps} />
      </SheetContent>
    </Sheet>
  </div>

  {/* ── Inline search bar — always visible ── */}
  <div className="relative">
    <Search
      size={15}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
    />
    <input
      type="text"
      placeholder="Search by name or specialty…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full h-10 pl-9 pr-9 rounded-xl border border-border bg-background text-sm
                 placeholder:text-muted-foreground focus:outline-none focus:ring-2
                 focus:ring-accent/40 focus:border-accent transition-colors"
    />
    {search && (
      <button
        onClick={() => setSearch("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
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
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((c) => <CreatorCard key={c._id} creator={c} variant="dashboard" />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── My Bookings ───────────────────────────────────────────────────────────────

function MyBookings() {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    paymentService.getMyBookings()
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

  const today = new Date(new Date().toDateString());

const upcoming = bookings.filter((b) => {
  if (b.status === "completed") return false;
  if (b.date) return new Date(b.date) >= today;
  return b.status === "upcoming" || b.status === "success";
});

const completed = bookings.filter((b) => {
  if (b.status === "completed") return true;
  if (b.date) return new Date(b.date) < today;
  return false;
});

  const BookingCard = ({ b }: { b: UserBooking }) => (
    <Card key={b._id} className="p-5 border-border/60 shadow-card flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="font-semibold">{b.creatorId?.name ?? "—"}</div>
        <div className="text-sm text-muted-foreground">
          {b.date ? format(new Date(b.date), "PPP") : "Monthly plan"} · {b.time ?? "—"}
        </div>
        <Badge variant="secondary" className="mt-1 text-xs capitalize">
          {b.sessionType}
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-display font-bold">₹{b.amount.toLocaleString()}</span>
        {(b.status === "upcoming" || b.status === "success")
          ? <VideoCallButton label="Join Session" bookingId={b._id} /> // ✅ fixed
          : <Button variant="outline">Leave Review</Button>}
      </div>
    </Card>
  );

  return (
    <Tabs defaultValue="upcoming">
      <TabsList>
        <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
        <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-3 mt-4">
        {upcoming.length === 0
          ? <p className="text-sm text-muted-foreground py-8 text-center">No upcoming sessions.</p>
          : upcoming.map((b) => <BookingCard key={b._id} b={b} />)}
      </TabsContent>

      <TabsContent value="completed" className="space-y-3 mt-4">
        {completed.length === 0
          ? <p className="text-sm text-muted-foreground py-8 text-center">No completed sessions yet.</p>
          : completed.map((b) => <BookingCard key={b._id} b={b} />)}
      </TabsContent>
    </Tabs>
  );
}

// ── Saved ─────────────────────────────────────────────────────────────────────

function Saved() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<PublicCreator[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const savedIds = getSavedIds();
    if (savedIds.length === 0) { setLoading(false); return; }

    creatorService.getVerifiedCreators()
      .then(({ creators }) => {
        setCreators(creators.filter((c) => savedIds.includes(c._id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm">Loading saved creators…</span>
    </div>
  );

  if (creators.length === 0) return (
    <div className="text-center py-16 text-muted-foreground">
      <Heart size={32} className="mx-auto mb-3 opacity-30" />
      <p className="font-medium">No saved creators yet</p>
      <p className="text-sm mt-1">Tap the ❤️ on any creator card to save them here</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/dashboard/find-creators")}>
        Find Creators
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {creators.length} saved creator{creators.length !== 1 ? "s" : ""}
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((c) => <CreatorCard key={c._id} creator={c} variant="dashboard" />)}
      </div>
    </div>
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
      toast.error("Upload failed. Please try again.");
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
    } catch {
      toast.error("Could not remove photo.");
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
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-accent text-accent-foreground
                     flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors disabled:opacity-60"
        >
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
function Profile() {
  const user     = authService.getStoredUser();
  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImage?.url || "");

  return (
    <div className="max-w-2xl space-y-6">
      {/* ── Avatar card ── */}
      <Card className="p-6 border-border/60 shadow-card">
        <ProfileImageUpload
          currentUrl={profileImageUrl}
          initials={initials}
          onUploaded={(url) => setProfileImageUrl(url)}
        />
        <div className="mt-4 pt-4 border-t border-border/60">
          <p className="font-display font-bold text-lg">{user?.name || "—"}</p>
          <p className="text-sm text-muted-foreground">{user?.email || "—"}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium capitalize">
            {user?.role || "user"}
          </span>
        </div>
      </Card>

      {/* ── Edit form ── */}
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
      <Route path="chats" element={<ChatList />} />
    </Routes>
  );
}