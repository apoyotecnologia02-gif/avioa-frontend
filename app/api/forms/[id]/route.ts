// app/api/forms/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← Promise
) {
  try {
    const { id: formId } = await params; // ← AWAIT
    const authHeader = request.headers.get("authorization");

    console.log(`🔍 GET /api/forms/${formId}`);

    const response = await fetch(`${BACKEND_URL}/api/v1/forms/${formId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error in GET proxy:", error);
    return NextResponse.json(
      { error: "Error al obtener el formulario" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← Promise
) {
  try {
    const { id: formId } = await params; // ← AWAIT
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    console.log(`📝 PUT /api/forms/${formId}`);

    const response = await fetch(`${BACKEND_URL}/api/v1/forms/${formId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error in PUT proxy:", error);
    return NextResponse.json(
      { error: "Error al actualizar el formulario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← Promise
) {
  try {
    const { id: formId } = await params; // ← AWAIT
    const authHeader = request.headers.get("authorization");

    console.log(`🗑️ DELETE /api/forms/${formId}`);
    console.log(`🔑 Authorization:`, authHeader ? "Presente" : "No presente");

    if (!authHeader) {
      console.error("❌ No hay token de autorización");
      return NextResponse.json(
        { error: "Token de autenticación no proporcionado" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/forms/${formId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    console.log(`📊 Status del backend: ${response.status}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Error ${response.status}:`, text);
      return NextResponse.json(
        { error: `Error en el backend: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ DELETE exitoso:`, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error in DELETE proxy:", error);
    return NextResponse.json(
      { error: "Error al eliminar el formulario" },
      { status: 500 }
    );
  }
}