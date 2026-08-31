import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const FEED_REACTIONS_URL = `${process.env.NEXT_PUBLIC_API_URL}/feed`;

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const authorization = request.headers.get("authorization");
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${FEED_REACTIONS_URL}/${id}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    });

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
