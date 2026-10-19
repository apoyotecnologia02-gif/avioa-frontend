import { NextRequest, NextResponse } from "next/server";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin/users/import-excel`;

export async function POST(req: NextRequest) {
  try {
    const incomingForm = await req.formData();

    const outgoingForm = new FormData();

    for (const [key, value] of incomingForm.entries()) {
      if (value instanceof File) {
        outgoingForm.append(key, value, value.name);
      } else {
        outgoingForm.append(key, String(value));
      }
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        ...(req.headers.get("authorization")
          ? { authorization: req.headers.get("authorization")! }
          : {}),
      },
      body: outgoingForm,
    });

    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    console.error("[import-excel proxy] error:", err);
    return NextResponse.json(
      {
        message:
          err instanceof Error
            ? err.message
            : "Error inesperado al procesar el Excel",
      },
      { status: 500 },
    );
  }
}
