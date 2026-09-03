"use client";

import { Copy, ShieldCheck } from "lucide-react";

// import * as QRCode from "qrcode";
import { useQRCode } from "next-qrcode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";


interface TwoFactorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: string | null;
  secret: string;
  onContinue: () => void;
  setTwoFactorEnabled: (enabled: boolean) => void;
}

export default function TwoFactorModal({
  open,
  onOpenChange,
  qrCode,
  secret,
  onContinue,
  setTwoFactorEnabled,
}: TwoFactorModalProps) {
  const { Image } = useQRCode();
  const [loading, setLoading] = useState(false);
  const [secretTxt, setSecretTxt] = useState("");

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    toast.success("Clave copiada al portapapeles.");
  };

  useEffect(() => {
    setSecretTxt(secret);
  }, [secret]);

  if (!qrCode) return null;

  const handleSaveTwoFactor = async () => {
    try {
      setLoading(true);
      const { data } = await api.post(
        "/auth/2fa/enable",
        { secret: secretTxt },
        { skip401Redirect: true },
      );
      toast.success(data.message);
      setTwoFactorEnabled(true);
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al guardar la clave.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>

          <DialogTitle>Configurar autenticación en dos pasos</DialogTitle>

          <DialogDescription>
            Escanea el siguiente código QR con tu aplicación de autenticación
            para vincular tu cuenta.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5">
          <div className="rounded-lg border bg-card p-4">
            <Image
              text={qrCode}
              options={{
                width: 220,
                margin: 2,
              }}
            />
          </div>

          <div className="w-full">
            <Separator className="mb-4" />

            <p className="mb-2 text-sm font-medium">
              ¿No puedes escanear el código?
            </p>

            <p className="mb-3 text-sm text-muted-foreground">
              Ingresa esta clave manualmente en tu aplicación de autenticación.
            </p>

            <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
              <code className="break-all font-mono text-sm">{secret}</code>

              <Button
                variant="ghost"
                size="icon"
                onClick={copySecret}
                title="Copiar clave"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="w-full space-y-2">
            <p className="mb-2 text-sm font-medium">
              Descarga los codigos de recuperación por seguridad.
            </p>

            <div className="flex items-center justify-between gap-2">
              <Button variant="outline">Descargar codigos</Button>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <p className="font-medium">Siguientes pasos</p>

            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Descarga los codigos de recuperación</li>
              <li>Abre Google Authenticator o Microsoft Authenticator.</li>
              <li>Escanea el código QR o ingresa la clave manualmente</li>
              <li>
                Presiona <strong>Continuar</strong>.
              </li>
              <li>
                Ingresa el código de 6 dígitos generado por la aplicación.
              </li>
            </ol>
          </div>

          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>

            <Button onClick={handleSaveTwoFactor}>Continuar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
