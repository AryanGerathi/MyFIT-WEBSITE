import { useMemo, useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, BadgeCheck, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RatingStars } from "@/components/RatingStars";
import { Link } from "react-router-dom";
import { creatorService, type PublicCreator } from "@/services/backendService";

const STATIC_CATEGORIES = ["All", "Fat Loss", "Muscle Gain", "Yoga", "Cardio", "Strength", "General"];
const MAX_RETRIES = 3;
const RETRY_DELAYS = [4000, 8000, 12000];

// ── Filters panel ─────────────────────────────────────────────────────────────
function Filters({
  categories,
  category, setCategory,
  price,    setPrice,
  minRating, setMinRating,
  priceType, setPriceType,
}: {
  categories: string[];
  category: string;   setCategory:  (v: string) => void;
  price: number;      setPrice:     (v: number) => void;
  minRating: number;  setMinRating: (v: number) => void;
  priceType: "monthly" | "session"; setPriceType: (v: "monthly" | "session") => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="font-display font-semibold mb-3 block">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Type Toggle */}
      <div>
        <Label className="font-display font-semibold mb-3 block">Price Type</Label>
        <div className="flex rounded-md border border-border overflow-hidden text-xs font-medium">
          <button
            onClick={() => { setPriceType("monthly"); setPrice(5000); }}
            className={`flex-1 py-1.5 transition-colors ${
              priceType === "monthly"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => { setPriceType("session"); setPrice(5000); }}
            className={`flex-1 py-1.5 transition-colors ${
              priceType === "session"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Per Session
          </button>
        </div>
      </div>

      <div>
        <Label className="font-display font-semibold mb-3 block">
          Max {priceType === "monthly" ? "Monthly" : "Per Session"} Price: ₹{price.toLocaleString()}
        </Label>
        <Slider
          value={[price]}
          onValueChange={([v]) => setPrice(v)}
          min={300} max={100000} step={50}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>₹300</span><span>₹1,00,000</span>
        </div>
      </div>

      <div>
        <Label className="font-display font-semibold mb-3 block">
          Min Rating: {minRating > 0 ? `${minRating}★` : "Any"}
        </Label>
        <Slider
          value={[minRating]}
          onValueChange={([v]) => setMinRating(v)}
          min={0} max={5} step={0.5}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Any</span><span>5★</span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const Explore = () => {
  const [creators,    setCreators]    = useState<PublicCreator[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [retryCount,  setRetryCount]  = useState(0);
  const [retryingIn,  setRetryingIn]  = useState<number | null>(null);

  const [category,  setCategory]  = useState("All");
  const [price,     setPrice]     = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [sort,      setSort]      = useState("popular");
  const [priceType, setPriceType] = useState<"monthly" | "session">("monthly");

  useEffect(() => {
    setLoading(true);
    setError(null);
    setRetryingIn(null);

    creatorService.getVerifiedCreators()
      .then(({ creators }) => {
        setCreators(creators);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (retryCount < MAX_RETRIES) {
          const delayMs = RETRY_DELAYS[retryCount] ?? 10000;
          let remaining = Math.round(delayMs / 1000);
          setRetryingIn(remaining);
          setLoading(true);

          const countdown = setInterval(() => {
            remaining -= 1;
            setRetryingIn(remaining);
            if (remaining <= 0) clearInterval(countdown);
          }, 1000);

          const retryTimer = setTimeout(() => {
            clearInterval(countdown);
            setRetryCount((n) => n + 1);
          }, delayMs);

          return () => { clearInterval(countdown); clearTimeout(retryTimer); };
        } else {
          setError(err.message);
          setLoading(false);
        }
      });
  }, [retryCount]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    creators.forEach((c) => {
      if (c.creatorProfile?.specialization) seen.add(c.creatorProfile.specialization);
    });
    const extra = [...seen].filter((c) => !STATIC_CATEGORIES.includes(c));
    return ["All", ...STATIC_CATEGORIES.slice(1), ...extra];
  }, [creators]);

  const filtered = useMemo(() => {
    let list = creators.filter((c) => {
      const monthly    = c.creatorProfile?.monthlyPrice   ?? 0;
      const sessions   = c.creatorProfile?.monthlySessions ?? 1;
      const perSession = sessions > 0 ? Math.round(monthly / sessions) : 0;
      const priceVal   = priceType === "monthly" ? monthly : perSession;
      const rating     = c.creatorProfile?.rating ?? 0;
      const spec       = c.creatorProfile?.specialization ?? "";

      return (
        (category === "All" || spec === category) &&
        (priceVal === 0 || priceVal <= price) &&
        rating >= minRating
      );
    });

    if (sort === "price-asc")  list = [...list].sort((a, b) => {
      const getPrice = (c: PublicCreator) => {
        const m = c.creatorProfile?.monthlyPrice ?? 0;
        const s = c.creatorProfile?.monthlySessions ?? 1;
        return priceType === "monthly" ? m : Math.round(m / s);
      };
      return getPrice(a) - getPrice(b);
    });
    if (sort === "price-desc") list = [...list].sort((a, b) => {
      const getPrice = (c: PublicCreator) => {
        const m = c.creatorProfile?.monthlyPrice ?? 0;
        const s = c.creatorProfile?.monthlySessions ?? 1;
        return priceType === "monthly" ? m : Math.round(m / s);
      };
      return getPrice(b) - getPrice(a);
    });
    if (sort === "rating")  list = [...list].sort((a, b) => (b.creatorProfile?.rating  ?? 0) - (a.creatorProfile?.rating  ?? 0));
    if (sort === "popular") list = [...list].sort((a, b) => (b.creatorProfile?.reviews ?? 0) - (a.creatorProfile?.reviews ?? 0));
    return list;
  }, [creators, category, price, minRating, sort, priceType]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    const isColdStart = retryCount > 0;
    return (
      <div className="container-app py-10 flex items-center justify-center h-60">
        <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
          <Loader2 className="animate-spin" size={28} />
          <span className="text-sm font-medium">
            {isColdStart
              ? `Server is waking up… retrying in ${retryingIn ?? "…"}s`
              : "Loading verified creators…"}
          </span>
          {isColdStart && (
            <span className="text-xs opacity-60 max-w-xs">
              Render free tier spins down after inactivity. This takes up to 30 seconds.
            </span>
          )}
          {isColdStart && (
            <span className="text-xs opacity-50">
              Attempt {retryCount} of {MAX_RETRIES}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container-app py-10">
        <Card className="p-10 flex flex-col items-center gap-4 text-center border-destructive/30">
          <AlertCircle size={36} className="text-destructive" />
          <div>
            <p className="font-semibold text-lg">Could not load creators</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">{error}</p>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm bg-muted/50 rounded-lg px-4 py-2">
            💡 The server may still be cold-starting. Wait 30 seconds and retry, or check your internet connection.
          </p>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => { setError(null); setRetryCount(0); }}
          >
            <RefreshCw size={14} /> Try again
          </Button>
        </Card>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Explore Creators</h1>
        <p className="text-muted-foreground mt-2">
          {filtered.length} verified trainer{filtered.length !== 1 ? "s" : ""} ready to coach you
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="hidden lg:block">
          <Card className="p-5 sticky top-24 border-border/60 shadow-card">
            <h2 className="font-display font-semibold mb-5">Filters</h2>
            <Filters
              categories={categories}
              category={category}   setCategory={setCategory}
              price={price}         setPrice={setPrice}
              minRating={minRating} setMinRating={setMinRating}
              priceType={priceType} setPriceType={setPriceType}
            />
          </Card>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-6 gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden gap-2">
                  <Filter size={16} /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <h2 className="font-display font-semibold mb-5 mt-4">Filters</h2>
                <Filters
                  categories={categories}
                  category={category}   setCategory={setCategory}
                  price={price}         setPrice={setPrice}
                  minRating={minRating} setMinRating={setMinRating}
                  priceType={priceType} setPriceType={setPriceType}
                />
              </SheetContent>
            </Sheet>

            <div className="ml-auto flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">Sort by:</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popularity</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              No verified creators match your filters.
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((c) => {
                const initials   = c.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
                const monthly    = c.creatorProfile?.monthlyPrice    ?? 0;
                const sessions   = c.creatorProfile?.monthlySessions ?? 1;
                const perSession = sessions > 0 ? Math.round(monthly / sessions) : 0;
                const displayPrice = priceType === "monthly" ? monthly : perSession;
                const rating     = c.creatorProfile?.rating   ?? 0;
                const reviews    = c.creatorProfile?.reviews  ?? 0;
                const specialty  = c.creatorProfile?.specialization ?? "";

                return (
                  <Card
                    key={c._id}
                    className="flex items-center gap-5 p-4 border-border/60 shadow-card hover:shadow-soft transition-shadow"
                  >
                    {/* Avatar */}
                    <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 bg-accent/10 flex items-center justify-center border border-border">
                      {c.profileImage?.url ? (
                        <img src={c.profileImage.url} alt={c.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-display font-bold text-xl text-accent">{initials}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-display font-semibold text-base">{c.name}</span>
                        <BadgeCheck size={15} className="text-accent" />
                        {specialty && (
                          <Badge variant="secondary" className="text-xs">{specialty}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {c.creatorProfile?.bio || "—"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <RatingStars rating={rating} />
                        <span className="text-sm font-medium">{rating > 0 ? rating : "New"}</span>
                        {reviews > 0 && (
                          <span className="text-xs text-muted-foreground">({reviews})</span>
                        )}
                      </div>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        {displayPrice > 0 ? (
                          <>
                            <span className="font-display font-bold text-lg text-primary">
                              ₹{displayPrice.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              /{priceType === "monthly" ? "month" : "session"}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Pricing TBD</span>
                        )}
                      </div>
                      <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link to={`/creator/${c._id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;