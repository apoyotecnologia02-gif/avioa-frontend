// app/api/maintenance/route.ts
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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

const safeJsonParse = async (req: NextRequest): Promise<any> => {
  try {
    const text = await req.text();
    if (!text || text.trim() === "") return {};
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing JSON body:", error);
    return {};
  }
};

// Construir URL al backend
const buildBackendUrl = (path: string) => {
  const clean = path.replace(/^\//, "");
  return clean
    ? `${API_URL}/maintenance/${clean}`
    : `${API_URL}/maintenance`;
};

// ===== GET =====
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  const status = searchParams.get("status");
  const userId = searchParams.get("userId");
  const equipmentId = searchParams.get("equipmentId");

  const query = new URLSearchParams();
  if (status) query.append("status", status);
  if (userId) query.append("userId", userId);
  if (equipmentId) query.append("equipmentId", equipmentId);
  const qs = query.toString() ? `?${query.toString()}` : "";

  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(`${buildBackendUrl(path)}${qs}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al obtener los datos" },
        { status: response.status },
      );
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Error en GET maintenance:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 },
    );
  }
}

// ===== POST =====
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  const body = await safeJsonParse(req);

  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(buildBackendUrl(path), {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al procesar la solicitud" },
        { status: response.status },
      );
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Error en POST maintenance:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 },
    );
  }
}

// ===== PATCH =====
export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  const body = await safeJsonParse(req);
  const hasBody = Object.keys(body).length > 0;

  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(buildBackendUrl(path), {
      method: "PATCH",
      headers,
      ...(hasBody && { body: JSON.stringify(body) }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al procesar la solicitud" },
        { status: response.status },
      );
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Error en PATCH maintenance:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 },
    );
  }
}