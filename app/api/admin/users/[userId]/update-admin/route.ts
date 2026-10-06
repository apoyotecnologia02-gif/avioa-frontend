import { NextResponse } from "next/server";

const UPDATE_USERS_ADMIN_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin/users`;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const authorization = request.headers.get("authorization");
    const body = await request.json();
    const response = await fetch(
      `${UPDATE_USERS_ADMIN_URL}/${userId}/update-admin`,
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
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible actualizar el usuario en el backend" },
      { status: 500 },
    );
  }
}
