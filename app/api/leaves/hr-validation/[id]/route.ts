import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/leaves/hr-validation`;

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");
    const response = await fetch(`${BASE_URL}/${id}`, {
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
      { error: "Error al obtener la solicitud" },
      { status: 500 },
    );
  }
}
