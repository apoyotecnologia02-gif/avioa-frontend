"use client";

import { canPublish, canPublishType } from "@/lib/feed-permissions";
import { useAuthStore } from "@/store/authStore";
import { useFeedStore } from "@/store/feedStore";
import { FeedPostType } from "@/types/feed.types";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { RecognitionUserPicker } from "./RecognitionUserPicket";
import { Send } from "lucide-react";

const TYPE_LABELS: Record<FeedPostType, string> = {
  PUBLICATION: "Publicación",
  RECOGNITION: "Reconocimiento",
  ANNOUNCEMENT: "Comunicado oficial",
};

interface UserOption {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

export function CreatePostBox() {
  const user = useAuthStore((state) => state.user);
  const createPost = useFeedStore((s) => s.createPost);

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState<FeedPostType>(FeedPostType.PUBLICATION);
  const [recognizedUser, setRecognizedUser] = useState<UserOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!canPublish(user)) return null;

  const availableTypes = (
    ["PUBLICATION", "RECOGNITION", "ANNOUNCEMENT"] as FeedPostType[]
  ).filter((t) => canPublishType(user, t));

  const isRecognition = type === FeedPostType.RECOGNITION;
  const canSubmit =
    content.trim().length > 0 && (!isRecognition || !!recognizedUser);

  const resetForm = () => {
    setContent("");
    setType(FeedPostType.PUBLICATION);
    setRecognizedUser(null);
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!content.trim() || !canSubmit) return;

    setIsSubmitting(true);

    try {
      await createPost({
        type,
        content: content.trim(),
        recognizedUserId: isRecognition ? recognizedUser!.userId : undefined,
      });
      // setContent("");
      // setOpen(false);
      resetForm();
      toast.success("Publicación creada");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo crear la publicación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // <Card className="p-4">
    //   <div className="flex gap-3">
    //     <Avatar>
    //       <AvatarImage src={user?.avatarUrl} />
    //       <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
    //     </Avatar>

    //     <div className="flex-1 space-y-3">
    //       <Textarea
    //         placeholder="Comparte algo con el equipo..."
    //         value={content}
    //         onChange={(e) => setContent(e.target.value)}
    //         onFocus={() => setOpen(true)}
    //         className="min-h-[44px] resize-none"
    //       />

    //       {open && (
    //         <>
    //           <Select
    //             value={type}
    //             onValueChange={(v) => {
    //               setType(v as FeedPostType);
    //               if (v !== FeedPostType.RECOGNITION) setRecognizedUser(null);
    //             }}
    //           >
    //             <SelectTrigger className="w-full sm:w-[220px]">
    //               <SelectValue />
    //             </SelectTrigger>
    //             <SelectContent>
    //               {availableTypes.map((t) => (
    //                 <SelectItem key={t} value={t}>
    //                   {TYPE_LABELS[t]}
    //                 </SelectItem>
    //               ))}
    //             </SelectContent>
    //           </Select>

    //           {isRecognition && (
    //             <RecognitionUserPicker
    //               value={recognizedUser}
    //               onChange={setRecognizedUser}
    //             />
    //           )}

    //           <div className="flex justify-end gap-2">
    //             <Button variant="ghost" size="sm" onClick={resetForm}>
    //               Cancelar
    //             </Button>
    //             <Button
    //               size="sm"
    //               disabled={!canSubmit || isSubmitting}
    //               onClick={handleSubmit}
    //             >
    //               Publicar
    //             </Button>
    //           </div>
    //         </>
    //       )}
    //     </div>
    //   </div>
    // </Card>
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 p-0 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4 p-5">
        <Avatar className="h-11 w-11 ring-2 ring-primary/10">
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback className="bg-primary/5 text-primary">
            {user?.name?.[0] ?? "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <Textarea
            placeholder="¿Qué estás pensando? Compártelo con el equipo…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setOpen(true)}
            className="min-h-[56px] resize-none border-0 bg-transparent px-1 py-2 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0"
          />

          {open && (
            <>
              <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
                <Select
                  value={type}
                  onValueChange={(v) => {
                    setType(v as FeedPostType);
                    if (v !== FeedPostType.RECOGNITION) setRecognizedUser(null);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[200px] border-0 bg-muted/50 text-sm font-medium hover:bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isRecognition && (
                  <RecognitionUserPicker
                    value={recognizedUser}
                    onChange={setRecognizedUser}
                  />
                )}

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    disabled={!canSubmit || isSubmitting}
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-primary to-primary/80 font-medium shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Publicar
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
