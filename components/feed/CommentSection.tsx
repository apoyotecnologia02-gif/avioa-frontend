import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { CornerDownRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FeedComment, FeedPost } from "@/types/feed.types";
import { useFeedStore } from "@/store/feedStore";
import { useAuthStore } from "@/store/authStore";

interface SectionProps {
  post: FeedPost;
}

export function CommentSection({ post }: SectionProps) {
  const { addComment, removeComment } = useFeedStore();
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId =
    currentUser?.userId ?? (currentUser as { id?: string } | null)?.id;

  const [rootContent, setRootContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitRoot = async () => {
    const text = rootContent.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await addComment(post.feedPostId, text, null);
      setRootContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-4 border-t border-border/60 pt-4">
      {/* Input raíz */}
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={currentUser?.avatarUrl ?? undefined} />
          <AvatarFallback className="text-xs">
            {currentUser?.name?.[0] ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Escribe un comentario…"
            value={rootContent}
            onChange={(e) => setRootContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitRoot();
              }
            }}
            rows={1}
            className="min-h-[42px] resize-none rounded-2xl border-border/60 bg-muted/40 px-4 py-2 text-sm focus-visible:ring-1"
          />
          {rootContent.trim().length > 0 && (
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                onClick={submitRoot}
                disabled={submitting}
                className="h-7 rounded-full px-3 text-xs"
              >
                Comentar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {post.comments.map((c) => (
          <CommentItem
            key={c.feedCommentId}
            comment={c}
            postId={post.feedPostId}
            currentUserId={currentUserId}
            onRemove={(commentId) => removeComment(post.feedPostId, commentId)}
            onReply={(parentId, content) =>
              addComment(post.feedPostId, content, parentId)
            }
          />
        ))}
      </div>
    </div>
  );
}

interface ItemProps {
  comment: FeedComment;
  postId: string;
  currentUserId?: string;
  onRemove: (commentId: string) => Promise<void>;
  onReply: (parentId: string, content: string) => Promise<void>;
}

function CommentItem({ comment, currentUserId, onRemove, onReply }: ItemProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = currentUserId === comment.author.userId;
  // Mostramos las 2 últimas respuestas por defecto (más recientes)
  const visibleReplies = showAllReplies
    ? comment.replies
    : comment.replies.slice(-2);
  const hiddenCount = comment.replies.length - visibleReplies.length;

  const submitReply = async () => {
    const text = replyText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await onReply(comment.feedCommentId, text);
      setReplyText("");
      setShowReplyBox(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2.5">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={comment.author.avatarUrl ?? undefined} />
          <AvatarFallback className="text-[10px]">
            {comment.author.name[0]}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="inline-block max-w-full rounded-2xl bg-muted/50 px-3.5 py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold">
                {comment.author.name}
              </span>
              <span className="text-[10px] text-muted-foreground">…</span>
            </div>
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-snug">
              {comment.content}
            </p>
          </div>

          <div className="mt-1 flex items-center gap-3 pl-1">
            <button
              onClick={() => setShowReplyBox((v) => !v)}
              className="text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Responder
            </button>
            {isOwner && (
              <button
                onClick={() => onRemove(comment.feedCommentId)}
                className="text-[11px] font-semibold text-muted-foreground transition-colors hover:text-destructive"
              >
                Eliminar
              </button>
            )}
          </div>

          {showReplyBox && (
            <div className="mt-2 flex items-start gap-2">
              <CornerDownRight className="mt-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <Textarea
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitReply();
                    }
                    if (e.key === "Escape") setShowReplyBox(false);
                  }}
                  placeholder={`Responder a ${comment.author.name}…`}
                  rows={1}
                  className="min-h-[38px] resize-none rounded-2xl border-border/60 bg-muted/30 px-3 py-1.5 text-sm"
                />
                {replyText.trim().length > 0 && (
                  <div className="mt-1.5 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setShowReplyBox(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 rounded-full px-3 text-xs"
                      onClick={submitReply}
                      disabled={submitting}
                    >
                      Responder
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {comment.replies.length > 0 && (
            <div className="mt-2 space-y-2 border-l-2 border-border/60 pl-3">
              {!showAllReplies && hiddenCount > 0 && (
                <button
                  onClick={() => setShowAllReplies(true)}
                  className="pl-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Ver {hiddenCount}{" "}
                  {hiddenCount === 1
                    ? "respuesta anterior"
                    : "respuestas anteriores"}
                </button>
              )}

              {visibleReplies.map((r) => (
                <ReplyItem key={r.feedCommentId} reply={r} />
              ))}

              {showAllReplies && hiddenCount > 0 && (
                <button
                  onClick={() => setShowAllReplies(false)}
                  className="pl-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Ocultar respuestas anteriores
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyItem({ reply }: { reply: FeedComment }) {
  return (
    <div className="flex items-start gap-2">
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarImage src={reply.author.avatarUrl ?? undefined} />
        <AvatarFallback className="text-[9px]">
          {reply.author.name[0]}
        </AvatarFallback>
      </Avatar>
      <div className="inline-block max-w-full rounded-2xl bg-muted/40 px-3 py-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold">{reply.author.name}</span>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(reply.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-sm leading-snug">
          {reply.content}
        </p>
      </div>
    </div>
  );
}
