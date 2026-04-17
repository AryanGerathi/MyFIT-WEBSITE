import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { creators, reviews, timeSlots } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { RatingStars } from "@/components/RatingStars";
import { BadgeCheck, Users, Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CreatorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const creator = creators.find((c) => c.id === id);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slot, setSlot] = useState<string | null>(null);

  if (!creator) return <Navigate to="/explore" replace />;

  const book = () => {
    if (!date || !slot) {
      toast.error("Please select a date and time slot");
      return;
    }
    sessionStorage.setItem("myfit:booking", JSON.stringify({
      creatorId: creator.id,
      creatorName: creator.name,
      creatorImage: creator.image,
      price: creator.price,
      date: date.toISOString(),
      time: slot,
    }));
    navigate("/booking");
  };

  return (
    <div className="container-app py-10 space-y-8">
      {/* TOP */}
      <Card className="overflow-hidden border-border/60 shadow-card">
        <div className="grid md:grid-cols-[280px_1fr] gap-0">
          <div className="aspect-square md:aspect-auto bg-muted">
            <img src={creator.image} alt={creator.name} className="h-full w-full object-cover" />
          </div>
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-bold text-3xl">{creator.name}</h1>
              {creator.verified && <BadgeCheck className="text-accent" />}
              <Badge variant="secondary">{creator.category}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{creator.specialty}</p>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <RatingStars rating={creator.rating} />
                <span className="font-semibold">{creator.rating}</span>
                <span className="text-sm text-muted-foreground">({creator.reviews} reviews)</span>
              </div>
              <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                <Users size={14} /> {creator.followers.toLocaleString()} followers
              </span>
            </div>

            <p className="mt-4 text-foreground/80 leading-relaxed">{creator.bio}</p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="rounded-lg border border-border/60 p-3 text-center">
                <div className="text-xs text-muted-foreground">Price</div>
                <div className="font-display font-bold text-xl text-primary">₹{creator.price}</div>
              </div>
              <div className="rounded-lg border border-border/60 p-3 text-center">
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1 justify-center"><Award size={12}/> Experience</div>
                <div className="font-display font-bold text-xl">{creator.experience}y</div>
              </div>
              <div className="rounded-lg border border-border/60 p-3 text-center">
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1 justify-center"><Sparkles size={12}/> Specialty</div>
                <div className="font-semibold text-sm mt-1 truncate">{creator.category}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* BOOK */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/60 shadow-card">
          <h2 className="font-display font-semibold text-xl mb-4">Pick a date</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
            className={cn("p-3 pointer-events-auto rounded-lg border")}
          />
        </Card>
        <Card className="p-6 border-border/60 shadow-card">
          <h2 className="font-display font-semibold text-xl mb-4">Available time slots</h2>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((t) => (
              <Button
                key={t}
                variant={slot === t ? "default" : "outline"}
                className={cn(slot === t && "bg-accent text-accent-foreground hover:bg-accent/90")}
                onClick={() => setSlot(t)}
              >
                {t}
              </Button>
            ))}
          </div>
          <Button onClick={book} size="lg" className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
            Book Session — ₹{creator.price}
          </Button>
        </Card>
      </div>

      {/* REVIEWS */}
      <div>
        <h2 className="font-display font-bold text-2xl mb-5">Reviews</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <Card key={r.id} className="p-5 border-border/60 shadow-card">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{r.user}</div>
                <span className="text-xs text-muted-foreground">{r.date}</span>
              </div>
              <RatingStars rating={r.rating} className="mt-1" />
              <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{r.comment}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
