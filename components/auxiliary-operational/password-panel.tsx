"use client";
import {
  auxiliaryFetch,
  isRequestCanceled,
} from "@/lib/auxiliary-operational/client";
import { useRefreshableEffect } from "@/hooks/useAuxiliaryOperational";
import { useEffect, useState, type FormEvent } from "react";
import {
  KeyRound,
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";
import AuxiliaryPasswordImport from "./password-import";
import type { PasswordEntry } from "@/lib/auxiliary-operational/domain/auxiliary-passwords";
type Entry = Omit<PasswordEntry, "password">;
const blank = { name: "", username: "", password: "", link: "" };
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
async function api<T>(path = "", payload?: unknown, signal?: AbortSignal) {
  const r = await auxiliaryFetch(
    "/api/auxiliary-operational/passwords" + path,
    {
      cache: "no-store",
      signal,
      ...(payload
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        : {}),
    },
  );
  const d = (await r.json()) as T & { error?: string };
  if (!r.ok) throw Error(d.error || "No se pudo completar la solicitud.");
  return d;
}
export default function AuxiliaryPasswords({ canEdit }: { canEdit: boolean }) {
  const [entries, setEntries] = useState<Entry[]>([]),
    [query, setQuery] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Entry | null | undefined>(undefined),
    [form, setForm] = useState(blank),
    [showForm, setShowForm] = useState(false),
    [revealed, setRevealed] = useState<Record<string, string>>({});
  useRefreshableEffect(() => {
    const c = new AbortController();
    api<{ entries: Entry[] }>("", undefined, c.signal)
      .then((d) => setEntries(d.entries))
      .catch((e) => {
        if (!c.signal.aborted && !isRequestCanceled(e))
          setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, []);
  async function reload() {
    const d = await api<{ entries: Entry[] }>();
    setEntries(d.entries);
    setRevealed({});
  }
  async function act(fn: () => Promise<void>) {
    if (busy) return;
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
  async function read(e: Entry) {
    return (
      await api<{ entry: PasswordEntry }>("?id=" + encodeURIComponent(e.id))
    ).entry;
  }
  function close() {
    setEditing(undefined);
    setForm(blank);
    setShowForm(false);
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    await act(async () => {
      await api("", {
        action: editing ? "update" : "create",
        id: editing?.id,
        revision: editing?.revision,
        ...form,
      });
      close();
      await reload();
      setNotice("Contraseña guardada.");
    });
  }
  const filtered = entries.filter((e) =>
    normalize(e.name + " " + e.username + " " + e.link).includes(
      normalize(query.trim()),
    ),
  );
  return (
    <section className="aux-card">
      <div className="aux-section-head">
        <h2>
          <KeyRound size={21} /> Contraseñas de Auxiliares
        </h2>
        {canEdit && (
          <button
            type="button"
            className="aux-primary"
            disabled={busy || loading}
            onClick={() => {
              close();
              setEditing(null);
              setError("");
              setNotice("");
            }}
          >
            <Plus size={17} /> Guardar contraseña
          </button>
        )}
      </div>
      <p>Accesos compartidos del equipo de Auxiliares operativos.</p>
      {canEdit && (
        <AuxiliaryPasswordImport
          existing={entries}
          disabled={busy || loading}
          onSaved={async (message) => {
            await reload();
            setNotice(message);
            setError("");
          }}
        />
      )}
      <label>
        Buscar plataforma o usuario
        <div className="aux-password-search">
          <Search size={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por plataforma, usuario o enlace…"
          />
        </div>
      </label>
      <p className="aux-muted">
        {filtered.length} de {entries.length} accesos guardados.
      </p>
      {error && (
        <p className="aux-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="aux-notice" role="status">
          {notice}
        </p>
      )}
      {editing !== undefined && canEdit && (
        <form onSubmit={save} className="aux-password-editor">
          <h3>{editing ? "Editar contraseña" : "Nuevo acceso"}</h3>
          <fieldset className="aux-form" disabled={busy}>
            <label>
              Plataforma
              <input
                required
                maxLength={150}
                value={form.name}
                onChange={(e) =>
                  setForm((v) => ({ ...v, name: e.target.value }))
                }
                placeholder="Hotel, aerolínea o sistema"
              />
            </label>
            <label>
              Usuario
              <input
                required
                autoComplete="off"
                maxLength={320}
                value={form.username}
                onChange={(e) =>
                  setForm((v) => ({ ...v, username: e.target.value }))
                }
              />
            </label>
            <label>
              Contraseña
              <input
                required
                type={showForm ? "text" : "password"}
                autoComplete="new-password"
                maxLength={4096}
                value={form.password}
                onChange={(e) =>
                  setForm((v) => ({ ...v, password: e.target.value }))
                }
              />
            </label>
            <label>
              Enlace · opcional
              <input
                type="url"
                maxLength={2000}
                value={form.link}
                onChange={(e) =>
                  setForm((v) => ({ ...v, link: e.target.value }))
                }
                placeholder="https://…"
              />
            </label>
            <div className="aux-actions aux-wide">
              <button
                type="button"
                aria-pressed={showForm}
                onClick={() => setShowForm((v) => !v)}
              >
                {showForm ? <EyeOff size={16} /> : <Eye size={16} />}{" "}
                {showForm ? "Ocultar" : "Ver contraseña"}
              </button>
              <button type="button" onClick={close}>
                Cancelar
              </button>
              <button type="submit" className="aux-primary">
                <Save size={16} />
                {busy ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </fieldset>
        </form>
      )}
      {loading ? (
        <p role="status">Cargando contraseñas…</p>
      ) : !filtered.length ? (
        <p className="aux-muted">
          {entries.length
            ? "No hay coincidencias."
            : "Todavía no hay contraseñas guardadas."}
        </p>
      ) : (
        <div className="aux-password-grid">
          {filtered.map((e) => (
            <article className="aux-password-item" key={e.id}>
              <h3>{e.name}</h3>
              <span className="aux-muted">Usuario</span>
              <p>{e.username}</p>
              <span className="aux-muted">Contraseña</span>
              <p>{revealed[e.id] ?? "••••••••••••"}</p>
              <div className="aux-actions">
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`${revealed[e.id] ? "Ocultar" : "Ver"} contraseña de ${e.name}`}
                  onClick={() => {
                    if (revealed[e.id])
                      setRevealed((v) => {
                        const next = { ...v };
                        delete next[e.id];
                        return next;
                      });
                    else
                      void act(async () => {
                        const d = await read(e);
                        setRevealed((v) => ({ ...v, [e.id]: d.password }));
                      });
                  }}
                >
                  {revealed[e.id] ? <EyeOff size={16} /> : <Eye size={16} />}{" "}
                  {revealed[e.id] ? "Ocultar" : "Ver"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void act(async () => {
                      const d = await read(e);
                      await navigator.clipboard.writeText(d.password);
                      setNotice("Contraseña copiada.");
                    })
                  }
                >
                  <Copy size={16} /> Copiar
                </button>
              </div>
              {e.link && (
                <a href={e.link} target="_blank" rel="noopener noreferrer">
                  Abrir plataforma ↗
                </a>
              )}
              {canEdit && (
                <div className="aux-actions">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void act(async () => {
                        const d = await read(e);
                        setEditing(d);
                        setForm({
                          name: d.name,
                          username: d.username,
                          password: d.password,
                          link: d.link,
                        });
                        setShowForm(false);
                      })
                    }
                  >
                    <Pencil size={15} /> Editar
                  </button>
                  <button
                    type="button"
                    className="aux-delete"
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          "¿Eliminar el acceso guardado de " + e.name + "?",
                        )
                      )
                        void act(async () => {
                          await api("", {
                            action: "delete",
                            id: e.id,
                            revision: e.revision,
                          });
                          if (editing?.id === e.id) close();
                          await reload();
                          setNotice("Contraseña eliminada.");
                        });
                    }}
                  >
                    <Trash2 size={15} /> Eliminar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
