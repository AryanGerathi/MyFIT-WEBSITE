import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle, Send, Loader2, CheckCircle2,
  Clock, AlertCircle, MessageSquare, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/backendService";
import { format } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HelpRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  message: string;
  status: "open" | "in-progress" | "resolved";
  createdAt: string;
}

const STORAGE_KEY = "myfit_help_requests";

export function getHelpRequests(): HelpRequest[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHelpRequest(req: HelpRequest) {
  const all = getHelpRequests();
  all.unshift(req);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

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
        {open ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
      </div>
      {open && (
        <div className="px-5 py-4 text-sm text-muted-foreground bg-muted/20 border-t border-border/40">
          {a}
        </div>
      )}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: HelpRequest["status"] }) {
  const map = {
    open:        "bg-amber-100 text-amber-700",
    "in-progress": "bg-blue-100 text-blue-700",
    resolved:    "bg-green-100 text-green-700",
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

  const [category, setCategory] = useState(categories[0]);
  const [subject,  setSubject]  = useState("");
  const [message,  setMessage]  = useState("");
  const [sending,  setSending]  = useState(false);
  const [myRequests, setMyRequests] = useState<HelpRequest[]>(() =>
    getHelpRequests().filter((r) => r.userEmail === user?.email)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate network

    const req: HelpRequest = {
      id:        `req_${Date.now()}`,
      userId:    user?._id    || "guest",
      userName:  user?.name   || "Guest",
      userEmail: user?.email  || "unknown",
      category,
      subject:   subject.trim(),
      message:   message.trim(),
      status:    "open",
      createdAt: new Date().toISOString(),
    };

    saveHelpRequest(req);
    setMyRequests((prev) => [req, ...prev]);
    setSubject("");
    setMessage("");
    setCategory(categories[0]);
    setSending(false);
    toast.success("Request submitted! Our team will get back to you soon.");
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <HelpCircle size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl">Help & Support</h1>
          <p className="text-sm text-muted-foreground">We usually respond within 24 hours</p>
        </div>
      </div>

      <Tabs defaultValue="raise">
        <TabsList className="w-full">
          <TabsTrigger value="raise"   className="flex-1">Raise a Request</TabsTrigger>
          <TabsTrigger value="mine"    className="flex-1">
            My Requests
            {myRequests.length > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                {myRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="faq"     className="flex-1">FAQ</TabsTrigger>
        </TabsList>

        {/* Raise Request Tab */}
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
                  placeholder="Describe your issue in detail. Include booking IDs, dates, or any relevant information…"
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                             placeholder:text-muted-foreground focus:outline-none focus:ring-2
                             focus:ring-accent/40 focus:border-accent transition-colors resize-none"
                />
              </div>

              {/* User info preview */}
              <div className="rounded-lg bg-muted/40 border border-border/40 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                <AlertCircle size={13} className="shrink-0" />
                Submitting as <span className="font-medium text-foreground ml-1">{user?.name}</span>
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

        {/* My Requests Tab */}
        <TabsContent value="mine" className="mt-4 space-y-3">
          {myRequests.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No requests yet</p>
              <p className="text-sm mt-1">Raise a request and track it here</p>
            </div>
          ) : (
            myRequests.map((r) => (
              <Card key={r.id} className="p-5 border-border/60 shadow-card">
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

        {/* FAQ Tab */}
        <TabsContent value="faq" className="mt-4 space-y-2">
          {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          <p className="text-xs text-center text-muted-foreground pt-2">
            Can't find your answer? <button className="text-accent underline underline-offset-2">Raise a request</button>
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}