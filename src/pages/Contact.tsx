import { Mail, MessageSquare, MapPin } from "lucide-react";

const contactInfo = [
  { icon: Mail, label: "Email Us", value: "support@myfittt.com", href: "mailto:support@myfittt.com" },
  { icon: MapPin, label: "Based In", value: "Bengaluru, India", href: null },
  { icon: MessageSquare, label: "Response Time", value: "Within 24 hours", href: null },
];

const steps = [
  { step: "01", title: "Open your email app", description: 'Click "Email Us Now" below or open Gmail, Outlook, or Apple Mail.' },
  { step: "02", title: "Address your email", description: "Send to support@myfittt.com. For creator inquiries use creators@myfittt.com." },
  { step: "03", title: "Write your message", description: "Include your name, issue details, and booking ID if relevant." },
  { step: "04", title: "We'll get back to you", description: "Our team responds within 24 hours on weekdays. Email is the best way to reach us." },
];

export default function Contact() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-border/60 bg-secondary/20">
        <div className="container-app py-20 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Get in <span className="text-accent">Touch</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Have a question, feedback, or just want to say hi? We are a small team and we read every message.
          </p>
        </div>
      </section>

      <section className="container-app py-20 grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="font-display font-bold text-2xl mb-8">Contact Details</h2>
          <div className="space-y-5">
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-accent text-white">
                  <item.icon size={17} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="font-medium hover:text-accent transition" target="_blank" rel="noopener noreferrer">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <a href="mailto:support@myfittt.com" className="inline-flex items-center justify-center gap-2 rounded-xl gradient-accent text-white px-6 py-3 font-semibold hover:opacity-90 transition">
              <Mail size={16} /> Email Us Now
            </a>
          </div>

        </div>

        <div>
          <h2 className="font-display font-bold text-2xl mb-8">How to Reach Us</h2>
          <div className="space-y-5">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="shrink-0 h-10 w-10 rounded-xl gradient-accent text-white grid place-items-center font-display font-bold text-sm">
                  {s.step}
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border/60 bg-secondary/30 p-6">
            <h3 className="font-display font-semibold mb-2">Tips for a faster reply</h3>
            <ul className="text-sm text-muted-foreground space-y-2 mt-3">
              <li className="flex items-start gap-2"><span className="text-accent font-bold mt-0.5">→</span> Include your registered email address</li>
              <li className="flex items-start gap-2"><span className="text-accent font-bold mt-0.5">→</span> Mention your booking ID if it is a payment issue</li>
              <li className="flex items-start gap-2"><span className="text-accent font-bold mt-0.5">→</span> Add screenshots if there is a technical problem</li>
              <li className="flex items-start gap-2"><span className="text-accent font-bold mt-0.5">→</span> Be as specific as possible so we can help faster</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}