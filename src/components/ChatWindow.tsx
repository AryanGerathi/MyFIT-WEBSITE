import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, Send, X, MessageCircle, CheckCheck, ImagePlus } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { chatService, type ChatMessage, type Conversation, authService } from "@/services/backendService";
import { toast } from "sonner";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(date: string) {
  const d = new Date(date);
  if (isToday(d))     return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function Avatar({ name, imageUrl, size = "sm" }: { name: string; imageUrl?: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const cls = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  return imageUrl
    ? <img src={imageUrl} alt={name} className={`${cls} rounded-full object-cover shrink-0`} />
    : <div className={`${cls} rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center shrink-0`}>{initials}</div>;
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ text, isMine, isTemp }: { text: string; isMine: boolean; isTemp: boolean }) {
  const isImage = text.startsWith("[image]:");
  const imageUrl = isImage ? text.replace("[image]:", "") : null;

  if (isImage && imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="shared"
        className={`max-w-[200px] rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity border border-border/40
          ${isMine ? "rounded-br-sm" : "rounded-bl-sm"}
          ${isTemp ? "opacity-60" : ""}`}
        onClick={() => window.open(imageUrl, "_blank")}
      />
    );
  }

  return (
    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words
      ${isMine
        ? "bg-accent text-accent-foreground rounded-br-sm"
        : "bg-muted text-foreground rounded-bl-sm"
      } ${isTemp ? "opacity-60" : ""}`}
    >
      {text}
    </div>
  );
}

// ── Main ChatWindow ───────────────────────────────────────────────────────────

interface ChatWindowProps {
  bookingId:   string;
  otherName:   string;
  otherImage?: string;
  onClose?:    () => void;
  embedded?:   boolean;
}

export function ChatWindow({ bookingId, otherName, otherImage, onClose, embedded = false }: ChatWindowProps) {
  const me = authService.getStoredUser();

  const [conversation,   setConversation]   = useState<Conversation | null>(null);
  const [messages,       setMessages]       = useState<ChatMessage[]>([]);
  const [text,           setText]           = useState("");
  const [loading,        setLoading]        = useState(true);
  const [sending,        setSending]        = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const convoIdRef   = useRef<string | null>(null);

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Fetch messages ───────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { messages: msgs } = await chatService.getMessages(conversationId);
      setMessages(msgs);
    } catch { /* silent poll failure */ }
  }, []);

  // ── Init ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { conversation: convo } = await chatService.getOrCreateConversation(bookingId);
        if (cancelled) return;
        setConversation(convo);
        convoIdRef.current = convo._id;
        await fetchMessages(convo._id);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [bookingId, fetchMessages]);

  // ── Scroll on new messages ───────────────────────────────────────────────────
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Polling every 3s ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!convoIdRef.current) return;
    pollRef.current = setInterval(() => {
      if (convoIdRef.current) fetchMessages(convoIdRef.current);
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [conversation, fetchMessages]);

  // ── Send text ────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || !convoIdRef.current || sending) return;
    const optimistic: ChatMessage = {
      _id:            `temp-${Date.now()}`,
      conversationId: convoIdRef.current,
      senderId:       me?._id ?? "",
      text:           text.trim(),
      readAt:         null,
      createdAt:      new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setSending(true);
    try {
      const { message } = await chatService.sendMessage(convoIdRef.current, optimistic.text);
      setMessages((prev) => prev.map((m) => m._id === optimistic._id ? message : m));
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setText(optimistic.text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // ── Send image ────────────────────────────────────────────────────────────────
  const handleImageSend = async (file: File) => {
    if (!convoIdRef.current) return;

    const localUrl = URL.createObjectURL(file);
    const optimistic: ChatMessage = {
      _id:            `temp-img-${Date.now()}`,
      conversationId: convoIdRef.current,
      senderId:       me?._id ?? "",
      text:           `[image]:${localUrl}`,
      readAt:         null,
      createdAt:      new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setImageUploading(true);

    try {
      const { imageUrl } = await chatService.uploadChatImage(file);
      const { message }  = await chatService.sendMessage(convoIdRef.current, `[image]:${imageUrl}`);
      setMessages((prev) => prev.map((m) => m._id === optimistic._id ? message : m));
      URL.revokeObjectURL(localUrl);
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      URL.revokeObjectURL(localUrl);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setImageUploading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Group messages by date ───────────────────────────────────────────────────
  const grouped = messages.reduce<{ date: string; msgs: ChatMessage[] }[]>((acc, msg) => {
    const d = new Date(msg.createdAt);
    const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMMM d, yyyy");
    const last = acc[acc.length - 1];
    if (last?.date === label) { last.msgs.push(msg); }
    else { acc.push({ date: label, msgs: [msg] }); }
    return acc;
  }, []);

  // ── Shell classes ─────────────────────────────────────────────────────────────
  const shellCls = embedded
    ? "flex flex-col h-full bg-background rounded-xl border border-border/60 shadow-card overflow-hidden"
    : "flex flex-col w-[360px] h-[520px] bg-background rounded-2xl border border-border/60 shadow-2xl overflow-hidden";

  if (loading) return (
    <div className={shellCls}>
      <div className="flex items-center justify-center flex-1 gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={18} />
        <span className="text-sm">Loading chat…</span>
      </div>
    </div>
  );

  if (error) return (
    <div className={shellCls}>
      <div className="flex flex-col items-center justify-center flex-1 gap-2 text-muted-foreground text-sm p-6 text-center">
        <MessageCircle size={28} className="opacity-30" />
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className={shellCls}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-muted/20 shrink-0">
        <Avatar name={otherName} imageUrl={otherImage} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{otherName}</p>
          <p className="text-xs text-muted-foreground">
            {conversation?.bookingId?.sessionType ?? "Session"} chat
            {conversation?.bookingId?.date
              ? ` · ${format(new Date(conversation.bookingId.date), "PP")}`
              : ""}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Messages ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <MessageCircle size={28} className="opacity-20" />
            <p className="text-sm">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          grouped.map(({ date, msgs }) => (
            <div key={date}>
              <div className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-xs text-muted-foreground px-2">{date}</span>
                <div className="flex-1 h-px bg-border/60" />
              </div>

              {msgs.map((msg) => {
                const isMine = msg.senderId === me?._id;
                const isTemp = msg._id.startsWith("temp-");
                return (
                  <div key={msg._id} className={`flex items-end gap-2 mb-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Only show avatar for text messages from others, not image messages */}
                    {!isMine && !msg.text.startsWith("[image]:") && (
                      <Avatar name={otherName} imageUrl={otherImage} />
                    )}
                    {/* Spacer so image messages still align correctly without an avatar */}
                    {!isMine && msg.text.startsWith("[image]:") && (
                      <div className="h-7 w-7 shrink-0" />
                    )}
                    <div className={`max-w-[72%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                      <MessageBubble text={msg.text} isMine={isMine} isTemp={isTemp} />
                      <div className={`flex items-center gap-1 text-[10px] text-muted-foreground ${isMine ? "flex-row-reverse" : ""}`}>
                        <span>{formatTime(msg.createdAt)}</span>
                        {isMine && !isTemp && (
                          <CheckCheck size={11} className={msg.readAt ? "text-accent" : "text-muted-foreground"} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ───────────────────────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-border/60 bg-background shrink-0">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageSend(file);
            e.target.value = "";
          }}
        />

        <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2">
          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading || sending}
            title="Send image"
            className="h-7 w-7 rounded-lg text-muted-foreground flex items-center justify-center
                       hover:text-foreground hover:bg-muted transition-colors shrink-0 disabled:opacity-40"
          >
            {imageUploading
              ? <Loader2 size={14} className="animate-spin" />
              : <ImagePlus size={14} />}
          </button>

          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending || imageUploading}
            className="h-8 w-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center
                       disabled:opacity-40 hover:bg-accent/90 transition-colors shrink-0"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          Chat is deleted 24 hours after your session
        </p>
      </div>
    </div>
  );
}