import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const REWARDS_URL = `${process.env.NEXT_PUBLIC_API_URL}/points/rewards/create/bulk`;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const authorization = request.headers.get("authorization");

    let fetchBody: BodyInit;
    let fetchHeaders: Record<string, string> = {
      ...(authorization ? { authorization: authorization } : {}),
    };

    if (contentType.includes("multipart/form-data")) {
      const fd = await request.formData();
      fetchBody = fd;
    } else {
      const body = await request.json();
      fetchBody = JSON.stringify(body);
      fetchHeaders["Content-Type"] = "application/json";
    }

    console.log(fetchBody);

    const response = await fetch(REWARDS_URL, {
      method: "POST",
      headers: fetchHeaders,
      body: fetchBody,
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return new NextResponse(JSON.stringify(data), {
        status: response.status,
      });
    }

    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible conectar con el backend de recompensas" },
      { status: 500 },
    );
  }
}
