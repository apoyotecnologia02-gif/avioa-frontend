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
  const headers = getAuthHeaders(req);
  const response = await fetch(`${API_URL}/commercial/operators`, { headers, cache: "no-store" });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } });
}


export async function POST(req: NextRequest) {
  const headers = getAuthHeaders(req);
  const isFormData = req.headers.get("content-type")?.includes("multipart/form-data");
  const url = new URL(req.url);
  const isImport = url.searchParams.get("path") === "import";

  let body: any;
  let finalUrl = `${API_URL}/commercial/operators`;

  if (isImport) {
    body = await req.formData();
    const category = url.searchParams.get("category") || "";
    finalUrl += `/import?category=${encodeURIComponent(category)}`;
  } else {
    body = await req.text();
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(finalUrl, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });
  
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } });
}


export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  const headers = getAuthHeaders(req);
  const response = await fetch(`${API_URL}/commercial/operators/${id}`, { method: "DELETE", headers, cache: "no-store" });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } });
}