import { useMemo, useState } from "react";
import { CreatorCard } from "@/components/CreatorCard";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { creators } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const categories = ["All", "Fat Loss", "Muscle Gain", "Yoga", "Cardio", "Strength"];

function Filters({
  category, setCategory, price, setPrice, minRating, setMinRating,
}: {
  category: string; setCategory: (v: string) => void;
  price: number; setPrice: (v: number) => void;
  minRating: number; setMinRating: (v: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="font-display font-semibold mb-3 block">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="font-display font-semibold mb-3 block">Max Price: ₹{price}</Label>
        <Slider value={[price]} onValueChange={([v]) => setPrice(v)} min={300} max={1500} step={50} />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>₹300</span><span>₹1,500</span>
        </div>
      </div>
      <div>
        <Label className="font-display font-semibold mb-3 block">Min Rating: {minRating}★</Label>
        <Slider value={[minRating]} onValueChange={([v]) => setMinRating(v)} min={3} max={5} step={0.5} />
      </div>
    </div>
  );
}

const Explore = () => {
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState(1500);
  const [minRating, setMinRating] = useState(3);
  const [sort, setSort] = useState("popular");

  const filtered = useMemo(() => {
    let list = creators.filter((c) =>
      (category === "All" || c.category === category) &&
      c.price <= price &&
      c.rating >= minRating,
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "popular") list = [...list].sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [category, price, minRating, sort]);

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Explore Creators</h1>
        <p className="text-muted-foreground mt-2">{filtered.length} trainers ready to coach you</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* desktop filters */}
        <aside className="hidden lg:block">
          <Card className="p-5 sticky top-24 border-border/60 shadow-card">
            <h2 className="font-display font-semibold mb-5">Filters</h2>
            <Filters category={category} setCategory={setCategory} price={price} setPrice={setPrice} minRating={minRating} setMinRating={setMinRating} />
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
              <SheetContent side="left" className="w-80">
                <h2 className="font-display font-semibold mb-5 mt-4">Filters</h2>
                <Filters category={category} setCategory={setCategory} price={price} setPrice={setPrice} minRating={minRating} setMinRating={setMinRating} />
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
            <Card className="p-12 text-center text-muted-foreground">No creators match your filters.</Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((c) => <CreatorCard key={c.id} creator={c} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
