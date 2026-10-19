"use client";

import { api } from "@/lib/axios";
import {
  ArrowRight,
  Calendar,
  ExternalLink,
  Flame,
  Moon,
  Plane,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

type Vuelo = {
  id: number;
  visto_en: string;
  origen: string;
  destino: string;
  ida: string;
  regreso: string;
  noches: number;
  precio: number;
  moneda: string;
  nivel: string;
  piso: number;
  techo: number;
  pct_vs_piso: number;
  ganga: number;
  vendedor: string;
  precio_vendedor: number;
  aerolinea_ida: string;
  aerolinea_regreso: string;
  escalas_ida: number;
  escalas_regreso: number;
  link: string;
};

const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export function FlightDealsContent() {
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.get("/vuelos/mejores-del-dia", {
          skip401Redirect: true,
        });
        if (!cancelled) setVuelos(data.data);
      } catch {
        if (!cancelled) setError("Error al obtener los vuelos");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) return <FlightDealsSkeleton />;
  if (error || vuelos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
          <Plane className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          No hay ofertas disponibles
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Vuelve más tarde para ver nuevas ofertas
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {vuelos.map((v) => (
        <FlightDealCard key={v.id} vuelo={v} />
      ))}
    </div>
  );
}

function FlightDealCard({ vuelo }: { vuelo: Vuelo }) {
  const discount = Math.round(vuelo.pct_vs_piso);
  const isGanga = vuelo.ganga === 1;
  const directo = vuelo.escalas_ida === 0 && vuelo.escalas_regreso === 0;

  return (
    <a
      href={vuelo.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex w-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Plane className="h-3.5 w-3.5" />
          {directo
            ? "Directo"
            : `${vuelo.escalas_ida} escala${vuelo.escalas_ida > 1 ? "s" : ""}`}
          <span className="text-border">·</span>
          <span className="truncate">{vuelo.vendedor}</span>
        </div>
        {isGanga && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
            <Flame className="h-3 w-3" />
            Ganga
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-lg font-bold tracking-tight">{vuelo.origen}</span>
        <div className="flex flex-1 items-center gap-1">
          <div className="h-px flex-1 bg-border" />
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight">
          {vuelo.destino}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(vuelo.ida)} – {formatDate(vuelo.regreso)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Moon className="h-3.5 w-3.5" />
          {vuelo.noches} {vuelo.noches === 1 ? "noche" : "noches"}
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 pt-1">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {cop.format(vuelo.precio)}
            </span>
            {discount > 0 && (
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                −{discount}%
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground line-through">
            {cop.format(vuelo.piso)}
          </div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
      </div>
    </a>
  );
}

function FlightDealsSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-[150px] animate-pulse rounded-2xl border border-border/60 bg-muted/40"
        />
      ))}
    </div>
  );
}