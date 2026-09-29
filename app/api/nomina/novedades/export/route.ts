import { NextResponse } from "next/server";

const EXPORT_URL = `${process.env.NEXT_PUBLIC_API_URL}/nomina/novedades/export`;

export async function GET(request: Request) {
  try {
    const { search } = new URL(request.url);
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${EXPORT_URL}${search}`, {
      method: "GET",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      }
      return NextResponse.json(
        { error: "Error al generar el archivo de exportación" },
        { status: response.status },
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    const contentDisposition = response.headers.get("content-disposition");
    const contentType =
      response.headers.get("content-type") ??
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ...(contentDisposition && {
          "Content-Disposition": contentDisposition,
        }),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al generar el archivo de exportación" },
      { status: 500 },
    );
  }
}
