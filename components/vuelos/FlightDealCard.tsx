import { fmtFecha, fmtPrecio } from "@/lib/format";
import { OfertaVuelo } from "@/types/vuelos.types";
import { CalendarDays, Clock, MapPin, Plane } from "lucide-react";

export function FlightDealCard({ deal }: { deal: OfertaVuelo }) {
  return (
    <article className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
      <div className="relative h-36 bg-gradient-to-br from-sky-500 to-indigo-600">
        <div className="absolute inset-0 bg-black/20" />

        {deal.ganga && (
          <span
            className="absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none text-white"
            style={{ backgroundColor: "#10b981" }}
          >
            GANGA
          </span>
        )}

        <div className="absolute right-3 top-3 rounded-xl bg-white/95 px-3 py-1.5 text-right shadow-sm backdrop-blur">
          <p className="text-lg font-bold leading-none text-foreground">
            {fmtPrecio(deal.precio, deal.moneda)}
          </p>
          {deal.pct_vs_piso != null && deal.pct_vs_piso < 0 && (
            <p className="text-[11px] text-emerald-600">
              {deal.pct_vs_piso.toFixed(0)}% bajo lo típico
            </p>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <MapPin className="h-3.5 w-3.5" />
            {deal.origen} → {deal.destino}
          </p>
          <p className="text-xs opacity-90">{deal.hoja}</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {fmtFecha(deal.ida)} – {fmtFecha(deal.regreso)}
          </span>
          <span className="text-xs">·</span>
          <span className="text-xs">{deal.noches} noches</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Plane className="h-3.5 w-3.5" />
            {deal.aerolinea_ida}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {deal.duracion_ida}
          </span>
          <span>
            {deal.escalas_ida === 0
              ? "Directo"
              : `${deal.escalas_ida} escala${deal.escalas_ida > 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-[11px] text-muted-foreground">
            {deal.vendedor}
          </span>
          <a
            href={deal.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver oferta →
          </a>
        </div>
      </div>
    </article>
  );
}
