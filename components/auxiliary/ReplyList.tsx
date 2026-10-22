"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Copy,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AuxiliaryPermissions, AuxiliaryRecord } from "@/types/auxiliary";
import { createAuxiliaryRepository } from "@/lib/auxiliary/auxiliar-repository";
import { quickReplyHtml } from "@/lib/auxiliary/domain/quick-reply-html";
import {
  parseQuickGrid,
  type QuickReply,
} from "@/lib/auxiliary/domain/auxiliary-quick-import";

const repository = createAuxiliaryRepository();
const newId = () => crypto.randomUUID();

// ============================================================
// parseGrid — antes vivía en Workspace.tsx, ahora se mueve aquí
// (o extráelo a lib/auxiliary/parse-grid.ts si lo reutilizas)
// ============================================================
export function parseGrid(text: string): string[][] {
  const sep = text.split(/\r?\n/, 1)[0].includes("\t") ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quote = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quote && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quote = !quote;
    } else if (c === sep && !quote) {
      row.push(cell);
      cell = "";
    } else if ((c === "\r" || c === "\n") && !quote) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }

  if (quote) throw Error("El CSV está incompleto: revisa las comillas.");
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

// ============================================================
// Componente
// ============================================================
interface Props {
  copy: (s: string) => void;
  notify: (s: string) => void;
  setError: (s: string) => void;
  permissions: AuxiliaryPermissions;
  onSaved: (row: AuxiliaryRecord) => void;
}

export function ReplyList({
  copy,
  notify,
  setError,
  permissions,
  onSaved,
}: Props) {
  const [replyRows, setReplyRows] = useState<AuxiliaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyQuery, setReplyQuery] = useState("");
  const [importText, setImportText] = useState("");
  const [preview, setPreview] = useState<ReturnType<
    typeof parseQuickGrid
  > | null>(null);
  const [busy, setBusy] = useState(false);

  // Cargar respuestas al montar
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    repository
      .list()
      .then((rows) => {
        if (cancelled) return;
        setReplyRows(rows.filter((r) => r.kind === "reply" && !r.archivedAt));
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setError]);

  const filtered = replyRows.filter((r) =>
    JSON.stringify(r.payload)
      .toLocaleLowerCase()
      .includes(replyQuery.toLocaleLowerCase()),
  );

  async function importReplies() {
    if (!preview || busy) return;
    setBusy(true);
    let added = 0;

    try {
      const existing = new Set(
        replyRows.map((row) =>
          JSON.stringify([
            (row.payload as QuickReply).title,
            (row.payload as QuickReply).category,
            (row.payload as QuickReply).body,
          ]),
        ),
      );

      for (const entry of preview.entries) {
        const key = JSON.stringify([entry.title, entry.category, entry.body]);
        if (existing.has(key)) continue;

        await repository.save(
          {
            id: newId(),
            kind: "reply",
            revision: 0,
            payload: { ...entry, html: quickReplyHtml(entry.body) },
            assets: [],
            state: "ready",
          },
          [],
        );
        added++;
        existing.add(key);
      }

      setPreview(null);
      setImportText("");

      const all = await repository.list();
      const replies = all.filter((r) => r.kind === "reply" && !r.archivedAt);
      setReplyRows(replies);
      notify(
        `${added} ${added === 1 ? "respuesta importada" : "respuestas importadas"}.`,
      );
      if (replies[0]) onSaved(replies[0]);
    } catch (e) {
      setError(
        `Se guardaron ${added} respuestas antes del error: ${(e as Error).message}`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* LISTA DE RESPUESTAS                                          */}
      {/* ============================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Respuestas guardadas</CardTitle>
          <CardDescription>
            {loading
              ? "Cargando catálogo…"
              : `${replyRows.length} ${
                  replyRows.length === 1 ? "respuesta" : "respuestas"
                } en el catálogo`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar respuesta"
              value={replyQuery}
              onChange={(e) => setReplyQuery(e.target.value)}
              placeholder="Hotel, destino o palabra clave…"
              className="pl-9"
            />
          </div>

          {/* Contenido */}
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <FolderOpen
                className="h-8 w-8 text-muted-foreground/60"
                strokeWidth={1.5}
              />
              <p className="text-sm font-medium">
                {replyQuery
                  ? "No hay coincidencias"
                  : "Aún no hay respuestas guardadas"}
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                {replyQuery
                  ? "Prueba con otra palabra clave o revisa los filtros."
                  : "Crea una respuesta o importa varias desde CSV/TSV."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((row) => {
                const p = row.payload as QuickReply;
                return (
                  <Card
                    key={row.auxiliaryRecordId}
                    className="flex flex-col border-border/60 bg-muted/30 p-4"
                  >
                    <Badge
                      variant="secondary"
                      className="mb-2 w-fit bg-primary/10 text-primary hover:bg-primary/10"
                    >
                      {p.category}
                    </Badge>
                    <h3 className="text-sm font-semibold leading-snug">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-4 flex-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1 border-t border-border/60 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-primary"
                        onClick={() => copy(p.body)}
                      >
                        <Copy className="h-3 w-3" /> Copiar texto
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-primary"
                        onClick={() => copy(quickReplyHtml(p.body))}
                      >
                        <Copy className="h-3 w-3" /> Copiar HTML
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* IMPORTAR RESPUESTAS                                          */}
      {/* ============================================================ */}
      {permissions.canCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Importar respuestas</CardTitle>
            <CardDescription>
              Pega filas con encabezados Título, Categoría, Respuesta y HTML
              (opcional), separadas por tabulaciones. También puedes cargar un
              CSV UTF-8.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Carga de archivo */}
            <div className="space-y-1.5">
              <label
                htmlFor="reply-import-file"
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium",
                  "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                )}
              >
                <Upload className="h-3.5 w-3.5" />
                Cargar archivo CSV o TSV
              </label>
              <input
                id="reply-import-file"
                type="file"
                accept=".csv,.tsv,text/csv,text/tab-separated-values"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;

                  if (file.size > 2 * 1024 * 1024) {
                    setError("Máximo 2 MB por archivo.");
                    return;
                  }

                  setImportText(await file.text());
                  setPreview(null);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Hasta 2 MB. Si usas Excel, exporta a CSV o pega la tabla
                directamente abajo.
              </p>
            </div>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                o
              </span>
            </div>

            {/* Pegar texto */}
            <div className="space-y-1.5">
              <label
                htmlFor="reply-import-text"
                className="text-xs font-semibold text-muted-foreground"
              >
                Pega las filas directamente
              </label>
              <Textarea
                id="reply-import-text"
                aria-label="Filas para importar respuestas"
                rows={6}
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setPreview(null);
                }}
                placeholder={
                  "Título\tCategoría\tRespuesta\nSaludo\tAtención\tHola, ¿cómo te ayudamos?"
                }
                className="font-mono text-xs"
              />
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!importText.trim() || busy}
                onClick={() => {
                  try {
                    setPreview(parseQuickGrid(parseGrid(importText)));
                    setError("");
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
                className="gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                Revisar importación
              </Button>

              {preview && (
                <Button
                  type="button"
                  size="sm"
                  disabled={busy}
                  onClick={() => void importReplies()}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {busy
                    ? "Importando…"
                    : `Importar ${preview.entries.length} ${
                        preview.entries.length === 1
                          ? "respuesta"
                          : "respuestas"
                      }`}
                </Button>
              )}
            </div>

            {/* Resumen del preview */}
            {preview && (
              <div
                className={cn(
                  "rounded-lg border px-4 py-3 text-xs leading-relaxed",
                  preview.entries.length > 0
                    ? "border-emerald-300/40 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-amber-300/40 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
                )}
              >
                <p className="flex items-center gap-1.5 font-semibold">
                  {preview.entries.length > 0 ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                  {preview.entries.length}{" "}
                  {preview.entries.length === 1
                    ? "respuesta válida"
                    : "respuestas válidas"}{" "}
                  · {preview.duplicates}{" "}
                  {preview.duplicates === 1 ? "duplicada" : "duplicadas"} dentro
                  del archivo
                </p>

                {preview.issues.length > 0 ? (
                  <pre className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">
                    {preview.issues.join("\n")}
                  </pre>
                ) : (
                  <p className="mt-1 text-[11px] opacity-80">
                    Sin filas con errores.
                  </p>
                )}
              </div>
            )}

            {/* Aviso */}
            <p className="flex items-start gap-2 rounded-lg bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                El contenido HTML se regenera desde el texto para evitar
                etiquetas y scripts del archivo. Los duplicados exactos del
                catálogo se omiten. Los archivos de Excel se pueden exportar a
                CSV o pegar como tabla.
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
