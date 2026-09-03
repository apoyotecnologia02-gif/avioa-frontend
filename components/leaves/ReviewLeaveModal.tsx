"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Loader2, Paperclip } from "lucide-react";
import {
  LEAVE_TYPE_META,
  type LeaveRequest,
  type ReviewLeaveDto,
} from "@/types/leaves.types";

interface ReviewLeaveModalProps {
  leave: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReview: (id: string, dto: ReviewLeaveDto) => Promise<void>;
  isReviewing: boolean;
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReviewLeaveModal({
  leave,
  open,
  onOpenChange,
  onReview,
  isReviewing,
}: ReviewLeaveModalProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!leave) return null;
  const meta = LEAVE_TYPE_META[leave.type];

  const handle = async (status: "APPROVED" | "REJECTED") => {
    setError(null);
    if (status === "REJECTED" && !comment.trim()) {
      setError("Escribe el motivo del rechazo");
      return;
    }
    try {
      await onReview(leave.leaveRequestId, {
        status,
        comment: comment.trim() || undefined,
      });
      setComment("");
      onOpenChange(false);
    } catch {
      /* toast ya mostrado */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Revisar solicitud</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Empleado */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {leave.user?.name?.charAt(0) ?? "?"}
            </div>
            <div>
              <p className="text-sm font-medium">{leave.user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {leave.user?.position ?? leave.user?.department ?? ""}
              </p>
            </div>
          </div>

          {/* Detalle */}
          <div className={`rounded-xl border p-3 ${meta.accent}`}>
            <p className="text-sm font-medium">{meta.label}</p>
            <p className="mt-1 text-sm">
              {fmt(leave.startDate)} – {fmt(leave.endDate)}
            </p>
            <p className="mt-0.5 text-xs opacity-80">
              {leave.businessDays} día(s) hábiles
            </p>
          </div>

          {/* Motivo del empleado */}
          <div>
            <Label className="text-xs text-muted-foreground">
              Motivo del empleado
            </Label>
            <p className="mt-1 text-sm">{leave.reason}</p>
          </div>

          {leave.attachmentUrl && (
            <a
              href={leave.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Paperclip className="h-3.5 w-3.5" />
              Ver soporte adjunto
            </a>
          )}

          {/* Comentario del líder */}
          <div className="space-y-1.5">
            <Label htmlFor="comment">
              Comentario{" "}
              <span className="text-xs text-muted-foreground">
                (obligatorio si rechazas)
              </span>
            </Label>
            <Textarea
              id="comment"
              rows={2}
              placeholder="Opcional al aprobar, requerido al rechazar"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => handle("REJECTED")}
            disabled={isReviewing}
          >
            {isReviewing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            Rechazar
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handle("APPROVED")}
            disabled={isReviewing}
          >
            {isReviewing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Aprobar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
