import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
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

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const safeJsonParse = async (req: NextRequest): Promise<any> => {
  try {
    const text = await req.text();
    if (!text || text.trim() === "") return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");
  const query = kind ? `?kind=${encodeURIComponent(kind)}` : "";

  try {
    const response = await fetch(`${API_URL}/commercial/resources${query}`, {
      headers: getAuthHeaders(req),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al obtener recursos" },
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
  const body = await safeJsonParse(req);

  try {
    const response = await fetch(`${API_URL}/commercial/resources`, {
      method: "POST",
      headers: getAuthHeaders(req),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al crear recurso" },
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