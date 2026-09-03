// components/cotizador/CotizadorProgress.tsx
"use client";

import { useCotizadorStore } from "@/store/useCotizadorStore";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";

export function CotizadorProgress() {
  const { status, progress, error } = useCotizadorStore();

  if (status === "idle" || status === "completed") return null;

  if (status === "failed") {
    return (
      <Card className="rounded-2xl border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm font-medium">
            {error ?? "Ocurrió un error procesando la cotización."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl p-5">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {progress?.message ?? "Procesando..."}
      </div>
      <Progress value={progress?.percentage ?? 0} className="mt-3" />
    </Card>
  );
}
