import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const CREATE_PASSWORD_VAULT_URL = `${process.env.NEXT_PUBLIC_API_URL}/password-vault/create`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization");

    const response = await fetch(CREATE_PASSWORD_VAULT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return new NextResponse(JSON.stringify(data), {
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
