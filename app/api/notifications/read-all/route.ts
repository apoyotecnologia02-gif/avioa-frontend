import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const READ_ALL_NOTIFICATIONS_URL = `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`;

export async function PATCH(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    const response = await fetch(READ_ALL_NOTIFICATIONS_URL, {
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
    return NextResponse.json(
      { error: "No fue posible conectar con el backend" },
      { status: 500 },
    );
  }
}
