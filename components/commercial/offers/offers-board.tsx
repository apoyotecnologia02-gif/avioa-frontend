"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, ChevronDown, Copy, Check } from "lucide-react";
import type { OfferOrigin } from "@/lib/travel-offers";

type DriveOffer = {
  id: string;
  title: string;
  updated: string;
  text: string;
  description: string;
  months: string;
  dates: string;
  deposit: string;
  children: string;
  booking: string;
  landing: string;
  range: string;
};


function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-3 flex w-fit items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-1.5 text-[12px] text-foreground transition-colors hover:bg-muted"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "¡Copiado!" : `Copiar ${label}`}
    </button>
  );
}

export function OffersBoard({ origin, query }: { origin: OfferOrigin; query: string }) {
  const [offers, setOffers] = useState<DriveOffer[]>([]);
  const [checkedAt, setCheckedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/commercial/drive-offers?origin=${origin}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al leer ofertas");
      setOffers(json.entries ?? []);
      setCheckedAt(json.checkedAt ?? "");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [origin]);

  useEffect(() => { load(); }, [load]);

  const normalizedQuery = query.toLowerCase().trim();
  const filteredOffers = offers.filter((offer) => {
    if (!normalizedQuery) return true;
    const searchContent = [
      offer.title, offer.description, offer.dates, offer.months, 
      offer.deposit, offer.children, offer.booking, offer.text 
    ].join(" ").toLowerCase();
    return searchContent.includes(normalizedQuery);
  });

  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">Cargando ofertas...</div>;
  if (error) return <div className="p-4 text-sm text-destructive bg-destructive/10 rounded border border-destructive/20">{error}</div>;
  
  if (filteredOffers.length === 0) {
    return (
      <div className="p-8 text-center border-dashed border-2 rounded-lg text-muted-foreground">
        {query ? `No se encontraron ofertas para "${query}"` : `Sin ofertas para ${origin}`}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
        <span>{filteredOffers.length} ofertas encontradas</span>
        <div className="flex items-center gap-4">
          {checkedAt && <span>Actualizado: {new Date(checkedAt).toLocaleString()}</span>}
          <button onClick={load} className="flex items-center gap-1 hover:text-foreground transition-colors">
            <RefreshCw className="h-3 w-3" /> Refrescar
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredOffers.map((o) => (
          <OfferCard key={o.id} offer={o} origin={origin} />
        ))}
      </div>
    </div>
  );
}

function OfferCard({ offer, origin }: { offer: DriveOffer, origin: OfferOrigin }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(offer.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm text-sm text-card-foreground">
      <header>
        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary mb-2">
          Salida {origin.charAt(0).toUpperCase() + origin.slice(1)}
        </span>
        <h3 className="font-semibold text-base leading-tight text-foreground">{offer.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">Actualización indicada en Drive: {offer.updated || "N/A"}</p>
      </header>

      {offer.description && (
        <div className="whitespace-pre-wrap text-[13px] text-foreground/80 leading-relaxed mt-2 border-b border-border/50 pb-4">
          {offer.description}
        </div>
      )}

      <div className="mt-2 space-y-1">
        
        {offer.dates && <Accordion title="Fechas disponibles" content={offer.dates} copyText={offer.dates} />}
        {offer.months && <Accordion title="Meses disponibles" content={offer.months} copyText={offer.months} />}
        {offer.deposit && <Accordion title="Plan separe" content={offer.deposit} copyText={offer.deposit} />}
        {offer.children && <Accordion title="Edades niños" content={offer.children} copyText={offer.children} />}
        {offer.booking && <Accordion title="Cómo reservar · uso interno" content={offer.booking} copyText={offer.booking} />}
      </div>

      <button
        onClick={copyToClipboard}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        {copied ? "¡Copiado!" : "Copiar oferta para el cliente"}
      </button>
    </article>
  );
}

function Accordion({ title, content, copyText }: { title: string; content: string; copyText: string }) {
  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden border-b border-transparent open:border-border/50 open:pb-3">
      <summary className="flex cursor-pointer items-center gap-1.5 py-1 text-muted-foreground hover:text-foreground transition-colors">
        <ChevronDown className="h-3 w-3 transition-transform group-open:-rotate-180" />
        <span className="text-[13px]">{title}</span>
      </summary>
      
     
      <div className="mt-2 flex flex-col items-start pl-4.5">
        <div className="whitespace-pre-wrap text-[13px] text-foreground/70 leading-relaxed">
          {content}
        </div>
        
        
        <CopyButton text={copyText} label={title.toLowerCase()} />
      </div>
    </details>
  );
}