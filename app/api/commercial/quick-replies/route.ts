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
  const auth = getAuthHeader(req);
  if (!auth) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const response = await fetch(`${API_URL}/commercial/quick-replies`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthHeader(req);
  if (!auth) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const contentType = req.headers.get("content-type") || "";
  const isFormData = contentType.includes("multipart/form-data");

  try {
    let body: any;
    let path = "";


    if (isFormData) {
      body = await req.formData();
      path = "/import";
    } else {
      body = await req.text();
    }

    const response = await fetch(`${API_URL}/commercial/quick-replies${path}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      body,
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error en proxy POST quick-replies:", error);
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
  }
}