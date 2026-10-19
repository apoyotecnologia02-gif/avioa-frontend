"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  MessageCircle,
  MoreHorizontal,
  Pin,
  Share2,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentSection } from "./CommentSection";
import { ImageGrid } from "./ImageGrid";
import { ReactionBar } from "./ReactionBar";
import type { FeedPost } from "@/types/feed.types";
import { useAuthStore } from "@/store/authStore";
import { useFeedStore } from "@/store/feedStore";
import { POST_TYPE_BADGE } from "@/lib/feed-reactions";
import { useModulePermission } from "@/hooks/useModulePermission";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

export function PostCard({ post }: { post: FeedPost }) {
  const user = useAuthStore((s) => s.user);
  const { removePost, togglePin } = useFeedStore();
  const [showComments, setShowComments] = useState(false);

  const badge = POST_TYPE_BADGE[post.type];
  const { canUpdate, canDelete } = useModulePermission("FEED");
  const currentUserId = user?.userId ?? (user as { id?: string } | null)?.id;
  const isAuthor = !!currentUserId && currentUserId === post.author.userId;
  const canManage = canUpdate || canDelete || isAuthor;
  const isAdmin = user?.role === "ADMIN";

  return (
    <article
      className={cn(
        "group relative rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md",
        post.pinned
          ? "border-primary/40 ring-1 ring-primary/10"
          : post.type === "BIRTHDAY"
            ? "border-pink-300/60 dark:border-pink-800/60"
            : "border-border/60",
      )}
    >
      {post.pinned && (
        <div className="flex items-center gap-1.5 rounded-t-2xl bg-primary/5 px-4 py-1.5 text-[11px] font-semibold text-primary sm:px-5">
          <Pin className="h-3 w-3 fill-current" />
          Fijado por un administrador
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background">
              <AvatarImage src={post.author.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {post.author.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="truncate text-sm font-semibold">
                  {post.author.name}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    badge.className,
                  )}
                >
                  {badge.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <time>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </time>
                {/* <span>·</span> */}
                {/* <span className="truncate">{post.author.role}</span> */}
              </div>
            </div>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {isAdmin && (
                  <DropdownMenuItem onClick={() => togglePin(post.feedPostId)}>
                    <Pin className="mr-2 h-4 w-4" />
                    {post.pinned ? "Desfijar" : "Fijar"}
                  </DropdownMenuItem>
                )}
                {(canDelete || isAuthor) && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => removePost(post.feedPostId)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {post.type === "RECOGNITION" && post.recognizedUser && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-amber-100/40 p-3 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-amber-900/10">
            <div className="shrink-0 text-2xl">🏆</div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Reconoce a
              </p>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage
                    src={post.recognizedUser.avatarUrl ?? undefined}
                  />
                  <AvatarFallback className="text-[10px]">
                    {post.recognizedUser.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-semibold">
                  {post.recognizedUser.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {post.type === "BIRTHDAY" && post.recognizedUser && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-pink-200/60 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-violet-50 p-4 dark:border-pink-900/40 dark:from-pink-950/20 dark:via-fuchsia-950/10 dark:to-violet-950/20">
            <div className="text-3xl">🎂</div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-pink-700 dark:text-pink-400">
                Hoy celebramos a
              </p>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage
                    src={post.recognizedUser.avatarUrl ?? undefined}
                  />
                  <AvatarFallback className="text-[10px]">
                    {post.recognizedUser.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-base font-bold">
                  {post.recognizedUser.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {post.content && (
          <div
            className="rich-content mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content, {
                ALLOWED_TAGS: [
                  "p",
                  "br",
                  "b",
                  "strong",
                  "i",
                  "em",
                  "s",
                  "u",
                  "ul",
                  "ol",
                  "li",
                  "a",
                ],
                ALLOWED_ATTR: ["href", "target", "rel"],
              }),
            }}
          />
        )}

        {post.images?.length > 0 && <ImageGrid images={post.images} />}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 border-t border-border/60 pt-3">
          <div className="min-w-0 flex-1">
            <ReactionBar post={post} />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setShowComments((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">
                {post.commentsCount > 0 ? post.commentsCount : "Comentar"}
              </span>
            </button>
            {/* <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Compartir</span>
            </button> */}
          </div>
        </div>
      </div>

      {showComments && (
        <div className="rounded-b-2xl border-t border-border/60 bg-muted/20 px-4 pb-5 pt-1 sm:px-5">
          <CommentSection post={post} />
        </div>
      )}
    </article>
  );
}
