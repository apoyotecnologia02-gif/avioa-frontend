import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const CHANGE_TEMPORARY_PASSWORD_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/change-temporary-password`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(CHANGE_TEMPORARY_PASSWORD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(JSON.stringify(data), {
        status: response.status,
      });
    }

    return new NextResponse(JSON.stringify(data), { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend de autenticación" },
      { status: 500 },
    );
  }
}
