import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const DELETE_PASSWORD_VAULT_TAG_URL = `${process.env.BACKEND}/password-vault/tag`;

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${DELETE_PASSWORD_VAULT_TAG_URL}/${id}`, {
      method: "DELETE",
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
