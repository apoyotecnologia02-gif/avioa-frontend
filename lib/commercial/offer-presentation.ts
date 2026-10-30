export type OfferPresentation = {
  duration: string;
  origin: string;
  accommodation: string;
  dates: string[];
  includes: string[];
  excludes: string[];
  paymentTerms: string[];
  conditions: string[];
};
export type OfferHotel = {
  name: string;
  rateText: string;
  closureNote: string;
};
export type PresentedOffer = {
  hotels?: OfferHotel[];
  title: string;
  detail: string;
  priceCOP: number | null;
  sourceIds: string[];
  closureNote: string;
  presentation?: OfferPresentation;
};
export const offerMoney = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
export const offerDisclaimer =
  "Tarifa orientativa, sujeta a disponibilidad y reconfirmación.";
const lines = (title: string, items: string[]) =>
  items.length ? [title, ...items.map((item) => "• " + item)].join("\n") : "";
export function offerHotelLines(o: PresentedOffer) {
  return (o.hotels || []).map((h) =>
    [h.name, h.rateText || "Tarifa por confirmar", h.closureNote]
      .filter(Boolean)
      .join(" · "),
  );
}
export function offerClientText(o: PresentedOffer) {
  const p = o.presentation;
  return [
    o.title,
    p &&
      [p.duration, p.origin && "Salida desde " + p.origin, p.accommodation]
        .filter(Boolean)
        .join("\n"),
    o.detail,
    lines("Hoteles y tarifas", offerHotelLines(o)),
    !o.hotels?.length && o.priceCOP !== null
      ? "Desde " + offerMoney(o.priceCOP) + " COP por adulto."
      : "",
    p && lines("Fechas publicadas", p.dates),
    p && lines("El plan incluye", p.includes),
    p && lines("No incluye", p.excludes),
    p && lines("Plan de pago", p.paymentTerms),
    p && lines("Condiciones importantes", p.conditions),
    o.closureNote,
    offerDisclaimer,
  ]
    .filter(Boolean)
    .join("\n\n");
}
export function offerDatesText(o: PresentedOffer) {
  if (!o.presentation?.dates.length) return "";
  return [
    o.title,
    lines("Fechas publicadas", o.presentation.dates),
    "Fechas sujetas a disponibilidad y reconfirmación.",
    o.closureNote,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function offerMainText(o: PresentedOffer) {
  const p = o.presentation;
  return [
    o.title,
    p &&
      [p.duration, p.origin && "Salida desde " + p.origin, p.accommodation]
        .filter(Boolean)
        .join(" · "),
    p?.includes.length ? "El plan incluye:\n" + p.includes.join(" • ") : "",
    p?.excludes.length ? "No incluye:\n" + p.excludes.join(" • ") : "",
    o.detail,
    offerHotelLines(o)
      .map((line) => "🏨 " + line)
      .join("\n"),
    !o.hotels?.length && o.priceCOP !== null
      ? "Desde " + offerMoney(o.priceCOP) + " COP por adulto."
      : "",
    p?.conditions.length ? "Importante:\n" + p.conditions.join("\n\n") : "",
    o.closureNote,
    offerDisclaimer,
  ]
    .filter(Boolean)
    .join("\n\n");
}
