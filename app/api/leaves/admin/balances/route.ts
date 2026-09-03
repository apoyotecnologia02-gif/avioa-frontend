import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const BACKEND = `${process.env.NEXT_PUBLIC_API_URL}`;

/** GET /api/leaves/admin/balances -> Obtener saldos de vacaciones de todos los colaboradores */
export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${BACKEND}/leaves/admin/balances`, {
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
      { error: "No fue posible obtener los saldos de vacaciones" },
      { status: 500 },
    );
  }
}
