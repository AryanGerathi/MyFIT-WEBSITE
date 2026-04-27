import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck } from "lucide-react";
import { RatingStars } from "./RatingStars";
import type { PublicCreator } from "@/services/backendService";

interface CreatorCardProps {
  creator: PublicCreator;
  variant?: "public" | "dashboard";
}

export function CreatorCard({ creator, variant = "public" }: CreatorCardProps) {
  const navigate = useNavigate();

  const id         = creator._id;
  const name       = creator.name;
  const imageUrl   = creator.profileImage?.url ?? "";
  const specialty  = creator.creatorProfile?.specialization ?? "";
  const bio        = creator.creatorProfile?.bio ?? "";
  const dailyPrice = creator.creatorProfile?.dailyPrice ?? 0;
  const rating     = creator.creatorProfile?.rating ?? 0;
  const reviews    = creator.creatorProfile?.reviews ?? 0;
  const verified   = creator.creatorProfile?.verified ?? false;

  const subtitle = specialty || bio || "Personal Trainer";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const profilePath =
    variant === "dashboard" ? `/dashboard/creator/${id}` : `/creator/${id}`;

  const handleBookNow = () => {
    const bookingPath = variant === "dashboard" ? "/dashboard/booking" : "/booking";
    navigate(bookingPath, {
      state: {
        creatorId:    id,
        creatorName:  name,
        creatorImage: imageUrl,
        price:        dailyPrice,
      },
    });
  };

  return (
    <Card className="group overflow-hidden border-border/60 shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
      <Link to={profilePath} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="font-display font-bold text-4xl text-accent select-none">
              {initials}
            </span>
          )}
        </div>
      </Link>

      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-semibold text-lg leading-tight">{name}</h3>
              {verified && <BadgeCheck size={16} className="text-accent" />}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{subtitle}</p>
          </div>
          {specialty && (
            <Badge variant="secondary" className="shrink-0 font-medium">
              {specialty}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <RatingStars rating={rating} />
            <span className="text-sm font-medium">{rating > 0 ? rating : "New"}</span>
            {reviews > 0 && (
              <span className="text-xs text-muted-foreground">({reviews})</span>
            )}
          </div>
          <div className="text-right">
            {dailyPrice > 0 ? (
              <>
                <span className="font-display font-bold text-lg text-primary">
                  ₹{dailyPrice.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">/session</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">Pricing TBD</span>
            )}
          </div>
        </div>

        {variant === "dashboard" ? (
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleBookNow}
            >
              Book Session
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(profilePath)}
            >
              View Profile
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to={profilePath}>View Profile</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}