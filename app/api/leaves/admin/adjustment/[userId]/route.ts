import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const BACKEND = `${process.env.NEXT_PUBLIC_API_URL}`;

/** PATCH /api/leaves/admin/adjustment/[userId] -> Actualizar ajuste de vacaciones del usuario */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${BACKEND}/leaves/admin/adjustment/${userId}`, {
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
      { error: "No fue posible actualizar el ajuste de vacaciones" },
      { status: 500 },
    );
  }
}
