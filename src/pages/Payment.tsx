import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "@/services/backendService";

declare global {
  interface Window { Razorpay: any; }
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id    = "razorpay-script";
    script.src   = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Payment = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [draft, setDraft]           = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const inDashboard = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    const raw = sessionStorage.getItem("myfit:booking");
    if (raw) setDraft(JSON.parse(raw));
  }, []);

  if (!draft) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="font-display font-bold text-2xl">No booking found</h1>
        <Button asChild className="mt-6">
          <Link to={inDashboard ? "/dashboard/find-creators" : "/explore"}>
            {inDashboard ? "Find Creators" : "Back to explore"}
          </Link>
        </Button>
      </div>
    );
  }

  const platformFee = Math.round(draft.price * 0.02);
  const total       = draft.price + platformFee;

  const pay = async () => {
    setProcessing(true);

    // 1. Load Razorpay SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load payment gateway. Check your connection.");
      setProcessing(false);
      return;
    }

    // 2. Create order on backend
    let order: { id: string; amount: number; currency: string };
    try {
      const res = await paymentService.createOrder(total);
      order = res.order;
    } catch (err: any) {
      toast.error(err.message || "Could not create order. Try again.");
      setProcessing(false);
      return;
    }

    // 3. Open Razorpay checkout
    const options = {
      key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount:      order.amount,
      currency:    order.currency,
      name:        "MyFit",
      description: `Session with ${draft.creatorName}`,
      order_id:    order.id,
      prefill:     { name: draft.creatorName },
      theme:       { color: "#6366f1" },

      handler: async (response: {
        razorpay_order_id:   string;
        razorpay_payment_id: string;
        razorpay_signature:  string;
      }) => {
        try {
          // 4. Verify + save to DB with booking metadata ✅
          await paymentService.verifyPayment({
            ...response,
            creatorId:   draft.creatorId,
            amount:      total,
            commission:  platformFee,
            sessionType: draft.sessionType ?? "single",
            date:        draft.date  ?? null,
            time:        draft.time  ?? null,
          });
          sessionStorage.removeItem("myfit:booking");
          toast.success("Payment successful!", {
            description: "Your session is confirmed.",
          });
          navigate(inDashboard ? "/dashboard/bookings" : "/dashboard");
        } catch (err: any) {
          toast.error(err.message || "Payment verification failed.");
        } finally {
          setProcessing(false);
        }
      },

      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled.");
          setProcessing(false);
        },
      },
    };

    new window.Razorpay(options).open();
  };

  return (
    <div className="container-app py-10 max-w-5xl grid lg:grid-cols-[1fr_360px] gap-6">
      <Card className="p-6 lg:p-8 border-border/60 shadow-card">
        <h1 className="font-display font-bold text-2xl">Complete your payment</h1>
        <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1">
          <ShieldCheck size={14} className="text-success" /> 100% secure & encrypted via Razorpay
        </p>

        <div className="mt-8">
          <Button
            onClick={pay}
            disabled={processing}
            size="lg"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Lock size={16} className="mr-2" />
            {processing ? "Opening payment…" : `Pay ₹${total}`}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Supports UPI · Cards · Net Banking · Wallets
          </p>
        </div>
      </Card>

      {/* ── Order Summary ── */}
      <Card className="p-6 border-border/60 shadow-card h-fit lg:sticky lg:top-24">
        <h2 className="font-display font-semibold">Order summary</h2>
        <div className="flex items-center gap-3 mt-4">
          <img
            src={draft.creatorImage}
            alt={draft.creatorName}
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div>
            <div className="font-semibold text-sm">{draft.creatorName}</div>
            <div className="text-xs text-muted-foreground">
              {draft.date ? new Date(draft.date).toLocaleDateString() : "Monthly plan"} · {draft.time ?? "—"}
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {draft.sessionType === "monthly" ? "Monthly plan fee" : "Session fee"}
            </span>
            <span>₹{draft.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform fee (2%)</span>
            <span>₹{platformFee}</span>
          </div>
          <div className="flex justify-between font-display font-bold pt-3 border-t border-border/60">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Payment;