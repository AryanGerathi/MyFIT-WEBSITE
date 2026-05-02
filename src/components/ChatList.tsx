import { useEffect, useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { format, isToday } from "date-fns";
import { chatService, authService, paymentService, type Conversation } from "@/services/backendService";
import { ChatWindow } from "./ChatWindow";

function Avatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return imageUrl
    ? <img src={imageUrl} alt={name} className="h-10 w-10 rounded-full object-cover shrink-0" />
    : <div className="h-10 w-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-sm shrink-0">{initials}</div>;
}

export function ChatList() {
  const me = authService.getStoredUser();
  const [conversations,  setConversations]  = useState<Conversation[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [activeOtherName, setActiveOtherName] = useState("");
  const [activeOtherImg,  setActiveOtherImg]  = useState<string | undefined>();

  useEffect(() => {
    const init = async () => {
      try {
        const isCreator = me?.role === "creator";

        // ── Step 1: fetch all bookings & auto-create conversations ──────────
        const bookingsRes = isCreator
          ? await paymentService.getMyCreatorBookings()
          : await paymentService.getMyBookings();

        const bookings = (bookingsRes as any).bookings ?? [];

        await Promise.allSettled(
          bookings.map((b: any) => chatService.getOrCreateConversation(b._id))
        );

        // ── Step 2: fetch all conversations ──────────────────────────────────
        const { conversations: convos } = await chatService.getMyConversations();

        // ── Step 3: deduplicate — one chat per other person (latest wins) ───
        const seen = new Map<string, Conversation>();
        for (const convo of convos) {
          const otherId = isCreator
            ? convo.userId?._id
            : convo.creatorId?._id;

          if (!otherId) continue;

          const existing = seen.get(otherId);
          if (!existing || new Date(convo.lastAt) > new Date(existing.lastAt)) {
            seen.set(otherId, convo);
          }
        }

        setConversations(Array.from(seen.values()));
      } catch (err) {
        console.error("ChatList init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [me?.role]);

  const openChat = (convo: Conversation) => {
    const isCreator = me?.role === "creator";
    const other     = isCreator ? convo.userId : convo.creatorId;
    const bookingId = typeof convo.bookingId === "object" && convo.bookingId
      ? convo.bookingId._id
      : String(convo.bookingId);
    setActiveOtherName(other?.name ?? "User");
    setActiveOtherImg(other?.profileImage?.url);
    setActiveBookingId(bookingId);
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
      <Loader2 className="animate-spin" size={15} /> Loading chats…
    </div>
  );

  if (conversations.length === 0) return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
      <MessageCircle size={28} className="opacity-20" />
      <p className="text-sm">No conversations yet.</p>
      <p className="text-xs">Chats appear after a booking is made.</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {conversations.map((convo) => {
        const isCreator = me?.role === "creator";
        const other     = isCreator ? convo.userId : convo.creatorId;
        const timeStr   = isToday(new Date(convo.lastAt))
          ? format(new Date(convo.lastAt), "h:mm a")
          : format(new Date(convo.lastAt), "MMM d");

        return (
          <button
            key={convo._id}
            onClick={() => openChat(convo)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
          >
            <Avatar name={other?.name ?? "User"} imageUrl={other?.profileImage?.url} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm truncate">{other?.name ?? "User"}</p>
                <span className="text-[10px] text-muted-foreground shrink-0">{timeStr}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {convo.lastMessage || "Start the conversation…"}
              </p>
            </div>
          </button>
        );
      })}

      {/* ── Floating chat window ─────────────────────────────────────────── */}
      {activeBookingId && (
        <div className="fixed bottom-6 right-6 z-50">
          <ChatWindow
            bookingId={activeBookingId}
            otherName={activeOtherName}
            otherImage={activeOtherImg}
            onClose={() => setActiveBookingId(null)}
          />
        </div>
      )}
    </div>
  );
}