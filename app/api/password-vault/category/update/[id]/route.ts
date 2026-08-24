import { NextResponse } from "next/server";

const UPDATE_PASSWORD_VAULT_CATEGORY_URL = `${process.env.NEXT_PUBLIC_API_URL}/password-vault/category/update`;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = request.json();
    const authorization = request.headers.get("authorization");

    const response = await fetch(
      `${UPDATE_PASSWORD_VAULT_CATEGORY_URL}/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authorization ? { Authorization: authorization } : {}),
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

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
