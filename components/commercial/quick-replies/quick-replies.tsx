"use client";
import { commercialRequest } from "@/lib/commercial/request";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { useCallback, useState } from "react";
import { useRefreshableEffect } from "@/lib/commercial/refresh";
import { normalizeOfferText, offersSheetUrl } from "@/lib/travel-offers";
type Reply = { id: string; title: string; text: string };
export function QuickReplies() {
  const [entries, setEntries] = useState<Reply[]>([]),
    [query, setQuery] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [checked, setChecked] = useState(""),
    [page, setPage] = useState(1);
  const load = useCallback(async (signal?: AbortSignal, force = false) => {
    setBusy(true);
    setError("");
    try {
      const r = await commercialRequest(
          "/api/commercial/quick-replies" + (force ? "?refresh=1" : ""),
          { cache: "no-store", signal },
        ),
        d = (await r.json()) as {
          entries: Reply[];
          checkedAt: string;
          error?: string;
        };
      if (!r.ok) throw Error(d.error);
      setError((d as { warning?: string }).warning || "");
      setEntries(d.entries);
      setChecked(d.checkedAt);
    } catch (e) {
      if (!signal?.aborted) setError((e as Error).message);
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }, []);
  useRefreshableEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);
  async function copy(text: string) {
    try {
      await copyCommercialText(text);
      setNotice("Respuesta copiada. Ya puedes pegarla en el chat del cliente.");
    } catch {
      setNotice(
        "No se pudo copiar automáticamente. Abre el texto completo y selecciónalo para copiarlo.",
      );
    }
  }
  const terms = normalizeOfferText(query).split(" ").filter(Boolean),
    filtered = entries.filter((e) =>
      terms.every((t) =>
        normalizeOfferText(e.title + " " + e.text).includes(t),
      ),
    ),
    pages = Math.max(1, Math.ceil(filtered.length / 24)),
    current = Math.min(page, pages);
  return (
    <section className="aux-card">
      <div className="aux-section-head">
        <div>
          <h2>Respuestas rápidas</h2>
          <p>Busca el mensaje y cópialo para atender a tu cliente.</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void load(undefined, true)}
        >
          {busy ? "Consultando Drive…" : "Actualizar desde Drive"}
        </button>
      </div>
      <a
        className="aux-primary"
        href={offersSheetUrl + "#gid=23297697"}
        target="_blank"
        rel="noopener noreferrer"
      >
        Cargar o editar respuestas en Drive ↗
      </a>
      <p className="aux-muted">
        Escribe el título en la columna A y la respuesta en la B de RESPUESTA
        RAPIDAS. La copia guardada se muestra al abrir; Actualizar desde Drive
        comprueba los cambios más recientes. Revisa y completa los datos del
        mensaje antes de enviarlo.
      </p>
      {checked && (
        <p className="aux-muted">
          Última consulta: {new Date(checked).toLocaleString("es-CO")}
        </p>
      )}
      {error && (
        <p className="aux-error" role="alert">
          {error}
          {entries.length > 0
            ? " Se conserva la última consulta en pantalla; puede estar desactualizada."
            : ""}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      <label>
        Buscar respuesta
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Saludo, seguimiento, reserva, documentación…"
        />
      </label>
      <p role="status">
        {filtered.length} de {entries.length} respuestas
      </p>
      <div className="aux-password-grid">
        {filtered.slice((current - 1) * 24, current * 24).map((e) => (
          <article className="aux-password-item" key={e.id}>
            <h3>{e.title}</h3>
            <p
              className="aux-quick-excerpt"
              style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
            >
              {e.text}
            </p>
            <details>
              <summary>Ver texto completo</summary>
              <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {e.text}
              </p>
            </details>
            <div className="aux-actions">
              <button
                type="button"
                className="aux-primary"
                onClick={() => void copy(e.text)}
              >
                Copiar respuesta
              </button>
              <a
                href={
                  offersSheetUrl + "#gid=23297697&range=A" + e.id + ":B" + e.id
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver en Drive ↗
              </a>
            </div>
          </article>
        ))}
      </div>
      {!busy && !filtered.length && !error && (
        <p>No hay respuestas para esta búsqueda.</p>
      )}
      {pages > 1 && (
        <div className="aux-actions">
          <button
            type="button"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            Anterior
          </button>
          <span>
            Página {current} de {pages}
          </span>
          <button
            type="button"
            disabled={current >= pages}
            onClick={() => setPage(current + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  );
}
