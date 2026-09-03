import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const GET_LEADERS = `${process.env.NEXT_PUBLIC_API_URL}/admin/users/leaders`;

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const response = await fetch(GET_LEADERS, {
      method: "GET",
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

    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend de usuarios" },
      { status: 500 },
    );
  }
}
