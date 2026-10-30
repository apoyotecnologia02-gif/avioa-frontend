"use client";

import { useCallback, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { commercialRequest } from "@/lib/commercial/request";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { useRefreshableEffect } from "@/lib/commercial/refresh";
import { useModulePermission } from "@/hooks/useModulePermission";
import { normalizeOfferText, offersSheetUrl } from "@/lib/travel-offers";
import {
  commercialProtocolSource,
  type ProtocolSection,
} from "@/lib/commercial-protocol";

const sourceUrl =
  offersSheetUrl + "#gid=" + commercialProtocolSource.gid;

interface ProtocolResponse {
  sections: ProtocolSection[];
  checkedAt: string;
  warning?: string;
  error?: string;
}

export function AttentionProtocol() {
  const permissions = useModulePermission("COMMERCIAL");

  const [sections, setSections] = useState<ProtocolSection[]>([]);
  const [checked, setChecked] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("all");

  const load = useCallback(async (signal?: AbortSignal, force = false) => {
    setBusy(true);
    setError("");
    try {
      const r = await commercialRequest(
        "/api/commercial/protocol" + (force ? "?refresh=1" : ""),
        { cache: "no-store", signal },
      );
      const d = (await r.json()) as ProtocolResponse;
      if (!r.ok) throw new Error(d.error || "No se pudo cargar el protocolo.");
      setError(d.warning || "");
      if (signal?.aborted) return;
      setSections(d.sections);
      setChecked(d.checkedAt);
    } catch (e) {
      if (!signal?.aborted) setError((e as Error).message);
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }, []);

  useRefreshableEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function copy(text: string) {
    try {
      await copyCommercialText(text);
      toast.success("Mensaje copiado. Revísalo antes de enviar.");
    } catch {
      toast.error(
        "No se pudo copiar. Selecciona el texto para copiarlo manualmente.",
      );
    }
  }

  if (!permissions.canAccess) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">
          No tienes acceso al módulo Comercial.
        </p>
      </div>
    );
  }

  // Filtro
  const terms = normalizeOfferText(query).split(" ").filter(Boolean);
  const visible = sections
    .filter((s) => selected === "all" || s.id === selected)
    .map((s) => ({
      ...s,
      steps: s.steps.filter((step) =>
        terms.every((t) =>
          normalizeOfferText(
            s.title + " " + step.label + " " + step.text,
          ).includes(t),
        ),
      ),
    }))
    .filter((s) => s.steps.length);

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <BookOpen className="h-5 w-5" />
            Protocolo de atención
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Guía de atención comercial en Bitrix24: escenarios, seguimientos y
            manejo de objeciones.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void load(undefined, true)}
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {busy ? "Consultando Drive…" : "Actualizar desde Drive"}
        </Button>
      </div>

      {/* Fuente + última consulta */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span>
          {checked
            ? `Última consulta: ${new Date(checked).toLocaleString("es-CO", {
                timeZone: "America/Bogota",
              })}`
            : "Se muestra el protocolo guardado."}
        </span>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline"
        >
          Ver protocolo en Drive <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <p className="text-xs text-muted-foreground">
        Despliega un escenario para consultar sus pasos. Los precios, fechas y
        condiciones de los ejemplos deben validarse antes de enviarlos.
      </p>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
          {sections.length > 0
            ? " Se conserva la consulta anterior; puede estar desactualizada."
            : ""}
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Escenario o sección</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                Todos los escenarios y objeciones
              </SelectItem>
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Buscar en el protocolo</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Saludo, seguimiento, fechas, objeciones…"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Estado de carga */}
      {busy && !checked && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando protocolo de atención…
        </div>
      )}

      {/* Secciones */}
      <div className="space-y-3">
        {visible.map((s) => (
          <details
            key={s.id}
            className="group rounded-lg border border-border bg-card"
            open={query.trim() || selected !== "all" ? true : undefined}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
              <span>{s.title}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <ol className="space-y-4 border-t border-border/50 p-4">
              {s.steps.map((step) => (
                <li
                  key={step.id}
                  className="border-b border-border/40 pb-4 last:border-b-0 last:pb-0"
                >
                  <strong className="block whitespace-pre-wrap text-sm">
                    {step.label || "Mensaje"}
                  </strong>
                  {step.text && (
                    <>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                        {step.text}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void copy(step.text)}
                        >
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Copiar mensaje
                        </Button>
                        <Button variant="link" size="sm" asChild>
                          <a
                            href={`${sourceUrl}&range=A${step.row}:C${step.row}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver en Drive{" "}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </details>
        ))}
      </div>

      {/* Sin resultados */}
      {!busy && !visible.length && !error && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            No encontramos pasos con esa búsqueda
          </h3>
          <p className="max-w-sm text-xs text-muted-foreground">
            Prueba con otras palabras o selecciona "Todos los escenarios".
          </p>
        </div>
      )}
    </div>
  );
}