import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const TOKEN_KEY = "portal_access_token";

const getAuthHeader = (req: NextRequest): string | null => {
  let token = req.cookies.get(TOKEN_KEY)?.value;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7);
  }
  if (!token) token = req.headers.get("x-access-token") || undefined;
  return token ? `Bearer ${token}` : null;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";

  try {
    const auth = getAuthHeader(req);
    const response = await fetch(`${API_URL}/commercial/protocol${suffix}`, {
      headers: { ...(auth ? { Authorization: auth } : {}) },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al obtener el protocolo" },
        { status: response.status },
      );
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 },
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const auth = getAuthHeader(req);
    if (!auth) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";
    const isFormData = contentType.includes("multipart/form-data");
    
    let body: any;
    let path = "";

  
    const url = new URL(req.url);
    if (url.pathname.includes("/import")) path = "/import";
    
    if (isFormData) {
      body = await req.formData();
    } else {
      body = await req.text();
    }

    const response = await fetch(`${API_URL}/commercial/protocol${path}`, {
      method: "POST",
      headers: { 
        Authorization: auth,
        ...(isFormData ? {} : { "Content-Type": "application/json" })
      },
      body,
      cache: "no-store",
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error en proxy POST protocol:", error);
    return NextResponse.json({ error: "Error de conexión con el servidor" }, { status: 500 });
  }
}