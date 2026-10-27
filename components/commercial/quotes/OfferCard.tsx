"use client";

import {
  CalendarDays,
  Copy,
  MapPin,
  Clock3,
  BedDouble,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Modelo local de propuesta.
 * No depende del backend, vive solo en el editor.
 */
export interface PresentedOffer {
  title: string;
  detail: string;
  hotels: Array<{
    name: string;
    rateText: string;
    closureNote: string;
  }>;
  sourceIds: string[];
  closureNote: string;
  presentation: {
    origin: string;
    duration: string;
    accommodation: string;
    dates: string[];
    includes: string[];
    excludes: string[];
    paymentTerms: string[];
    conditions: string[];
  };
}

/** Texto principal de la propuesta (copiable) */
export function offerMainText(offer: PresentedOffer): string {
  const p = offer.presentation;
  const lines: string[] = [];

  lines.push(offer.title);
  lines.push("");

  if (p.origin) lines.push(`Salida desde: ${p.origin}`);
  if (p.duration) lines.push(`Duración: ${p.duration}`);
  if (p.accommodation) lines.push(`Acomodación: ${p.accommodation}`);

  if (offer.detail) {
    lines.push("");
    lines.push(offer.detail);
  }

  if (offer.hotels.length > 0) {
    lines.push("");
    lines.push("Hoteles y tarifas:");
    offer.hotels.forEach((h) => {
      const rate = h.rateText ? ` — ${h.rateText}` : "";
      const note = h.closureNote ? ` (${h.closureNote})` : "";
      lines.push(`• ${h.name}${rate}${note}`);
    });
  }

  if (p.includes.length > 0) {
    lines.push("");
    lines.push("Incluye:");
    p.includes.forEach((item) => lines.push(`• ${item}`));
  }

  if (p.excludes.length > 0) {
    lines.push("");
    lines.push("No incluye:");
    p.excludes.forEach((item) => lines.push(`• ${item}`));
  }

  if (p.conditions.length > 0) {
    lines.push("");
    lines.push("Condiciones:");
    p.conditions.forEach((item) => lines.push(`• ${item}`));
  }

  if (offer.closureNote) {
    lines.push("");
    lines.push(offer.closureNote);
  }

  return lines.join("\n").trim();
}

/** Solo las fechas (para copiar aparte) */
export function offerDatesText(offer: PresentedOffer): string {
  if (offer.presentation.dates.length === 0) {
    return "Fechas por confirmar con el tarifario.";
  }
  return ["Fechas publicadas:", ...offer.presentation.dates.map((d) => `• ${d}`)].join("\n");
}

/** Texto completo (incluye fechas y pagos) */
export function offerClientText(offer: PresentedOffer): string {
  const parts = [offerMainText(offer)];

  if (offer.presentation.dates.length > 0) {
    parts.push("");
    parts.push(offerDatesText(offer));
  }

  if (offer.presentation.paymentTerms.length > 0) {
    parts.push("");
    parts.push("Pagos y condiciones:");
    offer.presentation.paymentTerms.forEach((item) =>
      parts.push(`• ${item}`),
    );
  }

  if (offer.sourceIds.length > 0) {
    parts.push("");
    parts.push("Fuentes:");
    offer.sourceIds.forEach((url) => parts.push(url));
  }

  return parts.join("\n").trim();
}

interface OfferCardProps {
  offer: PresentedOffer;
  onCopy: (text: string) => void;
  copiedText: string;
  copyKey: string;
}

export function OfferCard({
  offer,
  onCopy,
  copiedText,
  copyKey,
}: OfferCardProps) {
  const p = offer.presentation;
  const mainText = offerMainText(offer);

  const isCopied = (k: string) => copiedText === copyKey + k;

  return (
    <article className="rounded-lg border border-border bg-card">
      <header className="border-b border-border/50 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Propuesta · borrador manual
        </span>
        <h2 className="mt-1 text-lg font-semibold">{offer.title}</h2>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {p.duration && (
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {p.duration}
            </span>
          )}
          {p.origin && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Desde {p.origin}
            </span>
          )}
          {p.accommodation && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {p.accommodation}
            </span>
          )}
        </div>
      </header>

      <div className="space-y-4 p-4">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Texto principal</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(mainText)}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {isCopied("main") ? "Copiado" : "Copiar"}
            </Button>
          </div>
          <div className="whitespace-pre-wrap break-words rounded-md bg-muted/50 p-3 text-sm">
            {mainText}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <CalendarDays className="h-4 w-4" />
              Fechas publicadas
            </h3>
            {p.dates.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(offerDatesText(offer))}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {isCopied("dates") ? "Copiado" : "Copiar fechas"}
              </Button>
            )}
          </div>
          {p.dates.length > 0 ? (
            <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
              {p.dates.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Fechas por confirmar con el tarifario.
            </p>
          )}
        </section>

        {p.paymentTerms.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold">
              Pagos y condiciones
            </h3>
            <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
              {p.paymentTerms.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="border-t border-border/50 p-4">
        <Button
          className="w-full"
          onClick={() => onCopy(offerClientText(offer))}
        >
          <Copy className="mr-2 h-4 w-4" />
          {isCopied("full") ? "Oferta copiada" : "Copiar oferta completa"}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Incluye fechas y condiciones de pago
        </p>
      </footer>
    </article>
  );
}