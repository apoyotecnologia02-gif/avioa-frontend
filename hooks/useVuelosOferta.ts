"use client";

import { fetchOfertas } from "@/lib/format";
import { FiltrosVuelos, OfertaVuelo } from "@/types/vuelos.types";
import { useEffect, useRef, useState } from "react";

export function useVuelosOfertas(filters: FiltrosVuelos) {
  const [data, setData] = useState<OfertaVuelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersKey = JSON.stringify(filters);
  const prevKeyRef = useRef<string>("");

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const isLoadMore =
      prevKeyRef.current !== "" &&
      onlyLimitChanged(prevKeyRef.current, filtersKey);

    setLoading(true);
    setError(null);
    if (!isLoadMore) setData([]);

    fetchOfertas(filters, controller.signal)
      .then((items) => {
        if (cancelled) return;
        setData(items);
      })
      .catch((err: any) => {
        if (cancelled) return;
        if (isCancel(err) || controller.signal.aborted) return;
        setError(err.message ?? "Error al cargar ofertas");
      })
      .finally(() => {
        setLoading(false);
        prevKeyRef.current = filtersKey;
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  return { data, loading, error };
}

function onlyLimitChanged(prev: string, curr: string) {
  try {
    const a = { ...JSON.parse(prev), limit: 0 };
    const b = { ...JSON.parse(curr), limit: 0 };
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function isCancel(err: any): boolean {
  return (
    err?.name === "AbortError" ||
    err?.name === "CanceledError" ||
    err?.name === "CancelledError" ||
    err?.code === "ERR_CANCELED" ||
    err?.message === "canceled" ||
    err?.message === "The user aborted a request."
  );
}
