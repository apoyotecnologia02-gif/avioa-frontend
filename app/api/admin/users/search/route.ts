import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const SEARCH_USERS_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin/users/search`;

export async function GET(request: Request) {
  try {
    const autorization = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();

    const response = await fetch(
      `${SEARCH_USERS_URL}${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(autorization ? { Authorization: autorization } : {}),
        },
      },
    );

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(JSON.stringify(data), {
        status: response.status,
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend" },
      { status: 500 },
    );
  }
}
