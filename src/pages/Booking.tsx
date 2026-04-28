import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

type SessionType = "single" | "monthly";

type BookingState = {
  creatorId:        string;
  creatorName:      string;
  creatorImage:     string;
  price:            number;
  sessionType:      SessionType;
  prefillDate?:     string;
  prefillTime?:     string;
  timeSlots?:       string[];
  sessionDates?:    string[];
  monthlySessions?: number;
};

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as BookingState | null;

  const inDashboard  = location.pathname.startsWith("/dashboard");
  const paymentPath  = inDashboard ? "/dashboard/payment"       : "/payment";
  const explorePath  = inDashboard ? "/dashboard/find-creators" : "/explore";
  const exploreLabel = inDashboard ? "Find Creators"            : "Explore creators";

  const todayStr        = format(new Date(), "yyyy-MM-dd");
  const sessionType     = state?.sessionType ?? "single";
  const timeSlots       = state?.timeSlots ?? [];
  const monthlySessions = state?.monthlySessions ?? 0;
  const sessionDates    = (state?.sessionDates ?? []).map((d) => new Date(d));

  // ── Single session state ──────────────────────────────────────────────────
  const [date, setDate] = useState<string>(
    state?.prefillDate
      ? format(new Date(state.prefillDate), "yyyy-MM-dd")
      : todayStr
  );
  // Pre-select the slot chosen on the profile page
  const [time, setTime] = useState<string>(state?.prefillTime ?? "");

  // ── Monthly session state ─────────────────────────────────────────────────
  // Pre-select the slot chosen on the profile page
  const [monthlySlot, setMonthlySlot] = useState<string>(state?.prefillTime ?? "");

  if (!state?.creatorId) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="font-display font-bold text-2xl">No booking selected</h1>
        <p className="text-muted-foreground mt-2">Pick a creator and time slot first.</p>
        <Button asChild className="mt-6 bg-accent text-accent-foreground">
          <Link to={explorePath}>{exploreLabel}</Link>
        </Button>
      </div>
    );
  }

  const { creatorId, creatorName, creatorImage, price } = state;
  const platformFee = Math.round(price * 0.02);
  const total       = price + platformFee;

  const initials = creatorName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleProceed = () => {
    if (sessionType === "single") {
      if (!date || !time) return;
      sessionStorage.setItem("myfit:booking", JSON.stringify({
        creatorId, creatorName, creatorImage, price, date, time, sessionType,
      }));
    } else {
      if (timeSlots.length > 0 && !monthlySlot) return;
      sessionStorage.setItem("myfit:booking", JSON.stringify({
        creatorId, creatorName, creatorImage, price, sessionType,
        sessionDates: sessionDates.map((d) => d.toISOString()),
        time: monthlySlot,
        monthlySessions,
      }));
    }
    navigate(paymentPath);
  };

  const singleDisabled  = !date || !time || timeSlots.length === 0;
  const monthlyDisabled = timeSlots.length > 0 && !monthlySlot;
  const proceedDisabled = sessionType === "single" ? singleDisabled : monthlyDisabled;

  // Reusable slot button list
  const SlotButtons = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (s: string) => void;
  }) => (
    <>
      {timeSlots.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground border border-dashed rounded-lg px-4 py-3">
          <Clock size={15} className="opacity-40 shrink-0" />
          <span>This trainer hasn't set any available time slots yet.</span>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => onChange(slot)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  value === slot
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          {value && (
            <p className="text-xs text-muted-foreground mt-2">
              Selected: <span className="text-accent font-medium">{value}</span>
            </p>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="container-app py-10 max-w-3xl">
      <h1 className="font-display font-bold text-3xl">Confirm your booking</h1>
      <p className="text-muted-foreground mt-1">
        {sessionType === "monthly"
          ? "Review your selected sessions and preferred time, then proceed to payment"
          : "Review or adjust your date and time, then proceed to payment"}
      </p>

      <Card className="mt-6 p-6 border-border/60 shadow-card space-y-6">

        {/* Creator info */}
        <div className="flex items-center gap-4">
          {creatorImage ? (
            <img src={creatorImage} alt={creatorName}
              className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-display font-bold text-xl">
              {initials}
            </div>
          )}
          <div>
            <div className="font-display font-semibold text-lg">{creatorName}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs">
                {sessionType === "monthly" ? "Monthly plan" : "Single session"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {sessionType === "monthly"
                  ? `${monthlySessions} sessions / month`
                  : "1-on-1 personalized session"}
              </span>
            </div>
          </div>
        </div>

        {/* ── SINGLE SESSION ── */}
        {sessionType === "single" && (
          <>
            <div>
              <Label className="flex items-center gap-2 mb-2 font-medium">
                <Calendar size={15} className="text-accent" /> Select Date
              </Label>
              <input
                type="date"
                value={date}
                min={todayStr}
                onChange={(e) => setDate(e.target.value)}
                className="max-w-xs h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3 font-medium">
                <Clock size={15} className="text-accent" /> Select Time
              </Label>
              <SlotButtons value={time} onChange={setTime} />
            </div>
          </>
        )}

        {/* ── MONTHLY PLAN ── */}
        {sessionType === "monthly" && (
          <>
            <div>
              <Label className="flex items-center gap-2 mb-3 font-medium">
                <CalendarDays size={15} className="text-accent" /> Your session dates
              </Label>
              {sessionDates.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No dates selected.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[...sessionDates]
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((d, i) => (
                      <div
                        key={d.toISOString()}
                        className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded-lg px-3 py-2"
                      >
                        <CheckCircle2 size={13} className="text-accent shrink-0" />
                        <span className="font-medium text-xs">
                          #{i + 1}{" "}
                          {d.toLocaleDateString("en-IN", {
                            weekday: "short", day: "numeric", month: "short",
                          })}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3 font-medium">
                <Clock size={15} className="text-accent" /> Preferred time slot
                <span className="text-xs text-muted-foreground font-normal">
                  (applies to all sessions)
                </span>
              </Label>
              <SlotButtons value={monthlySlot} onChange={setMonthlySlot} />
            </div>
          </>
        )}

        {/* Price breakdown */}
        <div className="space-y-2 border-t border-border/60 pt-5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {sessionType === "monthly" ? "Monthly plan fee" : "Session fee"}
            </span>
            <span>₹{price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform fee (2%)</span>
            <span>₹{platformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-border/60">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>

        <Button
          onClick={handleProceed}
          disabled={proceedDisabled}
          size="lg"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50"
        >
          Proceed to Payment <ArrowRight size={16} className="ml-1" />
        </Button>
      </Card>
    </div>
  );
};

export default Booking;