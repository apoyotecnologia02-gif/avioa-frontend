import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const MARK_NOT_TAKEN_URL = `${process.env.NEXT_PUBLIC_API_URL}/leaves`;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");
    const body = await request.json();
    const response = await fetch(`${MARK_NOT_TAKEN_URL}/${id}/mark-not-taken`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Ocurrió un error al procesar la solicitud." },
      { status: 500 },
    );
  }
}
