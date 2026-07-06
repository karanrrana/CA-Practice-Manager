import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/EmptyState";
import { createComment } from "@/services/api";
import { formatDateTime } from "@/utils/format";
import { useAuth } from "@/context/AuthContext";
import type { Comment } from "@/types";

export function CommentsThread({
  serviceId,
  comments,
  onPosted,
}: {
  serviceId: string;
  comments: Comment[];
  onPosted: (message: string) => void;
}) {
  const { username } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  const submit = async () => {
    const text = message.trim();
    if (!text) return;
    setSending(true);
    try {
      await createComment(serviceId, username, text);
      setMessage("");
      onPosted(text);
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <MessageSquare className="h-3.5 w-3.5" /> Comments
      </div>

      <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No comments yet"
            description="Start the conversation about this service."
          />
        ) : (
          comments.map((c) => {
            const mine = c.username === username;
            return (
              <div key={c.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] animate-fade-in-up rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-xs font-semibold capitalize opacity-90">
                      {c.username}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {formatDateTime(c.created_at)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap break-words">{c.message}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a comment…"
          rows={1}
          className="min-h-[40px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button size="icon" onClick={submit} disabled={sending || !message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
