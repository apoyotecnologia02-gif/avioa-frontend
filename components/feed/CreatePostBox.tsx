"use client";

import { useState } from "react";
import { ImagePlus, Send } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FeedAuthor, FeedPostType } from "@/types/feed.types";
import { useAuthStore } from "@/store/authStore";
import { useFeedStore } from "@/store/feedStore";
import { POST_TYPE_LABELS } from "@/lib/feed-reactions";
import { RecognitionUserPicker } from "./RecognitionUserPicket";
import { RichTextEditor } from "./RichTextEditor";

export function CreatePostBox() {
  const user = useAuthStore((s) => s.user);
  const createPost = useFeedStore((s) => s.createPost);

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState<FeedPostType>("PUBLICATION");
  const [recognizedUser, setRecognizedUser] = useState<FeedAuthor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRecognition = type === "RECOGNITION";

  const plainText = content
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  const canSubmit =
    content.trim().length > 0 && (!isRecognition || !!recognizedUser);

  const reset = () => {
    setContent("");
    setType("PUBLICATION");
    setRecognizedUser(null);
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await createPost({
        type,
        content: content.trim(),
        recognizedUserId: isRecognition ? recognizedUser!.userId : undefined,
      });
      reset();
      toast.success("¡Publicado!");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo crear la publicación");
    } finally {
      setSubmitting(false);
    }
  };

  const availableTypes: FeedPostType[] = [
    "PUBLICATION",
    "RECOGNITION",
    "ANNOUNCEMENT",
    "BIRTHDAY",
  ];

  return (
    <Card className="rounded-2xl border-border/60 bg-card p-0 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
        <Avatar className="h-11 w-11 shrink-0 ring-2 ring-primary/10">
          <AvatarImage src={user?.avatar ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.name?.[0] ?? "U"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-3">
          {/* <Textarea
            placeholder={`¿Qué quieres compartir, ${user?.name?.split(" ")[0] ?? ""}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setOpen(true)}
            className="min-h-[52px] resize-none rounded-2xl border-border/60 bg-muted/30 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-1"
          /> */}

          <RichTextEditor
            value={content}
            onChange={setContent}
            onFocus={() => setOpen(true)}
            placeholder={`¿Qué quieres compartir, ${user?.name?.split(" ")[0] ?? ""}?`}
            showToolbar={open}
          />

          {open && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
              <Select
                value={type}
                onValueChange={(v) => {
                  setType(v as FeedPostType);
                  if (v !== "RECOGNITION") setRecognizedUser(null);
                }}
              >
                <SelectTrigger className="h-9 w-full rounded-full border-border/60 bg-muted/40 px-4 text-xs font-medium sm:w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {POST_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isRecognition && (
                <div className="min-w-0 flex-1 sm:flex-initial">
                  <RecognitionUserPicker
                    value={recognizedUser}
                    onChange={setRecognizedUser}
                  />
                </div>
              )}

              <button
                type="button"
                title="Adjuntar imagen (próximamente)"
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              >
                <ImagePlus className="h-4 w-4" />
              </button>

              <div className="ml-auto flex w-full items-center justify-end gap-2 sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="h-9 rounded-full px-4 text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  disabled={!canSubmit || submitting}
                  onClick={handleSubmit}
                  className="h-9 shrink-0 rounded-full bg-gradient-to-r from-primary to-primary/85 px-5 font-medium shadow-sm hover:shadow-md"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Publicar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
