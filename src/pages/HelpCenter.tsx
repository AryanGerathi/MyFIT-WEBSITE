import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  {
    category: "Getting Started",
    items: [
      {
        q: "How do I create an account on MyFit?",
        a: "Click 'Sign Up' on the top right, enter your name, email, phone number and set a password. You'll receive a 6-digit OTP on your email to verify your account.",
      },
      {
        q: "Is MyFit free to use?",
        a: "Browsing creators and their profiles is completely free. You only pay when you book a session with a creator. Pricing varies by creator.",
      },
      {
        q: "What types of fitness creators are on MyFit?",
        a: "We have creators across strength training, yoga, fat loss, HIIT, nutrition coaching, Zumba, calisthenics, sports-specific training, and more.",
      },
    ],
  },
  {
    category: "Booking & Payments",
    items: [
      {
        q: "What payment methods are supported?",
        a: "We support UPI (GPay, PhonePe, Paytm), credit/debit cards, and net banking — all major Indian payment methods are supported.",
      },
      {
        q: "Can I cancel or reschedule a booked session?",
        a: "Yes. You can cancel or reschedule up to 12 hours before your session for a full refund. Cancellations within 12 hours are subject to the creator's cancellation policy.",
      },
      {
        q: "How do I get a refund?",
        a: "Approved refunds are processed within 5–7 business days back to your original payment method. Contact support@myfittt.com with your booking ID.",
      },
    ],
  },
  {
    category: "For Creators",
    items: [
      {
        q: "How do I become a creator on MyFit?",
        a: "Sign up with the 'Creator' role, complete your profile with your specialization, bio, and rates, and submit for verification. Our team reviews applications within 48 hours.",
      },
      {
        q: "When do creators get paid?",
        a: "Payouts are processed every Monday for sessions completed in the previous week. Funds arrive in your linked bank account within 2 business days.",
      },
      {
        q: "What commission does MyFit take?",
        a: "MyFit takes a 15% platform fee from each booking. This covers payment processing, platform maintenance, and customer support.",
      },
    ],
  },
  {
    category: "Account & Privacy",
    items: [
      {
        q: "How do I reset my password?",
        a: "Currently, password reset is done via OTP verification. Contact support@myfittt.com and we'll help you regain access to your account.",
      },
      {
        q: "Is my personal data safe?",
        a: "Yes. We encrypt all sensitive data, never sell your information to third parties, and comply with Indian data protection laws. See our Privacy Policy for full details.",
      },
      {
        q: "How do I delete my account?",
        a: "Email support@myfittt.com with subject 'Account Deletion Request'. We'll process it within 7 business days and delete all your personal data.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left font-medium hover:text-accent transition"
      >
        <span>{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function HelpCenter() {
  const [search, setSearch] = useState("");

  const filtered = faqs.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border/60 bg-secondary/20">
        <div className="container-app py-20 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Help <span className="text-accent">Center</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Find answers to common questions about MyFit.
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm outline-none focus:border-accent transition"
            />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container-app py-16 max-w-3xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No results found for "{search}".</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try different keywords or{" "}
              <Link to="/contact" className="text-accent hover:underline">
                contact us directly
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {filtered.map((cat) => (
              <div key={cat.category}>
                <h2 className="font-display font-bold text-xl mb-4 text-accent">{cat.category}</h2>
                <div className="rounded-2xl border border-border/60 bg-secondary/20 px-6">
                  {cat.items.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still need help */}
        <div className="mt-16 rounded-2xl border border-border/60 bg-secondary/30 p-8 text-center">
          <h3 className="font-display font-bold text-xl mb-2">Still need help?</h3>
          <p className="text-muted-foreground text-sm mb-5">
            Can't find what you're looking for? Our support team is here for you.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl gradient-accent text-white px-6 py-2.5 font-semibold hover:opacity-90 transition text-sm"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </main>
  );
}