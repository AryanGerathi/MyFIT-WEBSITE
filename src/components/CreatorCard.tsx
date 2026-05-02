import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSavedIds, toggleSaved } from "@/lib/savedCreators";
import { BadgeCheck, Heart } from "lucide-react";
import { RatingStars } from "./RatingStars";
import type { PublicCreator } from "@/services/backendService";
import { useState } from "react";

interface CreatorCardProps {
  creator: PublicCreator;
  variant?: "public" | "dashboard";
}

export function CreatorCard({ creator, variant = "public" }: CreatorCardProps) {
  const navigate = useNavigate();

  const id           = creator._id;
  const name         = creator.name;
  const imageUrl     = creator.profileImage?.url ?? "";
  const specialty    = creator.creatorProfile?.specialization ?? "";
  const bio          = creator.creatorProfile?.bio ?? "";
  const dailyPrice   = creator.creatorProfile?.dailyPrice ?? 0;
  const monthlyPrice = creator.creatorProfile?.monthlyPrice ?? 0;
  const rating       = creator.creatorProfile?.rating ?? 0;
  const reviews      = creator.creatorProfile?.reviews ?? 0;
  const verified     = creator.creatorProfile?.verified ?? false;

  const subtitle    = specialty || bio || "Personal Trainer";
  const initials    = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const profilePath = variant === "dashboard" ? `/dashboard/creator/${id}` : `/creator/${id}`;

  const [saved, setSaved] = useState(() => getSavedIds().includes(id));

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleSaved(id);
    setSaved(nowSaved);
  };

  return (
    <Card className="group overflow-hidden border-border/60 shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
      <Link to={profilePath} className="block relative">
        <div className="aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="font-display font-bold text-2xl sm:text-4xl text-accent select-none">
              {initials}
            </span>
          )}
        </div>
        <button
          onClick={handleToggleSave}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-colors ${
            saved ? "bg-red-500 text-white" : "bg-black/30 text-white hover:bg-black/50"
          }`}
        >
          <Heart size={12} fill={saved ? "currentColor" : "none"} />
        </button>
      </Link>

      <div className="p-2.5 sm:p-5 space-y-2 sm:space-y-3">
        {/* Name + badge row */}
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-display font-semibold text-sm sm:text-lg leading-tight truncate">
                {name}
              </h3>
              {verified && <BadgeCheck size={13} className="text-accent shrink-0" />}
            </div>
            <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
              {subtitle}
            </p>
          </div>
          {specialty && (
            <Badge variant="secondary" className="hidden sm:inline-flex shrink-0 font-medium text-xs">
              {specialty}
            </Badge>
          )}
        </div>

        {/* Rating + price */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div className="flex items-center gap-1">
            <RatingStars rating={rating} />
            <span className="text-[11px] sm:text-sm font-medium">{rating > 0 ? rating : "New"}</span>
            {reviews > 0 && (
              <span className="text-[10px] sm:text-xs text-muted-foreground">({reviews})</span>
            )}
          </div>
          <div className="text-left sm:text-right">
            {dailyPrice > 0 ? (
              <>
                <span className="font-display font-bold text-sm sm:text-lg text-primary">
                  ₹{dailyPrice.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">/session</span>
              </>
            ) : monthlyPrice > 0 ? (
              <>
                <span className="font-display font-bold text-sm sm:text-lg text-primary">
                  ₹{monthlyPrice.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">/mo</span>
              </>
            ) : (
              <span className="text-[10px] sm:text-xs text-muted-foreground italic">TBD</span>
            )}
          </div>
        </div>

        {/* Buttons */}
        {variant === "dashboard" ? (
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
            <Button
              size="sm"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm h-8 sm:h-9"
              onClick={() => navigate(profilePath)}
            >
              Book
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
              onClick={() => navigate(profilePath)}
            >
              View
            </Button>
          </div>
        ) : (
          <Button
            asChild
            size="sm"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm h-8 sm:h-9"
          >
            <Link to={profilePath}>View Profile</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}