import { cookies } from "next/headers";
import { ACCESS_KEY } from "@/utils/constants";
export async function operationalProxy(request: Request, path: string[] = []) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base)
    return Response.json(
      { error: "Configura NEXT_PUBLIC_API_URL." },
      { status: 503 },
    );
  if (!["GET", "HEAD"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(request.url).origin)
      return Response.json({ error: "Origen no autorizado." }, { status: 403 });
  }
  const authorization =
    request.headers.get("authorization") ||
    ((await cookies()).get(ACCESS_KEY)?.value
      ? "Bearer " + (await cookies()).get(ACCESS_KEY)!.value
      : "");
  if (!authorization)
    return Response.json({ error: "Inicia sesión." }, { status: 401 });
  const headers = new Headers({ authorization });
  const type = request.headers.get("content-type");
  if (type) headers.set("content-type", type);
  const length = Number(request.headers.get("content-length"));
  if (length > 18 * 1024 * 1024)
    return Response.json({ error: "Carga demasiado grande." }, { status: 413 });
  try {
    const body = ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer();
    if (body && body.byteLength > 18 * 1024 * 1024)
      return Response.json(
        { error: "Carga demasiado grande." },
        { status: 413 },
      );
    const upstream = await fetch(
      base.replace(/\/$/, "") +
        "/auxiliary-operational" +
        (path.length ? "/" + path.map(encodeURIComponent).join("/") : "") +
        new URL(request.url).search,
      {
        method: request.method,
        headers,
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(100000),
      },
    );
    const output = new Headers({ "cache-control": "private, no-store" });
    for (const key of [
      "content-type",
      "content-disposition",
      "x-content-type-options",
      "content-security-policy",
    ]) {
      const value = upstream.headers.get(key);
      if (value) output.set(key, value);
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: output,
    });
  } catch {
    return Response.json(
      { error: "No se pudo contactar el backend." },
      { status: 502 },
    );
  }
}
