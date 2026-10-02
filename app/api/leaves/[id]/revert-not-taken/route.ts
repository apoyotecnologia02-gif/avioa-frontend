import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const REVERT_NOT_TAKEN_URL = `${process.env.NEXT_PUBLIC_API_URL}/leaves`;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const authorization = req.headers.get("authorization");

    const response = await fetch(
      `${REVERT_NOT_TAKEN_URL}/${id}/revert-not-taken`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authorization ? { Authorization: authorization } : {}),
        },
      },
    );

    const data = await parseResponseData(response);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Ocurrio un error al procesar la solicitud." },
      { status: 500 },
    );
  }
}
