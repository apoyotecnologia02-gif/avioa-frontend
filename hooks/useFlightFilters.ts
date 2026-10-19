"use client";

import { DEFAULT_LIMIT, FiltrosVuelos } from "@/types/vuelos.types";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

const URL_MAP: Record<keyof FiltrosVuelos, string> = {
  origen: "origen",
  destino: "destino",
  aerolinea: "aerolinea",
  solo_gangas: "gangas",
  precio_min: "min",
  precio_max: "max",
  max_escalas: "escalas",
  fecha_ida_desde: "desde",
  fecha_ida_hasta: "hasta",
  horas: "horas",
  limit: "limit",
};

export function useFlightFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<FiltrosVuelos>(() => {
    const g = (k: string) => searchParams.get(k) ?? undefined;

    const n = (k: string) => {
      const v = searchParams.get(k);
      return v !== null && v !== "" ? Number(v) : undefined;
    };
    return {
      origen: g("origen"),
      destino: g("destino"),
      aerolinea: g("aerolinea"),
      solo_gangas: searchParams.get("gangas") === "1" ? true : undefined,
      precio_min: n("min"),
      precio_max: n("max"),
      max_escalas: n("escalas"),
      fecha_ida_desde: g("desde"),
      fecha_ida_hasta: g("hasta"),
      horas: n("horas"),
      limit: n("limit") ?? DEFAULT_LIMIT,
    };
  }, [searchParams]);

  const setFilter = useCallback(
    (
      key: keyof FiltrosVuelos,
      value: string | number | boolean | undefined,
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      const urlKey = URL_MAP[key];

      if (key === "solo_gangas") {
        if (value === true) params.set(urlKey, "1");
        else params.delete(urlKey);
      } else if (value === undefined || value === null || value === "") {
        params.delete(urlKey);
      } else {
        params.set(urlKey, String(value));
      }

      if (key !== "limit") params.delete("limit");

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const removeFilter = useCallback(
    (key: keyof FiltrosVuelos) => setFilter(key, undefined),
    [setFilter],
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const activeCount = useMemo(
    () =>
      (Object.keys(filters) as (keyof FiltrosVuelos)[]).filter(
        (k) => k !== "limit" && filters[k] !== undefined,
      ).length,
    [filters],
  );

  return { filters, setFilter, removeFilter, clearAll, activeCount };
}
