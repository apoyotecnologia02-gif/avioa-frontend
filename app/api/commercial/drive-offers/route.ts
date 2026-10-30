// app/api/commercial/drive-offers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { offerOrigins, offerColumns, readPublicRange, type OfferOrigin } from "@/lib/travel-offers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; 

const ORIGINS = new Set<OfferOrigin>(["medellin", "bogota", "cali"]);

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("origin");
  const origin = raw && ORIGINS.has(raw as OfferOrigin) ? (raw as OfferOrigin) : "medellin";

  try {
    // 1. Leemos el CSV directamente (sin pasar por el chatbot)
    const source = offerOrigins[origin];
    const rows = await readPublicRange(source.gid, source.range, fetch);
    
    // 2. Parseamos las columnas sin filtros de IA
    const rawOffers = offerColumns(rows, origin);

    // 3. Mapeamos al formato que espera el frontend (OffersBoard)
    const entries = rawOffers.map((e) => {
        const text = e.text;
        
        // Extraemos cada sección para los acordeones usando Regex
        const descMatch = text.match(/OFERTA\s*(?:\([^)]+\))?:\s*([\s\S]*?)(?=\n\nMESES DISPONIBLES|$)/i);
        const monthsMatch = text.match(/MESES DISPONIBLES\s*(?:\([^)]+\))?:\s*([\s\S]*?)(?=\n\nFECHAS|$)/i);
        const datesMatch = text.match(/FECHAS\s*(?:\([^)]+\))?:\s*([\s\S]*?)(?=\n\nPLAN SEPARE|$)/i);
        const depositMatch = text.match(/PLAN SEPARE\s*(?:\([^)]+\))?:\s*([\s\S]*?)(?=\n\nEDADES|$)/i);
        const childrenMatch = text.match(/EDADES NIÑOS\s*(?:\([^)]+\))?:\s*([\s\S]*?)(?=\n\nCÓMO RESERVAR|$)/i);
        const bookingMatch = text.match(/CÓMO RESERVAR\s*(?:\([^)]+\))?:\s*([\s\S]*?)$/i);

        return {
          id: e.id,
          title: e.title,
          updated: text.match(/Actualización indicada: ([^\n]+)/)?.[1] ?? "",
          text: text,
          description: descMatch ? descMatch[1].trim() : "",
          months: monthsMatch ? monthsMatch[1].trim() : "",
          dates: datesMatch ? datesMatch[1].trim() : "",
          deposit: depositMatch ? depositMatch[1].trim() : "",
          children: childrenMatch ? childrenMatch[1].trim() : "",
          booking: bookingMatch ? bookingMatch[1].trim() : "",
          landing: "",
          range: e.range,
        };
      });

    return NextResponse.json({
      entries,
      checkedAt: new Date().toISOString(),
      sources: [{ tab: source.tab, range: source.range, ok: true }],
      warning: null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message, entries: [], checkedAt: "", sources: [] },
      { status: 502 },
    );
  }
}