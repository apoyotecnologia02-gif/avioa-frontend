// app/api/equipment-loans/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const TOKEN_KEY = "portal_access_token";

// Helper para obtener el token - CORREGIDO
const getAuthHeaders = (req: NextRequest) => {
  // 1. Intentar obtener de cookies con el nombre correcto
  let token = req.cookies.get(TOKEN_KEY)?.value;
  
  // 2. Si no está en cookies, buscar en el header Authorization
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  
  // 3. Si no hay token, buscar en el header x-access-token
  if (!token) {
    token = req.headers.get("x-access-token") || undefined;
  }
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  console.log("🔑 Token encontrado:", token ? `Sí (${token.substring(0, 20)}...)` : "No");
  console.log("📡 Headers enviados:", Object.keys(headers));
  
  return headers;
};

// GET
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  
  console.log(`📡 GET /api/equipment-loans?path=${path}`);
  
  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(`${API_URL}/equipment-loans/${path}`, {
      headers,
      cache: "no-store",
    });

    console.log(`📡 Respuesta del backend: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al obtener los datos" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error en GET equipment-loans:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 }
    );
  }
}

// POST
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  const body = await req.json();

  console.log(`📡 POST /api/equipment-loans?path=${path}`);

  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(`${API_URL}/equipment-loans/${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    console.log(`📡 Respuesta del backend: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al procesar la solicitud" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error en POST equipment-loans:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 }
    );
  }
}

// PATCH
export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  const body = await req.json();

  console.log(`📡 PATCH /api/equipment-loans?path=${path}`);

  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(`${API_URL}/equipment-loans/${path}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    console.log(`📡 Respuesta del backend: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al procesar la solicitud" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error en PATCH equipment-loans:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";

  console.log(`📡 DELETE /api/equipment-loans?path=${path}`);

  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(`${API_URL}/equipment-loans/${path}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    console.log(`📡 Respuesta del backend: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al procesar la solicitud" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error en DELETE equipment-loans:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 }
    );
  }
}