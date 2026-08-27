"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePermanentDeleteVault,
  useRestoreVault,
  useVaultTrash,
} from "@/hooks/useVaultTrash";
import { RotateCcw, Trash, Trash2 } from "lucide-react";
import { useState } from "react";

export default function PasswordsTrashPage() {
  const { items, isLoading, reload } = useVaultTrash();
  const { restore, isSubmitting: isRestoring } = useRestoreVault(reload);
  const { permanentDelete, isSubmitting: isDeleting } =
    usePermanentDeleteVault(reload);

  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  async function handleConfirmPermanentDelete() {
    if (!confirmTarget) return;
    await permanentDelete(confirmTarget);
    setConfirmTarget(null);
  }

  return (
    <div className="container mx-auto mx-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Papelera</h1>
        <p className="text-sm text-muted-foreground">
          Las credenciales eliminadas se conservan aquí 30 días antes de
          borrarse definitivamente.
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Días restantes</TableHead>
              <TableHead className="text-rigth">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              </TableRow>
            )}

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-muted-foreground"
                >
                  <Trash className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  La papelera esta vacia
                </TableCell>
              </TableRow>
            )}

            {items.map((item) => (
              <TableRow key={item.passwordVaultId}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  {item.category ? <Badge>{item.category.name}</Badge> : "-"}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      item.daysRemainig <= 5
                        ? "font-medium text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    {item.daysRemainig} día
                    {item.daysRemainig === 1 ? "" : "s"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => restore(item.passwordVaultId)}
                    disabled={isRestoring}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restaurar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmTarget(item.passwordVaultId)}
                    aria-label="Eliminar definitivamente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La credencial y su historial se
              borarán por completo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPermanentDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
