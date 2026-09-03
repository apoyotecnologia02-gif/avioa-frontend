import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const PASSWORD_VAULT_REVEAL_URL = `${process.env.NEXT_PUBLIC_API_URL}/password-vault/reveal`;

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const authorization = request.headers.get("authorization");
    const userAgent = request.headers.get("user-agent");

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    const ip = forwardedFor?.split(",")[0]?.trim() || realIp || null;

    const response = await fetch(`${PASSWORD_VAULT_REVEAL_URL}/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),

        ...(userAgent ? { "x-original-user-agent": userAgent } : {}),

        ...(ip ? { "x-original-ip": ip } : {}),
      },
      body: JSON.stringify(body),
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
