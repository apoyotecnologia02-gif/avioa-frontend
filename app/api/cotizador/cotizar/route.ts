import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const COTIZADOR_COTIZAR_URL = `${process.env.NEXT_PUBLIC_API_URL}/cotizador/cotizar`;

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(COTIZADOR_COTIZAR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend" },
      { status: 500 },
    );
  }
}
