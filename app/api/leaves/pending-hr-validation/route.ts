import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/leaves/pending-hr-validation`;

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const response = await fetch(URL, {
      method: "GET",
      headers: { ...(authorization ? { Authorization: authorization } : {}) },
      cache: "no-store",
    });
    const data = await parseResponseData(response);
    if (!response.ok)
      return NextResponse.json(data, { status: response.status });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener solicitudes pendientes" },
      { status: 500 },
    );
  }
}
