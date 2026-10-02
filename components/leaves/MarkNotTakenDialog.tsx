"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/axios";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface MarkNotTakenDialogProps {
  leaveRequestId: string;
  nombreColaborador: string;
  businessDays: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MarkNotTakenDialog({
  leaveRequestId,
  nombreColaborador,
  businessDays,
  open,
  onOpenChange,
  onSuccess,
}: MarkNotTakenDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError("El motivo es obligatorio");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.patch(`/leaves/${leaveRequestId}/mark-not-taken`, {
        reason: reason.trim(),
      });
      toast({
        title: "Marcada como no tomada",
        description: `Se devolvieron ${businessDays} día(s) al saldo de ${nombreColaborador}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["nomina"] });
      onSuccess?.();
      onOpenChange(false);
      setReason("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Ocurrió un error al procecesar la solicitud.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Marcar vacaciones como no tomadas</AlertDialogTitle>
          <AlertDialogDescription>
            Los {businessDays} días de {nombreColaborador} se devolverán a su
            saldo disponible. Esta acción queda registrada y puede revertirse si
            fue un error.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <label className="text-sm font-medium">
            Motivo <span className="text-destructive">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: El colaborador siguió trabajando esos días por necesidad operativa..."
            className="resize-none min-h-[80px]"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            variant="destructive"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar y devolver días
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
