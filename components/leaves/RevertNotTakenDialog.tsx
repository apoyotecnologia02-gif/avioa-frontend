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
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface RevertNotTakenDialogProps {
  leaveRequestId: string;
  nombreColaborador: string;
  businessDays: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RevertNotTakenDialog({
  leaveRequestId,
  nombreColaborador,
  businessDays,
  open,
  onOpenChange,
  onSuccess,
}: RevertNotTakenDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.patch(`/leaves/${leaveRequestId}/revert-not-taken`);
      toast({
        title: "Marca revertida",
        description: `Se volvieron a descontar ${businessDays} día(s) del saldo de ${nombreColaborador}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["nomina"] });
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Ocurrió un error al revertir la marca.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revertir "no tomada"</AlertDialogTitle>
          <AlertDialogDescription>
            Esto vuelve a descontar {businessDays} día(s) del saldo de{" "}
            {nombreColaborador}, como si la vacación sí se hubiera tomado. Úsalo
            solo si la marca anterior fue un error.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar reversión
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
