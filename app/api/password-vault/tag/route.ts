import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const GET_ALL_PASSWORD_TAGS = `${process.env.NEXT_PUBLIC_API_URL}/password-vault/tag`;

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    const response = await fetch(GET_ALL_PASSWORD_TAGS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(JSON.stringify(data), {
        status: response.status,
      });
    }

    return new NextResponse(JSON.stringify(data), { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend" },
      { status: 500 },
    );
  }
}
