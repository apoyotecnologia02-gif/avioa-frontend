import { NextResponse } from "next/server";
import { normalizeRole } from "@/lib/roles";

const AUTH_LOGIN_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(AUTH_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("response", response);
    if (!response.ok) {
      return NextResponse.json(
        data,
        { status: response.status },
      );
    }

    return NextResponse.json({
      accessToken: data.access_token,
      refreshToken: "",
      user: {
        id: data.userId,
        email: data.email,
        name: data.name,
        role: normalizeRole(data.role),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend de autenticación" },
      { status: 500 },
    );
  }
}
