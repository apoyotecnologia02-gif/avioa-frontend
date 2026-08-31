import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

export const AUTH_REFRESH_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(AUTH_REFRESH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend de autenticación" },
      { status: 500 },
    );
  }
}
