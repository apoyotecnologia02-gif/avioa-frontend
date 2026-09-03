import { NextResponse } from "next/server";

function getUrlById(id: string) {
  return `${process.env.NEXT_PUBLIC_API_URL}/points/rewards/delete/${id}`;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");

    const response = await fetch(getUrlById(id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "No fue posible eliminar la recompensa" },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { message: "Recompensa eliminada correctamente" },
      { status: response.status },
    );
  } catch {
    return NextResponse.json(
      { error: "No fue posible eliminar la recompensa" },
      { status: 500 },
    );
  }
}
