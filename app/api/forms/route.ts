import { NextResponse } from "next/server";
import { MOCK_FORMS } from "@/lib/mock-data";
import type { Form } from "@/types/form.types";
import { parseResponseData } from "@/utils/parse-response-data.util";

const FORMS_URL = `${process.env.NEXT_PUBLIC_API_URL}/forms`;

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json(MOCK_FORMS);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization");

    const response = await fetch(FORMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return new NextResponse(JSON.stringify(data), {
        status: response.status,
      });
    }

    return new NextResponse(JSON.stringify(data), { status: 200 });

    // const newForm: Form = {
    //   id: `form-${Date.now()}`,
    //   title: body.title || "Formulario sin título",
    //   description: body.description || "",
    //   category: body.category || "General",
    //   type: body.type || "native",
    //   schema: body.schema || { fields: [] },
    //   embedUrl: body.embedUrl,
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    // };

    // MOCK_FORMS.push(newForm);

    // return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear el formulario" },
      { status: 400 },
    );
  }
}
