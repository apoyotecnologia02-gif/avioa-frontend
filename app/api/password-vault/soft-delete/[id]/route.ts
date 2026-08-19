import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const PASSWORD_VAULT_SOFT_DELETE_URL = `${process.env.NEXT_PUBLIC_API_URL}/password-vault/soft-delete`;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${PASSWORD_VAULT_SOFT_DELETE_URL}/${id}`, {
      method: "PATCH",
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
    console.log(error);
    return NextResponse.json(
      { error: "No fue posible conectar con el backend" },
      { status: 500 },
    );
  }
}
