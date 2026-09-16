"use client";

import { api } from "@/lib/axios";
import {
  FiltrosNomina,
  NovedadConsolidada,
  ResumenColaborador,
  TotalesNomina,
} from "@/types/nomina.types";
import { useQuery } from "@tanstack/react-query";

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
