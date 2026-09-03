import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const WALLET_URL = `${process.env.NEXT_PUBLIC_API_URL}/points/wallet`;

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const response = await fetch(WALLET_URL, {
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
  } catch {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend de recompensas" },
      { status: 500 },
    );
  }
}
