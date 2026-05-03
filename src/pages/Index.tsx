import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/data/mock";
import { ArrowRight, Search, Calendar, Trophy, Sparkles, BadgeCheck, Loader2, LogIn, UserPlus } from "lucide-react";
import { RatingStars } from "@/components/RatingStars";
import { creatorService, authService, type PublicCreator } from "@/services/backendService";

const Index = () => {
  const [featured, setFeatured] = useState<PublicCreator[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const isLoggedIn = authService.isLoggedIn();
  const user = authService.getStoredUser();

  useEffect(() => {
    creatorService.getVerifiedCreators()
      .then(({ creators }) => {
        const sorted = [...creators].sort(
          (a, b) => (b.creatorProfile?.reviews ?? 0) - (a.creatorProfile?.reviews ?? 0)
        );
        setFeatured(sorted.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoadingCreators(false));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, hsl(222 89% 55% / 0.6), transparent 40%), radial-gradient(circle at 80% 70%, hsl(210 95% 60% / 0.4), transparent 40%)"
        }} />
        <div className="container-app relative py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white animate-fade-in-up">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur text-sm mb-6">
              <Sparkles size={14} className="text-accent" />
              India's #1 fitness creator marketplace
            </div>

            {/* Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              Train with Top<br />
              <span className="bg-gradient-to-r from-accent to-blue-300 bg-clip-text text-transparent">
                Fitness Creators
              </span>
            </h1>

            <p className="mt-5 text-lg text-white/80 max-w-lg">
              Book 1-on-1 sessions with India's best certified trainers and transform your body — on your schedule.
            </p>

            {/* Primary CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow">
                <Link to="/explore">
                  Explore Creators <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>

              {isLoggedIn ? (
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
                  <Link to={user?.role === "creator" ? "/creator-dashboard" : "/dashboard"}>
                    Go to Dashboard <ArrowRight size={16} className="ml-1" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
                  <Link to="/signup?role=creator">Become a Trainer</Link>
                </Button>
              )}
            </div>

            {/* Login / Sign up row — guests only */}
            {!isLoggedIn && (
              <div className="mt-5 flex items-center gap-3 flex-wrap">
                <Button
                  asChild
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90 font-semibold gap-1.5 shadow-sm"
                >
                  <Link to="/login">
                    <LogIn size={14} /> Login
                  </Link>
                </Button>
                <span className="text-white/50 text-sm">or</span>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-white/50 text-white bg-white/10 hover:bg-white/20 hover:text-white font-semibold gap-1.5"
                >
                  <Link to="/signup">
                    <UserPlus size={14} /> Sign up free
                  </Link>
                </Button>
              </div>
            )}

            {/* Logged-in greeting */}
            {isLoggedIn && user && (
              <p className="mt-5 text-sm text-white/60">
                Welcome back,{" "}
                <span className="text-white font-medium">{user.name.split(" ")[0]}</span> 👋
              </p>
            )}

            {/* Stats */}
            <div className="mt-10 flex items-center gap-6 text-sm">
              <div>
                <div className="font-display font-bold text-2xl text-white">500+</div>
                <div className="text-white/60">Trainers</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="font-display font-bold text-2xl text-white">25k+</div>
                <div className="text-white/60">Sessions</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="font-display font-bold text-2xl text-white">4.9★</div>
                <div className="text-white/60">Avg rating</div>
              </div>
            </div>
          </div>

          {/* Hero images */}
          <div className="relative animate-scale-in">
            <div className="absolute -inset-4 bg-accent/30 blur-3xl rounded-full" />
            <div className="relative grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop" alt="Strength training" loading="lazy" className="rounded-2xl shadow-2xl object-cover h-64 w-full mt-8" />
              <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop" alt="Yoga session" loading="lazy" className="rounded-2xl shadow-2xl object-cover h-64 w-full" />
              <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop" alt="HIIT workout" loading="lazy" className="rounded-2xl shadow-2xl object-cover h-64 w-full" />
              <img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop" alt="Running coach" loading="lazy" className="rounded-2xl shadow-2xl object-cover h-64 w-full mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CREATORS */}
      <section className="container-app py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl">Featured Creators</h2>
            <p className="text-muted-foreground mt-2">Hand-picked trainers ready to coach you this week</p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/explore">View all <ArrowRight size={16} className="ml-1" /></Link>
          </Button>
        </div>

        {loadingCreators ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm">Loading creators…</span>
          </div>
        ) : featured.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            No verified creators available right now.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((c) => {
              const initials = c.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
              const monthly = c.creatorProfile?.monthlyPrice ?? 0;
              const sessions = c.creatorProfile?.monthlySessions ?? 1;
              const perSession = sessions > 0 ? Math.round(monthly / sessions) : 0;
              const rating = c.creatorProfile?.rating ?? 0;
              const reviews = c.creatorProfile?.reviews ?? 0;
              const specialty = c.creatorProfile?.specialization ?? "";

              return (
                <Card
                  key={c._id}
                  className="flex flex-col border-border/60 shadow-card hover:shadow-soft transition-shadow overflow-hidden"
                >
                  <div className="h-44 bg-accent/10 flex items-center justify-center relative overflow-hidden">
                    {c.profileImage?.url ? (
                      <img src={c.profileImage.url} alt={c.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-display font-bold text-5xl text-accent/40">{initials}</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-display font-semibold text-base leading-tight">{c.name}</span>
                      <BadgeCheck size={14} className="text-accent shrink-0" />
                    </div>
                    {specialty && (
                      <Badge variant="secondary" className="text-xs w-fit mt-1">{specialty}</Badge>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 flex-1">
                      {c.creatorProfile?.bio || "—"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <RatingStars rating={rating} />
                      <span className="text-sm font-medium">{rating > 0 ? rating : "New"}</span>
                      {reviews > 0 && (
                        <span className="text-xs text-muted-foreground">({reviews})</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                      <div>
                        {monthly > 0 ? (
                          <>
                            <span className="font-display font-bold text-base text-primary">
                              ₹{perSession.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">/session</span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Pricing TBD</span>
                        )}
                      </div>
                      <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link to={`/creator/${c._id}`}>Book</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-secondary/40 py-20">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl">How it works</h2>
            <p className="text-muted-foreground mt-2">Three steps from sign-up to your first transformation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: "Browse Trainers", desc: "Filter by goal, price, and rating to find your perfect coach." },
              { icon: Calendar, title: "Book Session", desc: "Pick a time that works for you. Pay securely with UPI or card." },
              { icon: Trophy, title: "Join & Transform", desc: "Show up, train hard, and watch your body change." },
            ].map((step, i) => (
              <Card key={i} className="p-7 shadow-card border-border/60 relative overflow-hidden group hover:shadow-soft transition">
                <span className="absolute -top-4 -right-4 font-display font-extrabold text-7xl text-accent/10 group-hover:text-accent/20 transition">0{i + 1}</span>
                <div className="grid h-12 w-12 place-items-center rounded-xl gradient-accent text-white shadow-glow">
                  <step.icon size={20} />
                </div>
                <h3 className="font-display font-semibold text-xl mt-4">{step.title}</h3>
                <p className="text-muted-foreground mt-2">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-app py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl">Real results, real people</h2>
          <p className="text-muted-foreground mt-2">Members are crushing their goals with MyFit</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="p-6 shadow-card border-border/60">
              <p className="text-foreground/90 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border/60">
                <img src={t.image} alt={t.name} loading="lazy" className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA — auth-aware */}
      <section className="container-app pb-20">
        <div className="rounded-3xl gradient-hero p-10 lg:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, hsl(222 89% 55% / 0.6), transparent 50%)"
          }} />
          <div className="relative">
            {isLoggedIn && user ? (
              <>
                <h2 className="font-display font-bold text-3xl sm:text-4xl">
                  Ready for your next session, {user.name.split(" ")[0]}?
                </h2>
                <p className="text-white/80 mt-3 max-w-xl mx-auto">
                  Browse top trainers and book your next session today.
                </p>
                <Button asChild size="lg" className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow">
                  <Link to="/explore">Find your trainer <ArrowRight size={16} className="ml-1" /></Link>
                </Button>
              </>
            ) : (
              <>
                <h2 className="font-display font-bold text-3xl sm:text-4xl">
                  Ready to start your transformation?
                </h2>
                <p className="text-white/80 mt-3 max-w-xl mx-auto">
                  Join thousands transforming their bodies with India's top fitness creators.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow">
                    <Link to="/signup">
                      <UserPlus size={16} className="mr-1.5" /> Sign up free
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
                    <Link to="/login">
                      <LogIn size={16} className="mr-1.5" /> Login
                    </Link>
                  </Button>
                </div>
                <p className="mt-4 text-white/50 text-sm">
                  Already a trainer?{" "}
                  <Link to="/signup?role=creator" className="text-white/80 hover:text-white underline underline-offset-2 transition-colors">
                    Join as a creator
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;