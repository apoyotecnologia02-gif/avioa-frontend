import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auxiliary-operational`;

export async function GET(
  request: Request,
  { params }: { params: { id: string; replyId: string } },
) {
  try {
    const { id, replyId } = await params;

    const authorization = request.headers.get("authorization");

    const response = await fetch(`${API_URL}/${id}/replies/${replyId}/raw`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
