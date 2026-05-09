import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSavedIds, toggleSaved } from "@/lib/savedCreators";
import { BadgeCheck, Heart, Lock } from "lucide-react";
import { RatingStars } from "./RatingStars";
import { authService, type PublicCreator } from "@/services/backendService";
import { useState } from "react";

interface CreatorCardProps {
  creator: PublicCreator;
  variant?: "public" | "dashboard";
}

export function CreatorCard({ creator, variant = "public" }: CreatorCardProps) {
  const navigate  = useNavigate();
  const location  = useLocation();

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
  const isLoggedIn = authService.isLoggedIn();

  const goToLogin = () =>
    navigate("/login", { state: { returnTo: location.pathname } });

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { goToLogin(); return; }
    setSaved(toggleSaved(id));
  };

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { goToLogin(); return; }
    navigate(profilePath);
  };

  return (
    <Card className="group overflow-hidden border-border/60 shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <Link to={profilePath} className="block relative">
        <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl} alt={name} loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="font-display font-bold text-3xl text-accent select-none">{initials}</span>
          )}
        </div>
        {/* Save button */}
        <button
          onClick={handleToggleSave}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-colors ${
            saved ? "bg-red-500 text-white" : "bg-black/30 text-white hover:bg-black/50"
          }`}
        >
          <Heart size={13} fill={saved ? "currentColor" : "none"} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Name + verified */}
        <div>
          <div className="flex items-center gap-1">
            <h3 className="font-display font-semibold text-sm leading-tight truncate">{name}</h3>
            {verified && <BadgeCheck size={13} className="text-accent shrink-0" />}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{subtitle}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <RatingStars rating={rating} />
          <span className="text-[11px] font-medium">{rating > 0 ? rating : "New"}</span>
          {reviews > 0 && <span className="text-[10px] text-muted-foreground">({reviews})</span>}
        </div>

        {/* Price */}
        <div>
          {dailyPrice > 0 ? (
            <>
              <span className="font-display font-bold text-base text-primary">₹{dailyPrice.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground">/session</span>
            </>
          ) : monthlyPrice > 0 ? (
            <>
              <span className="font-display font-bold text-base text-primary">₹{monthlyPrice.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground">/mo</span>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground italic">TBD</span>
          )}
        </div>

        {/* Buttons */}
        {variant === "dashboard" ? (
          <div className="flex flex-col gap-1.5">
            <Button
              size="sm"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-8"
              onClick={handleBook}
            >
              {!isLoggedIn && <Lock size={11} className="mr-1" />} Book
            </Button>
            <Button
              size="sm" variant="outline"
              className="w-full text-xs h-8"
              onClick={() => navigate(profilePath)}
            >
              View
            </Button>
          </div>
        ) : (
          <Button
            asChild size="sm"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-8"
          >
            <Link to={profilePath}>View Profile</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}