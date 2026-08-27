"use client";

import { useAuthStore } from "@/store/authStore";
import { useFeedStore } from "@/store/feedStore";
import { FeedPost } from "@/types/feed.types";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { canManagePost } from "@/lib/feed-permissions";
import { Send, Trash2 } from "lucide-react";
import { es, Locale } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function CommentSection({ post }: { post: FeedPost }) {
  const user = useAuthStore((s) => s.user);
  const { addComment, removeComment } = useFeedStore();
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment(post.feedPostId, value.trim());
      setValue("");
    } finally {
      setIsSubmitting(false);
    }
  };

  function foramtDistanceToNow(
    createdAt: string,
    arg1: { addSuffix: boolean; locale: Locale },
  ): import("react").ReactNode {
    throw new Error("Function not implemented.");
  }

  return (
    // <div className="mt-3 space-y-3 border-t pt-3">
    //   {post.comments.map((comment) => (
    //     <div key={comment.feedCommentId} className="flex items-start gap-2">
    //       <Avatar className="h-7 w-7">
    //         <AvatarImage src={comment.author.avatarUrl} />
    //         <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
    //       </Avatar>
    //       <div className="flex-1 rounded-lg bg-muted px-3 py-2">
    //         <div className="flex items-center justify-between">
    //           <span className="text-xs font-medium">{comment.author.name}</span>
    //           {canManagePost(user, comment.author.userId) && (
    //             <button
    //               onClick={() =>
    //                 removeComment(post.feedPostId, comment.feedCommentId)
    //               }
    //               className="text-muted-foreground hover:text-destructive"
    //             >
    //               <Trash2 className="h-3 w-3" />
    //             </button>
    //           )}
    //         </div>
    //         <p className="text-sm">{comment.content}</p>
    //         <span className="text-[10px] text-muted-foreground">
    //           {formatDistanceToNow(new Date(comment.createdAt), {
    //             addSuffix: true,
    //             locale: es,
    //           })}
    //         </span>
    //       </div>
    //     </div>
    //   ))}

    //   <div className="flex items-center gap-2">
    //     <Avatar>
    //       <AvatarImage src={user?.avatarUrl} />
    //       <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
    //     </Avatar>
    //     <Input
    //       placeholder="Escribe un comentario..."
    //       value={value}
    //       onChange={(e) => setValue(e.target.value)}
    //       onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
    //       className="h-8 text-sm"
    //     />
    //     <Button
    //       size="icon"
    //       variant="ghost"
    //       className="h-8 w-8"
    //       disabled={!value.trim() || isSubmitting}
    //       onClick={handleSubmit}
    //     >
    //       <Send className="h-4 w-4" />
    //     </Button>
    //   </div>
    // </div>
    <div className="mt-4 space-y-4 border-t border-border/50 pt-4">
      {/* Lista de comentarios */}
      {post.comments.map((comment) => (
        <div key={comment.feedCommentId} className="flex items-start gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarImage src={comment.author.avatarUrl} />
            <AvatarFallback className="bg-primary/5 text-xs text-primary">
              {comment.author.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-2xl bg-muted/60 px-4 py-2.5 shadow-sm transition-colors hover:bg-muted/80">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground">
                {comment.author.name}
              </span>
              {canManagePost(user, comment.author.userId) && (
                <button
                  onClick={() =>
                    removeComment(post.feedPostId, comment.feedCommentId)
                  }
                  className="text-muted-foreground/50 transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
            <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">
              {comment.content}
            </p>
            <span className="mt-1 block text-[10px] text-muted-foreground/70">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>
        </div>
      ))}

      {/* Input de nuevo comentario */}
      <div className="mt-2 flex items-center gap-3">
        <Avatar className="h-8 w-8 ring-2 ring-background">
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback className="bg-primary/5 text-xs text-primary">
            {user?.name?.[0] ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="relative flex-1">
          <Input
            placeholder="Escribe un comentario…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-9 rounded-full border-border/50 bg-muted/40 pl-4 pr-10 text-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
            disabled={!value.trim() || isSubmitting}
            onClick={handleSubmit}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
