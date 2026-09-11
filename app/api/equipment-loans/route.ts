// app/api/equipment-loans/route.ts
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

// Helper para parsear el body de forma segura
const safeJsonParse = async (req: NextRequest): Promise<any> => {
  try {
    const text = await req.text();
    if (!text || text.trim() === "") {
      return {}; // Body vacío → objeto vacío
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing JSON body:", error);
    return {}; // Si falla el parseo, devolver objeto vacío
  }
};

// GET
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  
  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(`${API_URL}/equipment-loans/${path}`, {
      headers,
      cache: "no-store",
    });

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
    console.error("❌ Error en GET:", error);
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
  const body = await safeJsonParse(req); // ← CAMBIO

  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(`${API_URL}/equipment-loans/${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

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
    console.error("❌ Error en POST:", error);
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
  const body = await safeJsonParse(req); // ← CAMBIO CLAVE

  try {
    const headers = getAuthHeaders(req);
    
    // Solo enviar body si tiene contenido
    const hasBody = Object.keys(body).length > 0;
    
    const response = await fetch(`${API_URL}/equipment-loans/${path}`, {
      method: "PATCH",
      headers,
      ...(hasBody && { body: JSON.stringify(body) }),
      cache: "no-store",
    });

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
    console.error("❌ Error en PATCH:", error);
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

  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(`${API_URL}/equipment-loans/${path}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al procesar la solicitud" },
        { status: response.status }
      );
    }

    // DELETE puede no devolver body
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error en DELETE:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 }
    );
  }
}