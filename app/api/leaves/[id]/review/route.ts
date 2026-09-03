import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL;

/** PATCH /api/leaves/:id/review */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${BACKEND}/leaves/${id}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await parseResponseData(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "No fue posible procesar la revisión" },
      { status: 500 },
    );
  }
}
