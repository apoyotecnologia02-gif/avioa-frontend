"use client";

import { canManagePost } from "@/lib/feed-permissions";
import { REACTIONS } from "@/lib/feed-reactions";
import { useAuthStore } from "@/store/authStore";
import { useFeedStore } from "@/store/feedStore";
import { FeedPost } from "@/types/feed.types";
import { useState } from "react";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { es } from "date-fns/locale";
import {
  Gift,
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
import { Badge } from "../ui/badge";
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

  const badge = TYPE_BADGE[post.type];
  const canManage = canManagePost(user, post.author.userId);

  const handleReact = (type: (typeof REACTIONS)[number]["type"]) => {
    if (post.myReaction === type) {
      unreact(post.feedPostId);
    } else {
      react(post.feedPostId, type);
    }
  };

  return (
    // <article
    //   className={`rounded-2xl border bg-card p-5 ${
    //     post.pinned ? "border-primary/40" : ""
    //   }`}
    // >
    //   <div className="flex items-start justify-between">
    //     <div className="flex gap-3">
    //       <Avatar className="h-10 w-10">
    //         <AvatarImage src={post.author.avatarUrl} />
    //         <AvatarFallback>{post.author.name[0]}</AvatarFallback>
    //       </Avatar>
    //       <div>
    //         <div className="flex flex-wrap items-center gap-1.5">
    //           <span className="text-sm font-medium">{post.author.name}</span>
    //           {post.pinned && <Pin className="h-3 w-3 text-primary" />}
    //           <span className="text-sm text-muted-foreground">·</span>
    //           <span className="text-sm text-muted-foreground">
    //             {formatDistanceToNow(new Date(post.createdAt), {
    //               addSuffix: true,
    //               locale: es,
    //             })}
    //           </span>
    //         </div>
    //         <span
    //           className={`mt-1.5 inline-block rounded-md px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
    //         >
    //           {badge.label}
    //         </span>
    //       </div>
    //     </div>

    //     {canManage && (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
    //             <MoreHorizontal className="h-4 w-4" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           {user?.role === "ADMIN" && (
    //             <DropdownMenuItem onClick={() => togglePin(post.feedPostId)}>
    //               <Pin className="mr-2 h-4 w-4" />
    //               {post.pinned ? "Desfijar" : "Fijar"}
    //             </DropdownMenuItem>
    //           )}
    //           <DropdownMenuItem
    //             className="text-destructive"
    //             onClick={() => removePost(post.feedPostId)}
    //           >
    //             <Trash2 className="mr-2 h-4 w-4" />
    //             Eliminar
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     )}
    //   </div>

    //   {post.type === "RECOGNITION" && post.recognizedUser && (
    //     <p className="mt-3 text-sm text-muted-foreground">
    //       Reconoce a{" "}
    //       <span className="font-medium text-foreground">
    //         {post.recognizedUser.name}
    //       </span>
    //     </p>
    //   )}

    //   <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
    //     {post.content}
    //   </p>

    //   <div className="mt-4 flex items-center gap-5 border-t pt-3">
    //     <Popover>
    //       <PopoverTrigger asChild>
    //         <button
    //           className={`flex items-center gap-1.5 text-sm ${
    //             post.myReaction ? "text-primary" : "text-muted-foreground"
    //           }`}
    //         >
    //           {post.myReaction
    //             ? REACTIONS.find((r) => r.type === post.myReaction)?.emoji
    //             : "👍"}
    //           {post.reactionsCount > 0 && post.reactionsCount}
    //         </button>
    //       </PopoverTrigger>
    //       <PopoverContent className="flex w-auto gap-1 p-1">
    //         {REACTIONS.map((r) => (
    //           <button
    //             key={r.type}
    //             title={r.label}
    //             onClick={() => handleReact(r.type)}
    //             className={`rounded-md p-1.5 text-lg hover:bg-accent ${
    //               post.myReaction === r.type ? "bg-accent" : ""
    //             }`}
    //           >
    //             {r.emoji}
    //           </button>
    //         ))}
    //       </PopoverContent>
    //     </Popover>

    //     <button
    //       onClick={() => setShowComments((v) => !v)}
    //       className="flex items-center gap-1.5 text-sm text-muted-foreground"
    //     >
    //       <MessageCircle className="h-4 w-4" />
    //       {post.commentsCount > 0 && post.commentsCount}
    //     </button>

    //     <button className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
    //       <Share2 className="h-4 w-4" />
    //     </button>
    //   </div>

    //   {showComments && <CommentSection post={post} />}
    // </article>
    <article
      className={`group rounded-2xl border bg-card/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${post.pinned ? "border-primary/30 bg-primary/5" : "border-border/50"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-11 w-11 ring-2 ring-background">
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback className="bg-primary/5 text-primary">
              {post.author.name[0]}
            </AvatarFallback>
          </Avatar>
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

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
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
            side="top" // 👈 se abre hacia arriba
            align="start" // 👈 alineado a la izquierda del botón
          >
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                title={r.label}
                onClick={() => handleReact(r.type)}
                className={`rounded-md p-2 text-xl transition-all hover:scale-110 hover:bg-accent ${
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
