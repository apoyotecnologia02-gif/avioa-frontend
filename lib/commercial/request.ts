import { api } from "@/lib/axios";

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

  // Detectamos si es FormData o JSON
  let data: any = undefined;
  if (init?.body) {
    if (init.body instanceof FormData) {
      data = init.body;
    } else {
      try {
        data = JSON.parse(String(init.body));
      } catch {
        data = init.body; 
      }
    }
  }

  try {
    const response = await api.request({
      url,
      method: init?.method || "GET",
      data,
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