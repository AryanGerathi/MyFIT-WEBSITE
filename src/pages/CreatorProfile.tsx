import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/RatingStars";
import {
  BadgeCheck, Award, Sparkles, Loader2, AlertCircle,
  Clock, Heart, CheckCircle2, CalendarDays, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { reviews } from "@/data/mock";
import { creatorService, type PublicCreator } from "@/services/backendService";
import { getSavedIds, toggleSaved } from "@/lib/savedCreators";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type SessionType = "single" | "monthly";

const CreatorProfile = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [creator,       setCreator]       = useState<PublicCreator | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [saved,         setSaved]         = useState(false);
  const [sessionType,   setSessionType]   = useState<SessionType>("single");

  const [singleDate,    setSingleDate]    = useState<Date | undefined>(new Date());
  const [slot,          setSlot]          = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [monthlySlot,   setMonthlySlot]   = useState<string | null>(null);

  const inDashboard = location.pathname.startsWith("/dashboard");
  const bookingPath = inDashboard ? "/dashboard/booking" : "/booking";
  const explorePath = inDashboard ? "/dashboard/find-creators" : "/explore";

  useEffect(() => {
    if (!id) return;
    setLoading(true);
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

  const imageUrl        = creator?.profileImage?.url ?? "";
  const name            = creator?.name ?? "";
  const specialty       = creator?.creatorProfile?.specialization ?? "";
  const bio             = creator?.creatorProfile?.bio ?? "";
  const dailyPrice      = creator?.creatorProfile?.dailyPrice ?? 0;
  const monthlyPrice    = creator?.creatorProfile?.monthlyPrice ?? 0;
  const monthlySessions = creator?.creatorProfile?.monthlySessions ?? 0;
  const rating          = creator?.creatorProfile?.rating ?? 0;
  const reviewCount     = creator?.creatorProfile?.reviews ?? 0;
  const verified        = creator?.creatorProfile?.verified ?? false;
  const timeSlots       = creator?.creatorProfile?.timeSlots ?? [];

  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const savingsPercent =
    monthlyPrice > 0 && dailyPrice > 0 && monthlySessions > 0
      ? Math.round((1 - monthlyPrice / (dailyPrice * monthlySessions)) * 100)
      : 0;

  const handleSave = () => {
    if (!id) return;
    const nowSaved = toggleSaved(id);
    setSaved(nowSaved);
    toast.success(nowSaved ? "Creator saved!" : "Creator removed from saved");
  };

  const book = () => {
    if (!creator) return;

    if (sessionType === "single") {
      // ── SINGLE SESSION ──────────────────────────────────────────
      if (!singleDate || !slot) {
        toast.error("Please select a date and time slot");
        return;
      }
      navigate(bookingPath, {
        state: {
          creatorId:   creator._id,
          creatorName: name,
          creatorImage: imageUrl,
          price:       dailyPrice,
          sessionType: "single",
          prefillDate: singleDate.toISOString(),
          prefillTime: slot,         // ← selected slot pre-fills Booking page
          timeSlots,                 // ← all slots so Booking can render them
        },
      });
    } else {
      // ── MONTHLY PLAN ─────────────────────────────────────────────
      if (!monthlyPrice) {
        toast.error("Monthly plan not available");
        return;
      }
      if (monthlySessions > 0 && selectedDates.length < monthlySessions) {
        toast.error(`Please select all ${monthlySessions} session dates`);
        return;
      }
      if (timeSlots.length > 0 && !monthlySlot) {
        toast.error("Please select a preferred time slot");
        return;
      }
      navigate(bookingPath, {
        state: {
          creatorId:      creator._id,
          creatorName:    name,
          creatorImage:   imageUrl,
          price:          monthlyPrice,
          sessionType:    "monthly",
          sessionDates:   selectedDates.map((d) => d.toISOString()),
          prefillTime:    monthlySlot,  // ← selected slot pre-fills Booking page
          monthlySessions,
          timeSlots,                    // ← all slots so Booking can render them
        },
      });
    }
  };

  const singleBookDisabled =
    !slot || !singleDate || timeSlots.length === 0;

  const monthlyBookDisabled =
    !monthlyPrice ||
    (monthlySessions > 0 && selectedDates.length < monthlySessions) ||
    (timeSlots.length > 0 && !monthlySlot);

  const bookButtonLabel = () => {
    if (sessionType === "monthly") {
      if (monthlySessions > 0 && selectedDates.length < monthlySessions)
        return `Select ${monthlySessions - selectedDates.length} more date${
          monthlySessions - selectedDates.length > 1 ? "s" : ""
        }`;
      if (timeSlots.length > 0 && !monthlySlot)
        return "Select a time slot";
      return monthlyPrice > 0
        ? `Book Monthly Plan — ₹${monthlyPrice.toLocaleString()}/mo`
        : "Monthly plan unavailable";
    }
    return dailyPrice > 0
      ? `Book Session — ₹${dailyPrice.toLocaleString()}`
      : "Book Session";
  };

  if (loading) {
    return (
      <div className="container-app py-10 flex items-center justify-center h-60 gap-3 text-muted-foreground">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-sm">Loading profile…</span>
      </div>
    );
  }

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

  const TimeSlotPicker = ({
    value,
    onChange,
    label = "Available time slots",
  }: {
    value: string | null;
    onChange: (t: string) => void;
    label?: string;
  }) => (
    <div>
      <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
        {label}
      </h3>
      {timeSlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground border border-dashed rounded-lg">
          <Clock size={24} className="opacity-40" />
          <p className="text-sm">No time slots set by trainer yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map((t) => (
            <Button
              key={t}
              variant={value === t ? "default" : "outline"}
              className={cn(
                "transition-colors",
                value === t && "bg-accent text-accent-foreground hover:bg-accent/90"
              )}
              onClick={() => onChange(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container-app py-10 space-y-8">

      {/* TOP CARD */}
      <Card className="overflow-hidden border-border/60 shadow-card">
        <div className="grid md:grid-cols-[280px_1fr] gap-0">
          <div className="aspect-square md:aspect-auto bg-muted flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display font-bold text-6xl text-accent select-none">{initials}</span>
            )}
          </div>
          <div className="p-6 lg:p-8">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-3xl">{name}</h1>
                {verified && <BadgeCheck className="text-accent" />}
                {specialty && <Badge variant="secondary">{specialty}</Badge>}
              </div>
              <Button
                variant="outline" size="sm" onClick={handleSave}
                className={cn(
                  "flex items-center gap-1.5 transition-colors shrink-0",
                  saved && "border-rose-400 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                )}
              >
                <Heart size={15} className={cn("transition-all", saved && "fill-rose-500 text-rose-500")} />
                {saved ? "Saved" : "Save"}
              </Button>
            </div>
            <p className="text-muted-foreground mt-1">{specialty}</p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <RatingStars rating={rating} />
                <span className="font-semibold">{rating > 0 ? rating : "New"}</span>
                {reviewCount > 0 && (
                  <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
                )}
              </div>
            </div>
            {bio && <p className="mt-4 text-foreground/80 leading-relaxed">{bio}</p>}
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
                  {monthlyPrice > 0 ? `₹${monthlyPrice.toLocaleString()}` : "—"}
                </div>
              </div>
              <div className="rounded-lg border border-border/60 p-3 text-center">
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1 justify-center">
                  <Sparkles size={12} /> Sessions/mo
                </div>
                <div className="font-semibold text-xl mt-1">{monthlySessions || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* SESSION TYPE SELECTOR */}
      <div>
        <h2 className="font-display font-semibold text-xl mb-3">Choose a plan</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => { setSessionType("single"); setSlot(null); }}
            className={cn(
              "relative text-left rounded-xl border-2 p-4 transition-all",
              sessionType === "single"
                ? "border-accent bg-accent/5"
                : "border-border/60 bg-card hover:border-border"
            )}
          >
            {sessionType === "single" && (
              <CheckCircle2 size={18} className="absolute top-3 right-3 text-accent" />
            )}
            <div className="font-semibold text-base">Single session</div>
            <div className="text-2xl font-display font-bold text-primary mt-1">
              {dailyPrice > 0 ? `₹${dailyPrice.toLocaleString()}` : "TBD"}
              <span className="text-sm font-normal text-muted-foreground ml-1">/ session</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Pick any available date & time slot
            </div>
          </button>

          <button
            onClick={() => { setSessionType("monthly"); setSelectedDates([]); setMonthlySlot(null); }}
            disabled={!monthlyPrice}
            className={cn(
              "relative text-left rounded-xl border-2 p-4 transition-all",
              !monthlyPrice && "opacity-50 cursor-not-allowed",
              sessionType === "monthly"
                ? "border-accent bg-accent/5"
                : "border-border/60 bg-card hover:border-border"
            )}
          >
            {sessionType === "monthly" && (
              <CheckCircle2 size={18} className="absolute top-3 right-3 text-accent" />
            )}
            {savingsPercent > 0 && sessionType !== "monthly" && (
              <Badge className="absolute top-3 right-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-xs">
                Save {savingsPercent}%
              </Badge>
            )}
            <div className="font-semibold text-base">Monthly plan</div>
            <div className="text-2xl font-display font-bold text-primary mt-1">
              {monthlyPrice > 0 ? `₹${monthlyPrice.toLocaleString()}` : "—"}
              <span className="text-sm font-normal text-muted-foreground ml-1">/ month</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {monthlySessions > 0
                ? `${monthlySessions} sessions — pick your own dates`
                : "Contact trainer for details"}
            </div>
          </button>
        </div>
      </div>

      {/* BOOKING SECTION */}
      {sessionType === "single" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 border-border/60 shadow-card">
            <h2 className="font-display font-semibold text-xl mb-4">Pick a date</h2>
            <DayPicker
              mode="single"
              selected={singleDate}
              onSelect={setSingleDate}
              disabled={{ before: new Date() }}
              className="pointer-events-auto"
            />
          </Card>

          <Card className="p-6 border-border/60 shadow-card flex flex-col gap-6">
            <div>
              <h2 className="font-display font-semibold text-xl mb-4">Available time slots</h2>
              <TimeSlotPicker value={slot} onChange={setSlot} />
            </div>
            <Button
              onClick={book}
              size="lg"
              disabled={singleBookDisabled}
              className="w-full mt-auto bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50"
            >
              {bookButtonLabel()}
            </Button>
          </Card>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 border-border/60 shadow-card">
            <h2 className="font-display font-semibold text-xl mb-1">Pick your session dates</h2>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {Array.from({ length: monthlySessions }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i < selectedDates.length ? "bg-accent w-5" : "bg-border w-2"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedDates.length} / {monthlySessions} selected
              </span>
            </div>
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg p-2">
              <Info size={12} className="mt-0.5 shrink-0" />
              <span>
                Tap dates to select your {monthlySessions} preferred session days. Tap again to deselect.
              </span>
            </div>
            <DayPicker
              mode="multiple"
              selected={selectedDates}
              onSelect={(days) => {
                if (!days) { setSelectedDates([]); return; }
                if (monthlySessions > 0 && days.length > monthlySessions) {
                  toast.error(`You can only select ${monthlySessions} session dates`);
                  return;
                }
                setSelectedDates(days);
              }}
              disabled={{ before: new Date() }}
              className="pointer-events-auto"
            />
          </Card>

          <Card className="p-6 border-border/60 shadow-card flex flex-col gap-5">
            <div>
              <h2 className="font-display font-semibold text-xl mb-4">Monthly plan summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan price</span>
                  <span className="font-semibold">
                    {monthlyPrice > 0 ? `₹${monthlyPrice.toLocaleString()}/mo` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sessions included</span>
                  <span className="font-semibold">{monthlySessions || "—"}</span>
                </div>
                {savingsPercent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You save</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {savingsPercent}% vs per-session
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2 text-sm font-medium">
                <CalendarDays size={14} />
                Your selected dates
              </div>
              {selectedDates.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No dates selected yet — pick from the calendar
                </p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {[...selectedDates]
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((d, i) => (
                      <div
                        key={d.toISOString()}
                        className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-accent w-5 text-center">
                            #{i + 1}
                          </span>
                          <span>
                            {d.toLocaleDateString("en-IN", {
                              weekday: "short", day: "numeric", month: "short",
                            })}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setSelectedDates((prev) =>
                              prev.filter((x) => x.toDateString() !== d.toDateString())
                            )
                          }
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="border-t border-border/40 pt-4">
              <TimeSlotPicker
                value={monthlySlot}
                onChange={setMonthlySlot}
                label="Preferred time slot (applies to all sessions)"
              />
            </div>

            <Button
              onClick={book}
              size="lg"
              disabled={monthlyBookDisabled}
              className="w-full mt-auto bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50"
            >
              {bookButtonLabel()}
            </Button>
          </Card>
        </div>
      )}

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