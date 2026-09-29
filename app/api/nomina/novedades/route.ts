import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const NOMINA_NOVEDADES_URL = `${process.env.NEXT_PUBLIC_API_URL}/nomina/novedades`;

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();

    const response = await fetch(
      `${NOMINA_NOVEDADES_URL}${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authorization ? { Authorization: authorization } : {}),
        },
      },
    );

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(JSON.stringify(data), {
        status: response.status,
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend" },
      { status: 500 },
    );
  }
}
