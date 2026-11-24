import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const TOKEN_KEY = "portal_access_token";

const getAuthHeader = (req: NextRequest) => {
  let token = req.cookies.get(TOKEN_KEY)?.value;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7);
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const body = await req.text();
  try {
    const response = await fetch(`${API_URL}/commercial/quick-replies/${p.id}`, {
      method: "PATCH",
      headers: getAuthHeader(req),
      body,
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  try {
    const response = await fetch(`${API_URL}/commercial/quick-replies/${p.id}`, {
      method: "DELETE",
      headers: getAuthHeader(req),
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
  }
}