import { NextResponse } from "next/server";
import { parseResponseData } from "@/utils/parse-response-data.util";

const PRESIGN_URL = `${process.env.NEXT_PUBLIC_API_URL}/feed/attachments/presign`;

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(PRESIGN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(JSON.stringify(data), {
        status: response.status,
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[presign]", error);
    return NextResponse.json(
      { error: "Error al generar la URL de subida" },
      { status: 500 },
    );
  }
}
