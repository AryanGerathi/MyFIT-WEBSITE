import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { RatingStars } from "@/components/RatingStars";
import { BadgeCheck, Award, Sparkles, Loader2, AlertCircle, Clock, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { reviews } from "@/data/mock";
import { creatorService, type PublicCreator } from "@/services/backendService";

// ── Saved creators helpers (localStorage) ────────────────────────────────────
const SAVE_KEY = "myfit:saved_creators";

function getSavedIds(): string[] {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) ?? "[]"); }
  catch { return []; }
}

function toggleSavedId(id: string): boolean {
  const ids = getSavedIds();
  const isSaved = ids.includes(id);
  const next = isSaved ? ids.filter((x) => x !== id) : [...ids, id];
  localStorage.setItem(SAVE_KEY, JSON.stringify(next));
  return !isSaved;
}

const CreatorProfile = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [creator,  setCreator] = useState<PublicCreator | null>(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState<string | null>(null);
  const [date,     setDate]    = useState<Date | undefined>(new Date());
  const [slot,     setSlot]    = useState<string | null>(null);
  const [saved,    setSaved]   = useState(false);

  const inDashboard = location.pathname.startsWith("/dashboard");
  const bookingPath = inDashboard ? "/dashboard/booking" : "/booking";
  const explorePath = inDashboard ? "/dashboard/find-creators" : "/explore";

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Check saved state immediately
    setSaved(getSavedIds().includes(id));
    creatorService.getVerifiedCreators()
      .then(({ creators }) => {
        const found = creators.find((c) => c._id === id);
        if (!found) setError("This trainer profile could not be found.");
        else        setCreator(found);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Derived fields ────────────────────────────────────────────────────────
  const imageUrl    = creator?.profileImage?.url ?? "";
  const name        = creator?.name ?? "";
  const specialty   = creator?.creatorProfile?.specialization ?? "";
  const bio         = creator?.creatorProfile?.bio ?? "";
  const dailyPrice  = creator?.creatorProfile?.dailyPrice ?? 0;
  const rating      = creator?.creatorProfile?.rating ?? 0;
  const reviewCount = creator?.creatorProfile?.reviews ?? 0;
  const verified    = creator?.creatorProfile?.verified ?? false;
  const timeSlots   = creator?.creatorProfile?.timeSlots ?? [];

  const initials = name
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleSave = () => {
    if (!id) return;
    const nowSaved = toggleSavedId(id);
    setSaved(nowSaved);
    toast.success(nowSaved ? "Creator saved!" : "Creator removed from saved");
  };

  const book = () => {
    if (!creator) return;
    if (!date || !slot) {
      toast.error("Please select a date and time slot");
      return;
    }
    navigate(bookingPath, {
      state: {
        creatorId:    creator._id,
        creatorName:  name,
        creatorImage: imageUrl,
        price:        dailyPrice,
        prefillDate:  date.toISOString(),
        prefillTime:  slot,
        timeSlots,
      },
    });
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container-app py-10 flex items-center justify-center h-60 gap-3 text-muted-foreground">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-sm">Loading profile…</span>
      </div>
    );
  }

  // ── Error / not found ─────────────────────────────────────────────────────
  if (error || !creator) {
    return (
      <div className="container-app py-10">
        <Card className="p-10 flex flex-col items-center gap-3 text-center border-destructive/30">
          <AlertCircle size={32} className="text-destructive" />
          <p className="font-semibold">{error ?? "Trainer not found"}</p>
          <Button variant="outline" onClick={() => navigate(explorePath)}>
            Back to explore
          </Button>
        </Card>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="container-app py-10 space-y-8">

      {/* TOP CARD */}
      <Card className="overflow-hidden border-border/60 shadow-card">
        <div className="grid md:grid-cols-[280px_1fr] gap-0">

          {/* Avatar / photo */}
          <div className="aspect-square md:aspect-auto bg-muted flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display font-bold text-6xl text-accent select-none">
                {initials}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="p-6 lg:p-8">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-3xl">{name}</h1>
                {verified && <BadgeCheck className="text-accent" />}
                {specialty && <Badge variant="secondary">{specialty}</Badge>}
              </div>

              {/* Save button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className={cn(
                  "flex items-center gap-1.5 transition-colors shrink-0",
                  saved && "border-rose-400 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                )}
              >
                <Heart
                  size={15}
                  className={cn("transition-all", saved && "fill-rose-500 text-rose-500")}
                />
                {saved ? "Saved" : "Save"}
              </Button>
            </div>

            <p className="text-muted-foreground mt-1">{specialty}</p>

            {/* Rating row */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <RatingStars rating={rating} />
                <span className="font-semibold">{rating > 0 ? rating : "New"}</span>
                {reviewCount > 0 && (
                  <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
                )}
              </div>
            </div>

            {bio && (
              <p className="mt-4 text-foreground/80 leading-relaxed">{bio}</p>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="rounded-lg border border-border/60 p-3 text-center">
                <div className="text-xs text-muted-foreground">Per session</div>
                <div className="font-display font-bold text-xl text-primary">
                  {dailyPrice > 0 ? `₹${dailyPrice.toLocaleString()}` : "TBD"}
                </div>
              </div>
              <div className="rounded-lg border border-border/60 p-3 text-center">
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1 justify-center">
                  <Award size={12} /> Monthly
                </div>
                <div className="font-display font-bold text-xl">
                  {creator.creatorProfile?.monthlyPrice
                    ? `₹${creator.creatorProfile.monthlyPrice.toLocaleString()}`
                    : "—"}
                </div>
              </div>
              <div className="rounded-lg border border-border/60 p-3 text-center">
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1 justify-center">
                  <Sparkles size={12} /> Sessions/mo
                </div>
                <div className="font-semibold text-xl mt-1">
                  {creator.creatorProfile?.monthlySessions ?? "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* BOOKING */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/60 shadow-card">
          <h2 className="font-display font-semibold text-xl mb-4">Pick a date</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
            className={cn("p-3 pointer-events-auto rounded-lg border")}
          />
        </Card>

        <Card className="p-6 border-border/60 shadow-card">
          <h2 className="font-display font-semibold text-xl mb-4">Available time slots</h2>

          {timeSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground border border-dashed rounded-lg">
              <Clock size={28} className="opacity-40" />
              <p className="text-sm">This trainer hasn't set any available time slots yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((t) => (
                <Button
                  key={t}
                  variant={slot === t ? "default" : "outline"}
                  className={cn(
                    "transition-colors",
                    slot === t && "bg-accent text-accent-foreground hover:bg-accent/90"
                  )}
                  onClick={() => setSlot(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          )}

          <Button
            onClick={book}
            size="lg"
            disabled={!slot || !date || timeSlots.length === 0}
            className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50"
          >
            {dailyPrice > 0
              ? `Book Session — ₹${dailyPrice.toLocaleString()}`
              : "Book Session"}
          </Button>
        </Card>
      </div>

      {/* REVIEWS */}
      <div>
        <h2 className="font-display font-bold text-2xl mb-5">Reviews</h2>
        {reviews.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground border-border/60">
            No reviews yet for this trainer.
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <Card key={r.id} className="p-5 border-border/60 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{r.user}</div>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <RatingStars rating={r.rating} className="mt-1" />
                <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{r.comment}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CreatorProfile;