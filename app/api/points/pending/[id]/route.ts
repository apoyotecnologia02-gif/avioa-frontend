import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

function getUrlById(pointRequestId: string) {
  return `${process.env.NEXT_PUBLIC_API_URL}/points/pending/${pointRequestId}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");
    const response = await fetch(getUrlById(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "No fue posible obtener la solicitud de puntos" },
      { status: 500 },
    );
  }
}
