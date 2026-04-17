import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

type BookingDraft = {
  creatorId: string;
  creatorName: string;
  creatorImage: string;
  price: number;
  date: string;
  time: string;
};

const Booking = () => {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("myfit:booking");
    if (!raw) return;
    setDraft(JSON.parse(raw));
  }, []);

  if (!draft) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="font-display font-bold text-2xl">No booking selected</h1>
        <p className="text-muted-foreground mt-2">Pick a creator and time slot first.</p>
        <Button asChild className="mt-6 bg-accent text-accent-foreground"><Link to="/explore">Explore creators</Link></Button>
      </div>
    );
  }

  const platformFee = Math.round(draft.price * 0.05);
  const total = draft.price + platformFee;

  return (
    <div className="container-app py-10 max-w-3xl">
      <h1 className="font-display font-bold text-3xl">Confirm your booking</h1>
      <p className="text-muted-foreground mt-1">Review the details before payment</p>

      <Card className="mt-6 p-6 border-border/60 shadow-card">
        <div className="flex items-center gap-4">
          <img src={draft.creatorImage} alt={draft.creatorName} className="h-16 w-16 rounded-xl object-cover" />
          <div>
            <div className="font-display font-semibold text-lg">{draft.creatorName}</div>
            <div className="text-sm text-muted-foreground">1-on-1 personalized session</div>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border/60 p-4 flex items-center gap-3">
            <Calendar size={18} className="text-accent" />
            <div>
              <div className="text-xs text-muted-foreground">Date</div>
              <div className="font-semibold">{format(new Date(draft.date), "PPP")}</div>
            </div>
          </div>
          <div className="rounded-lg border border-border/60 p-4 flex items-center gap-3">
            <Clock size={18} className="text-accent" />
            <div>
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="font-semibold">{draft.time}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2 border-t border-border/60 pt-5">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Session fee</span><span>₹{draft.price}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Platform fee (5%)</span><span>₹{platformFee}</span></div>
          <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-border/60">
            <span>Total</span><span>₹{total}</span>
          </div>
        </div>

        <Button onClick={() => navigate("/payment")} size="lg" className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
          Proceed to Payment <ArrowRight size={16} className="ml-1" />
        </Button>
      </Card>
    </div>
  );
};

export default Booking;
