import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const TOKEN_KEY = "portal_access_token";

const getAuthHeader = (req: NextRequest): string | null => {
  let token = req.cookies.get(TOKEN_KEY)?.value;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  if (!token) {
    token = req.headers.get("x-access-token") || undefined;
  }
  return token ? `Bearer ${token}` : null;
};

// POST: subir un archivo
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthHeader(req);
    if (!auth) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await req.formData();
    const response = await fetch(`${API_URL}/flight-blockings/files`, {
      method: "POST",
      headers: { Authorization: auth },
      // ⚠️ NO poner Content-Type: el navegador añade el boundary del multipart
      body: formData,
      cache: "no-store",
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error proxy POST files:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 },
    );
  }
}

// GET: descargar un archivo por ?id=...
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthHeader(req);
    if (!auth) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    const response = await fetch(
      `${API_URL}/flight-blockings/files?id=${encodeURIComponent(id)}`,
      {
        headers: { Authorization: auth },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "No se pudo descargar el archivo" },
        { status: response.status },
      );
    }

    const buffer = await response.arrayBuffer();
    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";
    const contentDisposition =
      response.headers.get("Content-Disposition") || "attachment";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (error) {
    console.error("❌ Error proxy GET files:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 },
    );
  }
}