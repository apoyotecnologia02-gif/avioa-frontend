"use client";
import {
  auxiliaryFetch,
  isRequestCanceled,
} from "@/lib/auxiliary-operational/client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Plane, Plus, Save, Download, Trash2, Copy } from "lucide-react";
import { useRefreshableEffect } from "@/hooks/useAuxiliaryOperational";
import {
  newFlightItinerary,
  type FlightItinerary,
  type SavedFlightItinerary,
} from "@/lib/auxiliary-operational/domain/flight-itinerary";
import {
  TRANSFER_IMAGE_LIMIT,
  TRANSFER_IMAGE_BYTES,
} from "@/lib/auxiliary-operational/domain/transfer-images";
async function api<T>(path: string, init?: RequestInit) {
  const response = await auxiliaryFetch(
      "/api/auxiliary-operational/flights" + path,
      { cache: "no-store", ...init },
    ),
    result = (await response.json()) as T & { error?: string };
  if (!response.ok)
    throw Error(result.error || "No se pudo completar la solicitud.");
  return result;
}
export default function FlightPanel({
  canEdit,
  passengerText,
}: {
  canEdit: boolean;
  passengerText: string;
}) {
  const [data, setData] = useState<FlightItinerary>(newFlightItinerary),
    [saved, setSaved] = useState<SavedFlightItinerary | null>(null),
    [files, setFiles] = useState<File[]>([]),
    [previews, setPreviews] = useState<string[]>([]),
    [rows, setRows] = useState<SavedFlightItinerary[]>([]),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [view, setView] = useState<"edit" | "history">("edit");
  const operation = useRef<string | null>(null);
  const dirty =
    files.length > 0 ||
    JSON.stringify(data) !==
      JSON.stringify(saved?.data || newFlightItinerary());
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const result = await api<{
        itineraries: SavedFlightItinerary[];
        pages: number;
      }>("?q=" + encodeURIComponent(query) + "&page=" + page, { signal });
      setRows(result.itineraries);
      setPages(result.pages);
      if (page > result.pages) setPage(result.pages);
    },
    [query, page],
  );
  useRefreshableEffect(() => {
    const c = new AbortController(),
      timer = setTimeout(
        () =>
          void load(c.signal).catch((e) => {
            if (!isRequestCanceled(e)) setError(e.message);
          }),
        200,
      );
    return () => {
      clearTimeout(timer);
      c.abort();
    };
  }, [load]);
  function update<K extends keyof FlightItinerary>(
    key: K,
    value: FlightItinerary[K],
  ) {
    setData((current) => ({
      ...current,
      [key]: value,
      confirmed: key === "confirmed" ? (value as boolean) : false,
    }));
    operation.current = null;
    setNotice("");
  }
  function reset() {
    if (dirty && !confirm("¿Descartar los cambios de este itinerario?")) return;
    setData(newFlightItinerary());
    setSaved(null);
    setFiles([]);
    operation.current = null;
    setError("");
    setNotice("");
    setView("edit");
  }
  function open(row: SavedFlightItinerary) {
    if (dirty && !confirm("¿Descartar los cambios y abrir este itinerario?"))
      return;
    setSaved(row);
    setData({ ...row.data });
    setFiles([]);
    operation.current = null;
    setView("edit");
    setError("");
    setNotice("");
  }
  function attach(input: HTMLInputElement) {
    const incoming = Array.from(input.files || []);
    input.value = "";
    if (!incoming.length) return;
    if (
      (data.images?.length || 0) + files.length + incoming.length >
      TRANSFER_IMAGE_LIMIT
    ) {
      setError("Puedes adjuntar hasta 3 imágenes.");
      return;
    }
    if (
      incoming.some(
        (f) =>
          !["image/jpeg", "image/png"].includes(f.type) ||
          f.size < 1 ||
          f.size > TRANSFER_IMAGE_BYTES,
      )
    ) {
      setError("Usa imágenes JPG o PNG de hasta 5 MB cada una.");
      return;
    }
    setFiles((current) => [...current, ...incoming]);
    update("confirmed", false);
    setError("");
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy || !canEdit) return;
    if (!(data.images?.length || files.length)) {
      setError("Adjunta al menos una imagen del itinerario de vuelo.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      operation.current ??= crypto.randomUUID();
      const payload = JSON.stringify({
          id: saved?.id || null,
          revision: saved?.revision || 0,
          requestId: operation.current,
          data,
        }),
        form = new FormData();
      form.set("payload", payload);
      files.forEach((f) => form.append("images", f));
      const result = await api<{ itinerary: SavedFlightItinerary }>(
        "",
        files.length
          ? { method: "POST", body: form }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: payload,
            },
      );
      setSaved(result.itinerary);
      setData({ ...result.itinerary.data });
      setFiles([]);
      operation.current = null;
      setNotice("Itinerario guardado. Ya puedes descargar el PDF membreteado.");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(row: SavedFlightItinerary) {
    if (
      busy ||
      !canEdit ||
      !confirm(
        "¿Eliminar el itinerario " +
          row.data.reservationCode +
          " y sus imágenes?",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await api("/" + row.id, { method: "DELETE" });
      if (saved?.id === row.id) {
        setSaved(null);
        setData(newFlightItinerary());
        setFiles([]);
      }
      await load();
      setNotice("Itinerario eliminado.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const imageUrl = (id: string) =>
    "/api/auxiliary-operational/flights/" +
    saved?.id +
    "/image?imageId=" +
    encodeURIComponent(id);
  return (
    <>
      <section className="aux-card">
        <div className="aux-section-head">
          <h2>
            <Plane size={21} /> Itinerarios de vuelos
          </h2>
          {canEdit && (
            <button type="button" disabled={busy} onClick={reset}>
              <Plus size={17} /> Nuevo itinerario
            </button>
          )}
        </div>
        <p>
          Hoja membreteada de aVioa para enviar al pasajero. Completa la
          aerolínea, el código de reserva, los datos de los pasajeros y la
          imagen del vuelo de regreso o del itinerario completo.
        </p>
        <div className="aux-actions">
          <button
            type="button"
            disabled={busy}
            aria-pressed={view === "edit"}
            onClick={() => setView("edit")}
          >
            Crear / editar
          </button>
          <button
            type="button"
            disabled={busy}
            aria-pressed={view === "history"}
            onClick={() => setView("history")}
          >
            Itinerarios guardados
          </button>
        </div>
      </section>
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
      {view === "edit" && (
        <div className="aux-transfer-layout">
          <section className="aux-card">
            <form onSubmit={save}>
              <fieldset className="aux-form" disabled={busy || !canEdit}>
                <label>
                  Aerolínea
                  <input
                    maxLength={120}
                    value={data.airline || ""}
                    onChange={(e) => update("airline", e.target.value)}
                    placeholder="Ej.: Avianca, LATAM, JetSMART"
                  />
                </label>
                <label>
                  Código de reserva
                  <input
                    required
                    maxLength={120}
                    value={data.reservationCode}
                    onChange={(e) => update("reservationCode", e.target.value)}
                    placeholder="Código de la aerolínea · puedes incluir varios"
                  />
                </label>
                <label className="aux-wide">
                  Datos de los pasajeros
                  <textarea
                    required
                    rows={8}
                    maxLength={6000}
                    value={data.passengers}
                    onChange={(e) => update("passengers", e.target.value)}
                    placeholder="Nombre completo · Documento · Fecha de nacimiento. Un pasajero por línea."
                  />
                </label>
                {passengerText && (
                  <button
                    className="aux-wide"
                    type="button"
                    onClick={() => update("passengers", passengerText)}
                  >
                    <Copy size={16} /> Usar pasajeros transcritos
                  </button>
                )}
                <section className="aux-wide aux-voucher-images">
                  <label>
                    Imagen del vuelo o itinerario
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                      onChange={(e) => attach(e.currentTarget)}
                    />
                  </label>
                  <p className="aux-muted">
                    Al menos 1 imagen · hasta 3 JPG o PNG de 5 MB cada una. Se
                    imprimen completas, sin recortar.
                  </p>
                  <div className="aux-voucher-image-grid">
                    {data.images?.map((image) => (
                      <figure key={image.id}>
                        <img
                          alt={"Itinerario: " + image.name}
                          src={imageUrl(image.id)}
                        />
                        <figcaption>{image.name}</figcaption>
                        <button
                          type="button"
                          onClick={() =>
                            update(
                              "images",
                              data.images?.filter((i) => i.id !== image.id),
                            )
                          }
                        >
                          Quitar imagen
                        </button>
                      </figure>
                    ))}
                    {files.map((file, i) => (
                      <figure key={i}>
                        <img
                          alt={"Vista previa: " + file.name}
                          src={previews[i]}
                        />
                        <figcaption>{file.name} · sin guardar</figcaption>
                        <button
                          type="button"
                          onClick={() => {
                            setFiles((current) =>
                              current.filter((_, index) => index !== i),
                            );
                            update("confirmed", false);
                          }}
                        >
                          Quitar imagen
                        </button>
                      </figure>
                    ))}
                  </div>
                </section>
                <label className="aux-check aux-wide">
                  <input
                    required
                    type="checkbox"
                    checked={data.confirmed}
                    onChange={(e) => update("confirmed", e.target.checked)}
                  />{" "}
                  Revisé la aerolínea, el código de reserva, los pasajeros y la
                  imagen del vuelo.
                </label>
                <button type="submit" className="aux-primary aux-wide">
                  <Save size={17} />
                  {busy
                    ? "Guardando…"
                    : saved
                      ? "Guardar cambios"
                      : "Guardar y preparar PDF"}
                </button>
              </fieldset>
            </form>
            {saved && (
              <div className="aux-download">
                <span>
                  Reserva {saved.data.reservationCode} ·{" "}
                  {dirty ? "Cambios sin guardar" : "Versión " + saved.revision}
                </span>
                {!dirty ? (
                  <a
                    className="aux-download-button"
                    href={
                      "/api/auxiliary-operational/flights/" + saved.id + "/pdf"
                    }
                  >
                    <Download size={17} /> Descargar itinerario en PDF
                  </a>
                ) : (
                  <p>
                    Guarda los cambios para descargar el documento actualizado.
                  </p>
                )}
              </div>
            )}
          </section>
          <aside className="aux-card aux-flight-preview">
            <div className="aux-flight-letterhead">
              <img
                src="/avioa-logo-original.png"
                alt="aVioa Agencia de Viajes"
                width={500}
                height={260}
              />
              <span>DOCUMENTOS DE VIAJE</span>
            </div>
            <h2 className="aux-flight-title">Itinerario de vuelos</h2>
            <dl className="aux-flight-summary">
              <div>
                <dt>Aerolínea</dt>
                <dd>{data.airline || "Por completar"}</dd>
              </div>
              <div>
                <dt>Código de reserva</dt>
                <dd>{data.reservationCode || "Por completar"}</dd>
              </div>
            </dl>
            <h3>Pasajeros</h3>
            <div className="aux-flight-passengers">
              {data.passengers || "Aquí aparecerán los datos de los pasajeros."}
            </div>
            <h3>Itinerario de vuelos</h3>
            {data.images?.map((image) => (
              <img
                className="aux-flight-image"
                key={image.id}
                alt={image.name}
                src={imageUrl(image.id)}
              />
            ))}
            {previews.map((url, i) => (
              <img
                className="aux-flight-image"
                key={url}
                src={url}
                alt={"Imagen del itinerario " + (i + 1)}
              />
            ))}
            {!data.images?.length && !files.length && (
              <p className="aux-muted">
                La imagen que adjuntes aparecerá aquí.
              </p>
            )}
            <footer>
              INVERSIONES AVIOA S. A. S.
              <br />
              NIT 900971740-2 · RNT 95300
            </footer>
          </aside>
        </div>
      )}
      {view === "history" && (
        <section className="aux-card">
          <h2>Itinerarios guardados</h2>
          <label>
            Buscar por código de reserva
            <input
              type="search"
              value={query}
              maxLength={200}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <div className="aux-table">
            <table>
              <thead>
                <tr>
                  <th>Reserva</th>
                  <th>Creado por</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.data.reservationCode}</strong>
                      <small>
                        {row.data.airline || "Aerolínea sin registrar"}
                      </small>
                      <small>
                        {row.data.images?.length || 0} imágenes · versión{" "}
                        {row.revision}
                      </small>
                    </td>
                    <td>
                      {row.createdBy}
                      <small>
                        {new Date(row.updatedAt).toLocaleString("es-CO", {
                          timeZone: "America/Bogota",
                        })}
                      </small>
                    </td>
                    <td>
                      <div className="aux-actions">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => open(row)}
                        >
                          {canEdit ? "Abrir / editar" : "Consultar"}
                        </button>
                        <a
                          href={
                            "/api/auxiliary-operational/flights/" +
                            row.id +
                            "/pdf"
                          }
                        >
                          <Download size={15} /> PDF
                        </a>
                        {canEdit && (
                          <button
                            type="button"
                            disabled={busy}
                            className="aux-delete"
                            onClick={() => void remove(row)}
                          >
                            <Trash2 size={15} /> Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <p>No hay itinerarios para esta búsqueda.</p>}
          <div className="aux-actions">
            <button
              disabled={busy || page <= 1}
              onClick={() => setPage((n) => n - 1)}
            >
              Anterior
            </button>
            <small>
              {page} / {pages}
            </small>
            <button
              disabled={busy || page >= pages}
              onClick={() => setPage((n) => n + 1)}
            >
              Siguiente
            </button>
            <button
              disabled={busy}
              onClick={() => void load().catch((e) => setError(e.message))}
            >
              Actualizar
            </button>
          </div>
        </section>
      )}
    </>
  );
}
