"use client";

import { CalendarDays, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import { LEAVE_TYPE_META, type LeaveRequest } from "@/types/leaves.types";

interface LeaveTimelineProps {
  leaves: LeaveRequest[];
  isLoading: boolean;
  onCancel?: (id: string) => void;
  isCancelling?: boolean;
}

function fmt(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function LeaveTimeline({
  leaves,
  isLoading,
  onCancel,
  isCancelling,
}: LeaveTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
        <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">Aún no tienes solicitudes</p>
        <p className="text-xs text-muted-foreground">
          Cuando solicites vacaciones o un permiso, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {leaves.map((leave, i) => {
        const meta = LEAVE_TYPE_META[leave.type];
        const isLast = i === leaves.length - 1;
        return (
          <div key={leave.leaveRequestId} className="flex gap-3">
            {/* Riel del timeline */}
            <div className="flex flex-col items-center pt-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
              {!isLast && <span className="mt-1 w-px flex-1 bg-border" />}
            </div>

            {/* Contenido */}
            <div className={`flex-1 ${isLast ? "" : "pb-4"}`}>
              <div className="rounded-xl border bg-card p-3 transition-colors hover:border-primary/30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{meta.label}</span>
                      {leave.attachmentUrl && (
                        <a
                          href={leave.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                          title="Ver soporte"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {fmt(leave.startDate)} – {fmt(leave.endDate)} ·{" "}
                      {leave.businessDays} día(s) hábiles
                    </p>
                  </div>
                  <LeaveStatusBadge status={leave.status} />
                </div>

                {leave.reason && (
                  <p className="mt-2 text-sm text-muted-foreground/90">
                    {leave.reason}
                  </p>
                )}

                {/* Comentario del líder al rechazar */}
                {leave.status === "REJECTED" && leave.comment && (
                  <div className="mt-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
                    <strong>Motivo del rechazo:</strong> {leave.comment}
                  </div>
                )}

                {/* Cancelar (solo pendientes propias) */}
                {leave.status === "PENDING" && onCancel && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-rose-600"
                      onClick={() => onCancel(leave.leaveRequestId)}
                      disabled={isCancelling}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
