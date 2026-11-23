import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const TOKEN_KEY = "portal_access_token";

const getAuthHeaders = (req: NextRequest) => {
  let token = req.cookies.get(TOKEN_KEY)?.value;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7);
  }
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  
  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(`${API_URL}/commercial/rates/${path}`, {
      headers,
      cache: "no-store",
    });
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  const source = searchParams.get("source") || "";
  
  const contentType = req.headers.get("content-type") || "";
  const isFormData = contentType.includes("multipart/form-data");

  try {
    const headers = getAuthHeaders(req);
    let body: any;
    
    if (isFormData) {
      body = await req.formData();
    } else {
      body = await req.text();
      headers["Content-Type"] = "application/json";
    }

    const finalPath = path === "import" ? `import?source=${source}` : path;
    
    const response = await fetch(`${API_URL}/commercial/rates/${finalPath}`, {
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
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";

  try {
    const headers = getAuthHeaders(req);
    const response = await fetch(`${API_URL}/commercial/rates/${path}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
  }
}