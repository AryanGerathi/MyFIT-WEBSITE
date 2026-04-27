import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

type BookingState = {
  creatorId:    string;
  creatorName:  string;
  creatorImage: string;
  price:        number;
  prefillDate?: string;
  prefillTime?: string;
  timeSlots?:   string[];
};

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as BookingState | null;

  const inDashboard  = location.pathname.startsWith("/dashboard");
  const paymentPath  = inDashboard ? "/dashboard/payment"       : "/payment";
  const explorePath  = inDashboard ? "/dashboard/find-creators" : "/explore";
  const exploreLabel = inDashboard ? "Find Creators"            : "Explore creators";

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Use creator's slots from state
  const timeSlots = state?.timeSlots ?? [];

  const [date, setDate] = useState<string>(
    state?.prefillDate
      ? format(new Date(state.prefillDate), "yyyy-MM-dd")
      : todayStr
  );

  // Only keep prefillTime if it actually exists in the creator's slots
  const [time, setTime] = useState<string>(
    state?.prefillTime && timeSlots.includes(state.prefillTime)
      ? state.prefillTime
      : ""
  );

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
  const platformFee = Math.round(price * 0.05);
  const total       = price + platformFee;

  const handleProceed = () => {
    if (!date || !time) return;
    const draft = { creatorId, creatorName, creatorImage, price, date, time };
    sessionStorage.setItem("myfit:booking", JSON.stringify(draft));
    navigate(paymentPath);
  };

  const initials = creatorName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container-app py-10 max-w-3xl">
      <h1 className="font-display font-bold text-3xl">Confirm your booking</h1>
      <p className="text-muted-foreground mt-1">
        Review or adjust your date and time, then proceed to payment
      </p>

      <Card className="mt-6 p-6 border-border/60 shadow-card space-y-6">

        {/* Creator info */}
        <div className="flex items-center gap-4">
          {creatorImage ? (
            <img
              src={creatorImage}
              alt={creatorName}
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-display font-bold text-xl">
              {initials}
            </div>
          )}
          <div>
            <div className="font-display font-semibold text-lg">{creatorName}</div>
            <div className="text-sm text-muted-foreground">1-on-1 personalized session</div>
          </div>
        </div>

        {/* Date picker */}
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

        {/* Time slot picker */}
        <div>
          <Label className="flex items-center gap-2 mb-3 font-medium">
            <Clock size={15} className="text-accent" /> Select Time
          </Label>

          {timeSlots.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border border-dashed rounded-lg px-4 py-3">
              <Clock size={15} className="opacity-40 shrink-0" />
              <span>This trainer hasn't set any available time slots yet.</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    time === slot
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}

          {time && (
            <p className="text-xs text-muted-foreground mt-2">
              Selected: <span className="text-accent font-medium">{time}</span>
            </p>
          )}
        </div>

        {/* Price breakdown */}
        <div className="space-y-2 border-t border-border/60 pt-5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Session fee</span>
            <span>₹{price}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform fee (5%)</span>
            <span>₹{platformFee}</span>
          </div>
          <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-border/60">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        <Button
          onClick={handleProceed}
          disabled={!date || !time || timeSlots.length === 0}
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