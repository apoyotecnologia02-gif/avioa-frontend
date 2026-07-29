import { NextResponse } from "next/server";
import { normalizeRole } from "@/lib/roles";

const AUTH_LOGOUT_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`;

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const response = await fetch(AUTH_LOGOUT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend de autenticación" },
      { status: 500 },
    );
  }
}
