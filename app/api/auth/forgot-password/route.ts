import { NextResponse } from "next/server";

const FORGOT_PASSWORD_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`;

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(FORGOT_PASSWORD_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend de autenticación" },
      { status: 500 },
    );
  }
}
