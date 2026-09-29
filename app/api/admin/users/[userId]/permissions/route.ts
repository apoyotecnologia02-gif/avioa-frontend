import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const BACKEND_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin/users`;

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = await params;
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/${userId}/permissions`, {
      method: "GET",
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

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = await params;
    const authorization = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/${userId}/permissions`, {
      method: "PUT",
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
      { error: "No fue posible conectar con el backend" },
      { status: 500 },
    );
  }
}
