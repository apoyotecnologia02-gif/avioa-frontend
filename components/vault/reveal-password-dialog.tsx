"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ShieldCheck } from "lucide-react";
import { VaultItem } from "@/types/password-vault.types";
import { useRevealPassword } from "@/hooks/useRevealPasswordVault";

interface RevealPasswordDialogProps {
  item: VaultItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevealed: (password: string) => void;
}

export function RevealPasswordDialog({
  item,
  open,
  onOpenChange,
  onRevealed,
}: RevealPasswordDialogProps) {
  const { isSubmitting, error, reveal } = useRevealPassword();
  const [totpCode, setTotpCode] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  async function handleConfirm() {
    try {
      const res = await reveal(item?.passwordVaultId as string, {
        totpCode,
        loginPassword: loginPassword || undefined,
      });
      onRevealed(res.password);
      onOpenChange(false);
      setTotpCode("");
      setLoginPassword("");
    } catch {}
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          </div>
          <DialogTitle className="text-center">
            Confirma tu identidad
          </DialogTitle>
          <DialogDescription>
            Necesitamos verificar que eres tú antes de mostrar la contraseña
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Código 2FA</Label>
            <Input
              id="totp"
              inputMode="numeric"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="000000"
              autoFocus
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">o</p>
          <div className="space-y-1">
            <Label htmlFor="pwd">Tu contraseña</Label>
            <Input
              id="pwd"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Verificando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
