import { api } from "@/lib/axios";

// Preserve the existing JWT/refresh interceptors; return Fetch-compatible responses to the shared UI.
export const commercialRequest: typeof fetch = async (input, init) => {
  const raw =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  const url = raw.replace(/^\/api\/commercial\//, "/commercial/");
  if (!url.startsWith("/commercial/"))
    throw Error("Ruta comercial no permitida.");
  try {
    const response = await api.request({
      url,
      method: init?.method || "GET",
      data: init?.body ? JSON.parse(String(init.body)) : undefined,
      signal: init?.signal || undefined,
      timeout: 130000,
    });
    return Response.json(response.data, { status: response.status });
  } catch (e: any) {
    if (e?.response)
      return Response.json(e.response.data, { status: e.response.status });
    throw e;
  }
};