import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL;

/** GET /api/leaves/my/balance */
export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${BACKEND}/leaves/my/balance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const data = await parseResponseData(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "No fue posible obtener el balance" },
      { status: 500 },
    );
  }
}
