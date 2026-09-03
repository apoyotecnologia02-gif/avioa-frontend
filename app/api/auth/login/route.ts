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

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    if (data.mustChangePassword) {
      return NextResponse.json(data, { status: response.status });
    }

    if (data.twoFactorEnabled) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        id: data.user?.userId,
        email: data.user?.email,
        name: data.user?.name,
        avatar: data.user?.avatar,
        role: normalizeRole(data.user?.role),
        isLeader: Boolean(data.user?.isLeader),
        area: data.user?.area,
        leaderId: data.user?.leaderId,
        leaderName: data.user?.leaderName,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend de autenticación" },
      { status: 500 },
    );
  }
}
