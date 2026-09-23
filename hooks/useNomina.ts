"use client";

import { api } from "@/lib/axios";
import {
  FiltrosNomina,
  NovedadConsolidada,
  ResumenColaborador,
  TotalesNomina,
} from "@/types/nomina.types";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useState } from "react";

function buildParams(filtros: FiltrosNomina) {
  return {
    desde: filtros.desde,
    hasta: filtros.hasta,
    ...(filtros.userId && { userId: filtros.userId }),
    ...(filtros.area && { area: filtros.area }),
    ...(filtros.legalEntity && { legalEntity: filtros.legalEntity }),
    ...(filtros.soloRemuneradas !== undefined && {
      soloRemuneradas: filtros.soloRemuneradas,
    }),
    ...(filtros.tipos?.length && { tipos: filtros.tipos.join(",") }),
  };
}

export function useNovedadesConsolidadas(
  filtros: FiltrosNomina,
  enabled = true,
) {
  return useQuery<NovedadConsolidada[]>({
    queryKey: ["nomina", "novedades", filtros],
    queryFn: async () => {
      const { data } = await api.get("/nomina/novedades", {
        params: buildParams(filtros),
        skip401Redirect: true,
      });
      return data;
    },
    enabled: enabled && !!filtros.desde && !!filtros.hasta,
  });
}

export function useResumenPorColaborador(
  filtros: FiltrosNomina,
  enabled = true,
) {
  return useQuery<ResumenColaborador[]>({
    queryKey: ["nomina", "por-colaborador", filtros],
    queryFn: async () => {
      const { data } = await api.get("/nomina/novedades/por-colaborador", {
        params: buildParams(filtros),
        skip401Redirect: true,
      });
      return data;
    },
    enabled: enabled && !!filtros.desde && !!filtros.hasta,
  });
}

export function useTotalesNomina(filtros: FiltrosNomina, enabled = true) {
  return useQuery<TotalesNomina>({
    queryKey: ["nomina", "totales", filtros],
    queryFn: async () => {
      const { data } = await api.get("/nomina/novedades/totales", {
        params: buildParams(filtros),
        skip401Redirect: true,
      });
      return data;
    },
    enabled: enabled && !!filtros.desde && !!filtros.hasta,
  });
}

export function useExportarNominaExcel() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportar = async (filtros: FiltrosNomina) => {
    setIsExporting(true);

    try {
      const params = {
        desde: filtros.desde,
        hasta: filtros.hasta,
        ...(filtros.userId && { userId: filtros.userId }),
        ...(filtros.area && { area: filtros.area }),
        ...(filtros.legalEntity && { legalEntity: filtros.legalEntity }),
        ...(filtros.tipos?.length && { tipos: filtros.tipos.join(",") }),
      };

      const response = await api.get("/nomina/novedades/export", {
        params,
        responseType: "blob",
      });

      const disposition = response.headers["content-disposition"] as
        | string
        | undefined;
      const match = disposition?.match(
        /filename\*?=(?:UTF-8'')?["']?([^"';]+)/,
      );
      const filename = match
        ? decodeURIComponent(match[1])
        : "novedades_nomina_${filtros.desde}_${filtros.hasta}.xlsx";

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      let mensaje = "Ocurrió un error al generar el archivo.";

      if (err?.response?.data instanceof Blob) {
        try {
          const texto = await err.response.data.text();
          const parsed = JSON.parse(texto);
          mensaje = parsed.message || parsed.error || mensaje;
        } catch {}
      }

      toast({
        title: "Error al exportar",
        description: mensaje,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportar, isExporting };
}
