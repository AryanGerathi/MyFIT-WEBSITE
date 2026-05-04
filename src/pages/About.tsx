import { Link } from "react-router-dom";
import { Dumbbell, Target, Users, Zap, Heart } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description:
      "We exist to democratize access to elite fitness coaching — making world-class trainers available to everyone, not just the privileged few.",
  },
  {
    icon: Users,
    title: "Creator-First",
    description:
      "Fitness creators are athletes, educators, and entrepreneurs. We build tools that let them focus on what they do best: transforming lives.",
  },
  {
    icon: Zap,
    title: "Results Obsessed",
    description:
      "Every feature we ship is measured by one question: does it help someone get fitter, faster? If not, it doesn't ship.",
  },
  {
    icon: Heart,
    title: "Built for India",
    description:
      "From UPI payments to regional language support, MyFit is built ground-up for Indian users — not adapted from a Western product.",
  },
];

export default function About() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 gradient-accent opacity-5 pointer-events-none" />
        <div className="container-app py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent font-medium mb-6">
            <Dumbbell size={14} /> Our Story
          </div>
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-tight mb-6">
            India's Fitness Revolution<br />
            <span className="text-accent">Starts Here</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            MyFit was born from a simple observation: the best fitness creators in India had no
            platform built for them. We're changing that — one session at a time.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container-app py-20 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-display font-bold text-3xl mb-5">Why We Built MyFit</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              In 2024, a group of fitness enthusiasts and engineers noticed something frustrating:
              India had thousands of world-class fitness creators — but no platform that treated
              them as professionals.
            </p>
            <p>
              Trainers were juggling WhatsApp groups, Google Forms, and UPI QR codes just to
              manage their clients. Users had no way to discover, verify, or book vetted coaches.
              The ecosystem was broken.
            </p>
            <p>
              So we built MyFit — a marketplace that gives creators professional-grade tools and
              gives users a trusted, seamless way to find their perfect fitness match.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Active Creators", value: "500+" },
            { label: "Sessions Booked", value: "12,000+" },
            { label: "Cities Covered", value: "30+" },
            { label: "User Rating", value: "4.9 ★" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/60 bg-secondary/30 p-6 text-center"
            >
              <p className="font-display font-bold text-3xl text-accent">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border/60 bg-secondary/20">
        <div className="container-app py-20">
          <h2 className="font-display font-bold text-3xl text-center mb-12">What We Stand For</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border/60 bg-background p-6 hover:border-accent/40 transition"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl gradient-accent text-white mb-4">
                  <v.icon size={18} />
                </div>
                <h3 className="font-display font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-app py-20 text-center">
        <h2 className="font-display font-bold text-3xl mb-4">Ready to Transform?</h2>
        <p className="text-muted-foreground mb-8">
          Join thousands of Indians already training with MyFit's top creators.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl gradient-accent text-white px-8 py-3 font-semibold hover:opacity-90 transition"
        >
          Explore Creators
        </Link>
      </section>
    </main>
  );
}