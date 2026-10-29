"use client";
import {
  auxiliaryFetch,
  isRequestCanceled,
} from "@/lib/auxiliary-operational/client";
import { useCallback, useRef, useState, type FormEvent } from "react";
import HtmlConverter from "./html-converter";
import { quickReplyHtml } from "@/lib/auxiliary-operational/domain/quick-reply-html";
import { Copy, Search, Upload, RefreshCw, BookOpen } from "lucide-react";
import { useRefreshableEffect } from "@/hooks/useAuxiliaryOperational";
import { readPasswordFileGrid } from "@/lib/auxiliary-operational/domain/reservation-password-import";
import {
  parseQuickGrid,
  quickNormalize,
  type QuickReply,
} from "@/lib/auxiliary-operational/domain/auxiliary-quick-import";
type Entry = QuickReply & { id: string; revision: number };
type Preview = ReturnType<typeof parseQuickGrid>;
async function request(body?: unknown, signal?: AbortSignal) {
  const r = await auxiliaryFetch("/api/auxiliary-operational/quick-replies", {
    cache: "no-store",
    signal,
    ...(body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
  const d = (await r.json()) as {
    error?: string;
    entries: Entry[];
    added: number;
    skipped: number;
  };
  if (!r.ok) throw Error(d.error || "No se pudo completar la solicitud.");
  return d;
}
export default function QuickReplies({ canEdit }: { canEdit: boolean }) {
  const [entries, setEntries] = useState<Entry[]>([]),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [selected, setSelected] = useState<string | null>(null),
    [preview, setPreview] = useState<Preview | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [editing, setEditing] = useState<Entry | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const [converterText, setConverterText] = useState("");
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const d = await request(undefined, signal);
      setEntries(d.entries);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);
  useRefreshableEffect(() => {
    const c = new AbortController();
    void load(c.signal).catch((e) => {
      if (!isRequestCanceled(e)) setError(e.message);
    });
    return () => c.abort();
  }, [load]);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function choose(file: File) {
    setPreview(null);
    await run(async () => {
      setPreview(parseQuickGrid(await readPasswordFileGrid(file)));
    });
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Respuesta copiada.");
    } catch {
      setError(
        "No se pudo copiar automáticamente. Abre la respuesta y selecciona el texto para copiarlo.",
      );
    }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await run(async () => {
      await request({
        action: "edit",
        id: editing.id,
        revision: editing.revision,
        entry: editing,
      });
      setEditing(null);
      await load();
      setNotice("Respuesta actualizada.");
    });
  }
  const categories = [...new Set(entries.map((e) => e.category))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
  const words = quickNormalize(query).split(" ").filter(Boolean),
    filtered = entries.filter(
      (e) =>
        (!category || e.category === category) &&
        words.every((w) =>
          quickNormalize(e.title + " " + e.category + " " + e.body).includes(w),
        ),
    ),
    active = entries.find((e) => e.id === selected);
  return (
    <section className="aux-card">
      <div className="aux-section-head">
        <div>
          <h2>
            <BookOpen size={22} /> Respuestas rápidas
          </h2>
          <p>
            Encuentra el mensaje por hotel, destino o palabra clave y cópialo
            para tu gestión.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(() => load())}
        >
          <RefreshCw size={17} /> Actualizar
        </button>
      </div>
      {error && (
        <p role="alert" className="aux-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="aux-notice">
          {notice}
        </p>
      )}
      <HtmlConverter text={converterText} onChange={setConverterText} />
      {canEdit && (
        <div className="aux-quick-import">
          <button
            type="button"
            className="aux-primary"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            <Upload size={18} /> Importar Excel
          </button>
          <input
            hidden
            ref={input}
            type="file"
            accept=".xlsx"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void choose(f);
            }}
          />
          <p>
            Admite el archivo de respuestas rápidas con celdas combinadas, o una
            tabla con <strong>Título, Categoría, Respuesta</strong> y{" "}
            <strong>HTML</strong> (opcional). Máximo 300 respuestas y 2 MB. Las
            respuestas idénticas no se duplican; los textos diferentes se
            conservan como otra versión.
          </p>
        </div>
      )}
      {preview && (
        <div className="aux-password-editor">
          <h3>Revisar importación · {preview.entries.length} respuestas</h3>
          <p>
            {preview.duplicates} repeticiones del archivo omitidas. Se
            conservarán saltos de línea, emojis y el código HTML disponible.
          </p>
          {preview.issues.length > 0 && (
            <details>
              <summary>
                Revisar {preview.issues.length} filas no importables
              </summary>
              <ul>
                {preview.issues.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </details>
          )}
          <div className="aux-quick-preview">
            {preview.entries.map((e, i) => (
              <details key={i}>
                <summary>
                  {e.title} · {e.category}
                </summary>
                <p style={{ whiteSpace: "pre-wrap" }}>{e.body}</p>
                {e.html && <small>Incluye código HTML.</small>}
              </details>
            ))}
          </div>
          <div className="aux-actions">
            <button
              type="button"
              className="aux-primary"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const d = await request({
                    action: "import",
                    entries: preview.entries,
                  });
                  setPreview(null);
                  await load();
                  setNotice(
                    `${d.added} respuestas importadas · ${d.skipped} ya existentes omitidas.`,
                  );
                })
              }
            >
              {busy ? "Importando…" : "Confirmar importación"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setPreview(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      <div className="aux-quick-filters">
        <label>
          <span>
            <Search size={15} /> Buscar respuesta
          </span>
          <input
            type="search"
            placeholder="Ej.: Sirenis, documentación, equipaje…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Categoría
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="aux-muted" role="status">
        {loading
          ? "Cargando respuestas…"
          : `${filtered.length} de ${entries.length} respuestas`}
      </p>
      {editing && (
        <form className="aux-password-editor" onSubmit={save}>
          <h3>Editar respuesta</h3>
          <fieldset className="aux-form" disabled={busy}>
            <label>
              Título
              <input
                required
                maxLength={250}
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />
            </label>
            <label>
              Categoría
              <input
                required
                maxLength={150}
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
              />
            </label>
            <label className="aux-wide">
              Respuesta
              <textarea
                rows={12}
                required
                maxLength={20000}
                value={editing.body}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    body: e.target.value,
                    html: quickReplyHtml(e.target.value),
                  })
                }
              />
            </label>
            <label className="aux-wide">
              Código HTML (se regenera automáticamente al cambiar la respuesta)
              <textarea
                rows={4}
                maxLength={200000}
                value={editing.html}
                onChange={(e) =>
                  setEditing({ ...editing, html: e.target.value })
                }
              />
            </label>
            <div className="aux-actions aux-wide">
              <button className="aux-primary" type="submit">
                Guardar cambios
              </button>
              <button type="button" onClick={() => setEditing(null)}>
                Cancelar
              </button>
            </div>
          </fieldset>
        </form>
      )}
      {active && !editing && (
        <article className="aux-quick-detail">
          <div className="aux-section-head">
            <div>
              <span className="aux-badge">{active.category}</span>
              <h3>{active.title}</h3>
            </div>
            <button type="button" onClick={() => setSelected(null)}>
              Cerrar respuesta
            </button>
          </div>
          <div className="aux-quick-body" tabIndex={0}>
            {active.body}
          </div>
          <div className="aux-actions">
            <button
              type="button"
              className="aux-primary"
              onClick={() => void copy(active.body)}
            >
              <Copy size={16} /> Copiar respuesta
            </button>
            <button
              type="button"
              onClick={() => void copy(quickReplyHtml(active.body))}
            >
              Copiar HTML del texto actual
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  converterText &&
                  converterText !== active.body &&
                  !window.confirm(
                    "¿Reemplazar el texto que tienes en el convertidor?",
                  )
                )
                  return;
                setConverterText(active.body);
                document
                  .getElementById("quick-html-converter")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Abrir en convertidor
            </button>
            {canEdit && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditing({ ...active })}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="aux-delete"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        `¿Eliminar la respuesta «${active.title}»?`,
                      )
                    )
                      void run(async () => {
                        await request({
                          action: "delete",
                          id: active.id,
                          revision: active.revision,
                        });
                        setSelected(null);
                        await load();
                        setNotice("Respuesta eliminada.");
                      });
                  }}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
          {active.html && (
            <details>
              <summary>Ver código HTML original</summary>
              <p className="aux-muted">
                Se conserva tal como viene en el Excel. Verifica que corresponda
                al mensaje antes de usarlo.
              </p>
              <pre className="aux-quick-code">{active.html}</pre>
            </details>
          )}
        </article>
      )}
      <div className="aux-password-grid">
        {filtered.map((e) => (
          <article key={e.id} className="aux-password-item aux-quick-item">
            <span className="aux-badge">{e.category}</span>
            <h3>{e.title}</h3>
            <p className="aux-quick-excerpt">{e.body}</p>
            <div className="aux-actions">
              <button
                type="button"
                className="aux-primary"
                onClick={() => {
                  setSelected(e.id);
                  setEditing(null);
                  requestAnimationFrame(() =>
                    document
                      .querySelector(".aux-quick-detail")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      }),
                  );
                }}
              >
                Ver respuesta
              </button>
              <button
                type="button"
                aria-label={"Copiar " + e.title}
                onClick={() => void copy(e.body)}
              >
                <Copy size={16} /> Copiar
              </button>
            </div>
          </article>
        ))}
      </div>
      {!loading && !filtered.length && (
        <p className="aux-notice">
          {entries.length
            ? "No hay coincidencias. Prueba otra palabra o categoría."
            : canEdit
              ? "Importa el Excel para compartir las respuestas con el equipo."
              : "Todavía no hay respuestas importadas."}
        </p>
      )}
    </section>
  );
}
