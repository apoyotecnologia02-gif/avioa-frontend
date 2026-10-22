import { NextResponse } from "next/server";

const base = process.env.NEXT_PUBLIC_API_URL;

export async function auxiliaryProxy(request: Request, suffix = "") {
  if (!base)
    return NextResponse.json(
      { message: "Backend sin configurar." },
      { status: 503 },
    );
  const auth = request.headers.get("authorization");

  if (!auth)
    return NextResponse.json({ message: "Inicia sesión." }, { status: 401 });

  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(request.url).origin)
      return NextResponse.json(
        { message: "Origen no autorizado." },
        { status: 403 },
      );
  }
  try {
    const headers: Record<string, string> = { Authorization: auth };
    const contentType = request.headers.get("content-type");
    if (contentType) headers["Content-Type"] = contentType;
    const response = await fetch(
      base.replace(/\/$/, "") + "/auxiliary/records" + suffix,
      {
        method: request.method,
        headers,
        body:
          request.method === "GET" ? undefined : await request.arrayBuffer(),
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      },
    );
    const output = new Headers({ "Cache-Control": "private, no-store" });
    for (const key of [
      "Content-Type",
      "Content-Disposition",
      "X-Content-Type-Options",
    ]) {
      const value = response.headers.get(key);
      if (value) output.set(key, value);
    }
    return new Response(response.body, {
      status: response.status,
      headers: output,
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo contactar el backend." },
      { status: 502 },
    );
  }
}
