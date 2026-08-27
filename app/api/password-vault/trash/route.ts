import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const PASSWORD_VAULT_TRASH_URL = `${process.env.NEXT_PUBLIC_API_URL}/password-vault/trash`;

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    const response = await fetch(PASSWORD_VAULT_TRASH_URL, {
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
  } catch {
    return NextResponse.json(
      { error: "No fue posible conectarse con el backend" },
      { status: 500 },
    );
  }
}
