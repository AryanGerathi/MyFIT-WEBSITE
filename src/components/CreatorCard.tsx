import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck } from "lucide-react";
import { RatingStars } from "./RatingStars";
import type { Creator } from "@/data/mock";

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Card className="group overflow-hidden border-border/60 shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
      <Link to={`/creator/${creator.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={creator.image}
            alt={creator.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-semibold text-lg leading-tight">{creator.name}</h3>
              {creator.verified && <BadgeCheck size={16} className="text-accent" />}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{creator.specialty}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 font-medium">
            {creator.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <RatingStars rating={creator.rating} />
            <span className="text-sm font-medium">{creator.rating}</span>
            <span className="text-xs text-muted-foreground">({creator.reviews})</span>
          </div>
          <div className="text-right">
            <span className="font-display font-bold text-lg text-primary">₹{creator.price}</span>
            <span className="text-xs text-muted-foreground">/session</span>
          </div>
        </div>

        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link to={`/creator/${creator.id}`}>View Profile</Link>
        </Button>
      </div>
    </Card>
  );
}
