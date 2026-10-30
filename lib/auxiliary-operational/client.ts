"use client";
import { api } from "@/lib/axios";

export function isRequestCanceled(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    name?: unknown;
    code?: unknown;
    __CANCEL__?: unknown;
  };
  return (
    candidate.name === "AbortError" ||
    candidate.name === "CanceledError" ||
    candidate.code === "ERR_CANCELED" ||
    candidate.__CANCEL__ === true
  );
}

/** Reuse portal token injection, refresh, multipart handling and error behavior. */
export async function auxiliaryFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = Object.fromEntries(new Headers(options.headers).entries());
  try {
    const response = await api.request({
      url: url.replace(/^\/api/, ""),
      method: options.method || "GET",
      data: options.body || undefined,
      headers,
      signal: options.signal || undefined,
      responseType: "arraybuffer",
    });
    return new Response(response.data, {
      status: response.status,
      headers: {
        "content-type": String(
          response.headers["content-type"] || "application/json",
        ),
      },
    });
  } catch (error) {
    const response = (
      error as { response?: { data?: ArrayBuffer; status: number } }
    ).response;
    if (response)
      return new Response(response.data, { status: response.status });
    throw error;
  }
}
