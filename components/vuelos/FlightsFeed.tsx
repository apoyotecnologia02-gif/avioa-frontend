"use client";

import { useFlightFilters } from "@/hooks/useFlightFilters";
import { useVuelosOfertas } from "@/hooks/useVuelosOferta";
import { DEFAULT_LIMIT, MAX_LIMIT } from "@/types/vuelos.types";
import { FilterPanelDesktop, FilterPanelMobile } from "./FilterPane";
import { FilterChips } from "./FilterChips";
import { FeedSkeletonFlight } from "./FeedSkeletonFlight";
import { FeedEmpty } from "./FeedEmptyFlight";
import { FlightDealCard } from "./FlightDealCard";
import { Button } from "../ui/button";

export function FlightsFeed() {
  const { filters, setFilter, activeCount } = useFlightFilters();
  const { data, loading, error } = useVuelosOfertas(filters);

  const limit = filters.limit ?? DEFAULT_LIMIT;
  const hasMore = data.length >= limit && limit < MAX_LIMIT;
  const reachedEnd = !loading && data.length < limit;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vuelos baratos</h1>
          <p className="text-sm text-muted-foreground">
            {loading && data.length === 0
              ? "Cargando ofertas…"
              : `${data.length} oferta${data.length === 1 ? "" : "s"}${
                  activeCount > 0
                    ? ` · ${activeCount} filtro${activeCount === 1 ? "" : "s"} activo${activeCount === 1 ? "" : "s"}`
                    : ""
                }`}
          </p>
        </div>
        <FilterPanelMobile />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <FilterPanelDesktop />

        <main className="min-w-0">
          <FilterChips />

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          {loading && data.length === 0 && <FeedSkeletonFlight />}

          {!loading && data.length === 0 && !error && (
            <FeedEmpty filtered={activeCount > 0} />
          )}

          {data.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.map((deal, i) => (
                  <FlightDealCard
                    key={
                      deal.id ??
                      `${deal.origen}-${deal.destino}-${deal.ida}-${i}`
                    }
                    deal={deal}
                  />
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                {hasMore && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilter(
                        "limit",
                        Math.min(limit + DEFAULT_LIMIT, MAX_LIMIT),
                      )
                    }
                    disabled={loading}
                  >
                    {loading
                      ? "Cargando..."
                      : `Ver más (${data.length}/${MAX_LIMIT})`}
                  </Button>
                )}
                {reachedEnd && data.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {limit >= MAX_LIMIT
                      ? "Has visto todas las ofertas disónibles"
                      : "No hay más ofertas por ahora"}
                  </p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
