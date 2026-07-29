import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/connect`;

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const response = await fetch(GOOGLE_AUTH_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return new NextResponse(JSON.stringify(data), {
        status: response.status,
      });
    }

    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend de recompensas" },
      { status: 500 },
    );
  }
}
