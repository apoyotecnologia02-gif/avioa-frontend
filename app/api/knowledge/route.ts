import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const KNOWLEDGE_URL = `${process.env.NEXT_PUBLIC_API_URL}/knowledge`;

export async function GET(request: Request) {
  try {
    const { search } = new URL(request.url);
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${KNOWLEDGE_URL}${search}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener la biblioteca de conocimiento" },
      { status: 500 },
    );
  }
}
