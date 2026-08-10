import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const PASSWORD_VAULT_UPDATE_URL = `${process.env.NEXT_PUBLIC_API_URL}/password-vault/update`;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const authorization = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${PASSWORD_VAULT_UPDATE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
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
