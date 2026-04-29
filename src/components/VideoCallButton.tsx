import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, Copy, Check, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "@/services/backendService";

interface VideoCallButtonProps {
  label?:      string;
  clientName?: string;
  bookingId?:  string;
  roomUrl?:    string;
}

export function VideoCallButton({
  label = "Join Session",
  clientName,
  bookingId,
  roomUrl: roomUrlProp,
}: VideoCallButtonProps) {
  const [open,    setOpen]    = useState(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(roomUrlProp ?? null);
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState(false);

  const handleOpen = async () => {
    // If we already fetched the URL in this session, just re-open dialog
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

          {/* ✅ Corrected note — each person gets their own JWT-signed link */}
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