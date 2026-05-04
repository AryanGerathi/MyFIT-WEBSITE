import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/RatingStars";
import {
  BadgeCheck, Award, Sparkles, Loader2, AlertCircle,
  Clock, Heart, CheckCircle2, CalendarDays, Info,
  Share2, Check, Lock, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  creatorService, authService, reviewService,
  type PublicCreator, type Review,
} from "@/services/backendService";
import { getSavedIds, toggleSaved } from "@/lib/savedCreators";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type SessionType = "single" | "monthly";

// ── Share Button ──────────────────────────────────────────────────────────────

function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} — Trainer Profile`, text: `Check out ${name}'s trainer profile!`, url });
        return;
      } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Could not copy link"); }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1.5 transition-colors shrink-0">
      {copied ? <><Check size={15} className="text-green-600" /> Copied!</> : <><Share2 size={15} /> Share</>}
    </Button>
  );
}

// ── Auth Guard Banner ─────────────────────────────────────────────────────────

function AuthGuardBanner({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-5 flex flex-col sm:flex-row items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
        <Lock size={18} className="text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">Login required to book a session</p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
          Create a free account or sign in to book sessions with this trainer.
        </p>
      </div>
      <Button size="sm" onClick={onLogin} className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">
        Login / Sign up
      </Button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

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

  // ── Booked slots state ──────────────────────────────────────────────────────
  const [bookedSlots,       setBookedSlots]       = useState<string[]>([]);
  const [slotsLoading,      setSlotsLoading]      = useState(false);

  // ── Reviews state ───────────────────────────────────────────────────────────
  const [liveReviews,    setLiveReviews]    = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [avgRating,      setAvgRating]      = useState(0);

  const inDashboard = location.pathname.startsWith("/dashboard");
  const bookingPath = inDashboard ? "/dashboard/booking" : "/booking";
  const explorePath = inDashboard ? "/dashboard/find-creators" : "/explore";

  const isLoggedIn = authService.isLoggedIn();
  const goToLogin  = () => navigate("/login", { state: { returnTo: location.pathname } });

  // ── Load creator ────────────────────────────────────────────────────────────
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

  // ── Load live reviews ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    reviewService.getCreatorReviews(id)
      .then(({ reviews: r, averageRating }) => {
        setLiveReviews(r);
        setAvgRating(averageRating);
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [id]);

  // ── Fetch booked slots whenever creator or selected date changes ─────────────
  const fetchBookedSlots = useCallback(async (creatorId: string, date: Date) => {
    setSlotsLoading(true);
    setSlot(null); // Reset selected slot when date changes
    try {
      const booked = await creatorService.getBookedSlots(creatorId, date);
      setBookedSlots(booked);
    } catch {
      setBookedSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id || !singleDate || sessionType !== "single") return;
    fetchBookedSlots(id, singleDate);
  }, [id, singleDate, sessionType, fetchBookedSlots]);

  const imageUrl        = creator?.profileImage?.url ?? "";
  const name            = creator?.name ?? "";
  const specialty       = creator?.creatorProfile?.specialization ?? "";
  const bio             = creator?.creatorProfile?.bio ?? "";
  const dailyPrice      = creator?.creatorProfile?.dailyPrice ?? 0;
  const monthlyPrice    = creator?.creatorProfile?.monthlyPrice ?? 0;
  const monthlySessions = creator?.creatorProfile?.monthlySessions ?? 0;
  const rating          = avgRating || (creator?.creatorProfile?.rating ?? 0);
  const reviewCount     = liveReviews.length || (creator?.creatorProfile?.reviews ?? 0);
  const verified        = creator?.creatorProfile?.verified ?? false;
  const timeSlots       = creator?.creatorProfile?.timeSlots ?? [];

  // ── Available slots = all trainer slots minus booked ones ───────────────────
  const availableSlots = timeSlots.filter((t) => !bookedSlots.includes(t));

  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const savingsPercent =
    monthlyPrice > 0 && dailyPrice > 0 && monthlySessions > 0
      ? Math.round((1 - monthlyPrice / (dailyPrice * monthlySessions)) * 100)
      : 0;

  const handleSave = () => {
    if (!isLoggedIn) { goToLogin(); return; }
    if (!id) return;
    const nowSaved = toggleSaved(id);
    setSaved(nowSaved);
    toast.success(nowSaved ? "Creator saved!" : "Creator removed from saved");
  };

  const book = () => {
    if (!isLoggedIn) { goToLogin(); return; }
    if (!creator) return;

    if (sessionType === "single") {
      if (!singleDate || !slot) { toast.error("Please select a date and time slot"); return; }
      navigate(bookingPath, {
        state: {
          creatorId: creator._id, creatorName: name, creatorImage: imageUrl,
          price: dailyPrice, sessionType: "single",
          prefillDate: singleDate.toISOString(), prefillTime: slot, timeSlots,
        },
      });
    } else {
      if (!monthlyPrice) { toast.error("Monthly plan not available"); return; }
      if (monthlySessions > 0 && selectedDates.length < monthlySessions) {
        toast.error(`Please select all ${monthlySessions} session dates`); return;
      }
      if (timeSlots.length > 0 && !monthlySlot) { toast.error("Please select a preferred time slot"); return; }
      navigate(bookingPath, {
        state: {
          creatorId: creator._id, creatorName: name, creatorImage: imageUrl,
          price: monthlyPrice, sessionType: "monthly",
          sessionDates: selectedDates.map((d) => d.toISOString()),
          prefillTime: monthlySlot, monthlySessions, timeSlots,
        },
      });
    }
  };

  const singleBookDisabled  = isLoggedIn && (!slot || !singleDate || availableSlots.length === 0);
  const monthlyBookDisabled = isLoggedIn && (
    !monthlyPrice ||
    (monthlySessions > 0 && selectedDates.length < monthlySessions) ||
    (timeSlots.length > 0 && !monthlySlot)
  );

  const bookButtonLabel = () => {
    if (!isLoggedIn) return "Login to Book";
    if (sessionType === "monthly") {
      if (monthlySessions > 0 && selectedDates.length < monthlySessions)
        return `Select ${monthlySessions - selectedDates.length} more date${monthlySessions - selectedDates.length > 1 ? "s" : ""}`;
      if (timeSlots.length > 0 && !monthlySlot) return "Select a time slot";
      return monthlyPrice > 0 ? `Book Monthly Plan — ₹${monthlyPrice.toLocaleString()}/mo` : "Monthly plan unavailable";
    }
    return dailyPrice > 0 ? `Book Session — ₹${dailyPrice.toLocaleString()}` : "Book Session";
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
          <Button variant="outline" onClick={() => navigate(explorePath)}>Back to explore</Button>
        </Card>
      </div>
    );
  }

  // ── Time Slot Picker ─────────────────────────────────────────────────────────
  // For single sessions: shows available vs booked slots with visual distinction.
  // For monthly sessions: shows all slots (no per-date booking conflict check).
  const TimeSlotPicker = ({
    value, onChange, label = "Available time slots", showAvailability = false,
  }: {
    value: string | null;
    onChange: (t: string) => void;
    label?: string;
    /** When true, dims/disables slots that are already booked for the selected date */
    showAvailability?: boolean;
  }) => {
    const slotsToRender = showAvailability ? timeSlots : timeSlots; // always render all; style differs

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{label}</h3>
          {showAvailability && slotsLoading && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 size={11} className="animate-spin" /> Checking availability…
            </span>
          )}
        </div>

        {timeSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground border border-dashed rounded-lg">
            <Clock size={24} className="opacity-40" />
            <p className="text-sm">No time slots set by trainer yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {slotsToRender.map((t) => {
                const isBooked    = showAvailability && bookedSlots.includes(t);
                const isSelected  = value === t;
                const isDisabled  = isBooked || (showAvailability && slotsLoading);

                return (
                  <button
                    key={t}
                    disabled={isDisabled}
                    title={isBooked ? "Already booked — pick another slot" : t}
                    onClick={() => {
                      if (isDisabled) return;
                      if (!isLoggedIn) { goToLogin(); return; }
                      onChange(t);
                    }}
                    className={cn(
                      "relative flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-all",
                      // Selected
                      isSelected && !isBooked && "border-accent bg-accent text-accent-foreground",
                      // Available & not selected
                      !isSelected && !isBooked && "border-border bg-card hover:border-accent hover:bg-accent/5",
                      // Booked — greyed out, not clickable
                      isBooked && "cursor-not-allowed border-border/40 bg-muted/50 text-muted-foreground line-through opacity-60",
                    )}
                  >
                    {isBooked && <Lock size={11} className="shrink-0" />}
                    {t}
                    {isBooked && (
                      <span className="absolute -top-1.5 -right-1.5 rounded-full bg-rose-500 text-white text-[9px] font-bold px-1 leading-4">
                        Full
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend — only shown for single-session picker */}
            {showAvailability && !slotsLoading && bookedSlots.length > 0 && (
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm border border-border bg-card" />
                  Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-muted/60 border border-border/40 opacity-60" />
                  Already booked
                </span>
              </div>
            )}

            {/* No available slots warning */}
            {showAvailability && !slotsLoading && availableSlots.length === 0 && timeSlots.length > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800 px-3 py-2 text-xs text-rose-700 dark:text-rose-400">
                <AlertCircle size={13} className="shrink-0" />
                All slots are booked for this date. Please select a different day.
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container-app py-10 space-y-8">

      {/* TOP CARD */}
      <Card className="overflow-hidden border-border/60 shadow-card">
        <div className="grid md:grid-cols-[280px_1fr] gap-0">
          <div className="aspect-square md:aspect-auto bg-muted flex items-center justify-center">
            {imageUrl
              ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
              : <span className="font-display font-bold text-6xl text-accent select-none">{initials}</span>}
          </div>
          <div className="p-6 lg:p-8">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-3xl">{name}</h1>
                {verified && <BadgeCheck className="text-accent" />}
                {specialty && <Badge variant="secondary">{specialty}</Badge>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ShareButton name={name} />
                <Button
                  variant="outline" size="sm" onClick={handleSave}
                  className={cn("flex items-center gap-1.5 transition-colors", saved && "border-rose-400 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20")}
                >
                  <Heart size={15} className={cn("transition-all", saved && "fill-rose-500 text-rose-500")} />
                  {saved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground mt-1">{specialty}</p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <RatingStars rating={rating} />
                <span className="font-semibold">{rating > 0 ? rating.toFixed(1) : "New"}</span>
                {reviewCount > 0 && (
                  <span className="text-sm text-muted-foreground">({reviewCount} review{reviewCount !== 1 ? "s" : ""})</span>
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

      {/* AUTH GUARD BANNER */}
      {!isLoggedIn && <AuthGuardBanner onLogin={goToLogin} />}

      {/* SESSION TYPE SELECTOR */}
      <div>
        <h2 className="font-display font-semibold text-xl mb-3">Choose a plan</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => { setSessionType("single"); setSlot(null); }}
            className={cn(
              "relative text-left rounded-xl border-2 p-4 transition-all",
              sessionType === "single" ? "border-accent bg-accent/5" : "border-border/60 bg-card hover:border-border"
            )}
          >
            {sessionType === "single" && <CheckCircle2 size={18} className="absolute top-3 right-3 text-accent" />}
            <div className="font-semibold text-base">Single session</div>
            <div className="text-2xl font-display font-bold text-primary mt-1">
              {dailyPrice > 0 ? `₹${dailyPrice.toLocaleString()}` : "TBD"}
              <span className="text-sm font-normal text-muted-foreground ml-1">/ session</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Pick any available date & time slot</div>
          </button>

          <button
            onClick={() => { setSessionType("monthly"); setSelectedDates([]); setMonthlySlot(null); }}
            disabled={!monthlyPrice}
            className={cn(
              "relative text-left rounded-xl border-2 p-4 transition-all",
              !monthlyPrice && "opacity-50 cursor-not-allowed",
              sessionType === "monthly" ? "border-accent bg-accent/5" : "border-border/60 bg-card hover:border-border"
            )}
          >
            {sessionType === "monthly" && <CheckCircle2 size={18} className="absolute top-3 right-3 text-accent" />}
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
              {monthlySessions > 0 ? `${monthlySessions} sessions — pick your own dates` : "Contact trainer for details"}
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
              onSelect={(date) => {
                setSingleDate(date);
                // bookedSlots & slot reset happen in the useEffect above
              }}
              disabled={{ before: new Date() }}
              className="pointer-events-auto"
            />
          </Card>
          <Card className="p-6 border-border/60 shadow-card flex flex-col gap-6">
            <div>
              <h2 className="font-display font-semibold text-xl mb-4">Available time slots</h2>
              {/* Pass showAvailability=true so booked slots are visually disabled */}
              <TimeSlotPicker
                value={slot}
                onChange={setSlot}
                showAvailability
              />
            </div>
            <Button
              onClick={book} size="lg" disabled={singleBookDisabled}
              className={cn(
                "w-full mt-auto text-white disabled:opacity-50",
                !isLoggedIn ? "bg-amber-500 hover:bg-amber-600" : "bg-accent hover:bg-accent/90 text-accent-foreground"
              )}
            >
              {!isLoggedIn && <Lock size={15} className="mr-2" />}
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
                  <div key={i} className={cn("h-2 rounded-full transition-all duration-300", i < selectedDates.length ? "bg-accent w-5" : "bg-border w-2")} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{selectedDates.length} / {monthlySessions} selected</span>
            </div>
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg p-2">
              <Info size={12} className="mt-0.5 shrink-0" />
              <span>Tap dates to select your {monthlySessions} preferred session days. Tap again to deselect.</span>
            </div>
            <DayPicker
              mode="multiple" selected={selectedDates}
              onSelect={(days) => {
                if (!isLoggedIn) { goToLogin(); return; }
                if (!days) { setSelectedDates([]); return; }
                if (monthlySessions > 0 && days.length > monthlySessions) {
                  toast.error(`You can only select ${monthlySessions} session dates`); return;
                }
                setSelectedDates(days);
              }}
              disabled={{ before: new Date() }} className="pointer-events-auto"
            />
          </Card>
          <Card className="p-6 border-border/60 shadow-card flex flex-col gap-5">
            <div>
              <h2 className="font-display font-semibold text-xl mb-4">Monthly plan summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan price</span>
                  <span className="font-semibold">{monthlyPrice > 0 ? `₹${monthlyPrice.toLocaleString()}/mo` : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sessions included</span>
                  <span className="font-semibold">{monthlySessions || "—"}</span>
                </div>
                {savingsPercent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You save</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{savingsPercent}% vs per-session</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-sm font-medium">
                <CalendarDays size={14} /> Your selected dates
              </div>
              {selectedDates.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No dates selected yet — pick from the calendar</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {[...selectedDates].sort((a, b) => a.getTime() - b.getTime()).map((d, i) => (
                    <div key={d.toISOString()} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-accent w-5 text-center">#{i + 1}</span>
                        <span>{d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
                      </div>
                      <button
                        onClick={() => setSelectedDates((prev) => prev.filter((x) => x.toDateString() !== d.toDateString()))}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-border/40 pt-4">
              {/* Monthly plan: no per-date conflict, show all slots */}
              <TimeSlotPicker
                value={monthlySlot}
                onChange={setMonthlySlot}
                label="Preferred time slot (applies to all sessions)"
                showAvailability={false}
              />
            </div>
            <Button
              onClick={book} size="lg" disabled={monthlyBookDisabled}
              className={cn(
                "w-full mt-auto text-white disabled:opacity-50",
                !isLoggedIn ? "bg-amber-500 hover:bg-amber-600" : "bg-accent hover:bg-accent/90 text-accent-foreground"
              )}
            >
              {!isLoggedIn && <Lock size={15} className="mr-2" />}
              {bookButtonLabel()}
            </Button>
          </Card>
        </div>
      )}

      {/* REVIEWS */}
      <div>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="font-display font-bold text-2xl">Reviews</h2>
          {!reviewsLoading && liveReviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-border"}
                  />
                ))}
              </div>
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({liveReviews.length} review{liveReviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>

        {reviewsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-6">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm">Loading reviews…</span>
          </div>
        ) : liveReviews.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground border-border/60">
            <Star size={28} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No reviews yet</p>
            <p className="text-sm mt-1">Be the first to review this trainer after your session.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {liveReviews.map((r) => (
              <Card key={r._id} className="p-5 border-border/60 shadow-card">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {r.userId.profileImage?.url ? (
                        <img
                          src={r.userId.profileImage.url}
                          alt={r.userId.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-accent">
                          {r.userId.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-sm">{r.userId.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(r.createdAt), "PP")}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 mt-2.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-border"}
                    />
                  ))}
                </div>

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