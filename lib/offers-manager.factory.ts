import type { OfferRecord } from "@/lib/offers-manager-native";

export function createNewOffer(): OfferRecord {
  const stamp = Date.now().toString(36).toUpperCase();

  return {
    id: `PRD-${stamp}`,
    title: "Nueva oferta sin título",
    origin: "MDE",
    dest: "",
    destName: "",
    kind: "VUELO_HOTEL",
    status: "BORRADOR",
    source: "PORTAL_DEMO",
    sourceRow: null,
    sourceFile: "Formulario del portal",
    periods: [],
    variants: [],
    includes: [],
    excludes: [],
    conditions: [],
    charges: [],
    promos: [],
    itinerary: [],
    description: "",
    commercialMessage: "",
    sourceText: "",
    notes: "",
    internalPaymentPlan: "",
    internalAssembly: "",
    defaultForDestination: false,
    priceConfirmed: false,
    availabilityConfirmed: false,
    publicNote: "Tarifa sujeta a reconfirmación antes de reservar.",
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}
