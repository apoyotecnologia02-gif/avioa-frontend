import { NextResponse } from "next/server";
import { MOCK_FORMS } from "@/lib/mock-data";
import type { Form } from "@/types/form.types";
import { parseResponseData } from "@/utils/parse-response-data.util";

const FORMS_URL = `${process.env.NEXT_PUBLIC_API_URL}/forms`;

export async function GET(request: Request) {
  try {
    const { search } = new URL(request.url);
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${FORMS_URL}${search}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
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
      { error: "Error al obtener los formularios" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization");

    const response = await fetch(FORMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
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
      { error: "Error al crear el formulario" },
      { status: 400 },
    );
  }
}
