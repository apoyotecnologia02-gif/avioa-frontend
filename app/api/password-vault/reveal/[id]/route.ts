import { NextResponse } from "next/server";

const PASSWORD_VAULT_REVEAL_URL = `${process.env.NEXT_PUBLIC_API_URL}/password-vault/reveal`;

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const authorization = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${PASSWORD_VAULT_REVEAL_URL}/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "No fue posible conectar con el backend" },
        { status: 500 },
      );
    }

    return new NextResponse(response.body, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend" },
      { status: 500 },
    );
  }
}
