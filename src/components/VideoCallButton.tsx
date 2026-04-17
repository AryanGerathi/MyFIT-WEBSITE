import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function VideoCallButton({ label = "Join Session", clientName }: { label?: string; clientName?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const link = `https://meet.myfit.app/session-${Math.random().toString(36).slice(2, 8)}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
        <Video size={16} />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session ready</DialogTitle>
            <DialogDescription>
              {clientName ? `Your session with ${clientName} is ready to start.` : "Your session room is ready."}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-secondary/40 p-3 flex items-center justify-between gap-2">
            <code className="text-xs sm:text-sm truncate">{link}</code>
            <Button size="sm" variant="ghost" onClick={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </Button>
          </div>
          <Button className="w-full bg-accent text-accent-foreground" onClick={() => toast.success("Joining session…")}>
            <Video size={16} className="mr-2" /> Open meeting room
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
