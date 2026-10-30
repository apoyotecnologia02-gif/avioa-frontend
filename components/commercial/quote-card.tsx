"use client";
import { CalendarDays, Copy, MapPin, Clock3, BedDouble } from "lucide-react";
import {
  offerClientText,
  offerMainText,
  offerDatesText,
  type PresentedOffer,
} from "@/lib/commercial/offer-presentation";

export default function OfferCard({
  offer,
  index,
  copyId,
  copied,
  onCopy,
}: {
  offer: PresentedOffer;
  index: number;
  copyId: string;
  copied: string;
  onCopy: (id: string, text: string) => void;
}) {
  const p = offer.presentation;
  const mainText = offerMainText(offer);
  return (
    <article className="quote-offer-card" aria-label={offer.title}>
      <header className="offer-card-header">
        <span className="offer-card-kicker">
          {"Propuesta " + (index + 1) + " · borrador manual"}
        </span>
        <h2>{offer.title}</h2>
        {p && (
          <div className="offer-facts">
            {p.duration && (
              <span>
                <Clock3 size={16} />
                {p.duration}
              </span>
            )}
            {p.origin && (
              <span>
                <MapPin size={16} />
                Desde {p.origin}
              </span>
            )}
            {p.accommodation && (
              <span>
                <BedDouble size={16} />
                {p.accommodation}
              </span>
            )}
          </div>
        )}
      </header>
      <div className="offer-card-body">
        <section className="offer-section">
          <div className="offer-section-heading">
            <h3>Texto principal</h3>
            <button
              type="button"
              className="offers-copy"
              onClick={() => onCopy(copyId + "-main", mainText)}
            >
              <Copy size={14} />
              {copied === copyId + "-main"
                ? "Copiado"
                : "Copiar texto principal"}
            </button>
          </div>
          <div
            className="offers-prose"
            style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
          >
            {mainText}
          </div>
        </section>
        {p && (
          <>
            <section className="offer-dates">
              <div className="offer-section-heading">
                <h3>
                  <CalendarDays size={18} />
                  Fechas publicadas
                </h3>
                {p.dates.length > 0 && (
                  <button
                    type="button"
                    className="offers-copy"
                    onClick={() =>
                      onCopy(copyId + "-dates", offerDatesText(offer))
                    }
                  >
                    <Copy size={14} />
                    {copied === copyId + "-dates"
                      ? "Fechas copiadas"
                      : "Copiar fechas"}
                  </button>
                )}
              </div>
              {p.dates.length ? (
                <ul>
                  {p.dates.map((date, i) => (
                    <li key={i}>{date}</li>
                  ))}
                </ul>
              ) : (
                <p>Fechas por confirmar con el tarifario.</p>
              )}
            </section>
            {p.paymentTerms.length > 0 && (
              <section className="offer-section offer-payment">
                <div className="offer-section-heading">
                  <h3>Pagos y condiciones de pago</h3>
                  <button
                    type="button"
                    className="offers-copy"
                    onClick={() =>
                      onCopy(
                        copyId + "-paymentTerms",
                        [
                          "Pagos y condiciones de pago",
                          ...p.paymentTerms.map((item) => "• " + item),
                        ].join("\n"),
                      )
                    }
                  >
                    <Copy size={14} />
                    {copied === copyId + "-paymentTerms"
                      ? "Copiado"
                      : "Copiar pagos"}
                  </button>
                </div>
                <ul>
                  {p.paymentTerms.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
      <footer className="offer-card-footer">
        <button
          type="button"
          className="offer-copy-client"
          onClick={() => onCopy(copyId, offerClientText(offer))}
        >
          <Copy size={16} />
          {copied === copyId ? "Oferta copiada" : "Copiar oferta completa"}
        </button>
        <span>Incluye también las fechas y los pagos</span>
      </footer>
    </article>
  );
}
