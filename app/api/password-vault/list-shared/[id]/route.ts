import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const PASSWORD_VAULT_LIST_SHARED_URL = `${process.env.NEXT_PUBLIC_API_URL}/password-vault/list-shared`;

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${PASSWORD_VAULT_LIST_SHARED_URL}/${id}`, {
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
  } catch {
    return NextResponse.json(
      { error: "No fue posible obtener las solicitudes" },
      { status: 500 },
    );
  }
}
