"use client";
import { useState } from "react";
import { Building2, Plane, MapPin } from "lucide-react";
import { offerOrigins, type OfferOrigin } from "@/lib/travel-offers";
import { OffersBoard } from "./offers-board";

const TABS: { key: OfferOrigin; label: string; icon: typeof Plane }[] = [
  { key: "medellin", label: "Medellín", icon: Plane },
  { key: "bogota",   label: "Bogotá",   icon: Building2 },
  { key: "cali",     label: "Cali",     icon: MapPin },
];

export function OfertasTarifario() {
  const [origin, setOrigin] = useState<OfferOrigin>("medellin");
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Ofertas tarifario</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ofertas por ciudad de salida · alimentadas desde el tarifario en Drive.
        </p>
      </div>
      <nav role="tablist" className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={origin === key}
            onClick={() => setOrigin(key)}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
              origin === key
                ? "bg-card font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-card/50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>
      <OffersBoard key={origin} origin={origin} />
    </div>
  );
}