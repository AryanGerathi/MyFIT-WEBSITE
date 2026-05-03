import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { reviewService } from "@/services/backendService";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  open:        boolean;
  onClose:     () => void;
  bookingId:   string;
  creatorName: string;
  creatorId:   string;
  onSubmitted: () => void;
}

export function ReviewModal({
  open, onClose, bookingId, creatorName, creatorId,
}: ReviewModalProps) {
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [comment,   setComment]   = useState("");
  const [saving,    setSaving]    = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setRating(0);
    setHovered(0);
    setComment("");
    setSubmitted(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (rating === 0)          { toast.error("Please select a star rating");            return; }
    if (!comment.trim())       { toast.error("Please write a short review");            return; }
    if (comment.trim().length < 10) { toast.error("Review must be at least 10 characters"); return; }

    setSaving(true);
    try {
      await reviewService.submitReview({ bookingId, creatorId, rating, comment: comment.trim() });
      setSubmitted(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not submit review. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const starLabel = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  const activeRating = hovered || rating;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] rounded-2xl p-0 overflow-hidden">

        {/* ── Success State ── */}
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-12 px-8 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Review submitted!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Thanks for rating <span className="font-medium text-foreground">{creatorName}</span>.
                Your feedback helps others find great trainers.
              </p>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={22}
                  className={i < rating ? "fill-amber-400 text-amber-400" : "text-border"}
                />
              ))}
            </div>
            <Button onClick={handleClose} className="mt-2 bg-accent text-accent-foreground w-full">
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="px-6 pt-6 pb-4 border-b border-border/60">
              <DialogHeader className="text-left space-y-1">
                <DialogTitle className="font-display text-lg">
                  Rate your session
                </DialogTitle>
                <DialogDescription className="text-sm">
                  How was your session with{" "}
                  <span className="font-medium text-foreground">{creatorName}</span>?
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* ── Body ── */}
            <div className="px-6 py-5 space-y-5">

              {/* Star picker */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="flex items-center gap-1.5"
                  onMouseLeave={() => setHovered(0)}
                >
                  {Array.from({ length: 5 }).map((_, i) => {
                    const val = i + 1;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        onMouseEnter={() => setHovered(val)}
                        className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                        aria-label={`Rate ${val} star${val > 1 ? "s" : ""}`}
                      >
                        <Star
                          size={36}
                          className={cn(
                            "transition-colors duration-100",
                            val <= activeRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-border hover:text-amber-300"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Rating label */}
                <span
                  className={cn(
                    "text-sm font-medium h-5 transition-opacity duration-150",
                    activeRating > 0 ? "opacity-100" : "opacity-0"
                  )}
                >
                  {starLabel[activeRating]}
                </span>
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Your review
                </label>
                <Textarea
                  placeholder={`Share what you liked about ${creatorName}'s training style, punctuality, expertise…`}
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  className="resize-none text-sm"
                />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">{comment.length}/500</span>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-6 pb-6 flex flex-col gap-2">
              <Button
                onClick={handleSubmit}
                disabled={saving || rating === 0}
                className="w-full bg-accent text-accent-foreground gap-2"
              >
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                  : "Submit review"}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleClose} disabled={saving}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}