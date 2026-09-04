import { NextResponse } from "next/server";
import { MOCK_FORMS } from "@/lib/mock-data";
import { parseResponseData } from "@/utils/parse-response-data.util";

const FORMS_URL = `${process.env.NEXT_PUBLIC_API_URL}/forms`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const authorization = request.headers.get("authorization");

    const response = await fetch(`${FORMS_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(data, {
        status: response.status,
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible obtener el formulario" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${FORMS_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend" },
      { status: 500 },
    );
  }
}
