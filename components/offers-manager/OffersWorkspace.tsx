"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/axios";
import { hasModuleAccess } from "@/lib/permissions";
import { useAuthStore } from "@/store/authStore";

export function OffersWorkspace({
  view,
}: {
  view: "offers" | "catalogo" | "sim";
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const user = useAuthStore((state) => state.user);
  // Register OFFERS and OFFERS_INTERNAL in lib/modules.ts before compiling this integration.
  const access =
    !!user &&
    hasModuleAccess(user, "OFFERS") &&
    hasModuleAccess(user, "OFFERS_INTERNAL");
  useEffect(() => {
    if (!access) return;
    let active = true;
    const channel = crypto.randomUUID();
    const listener = async (event: MessageEvent) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== window.location.origin ||
        event.data?.channel !== channel ||
        typeof event.data.id !== "string"
      )
        return;
      const { id, path, options = {} } = event.data;
      if (path === "runtime-refresh") {
        if ((options.method || "GET") !== "GET") return;
        try {
          const response = await api.get("/offers-manager/runtime", {
            responseType: "text",
          });
          if (!active) return;
          const nextHtml = String(response.data)
            .replaceAll("__OFFERS_RPC_CHANNEL__", channel)
            .replaceAll("__OFFERS_INITIAL_VIEW__", view);
          frame.current?.contentWindow?.postMessage(
            { channel, id, ok: true, data: { refreshed: true } },
            window.location.origin,
          );
          setHtml(nextHtml);
        } catch (e: any) {
          if (active)
            frame.current?.contentWindow?.postMessage(
              {
                channel, id, ok: false,
                status: e.response?.status || 500,
                error: "No se pudo recargar el catálogo. Intenta de nuevo.",
              },
              window.location.origin,
            );
        }
        return;
      }
      const valid =
        typeof path === "string" &&
        /^(session|state|history(?:\?offset=\d+)?|history\/\d+|approve|workbook-sync|hunter\/(status|sync)|product-import\/(preview|commit))$/.test(
          path,
        );
      if (!valid || !["GET", "POST", "PUT"].includes(options.method || "GET"))
        return;
      if (
        (path === "hunter/status" && (options.method || "GET") !== "GET") ||
        (path === "hunter/sync" && options.method !== "POST")
      ) return;
      try {
        const response = await api.request({
          url: "/offers-manager/" + path,
          method: options.method || "GET",
          data: options.body ? JSON.parse(options.body) : undefined,
        });
        if (active)
          frame.current?.contentWindow?.postMessage(
            { channel, id, ok: true, data: response.data },
            "*",
          );
      } catch (e: any) {
        if (active)
          frame.current?.contentWindow?.postMessage(
            {
              channel,
              id,
              ok: false,
              status: e.response?.status || 500,
              error:
                e.response?.data?.error ||
                e.message ||
                "No se pudo completar la operación",
            },
            "*",
          );
      }
    };
    window.addEventListener("message", listener);
    api
      .get("/offers-manager/runtime", { responseType: "text" })
      .then((response) => {
        if (active)
          setHtml(
            String(response.data)
              .replaceAll("__OFFERS_RPC_CHANNEL__", channel)
              .replaceAll("__OFFERS_INITIAL_VIEW__", view),
          );
      })
      .catch((e: any) => {
        if (active) setError(e.message || "No se pudo abrir el gestor");
      });
    return () => {
      active = false;
      window.removeEventListener("message", listener);
    };
  }, [access, view]);
  if (!user) return <p>Cargando sesión…</p>;
  if (!access)
    return <p>No tienes permiso para este espacio interno de Producto.</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!html) return <p>Cargando gestor de ofertas…</p>;
  return (
    <iframe
      ref={frame}
      srcDoc={html}
      sandbox="allow-scripts allow-same-origin allow-downloads allow-modals allow-popups allow-popups-to-escape-sandbox"
      allow="clipboard-write"
      title="Ofertas, catálogo del cazador y simulador"
      className="w-full h-[calc(100dvh-100px)] min-h-[650px] border-0"
    />
  );
}
