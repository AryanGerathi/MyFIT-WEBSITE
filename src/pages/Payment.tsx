import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const Payment = () => {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("myfit:booking");
    if (raw) setDraft(JSON.parse(raw));
  }, []);

  if (!draft) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="font-display font-bold text-2xl">No booking found</h1>
        <Button asChild className="mt-6"><Link to="/explore">Back to explore</Link></Button>
      </div>
    );
  }

  const total = draft.price + Math.round(draft.price * 0.05);

  const pay = (method: string) => {
    setProcessing(true);
    setTimeout(() => {
      sessionStorage.removeItem("myfit:booking");
      toast.success(`Payment successful via ${method}!`, { description: "Your session is confirmed." });
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="container-app py-10 max-w-5xl grid lg:grid-cols-[1fr_360px] gap-6">
      <Card className="p-6 lg:p-8 border-border/60 shadow-card">
        <h1 className="font-display font-bold text-2xl">Choose payment method</h1>
        <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1"><ShieldCheck size={14} className="text-success"/> 100% secure & encrypted</p>

        <Tabs defaultValue="upi" className="mt-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="upi">UPI</TabsTrigger>
            <TabsTrigger value="card">Card</TabsTrigger>
            <TabsTrigger value="netbanking">Net Banking</TabsTrigger>
          </TabsList>

          <TabsContent value="upi" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="upi">UPI ID</Label>
              <Input id="upi" placeholder="yourname@upi" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["Google Pay", "PhonePe", "Paytm", "BHIM"].map((a) => (
                <button key={a} className="rounded-lg border border-border/60 p-3 text-xs font-medium hover:border-accent hover:text-accent transition">{a}</button>
              ))}
            </div>
            <Button onClick={() => pay("UPI")} disabled={processing} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Lock size={16} className="mr-2" /> {processing ? "Processing…" : `Pay ₹${total}`}
            </Button>
          </TabsContent>

          <TabsContent value="card" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="cardno">Card number</Label>
              <Input id="cardno" placeholder="1234 5678 9012 3456" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="exp">Expiry</Label>
                <Input id="exp" placeholder="MM/YY" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="cname">Name on card</Label>
              <Input id="cname" placeholder="John Doe" className="mt-1.5" />
            </div>
            <Button onClick={() => pay("Card")} disabled={processing} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Lock size={16} className="mr-2" /> {processing ? "Processing…" : `Pay ₹${total}`}
            </Button>
          </TabsContent>

          <TabsContent value="netbanking" className="space-y-4 mt-6">
            <Label>Select your bank</Label>
            <RadioGroup defaultValue="hdfc" className="grid grid-cols-2 gap-2">
              {["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak", "Yes Bank"].map((b) => (
                <Label key={b} className="flex items-center gap-2 rounded-lg border border-border/60 p-3 cursor-pointer hover:border-accent">
                  <RadioGroupItem value={b} />
                  {b}
                </Label>
              ))}
            </RadioGroup>
            <Button onClick={() => pay("Net Banking")} disabled={processing} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Lock size={16} className="mr-2" /> {processing ? "Processing…" : `Pay ₹${total}`}
            </Button>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6 border-border/60 shadow-card h-fit lg:sticky lg:top-24">
        <h2 className="font-display font-semibold">Order summary</h2>
        <div className="flex items-center gap-3 mt-4">
          <img src={draft.creatorImage} alt={draft.creatorName} className="h-12 w-12 rounded-lg object-cover" />
          <div>
            <div className="font-semibold text-sm">{draft.creatorName}</div>
            <div className="text-xs text-muted-foreground">{new Date(draft.date).toLocaleDateString()} · {draft.time}</div>
          </div>
        </div>
        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Session</span><span>₹{draft.price}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Platform fee</span><span>₹{Math.round(draft.price * 0.05)}</span></div>
          <div className="flex justify-between font-display font-bold pt-3 border-t border-border/60"><span>Total</span><span>₹{total}</span></div>
        </div>
      </Card>
    </div>
  );
};

export default Payment;
