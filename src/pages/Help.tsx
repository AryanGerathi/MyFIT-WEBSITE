import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle, Send, Loader2,
  Clock, AlertCircle, MessageSquare,
  ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { authService, helpService, type HelpRequest } from "@/services/backendService";
import { format } from "date-fns";

// ── FAQ Data ──────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "How do I book a session with a trainer?",
    a: "Go to 'Find Creators', pick a trainer you like, click 'Book', choose your session type and time slot, then complete payment via UPI or card.",
  },
  {
    q: "Can I cancel or reschedule a session?",
    a: "Currently, cancellations must be requested at least 24 hours in advance. Raise a help request below and our team will assist you.",
  },
  {
    q: "How do I get a refund?",
    a: "Refunds are processed within 5-7 business days for eligible cancellations. Raise a 'Refund Request' below with your booking details.",
  },
  {
    q: "Why can't I join a video session?",
    a: "Ensure your browser allows camera/microphone access. The 'Join' button activates 10 minutes before the session. If issues persist, raise a support request.",
  },
  {
    q: "How do I change my profile information?",
    a: "Go to the Profile tab in your dashboard to update your name, phone number, and profile photo.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card details.",
  },
];

const categories = [
  "Booking Issue",
  "Payment / Refund",
  "Technical Problem",
  "Account Issue",
  "Session Feedback",
  "Other",
];

// ── FAQ Accordion ─────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-border/60 rounded-xl overflow-hidden cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors">
        <p className="font-medium text-sm pr-4">{q}</p>
        {open
          ? <ChevronUp   size={16} className="text-muted-foreground shrink-0" />
          : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
      </div>
      {open && (
        <div className="px-5 py-4 text-sm text-muted-foreground bg-muted/20 border-t border-border/40">
          {a}
        </div>
      )}
    </div>
  );
}

// ── Status Pill ───────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: HelpRequest["status"] }) {
  const map = {
    open:          "bg-amber-100 text-amber-700",
    "in-progress": "bg-blue-100 text-blue-700",
    resolved:      "bg-green-100 text-green-700",
  };
  const labels = { open: "Open", "in-progress": "In Progress", resolved: "Resolved" };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

// ── Main Help Page ────────────────────────────────────────────────────────────

export default function Help() {
  const user = authService.getStoredUser();

  // ── Guard: hide form entirely if admin ───────────────────────────────────────
  const isAdmin = user?.role === "admin";

  // ── form state ──────────────────────────────────────────────────────────────
  const [category, setCategory] = useState(categories[0]);
  const [subject,  setSubject]  = useState("");
  const [message,  setMessage]  = useState("");
  const [sending,  setSending]  = useState(false);

  // ── my requests state ────────────────────────────────────────────────────────
  const [myRequests,      setMyRequests]      = useState<HelpRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError,   setRequestsError]   = useState<string | null>(null);

  const loadMyRequests = useCallback(async () => {
    // Admins don't have personal requests — skip the call entirely
    if (isAdmin) return;
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const data = await helpService.getMine();
      setMyRequests(data.requests);
    } catch (err: unknown) {
      setRequestsError(err instanceof Error ? err.message : "Could not load your requests.");
    } finally {
      setRequestsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { loadMyRequests(); }, [loadMyRequests]);

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Defensive check — should never reach here if isAdmin, but just in case
    if (isAdmin) {
      toast.error("Admins cannot submit help requests. Please log in as a user.");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSending(true);
    try {
      const { request: newReq } = await helpService.submit({
        category,
        subject: subject.trim(),
        message: message.trim(),
      });
      setMyRequests((prev) => [newReq, ...prev]);
      setSubject("");
      setMessage("");
      setCategory(categories[0]);
      toast.success("Request submitted! Our team will get back to you soon.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      // Surface a clear message if backend rejects due to admin role
      if (msg.toLowerCase().includes("admin")) {
        toast.error("Please log in as a user to submit help requests.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <HelpCircle size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl">Help &amp; Support</h1>
          <p className="text-sm text-muted-foreground">We usually respond within 24 hours</p>
        </div>
      </div>

      <Tabs defaultValue={isAdmin ? "faq" : "raise"}>
        <TabsList className="w-full">
          {/* Hide "Raise a Request" and "My Requests" tabs for admins */}
          {!isAdmin && (
            <>
              <TabsTrigger value="raise" className="flex-1">Raise a Request</TabsTrigger>
              <TabsTrigger value="mine"  className="flex-1">
                My Requests
                {myRequests.length > 0 && (
                  <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                    {myRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="faq" className={isAdmin ? "flex-1" : "flex-1"}>FAQ</TabsTrigger>
        </TabsList>

        {/* ── Raise Request ── (users only) */}
        {!isAdmin && (
          <TabsContent value="raise" className="mt-4">
            <Card className="p-6 border-border/60 shadow-card">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-sm">Category</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                          category === cat
                            ? "bg-accent text-accent-foreground border-accent"
                            : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm">Subject</Label>
                  <Input
                    id="subject"
                    className="mt-1.5"
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm">Message</Label>
                  <textarea
                    id="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail…"
                    className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                               placeholder:text-muted-foreground focus:outline-none focus:ring-2
                               focus:ring-accent/40 focus:border-accent transition-colors resize-none"
                  />
                </div>

                <div className="rounded-lg bg-muted/40 border border-border/40 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                  <AlertCircle size={13} className="shrink-0" />
                  Submitting as{" "}
                  <span className="font-medium text-foreground ml-1">{user?.name}</span>
                  <span className="mx-1">·</span>
                  {user?.email}
                </div>

                <Button
                  type="submit"
                  disabled={sending || !subject.trim() || !message.trim()}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                >
                  {sending
                    ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                    : <><Send size={15} /> Submit Request</>}
                </Button>
              </form>
            </Card>
          </TabsContent>
        )}

        {/* ── My Requests ── (users only) */}
        {!isAdmin && (
          <TabsContent value="mine" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {myRequests.length} request{myRequests.length !== 1 ? "s" : ""}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMyRequests}
                disabled={requestsLoading}
                className="gap-2"
              >
                {requestsLoading
                  ? <Loader2 size={13} className="animate-spin" />
                  : <RefreshCw size={13} />}
                Refresh
              </Button>
            </div>

            {requestsLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading your requests…</span>
              </div>
            ) : requestsError ? (
              <div className="flex flex-col items-center py-10 gap-3 text-center">
                <AlertCircle size={28} className="text-destructive opacity-60" />
                <p className="text-sm text-destructive">{requestsError}</p>
                <Button variant="outline" size="sm" onClick={loadMyRequests}>Retry</Button>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium">No requests yet</p>
                <p className="text-sm mt-1">Raise a request and track it here</p>
              </div>
            ) : (
              myRequests.map((r) => (
                <Card key={r._id} className="p-5 border-border/60 shadow-card">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">{r.subject}</span>
                        <Badge variant="secondary" className="text-xs shrink-0">{r.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.message}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {format(new Date(r.createdAt), "PPp")}
                      </div>
                    </div>
                    <StatusPill status={r.status} />
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        )}

        {/* ── FAQ ── (everyone) */}
        <TabsContent value="faq" className="mt-4 space-y-2">
          {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          <p className="text-xs text-center text-muted-foreground pt-2">
            Can't find your answer?{" "}
            <button className="text-accent underline underline-offset-2">Raise a request</button>
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}