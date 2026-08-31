"use client";

import { CotizadorForm } from "@/components/cotizador/CotizadorForm";
import { CotizadorProgress } from "@/components/cotizador/CotizadorProgress";
import { CotizadorResults } from "@/components/cotizador/CotizadorResults";
import { useCotizadorStore } from "@/store/useCotizadorStore";

export default function CotizadorPage() {
  const status = useCotizadorStore((s) => s.status);

  return (
    <div className="mx-auto max-w-3xl space-y-4 py-6">
      <div>
        <h1 className="text-xl font-semibold">
          Cotizador IA de vuelos + hoteles
        </h1>
        <p className="text-sm text-muted-foreground">
          Escribe tu solicitud en lenguaje natural y la IA se encarga del resto.
        </p>
      </div>

      <CotizadorForm />
      <CotizadorProgress />
      {status === "completed" && <CotizadorResults />}
    </div>
  );
}
