import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const route = path.join("/");
  if (
    !/^(runtime|session|state|history|history\/\d+|approve|initialize|workbook-sync|hunter\/(status|sync)|product-import\/(preview|commit))$/.test(
      route,
    )
  )
    return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
  if (
    (route === "hunter/status" && req.method !== "GET") ||
    (route === "hunter/sync" && req.method !== "POST")
  ) return NextResponse.json({ error: "Método no permitido" }, { status: 405 });
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer "))
    return NextResponse.json(
      { error: "Inicia sesión en el portal" },
      { status: 401 },
    );
  if (
    req.method !== "GET" &&
    req.headers.get("origin") &&
    req.headers.get("origin") !== req.nextUrl.origin
  )
    return NextResponse.json({ error: "Origen inválido" }, { status: 403 });
  const base =
    process.env.OFFERS_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base)
    return NextResponse.json(
      { error: "Configura OFFERS_BACKEND_URL en el frontend del VPS" },
      { status: 503 },
    );
  try {
    const url = new URL(base.replace(/\/$/, "") + "/offers-manager/" + route);
    url.search = req.nextUrl.search;
    const body = req.method === "GET" ? undefined : await req.text();
    if (body && Buffer.byteLength(body) > 8_000_000)
      return NextResponse.json(
        { error: "Carga demasiado grande" },
        { status: 413 },
      );
    const response = await fetch(url, {
      method: req.method,
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
      redirect: "error",
    });
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo consultar el backend de Ofertas" },
      { status: 502 },
    );
  }
}
export { proxy as GET, proxy as POST, proxy as PUT };
