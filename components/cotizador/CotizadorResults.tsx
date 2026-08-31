"use client";

import { useMemo } from "react";
import { useCotizadorStore } from "@/store/useCotizadorStore";
import { generarTextoCombinadoComercial } from "@/lib/cotizador-parser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CotizadorResumen } from "./CotizadorResumen";
import { CotizadorVuelos } from "./CotizadorVuelos";
import { CotizadorHoteles } from "./CotizadorHoteles";

export function CotizadorResults() {
  const result = useCotizadorStore((s) => s.result);

  const textoCombinado = useMemo(() => {
    if (!result) return "";
    return generarTextoCombinadoComercial(
      result.vuelos.resultado_ia.recomendacion,
      result.hoteles.texto,
    );
  }, [result]);

  if (!result) return null;

  return (
    <Tabs defaultValue="resumen" className="mt-4">
      <TabsList>
        <TabsTrigger value="resumen">Resumen comercial</TabsTrigger>
        <TabsTrigger value="vuelos">Vuelos</TabsTrigger>
        <TabsTrigger value="hoteles">Hoteles</TabsTrigger>
      </TabsList>

      <TabsContent value="resumen">
        <CotizadorResumen texto={textoCombinado} />
      </TabsContent>

      <TabsContent value="vuelos">
        <CotizadorVuelos resultadoIA={result.vuelos.resultado_ia} />
      </TabsContent>

      <TabsContent value="hoteles">
        <CotizadorHoteles
          resultados={result.hoteles.resultados}
          texto={result.hoteles.texto}
        />
      </TabsContent>
    </Tabs>
  );
}
