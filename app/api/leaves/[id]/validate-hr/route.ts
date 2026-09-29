import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/leaves`;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const authorization = request.headers.get("authorization");
    const response = await fetch(`${BASE_URL}/${id}/validate-hr`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await parseResponseData(response);
    if (!response.ok)
      return NextResponse.json(data, { status: response.status });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al validar la solicitud" },
      { status: 400 },
    );
  }
}
