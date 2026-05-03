import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, Copy, Check, Loader2, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "@/services/backendService";

interface VideoCallButtonProps {
  label?:       string;
  clientName?:  string;
  bookingId?:   string;
  roomUrl?:     string;
  sessionDate?: string | null;  // e.g. "2025-05-03"
  sessionTime?: string | null;  // e.g. "6:00 AM"
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse "6:00 AM" / "11:30 PM" → 24-hour { hours, minutes } */
function parseTime12h(timeStr: string): { hours: number; minutes: number } | null {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

/** Build the Date object for when the session window opens (5 min before start) */
function getWindowOpenTime(date: string, time: string): Date | null {
  const parsed = parseTime12h(time);
  if (!parsed) return null;
  const sessionStart = new Date(date);
  sessionStart.setHours(parsed.hours, parsed.minutes, 0, 0);
  return new Date(sessionStart.getTime() - 5 * 60 * 1000);
}

/** Build the Date object for when the session window closes (90 min after start) */
function getWindowCloseTime(date: string, time: string): Date | null {
  const parsed = parseTime12h(time);
  if (!parsed) return null;
  const sessionStart = new Date(date);
  sessionStart.setHours(parsed.hours, parsed.minutes, 0, 0);
  return new Date(sessionStart.getTime() + 90 * 60 * 1000);
}

/** Is the current moment inside [sessionStart - 5min, sessionStart + 90min]? */
function isSessionWindowOpen(date: string, time: string): boolean {
  const open  = getWindowOpenTime(date, time);
  const close = getWindowCloseTime(date, time);
  if (!open || !close) return false;
  const now = Date.now();
  return now >= open.getTime() && now <= close.getTime();
}

/** How many whole minutes until the window opens (0 if already open / past) */
function minutesUntilOpen(date: string, time: string): number {
  const open = getWindowOpenTime(date, time);
  if (!open) return 0;
  return Math.max(0, Math.ceil((open.getTime() - Date.now()) / 60_000));
}

/** Human-readable countdown label */
function countdownLabel(mins: number): string {
  if (mins <= 0)  return "Opens in <1 min";
  if (mins < 60)  return `Available in ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `Available in ${h}h ${m}m` : `Available in ${h}h`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VideoCallButton({
  label = "Join Session",
  clientName,
  bookingId,
  roomUrl: roomUrlProp,
  sessionDate,
  sessionTime,
}: VideoCallButtonProps) {
  const [open,    setOpen]    = useState(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(roomUrlProp ?? null);
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState(false);

  // Re-evaluate every 30 s so the button unlocks automatically without a refresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Time-gate logic ──────────────────────────────────────────────────────────
  // Monthly-plan bookings have no date/time → always available
  const hasSchedule = !!(sessionDate && sessionTime);
  const allowed     = !hasSchedule || isSessionWindowOpen(sessionDate!, sessionTime!);
  const minsLeft    = hasSchedule && !allowed
    ? minutesUntilOpen(sessionDate!, sessionTime!)
    : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleOpen = async () => {
    if (!allowed) return;

    // Re-use already-fetched URL
    if (roomUrl) { setOpen(true); return; }

    if (!bookingId) {
      toast.error("No booking ID provided.");
      return;
    }

    setLoading(true);
    try {
      const data = await paymentService.getRoomUrl(bookingId);
      setRoomUrl(data.roomUrl);
      setOpen(true);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load session room. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!roomUrl) return;
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const joinRoom = () => {
    if (!roomUrl) return;
    window.open(roomUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  // ── Locked state ──────────────────────────────────────────────────────────────

  if (!allowed) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="gap-1.5 shrink-0 text-muted-foreground cursor-not-allowed"
        title={`Session link unlocks 5 minutes before the scheduled time`}
      >
        <Clock size={14} />
        {countdownLabel(minsLeft)}
      </Button>
    );
  }

  // ── Active state ──────────────────────────────────────────────────────────────

  return (
    <>
      <Button
        onClick={handleOpen}
        disabled={loading}
        size="sm"
        className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5 shrink-0"
      >
        {loading
          ? <Loader2 size={14} className="animate-spin" />
          : <Video size={14} />}
        {loading ? "Loading…" : label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] rounded-xl p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-lg">
              Session ready 🎉
            </DialogTitle>
            <DialogDescription className="text-sm">
              {clientName
                ? `Your session with ${clientName} is ready to start.`
                : "Your session room is ready to join."}
            </DialogDescription>
          </DialogHeader>

          {/* Room URL display */}
          {roomUrl && (
            <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground mb-1.5 font-medium">
                Your personal session link
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs flex-1 break-all text-foreground leading-relaxed line-clamp-2">
                  {roomUrl}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copy}
                  className="shrink-0 h-7 w-7 p-0"
                >
                  {copied
                    ? <Check size={13} className="text-green-600" />
                    : <Copy size={13} />}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-2">
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              onClick={joinRoom}
              disabled={!roomUrl}
            >
              <ExternalLink size={15} />
              Open meeting room
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-1">
            Opens in a new tab · Your link is personal and secure —{" "}
            {clientName
              ? "your client receives their own separate link"
              : "your trainer receives their own separate link"}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}