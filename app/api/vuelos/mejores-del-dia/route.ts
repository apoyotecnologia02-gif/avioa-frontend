import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const MEJORES_DEL_DIA_URL = `${process.env.NEXT_PUBLIC_API_URL}/vuelos/mejores-del-dia`;

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const response = await fetch(MEJORES_DEL_DIA_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los vuelos" },
      { status: 500 },
    );
  }
}
