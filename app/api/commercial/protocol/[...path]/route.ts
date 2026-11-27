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

async function proxyRequest(req: NextRequest, method: string, pathSegments: string[]) {
  const auth = getAuthHeader(req);
  if (!auth) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const path = pathSegments ? pathSegments.join("/") : "";
  const url = new URL(req.url);
  const fullUrl = `${API_URL}/commercial/protocol/${path}${url.search}`;

  const headers: Record<string, string> = { Authorization: auth };
  let body: any = undefined;

  const contentType = req.headers.get("content-type") || "";
  
  if (contentType.includes("multipart/form-data")) {
    body = await req.formData();
  } else if (["POST", "PATCH", "PUT"].includes(method)) {
    body = await req.text();
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(fullUrl, { method, headers, body, cache: "no-store" });
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`❌ Error proxy protocol [${method}] ${path}:`, error);
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
  }
}


export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const p = await params;
  return proxyRequest(req, "GET", p.path || []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const p = await params;
  return proxyRequest(req, "POST", p.path || []);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const p = await params;
  return proxyRequest(req, "PATCH", p.path || []);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const p = await params;
  return proxyRequest(req, "DELETE", p.path || []);
}