import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const PASSWORD_VAULT_FIND_ALL_URL = `${process.env.NEXT_PUBLIC_API_URL}/password-vault/find-all`;

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();

    const response = await fetch(
      `${PASSWORD_VAULT_FIND_ALL_URL}${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authorization ? { Authorization: authorization } : {}),
        },
      },
    );

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
