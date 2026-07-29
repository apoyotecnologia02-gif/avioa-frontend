import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const TWO_FACTOR_DISABLE_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/disable`;

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    const response = await fetch(TWO_FACTOR_DISABLE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(JSON.stringify(data), {
        status: response.status,
      });
    }

    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al desactivar la autenticación de dos factores." },
      { status: 500 },
    );
  }
}
