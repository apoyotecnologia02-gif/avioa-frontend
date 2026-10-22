"use client";
import { KeyRound, ArrowUpRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PasswordsPanel({
  embedded,
  onGoIntegration,
}: {
  embedded: boolean;
  onGoIntegration: () => void;
}) {
  return (
    <Card className="mx-auto max-w-3xl p-10 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <KeyRound className="h-8 w-8" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Accesos del equipo
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        Tu bóveda, en el portal
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Auxiliares está preparado para utilizar la bóveda de contraseñas de tu
        frontend, con los permisos y el cifrado existentes.
      </p>
      <div className="mt-6 flex justify-center">
        {embedded ? (
          <Button asChild className="gap-1.5">
            <a href="/passwords">
              Abrir bóveda <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        ) : (
          <Button onClick={onGoIntegration} className="gap-1.5">
            Ver integración <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="mx-auto mt-6 max-w-md rounded-lg bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        Este sitio no solicita ni almacena contraseñas. La bóveda se conecta al
        integrar el módulo en el portal.
      </p>
    </Card>
  );
}
