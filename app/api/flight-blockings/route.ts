import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const TOKEN_KEY = "portal_access_token";

const getAuthHeaders = (req: NextRequest) => {
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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export async function GET(req: NextRequest) {
  try {
    const headers = getAuthHeaders(req);
      const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`${API_URL}/flight-blockings`, {
      headers,
      cache: "no-store",
      signal: controller.signal, // <-- Le pasamos la señal
    });
    
    clearTimeout(timeoutId);

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("❌ Error proxy GET flight-blockings:", error);
    // Si fue un aborto por timeout, avisamos
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: "El servidor tardó demasiado en responder (Timeout)" }, { status: 504 });
    }
    return NextResponse.json({ error: "Error de conexión con el servidor" }, { status: 500 });
  }
  }


export async function POST(req: NextRequest) {
  try {
    const headers = getAuthHeaders(req);
    const body = await req.text();
    const response = await fetch(`${API_URL}/flight-blockings`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error proxy POST flight-blockings:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 },
    );
  }
}