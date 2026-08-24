import { NextResponse } from "next/server";

const USERS_DIRECTORY_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin/users/directory`;

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    const response = await fetch(USERS_DIRECTORY_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(JSON.stringify(data), {
        status: response.status,
      });
    }

    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend" },
      { status: 500 },
    );
  }
}
