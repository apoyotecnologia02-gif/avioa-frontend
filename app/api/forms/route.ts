// app/api/forms/route.ts
import { NextRequest, NextResponse } from "next/server";

// 🔥 Usar la URL correcta del backend
const BACKEND_URL = "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = queryString 
      ? `${BACKEND_URL}/api/v1/forms?${queryString}` 
      : `${BACKEND_URL}/api/v1/forms`;

    const authHeader = request.headers.get("authorization");
    
    console.log('🔍 Proxying GET to:', url);
    console.log('🔑 Authorization:', authHeader ? 'Presente' : 'No presente');

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    console.log('📊 Status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Error:', response.status, text);
      return NextResponse.json(
        { error: `Error en el backend: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in GET proxy:', error);
    return NextResponse.json(
      { error: "Error al obtener formularios" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    const url = `${BACKEND_URL}/api/v1/forms`;
    console.log('🔍 Proxying POST to:', url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Error:', response.status, text);
      return NextResponse.json(
        { error: `Error en el backend: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in POST proxy:', error);
    return NextResponse.json(
      { error: "Error al crear el formulario" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formId = request.nextUrl.pathname.split('/').pop();
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    const url = `${BACKEND_URL}/api/v1/forms/${formId}`;
    console.log('🔍 Proxying PUT to:', url);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Error:', response.status, text);
      return NextResponse.json(
        { error: `Error en el backend: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in PUT proxy:', error);
    return NextResponse.json(
      { error: "Error al actualizar el formulario" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const formId = request.nextUrl.pathname.split('/').pop();
    const authHeader = request.headers.get("authorization");

    const url = `${BACKEND_URL}/api/v1/forms/${formId}`;
    console.log('🔍 Proxying DELETE to:', url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Error:', response.status, text);
      return NextResponse.json(
        { error: `Error en el backend: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in DELETE proxy:', error);
    return NextResponse.json(
      { error: "Error al eliminar el formulario" },
      { status: 500 }
    );
  }
}