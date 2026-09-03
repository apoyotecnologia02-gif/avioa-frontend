"use client";

import { canManagePost } from "@/lib/feed-permissions";
import { REACTIONS } from "@/lib/feed-reactions";
import { useAuthStore } from "@/store/authStore";
import { useFeedStore } from "@/store/feedStore";
import { FeedPost, ReactionType } from "@/types/feed.types";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { es } from "date-fns/locale";
import {
  MessageCircle,
  MoreHorizontal,
  Pin,
  Share2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CommentSection } from "./CommentSection";

const TYPE_BADGE: Record<
  FeedPost["type"],
  { label: string; className: string }
> = {
  PUBLICATION: { label: "Publicación", className: "bg-secondary" },
  RECOGNITION: {
    label: "🏆 Reconocimiento",
    className: "bg-amber-100 text-amber-800",
  },
  ANNOUNCEMENT: {
    label: "📢 Comunicado",
    className: "bg-blue-100 text-blue-800",
  },
};

export function PostCard({ post }: { post: FeedPost }) {
  const user = useAuthStore((s) => s.user);
  const { react, unreact, removePost, togglePin } = useFeedStore();
  const [showComments, setShowComments] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const badge = TYPE_BADGE[post.type];
  const canManage = canManagePost(user, post.author.userId);

  const handleReact = async (type: ReactionType) => {
    if (isReacting) return;

    setIsReacting(true);
    try {
      if (post.myReaction === type) {
        await unreact(post.feedPostId);
      } else {
        await react(post.feedPostId, type);
      }
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <article
      className={`group rounded-2xl border bg-card/60 p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md sm:p-5 ${post.pinned ? "border-primary/30 bg-primary/5" : "border-border/50"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background sm:h-11 sm:w-11">
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback className="bg-primary/5 text-primary">
              {post.author.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {post.author.name}
              </span>
              {post.pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  <Pin className="h-3 w-3" />
                  Fijado
                </span>
              )}
              <span className="text-xs text-muted-foreground">.</span>
              <time className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </time>
            </div>
            <span
              className={`mt-1.5 inline-block rounded-full px-3 py-0.5 text-[11px] font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user?.role === "admin" && (
                <DropdownMenuItem onClick={() => togglePin(post.feedPostId)}>
                  <Pin className="mr-2 h-4 w-4" />
                  {post.pinned ? "Desfijar" : "Fijar"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => removePost(post.feedPostId)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {post.type === "RECOGNITION" && post.recognizedUser && (
        <div className="mt-3 rounded-lg bg-primary/5 px-4 py-2 text-sm">
          <span className="text-muted-foreground">🎉 Reconoce a </span>
          <span className="font-semibold text-foreground">
            {post.recognizedUser.name}
          </span>
        </div>
      )}

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {post.content}
      </p>

      <div className="mt-5 flex items-center gap-6 border-t border-border/50 pt-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Elegir reacción"
              className={`flex items-center gap-2 text-sm transition-colors ${
                post.myReaction
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-lg leading-none">
                {post.myReaction
                  ? REACTIONS.find((r) => r.type === post.myReaction)?.emoji
                  : "👍"}
              </span>
              {post.reactionsCount > 0 && (
                <span className="font-medium">{post.reactionsCount}</span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="flex w-auto gap-1 p-1.5"
            side="top"
            align="start"
          >
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                type="button"
                title={r.label}
                onClick={() => handleReact(r.type)}
                disabled={isReacting}
                aria-pressed={post.myReaction === r.type}
                className={`rounded-md p-2 text-xl transition-all hover:scale-110 hover:bg-accent disabled:pointer-events-none disabled:opacity-50 ${
                  post.myReaction === r.type ? "bg-accent" : ""
                }`}
              >
                {r.emoji}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          {post.commentsCount > 0 && (
            <span className="font-medium">{post.commentsCount}</span>
          )}
        </button>

        <button className="ml-auto flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {showComments && <CommentSection post={post} />}
    </article>
  );
}
