import { NextRequest, NextResponse } from "next/server";
import { offerColumns } from "@/lib/travel-offers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const TOKEN_KEY = "portal_access_token";

const ORIGINS: Record<string, { gid: string; range: string; key: any }> = {
  medellin: { gid: "915260279", range: "A1:FY50", key: "medellin" },
  bogota: { gid: "1717217639", range: "A1:DO50", key: "bogota" },
  cali: { gid: "1822486735", range: "A1:AH50", key: "cali" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let gid = searchParams.get("gid");
  let range = searchParams.get("range");
  const origin = searchParams.get("origin");

  let originKey = null;
  if (origin) {
    const config = ORIGINS[origin];
    if (!config) return NextResponse.json({ error: "Origen inválido" }, { status: 400 });
    gid = config.gid;
    range = config.range;
    originKey = config.key;
  }

  if (!gid || !range) {
    return NextResponse.json({ error: "Faltan parámetros gid y range" }, { status: 400 });
  }

  let token = req.cookies.get(TOKEN_KEY)?.value;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7);
  }

  try {
    const response = await fetch(`${API_URL}/commercial/offers/raw?gid=${encodeURIComponent(gid)}&range=${encodeURIComponent(range)}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json(data, { status: response.status });

    if (originKey && data.rows) {
      const rawOffers = offerColumns(data.rows, originKey);
      

      const offers = rawOffers.map((offer: any) => {

        const lines = offer.text.split("\n\n");
        const extract = (prefix: string) => {
          const line = lines.find((l: string) => l.startsWith(prefix));
          return line ? line.replace(prefix, "").trim() : "";
        };

       
        const cleanText = (str: string) => str.replace(/\(\w+\d+\):\s*/g, "");

        const description = extract("OFERTA") || offer.text;
        const months = cleanText(extract("MESES DISPONIBLES"));
        const dates = cleanText(extract("FECHAS"));
        const deposit = cleanText(extract("PLAN SEPARE"));
        const children = cleanText(extract("EDADES NIÑOS"));
        const updated = offer.text.match(/Actualización indicada: (.*)/)?.[1] || "";

        return {
          id: offer.id,
          title: offer.title,
          updated,
          text: cleanText(offer.text.replace(/Actualización indicada: .*\n?/, '')), // Texto limpio para copiar
          description, 
          months,
          dates,
          deposit,
          children,
          booking: "",
          landing: "",
          range: offer.range,
        };
      });
      
      return NextResponse.json({ offers });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error en proxy offers:", error);
    return NextResponse.json({ error: "Error de conexión con el servidor" }, { status: 500 });
  }
}