import { NextResponse } from "next/server";
import { MOCK_FORMS } from "@/lib/mock-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const form = MOCK_FORMS.find((f) => f.id === id);

  if (!form) {
    return NextResponse.json(
      { error: "Formulario no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json(form);
}
