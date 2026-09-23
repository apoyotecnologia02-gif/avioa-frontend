"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Coins,
  FileText,
  Loader2,
  Inbox,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

import {
  useLeavesPendingHRValidation,
  useValidateByHR,
} from "@/hooks/useHRLeaveValidation";
import { LEAVE_TYPE_META, LeaveRequest } from "@/types/leaves.types";

type Accion = "APPROVE" | "REJECT";

interface ConfirmState {
  leave: LeaveRequest;
  action: Accion;
}

export default function HRLeaveValidationPage() {
  const { toast } = useToast();
  const { data: leaves, isLoading } = useLeavesPendingHRValidation();
  const { mutateAsync: validar, isPending } = useValidateByHR();

  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const abrirConfirmacion = (leave: LeaveRequest, action: Accion) => {
    setConfirm({ leave, action });
    setComment("");
    setError(null);
  };

  const handleConfirmar = async () => {
    if (!confirm) return;

    if (confirm.action === "REJECT" && !comment.trim()) {
      setError("El motivo de rechazo es obligatorio.");
      return;
    }

    try {
      await validar({
        leaveRequestId: confirm.leave.leaveRequestId,
        dto: { action: confirm.action, comment: comment.trim() || undefined },
      });
      toast({
        title:
          confirm.action === "APPROVE"
            ? "Validada — enviada al líder"
            : "Solicitud rechazada",
        description:
          confirm.action === "APPROVE"
            ? `${confirm.leave.user?.name ?? "El colaborador"} ahora espera aprobación de su líder.`
            : `Se notificó a ${confirm.leave.user?.name ?? "el colaborador"}.`,
      });
      setConfirm(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Ocurrió un error al procesar la solicitud.",
      );
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-2 sm:py-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Validación de vacaciones compensadas
        </h1>
        <p className="text-sm text-muted-foreground">
          Solicitudes que el colaborador marcó para pagarse en dinero —
          requieren tu visto bueno antes de pasar al líder.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : !leaves || leaves.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No hay solicitudes de vacaciones compensadas pendientes de
              validar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => {
            const typeMeta = LEAVE_TYPE_META[leave.type];

            return (
              <Card key={leave.leaveRequestId}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">
                          {leave.user?.name ?? "Colaborador"}
                        </p>
                        <Badge variant="outline" className={typeMeta.accent}>
                          {typeMeta.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="gap-1 text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                        >
                          <Coins className="h-3 w-3" /> Compensada
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {leave.user?.position ?? "—"}
                        {leave.user?.department
                          ? ` · ${leave.user.department}`
                          : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Solicitado el{" "}
                        {new Date(leave.createdAt).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {leave.businessDays} día(s) hábiles
                    </span>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-3 text-sm">
                    <span className="text-muted-foreground">Periodo: </span>
                    {new Date(leave.startDate).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                    })}
                    {" – "}
                    {new Date(leave.endDate).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>

                  <p className="text-sm text-foreground">{leave.reason}</p>

                  {leave.attachmentUrl && (
                    <a
                      href={leave.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" /> Ver soporte adjunto
                    </a>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
                      onClick={() => abrirConfirmacion(leave, "APPROVE")}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Validar y enviar
                      al líder
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                      onClick={() => abrirConfirmacion(leave, "REJECT")}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.action === "APPROVE"
                ? "Validar solicitud"
                : "Rechazar solicitud"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.action === "APPROVE"
                ? `Al validar, la solicitud de ${confirm?.leave.user?.name ?? "el colaborador"} pasará a revisión de su líder. GH no está aprobando las vacaciones, solo confirmando que la información es correcta.`
                : `¿Confirmas que deseas rechazar la solicitud de ${confirm?.leave.user?.name ?? "el colaborador"}? No pasará al líder.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">
              Comentario{" "}
              {confirm?.action === "REJECT" && (
                <span className="text-destructive">*</span>
              )}
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                confirm?.action === "REJECT"
                  ? "Explica por qué se rechaza (obligatorio)..."
                  : "Comentario opcional para el colaborador o el líder..."
              }
              className="resize-none min-h-[80px]"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirm(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmar}
              disabled={isPending}
              variant={
                confirm?.action === "APPROVE" ? "default" : "destructive"
              }
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirm?.action === "APPROVE"
                ? "Confirmar validación"
                : "Confirmar rechazo"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
