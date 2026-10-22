import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const TOKEN_KEY = "portal_access_token";

async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
    .replace(/^\/api\/transfers\/?/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const target =
    API_URL + "/transfers" + (path ? "/" + path : "") + req.nextUrl.search;

  const token =
    req.cookies.get(TOKEN_KEY)?.value ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    req.headers.get("x-access-token");

  try {
    const response = await fetch(target, {
      method: req.method,
      headers: {
        ...(token ? { Authorization: "Bearer " + token } : {}),
        "Content-Type": "application/json",
      },
      ...(req.method === "GET" || req.method === "HEAD"
        ? {}
        : { body: await req.text() }),
      cache: "no-store",
    });

    const type = response.headers.get("content-type") ?? "";

    const body = type.includes("application/json")
      ? await response.json()
      : await response.text();

    return type.includes("application/json")
      ? NextResponse.json(body, { status: response.status })
      : new NextResponse(body, {
          status: response.status,
          headers: { "Content-Type": type || "text/plain" },
        });
  } catch {
    return NextResponse.json(
      { message: "Error de conexión con el servidor" },
      { status: 502 },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;

export const DELETE = proxy;
