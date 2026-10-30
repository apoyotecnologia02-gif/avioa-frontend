import { fmtFecha, fmtPrecio } from "@/lib/format";
import { OfertaVuelo } from "@/types/vuelos.types";
import { CalendarDays, Clock, Info, MapPin, Plane } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const formatHora = (fechaHora?: string) => {
  if (!fechaHora) return "--:--";
  const parts = fechaHora.split(" ");
  return parts.length > 1 ? parts[1] : fechaHora;
};

const textoEscalas = (escalas?: number) => {
  if (escalas === undefined || escalas === null) return "";
  return escalas === 0
    ? "Directo"
    : `${escalas} escala${escalas > 1 ? "s" : ""}`;
};

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

        {/* NUEVO BLOQUE DE ITINERARIO (IDA Y REGRESO) */}
        <div className="rounded-lg border bg-slate-50/50 p-3">
          {/* SECCIÓN IDA */}
          <div className="mb-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ida
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                {formatHora(deal.salida_ida)}
              </span>

              <div className="flex flex-1 items-center px-2">
                <div className="h-px flex-1 border-t border-dashed border-slate-300"></div>
                <span className="px-2 text-[11px] text-slate-500">
                  {deal.duracion_ida}
                </span>
                <div className="h-px flex-1 border-t border-dashed border-slate-300"></div>
              </div>

              <span className="text-sm font-semibold text-slate-700">
                {formatHora(deal.llegada_ida)}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-slate-500">
              <span>{deal.aerolinea_ida}</span>
              <span>{textoEscalas(deal.escalas_ida)}</span>
            </div>
          </div>

          {/* SECCIÓN REGRESO (solo si existe) */}
          {deal.salida_regreso && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Regreso
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  {formatHora(deal.salida_regreso)}
                </span>

                <div className="flex flex-1 items-center px-2">
                  <div className="h-px flex-1 border-t border-dashed border-slate-300"></div>
                  <span className="px-2 text-[11px] text-slate-500">
                    {deal.duracion_regreso}
                  </span>
                  <div className="h-px flex-1 border-t border-dashed border-slate-300"></div>
                </div>

                <span className="text-sm font-semibold text-slate-700">
                  {formatHora(deal.llegada_regreso as string)}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                <span>{deal.aerolinea_regreso}</span>
                <span>{textoEscalas(deal.escalas_regreso)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-[11px] text-muted-foreground">
            {deal.vendedor}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={deal.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver oferta →
              </a>
            </TooltipTrigger>
            <TooltipContent side="top" align="end" className="max-w-[220px]">
              <p className="text-xs">
                ¿Buscas otro horario? Haz clic en <b>Ver oferta</b> para ver más
                opciones y fechas disponibles.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <p className="flex items-center justify-end gap-1 text-[10px] leading-tight text-muted-foreground">
          <Info className="h-3 w-3 shrink-0" />
          <span>Más horarios y fechas en «Ver oferta»</span>
        </p>
      </div>
    </article>
  );
}
