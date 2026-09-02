"use client";

import { VaultItem } from "@/types/password-vault.types";
import { useState } from "react";
import { useToggleFavoriteVault } from "@/hooks/useToggleFavoriteVault";
import { useDeleteVault } from "@/hooks/useDeleteVault";
import { useRevealPassword } from "@/hooks/useRevealPasswordVault";
import {
  Copy,
  ExternalLink,
  Eye,
  Pencil,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { StrengthBadge } from "./strength-badge";
import { Badge } from "../ui/badge";
import { RevealPasswordDialog } from "./reveal-password-dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
} from "@radix-ui/react-alert-dialog";
import { ShareVaultDialog } from "./ShareVaultDialog";
import { toast } from "sonner";

interface VaultDetailsProps {
  item: VaultItem;
  onEdit: (item: VaultItem) => void;
  onDeleted: () => void;
  onFavoriteToggled: () => void;
  revealedPassword: {
    password: string;
    itemId: string;
  } | null;

  onRevealed: (password: string) => void;
}

export function VaultDetails({
  item,
  onEdit,
  onDeleted,
  onFavoriteToggled,
  revealedPassword,
  onRevealed,
}: VaultDetailsProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  // const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  // const [revealedPassword, setRevealedPassword] = useState<{
  //   itemId: string;
  //   password: string;
  // } | null>(null);

  const [shareOpen, setShareOpen] = useState(false);

  const { toggleFavorite } = useToggleFavoriteVault(onFavoriteToggled);
  const { deleteVault, isSubmitting: isDeleting } = useDeleteVault(onDeleted);
  const { logCopy, reveal } = useRevealPassword();

  async function handleCopy(field: "USERNAME" | "PASSWORD", value?: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    await logCopy(item.passwordVaultId, field);
    const toastMessage =
      field === "USERNAME" ? "Usuario copiado" : "Clave copiada";
    toast.success(`${toastMessage} al portapapeles.`);
  }

  async function handleConfirmDelete() {
    await deleteVault(item.passwordVaultId);
    setConfirmDeleteOpen(false);
  }

  async function handleCopyWithoutReveal(passwordVaultId: string) {
    const password = await reveal(passwordVaultId, {
      onlyCopy: true,
    });

    await navigator.clipboard.writeText(password.password);
    await logCopy(passwordVaultId, "PASSWORD");
    toast.success("Clave copiada al portapapeles.");
  }

  const identifier = item.username ?? item.email;

  const isRevealed = revealedPassword?.itemId === item.passwordVaultId;

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden">
      <div className="flex min-w-0 items-start justify-between gap-3 border-b p-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{item.title}</h2>
          {item.website && (
            <a
              href={
                item.website.startsWith("http")
                  ? item.website
                  : `https://${item.website}`
              }
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground hover:underline"
            >
              <span className="truncate">{item.website}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(item.passwordVaultId)}
            aria-label={
              item.favorite ? "Quitar de favoritos" : "Agregar a favoritos"
            }
          >
            <Star
              className={`h-4 w-4 ${item.favorite ? "fill-yellow-400 text-yellow" : ""}`}
            />
          </Button>

          {item.canAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShareOpen(true)}
              aria-label="Compartir"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}

          {item.canEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {item.canAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-xl space-y-5">
          {identifier && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Usuario
              </p>
              <div className="flex min-w-0 items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{identifier}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => handleCopy("USERNAME", identifier)}
                  aria-label="Copiar usuario"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Contraseña
            </p>
            <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 break-all font-mono">
                {isRevealed ? revealedPassword?.password : "••••••••••••"}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                {isRevealed ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() =>
                      handleCopy("PASSWORD", revealedPassword.password)
                    }
                    aria-label="Copiar contraseña"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setRevealOpen(true)}
                      aria-label="Mostrar contraseña"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        handleCopyWithoutReveal(item.passwordVaultId)
                      }
                      aria-label="Copiar contraseña"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Fortaleza
            </p>
            <StrengthBadge level={item.strengthLevel} />
          </div>

          {item.category && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Categoría
              </p>
              <Badge variant="outline">{item.category.name}</Badge>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Etiquetas
              </p>
              <div className="flex flex-wrap gap-1">
                {item.tags.map(({ tag }) => (
                  <Badge key={tag.name} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {item.notes && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Notas</p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {item.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      <RevealPasswordDialog
        item={item}
        open={revealOpen}
        onOpenChange={setRevealOpen}
        // onRevealed={(password) => {
        //   setRevealedPassword({ password, itemId: item.passwordVaultId });
        //   setTimeout(() => setRevealedPassword(null), 15000);
        // }}
        onRevealed={onRevealed}
      />

      <ShareVaultDialog
        vaultId={item.passwordVaultId}
        vaultTitle={item.title}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Enviar a la papelera?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{item.title}&quot; se moverá a la papelera. Podrás
              restaurarla dentro de los próximos 30 días.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="mr-2">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
