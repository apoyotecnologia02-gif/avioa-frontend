"use client";
import { auxiliaryFetch } from "@/lib/auxiliary-operational/client";
import { useEffect, useState, type FormEvent } from "react";
import {
  Bus,
  Mail,
  Send,
  Plus,
  CheckCircle,
  Copy,
  Trash2,
  Pencil,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import {
  newTransferRequest,
  transferLabels,
  transferOperators,
  operatorFor,
  transferMessage,
  transferSubject,
  transferWhatsApp,
  transferStateLabels,
  type TransferRequestData,
  type TransferRequestRecord,
} from "@/lib/auxiliary-operational/domain/transfer-requests";
import TransferRequestToursEditor from "./transfer-request-tours-editor";
import { api } from "@/lib/axios";
const groups = [
  {
    title: "Reserva y pasajeros",
    keys: [
      "advisor",
      "reservationCode",
      "holder",
      "phone",
      "adults",
      "infants",
    ],
  },
  { title: "Destino y servicio", keys: ["hotel", "tours", "tourNotes"] },
  {
    title: "Vuelo de llegada",
    keys: ["arrivalAirline", "arrivalFlight", "arrivalDate", "arrivalTime"],
  },
  {
    title: "Vuelo de regreso",
    keys: ["returnAirline", "returnFlight", "returnDate", "returnTime"],
  },
];
const onVacationForm =
  "https://forms.cloud.microsoft/pages/responsepage.aspx?id=4psVSYo5Z0WsG0I4Zw5h6oGhzQ9Wi2BJhS1lXyOtlvRUN05NQ0xaNTVJTTAyMzcyMTI4VzJGOVJaNS4u&route=shorturl";
const original =
  "https://docs.google.com/forms/d/e/1FAIpQLScOwyfsKHQC8NBC0Ou-B_ULi1gyUhT2l0wbZ_C8QXBdv6dd4A/viewform";
export default function TransferRequestPanel({
  canEdit,
}: {
  canEdit: boolean;
}) {
  const [data, setData] = useState(newTransferRequest),
    [records, setRecords] = useState<TransferRequestRecord[]>([]),
    [active, setActive] = useState<TransferRequestRecord | null>(null),
    [requestId, setRequestId] = useState(""),
    [emailConfigured, setEmailConfigured] = useState(false),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [query, setQuery] = useState(""),
    [editingTours, setEditingTours] = useState<TransferRequestRecord | null>(
      null,
    ),
    [repliesFor, setRepliesFor] = useState<TransferRequestRecord | null>(null);
  async function load() {
    try {
      const r = await auxiliaryFetch(
          "/api/auxiliary-operational/transfer-requests",
          { cache: "no-store" },
        ),
        v = (await r.json()) as {
          records: TransferRequestRecord[];
          emailConfigured: boolean;
          error?: string;
        };
      if (!r.ok) throw Error(v.error);
      setRecords(v.records);
      setEmailConfigured(v.emailConfigured);
      setActive((prev) =>
        prev
          ? v.records.find((x: TransferRequestRecord) => x.id === prev.id) ||
            prev
          : null,
      );
      setLoaded(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    setRequestId(crypto.randomUUID());
    void load();
  }, []);
  const op = data.destination
    ? transferOperators[data.destination as keyof typeof transferOperators]
    : null;
  async function action(payload: unknown) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await auxiliaryFetch(
          "/api/auxiliary-operational/transfer-requests",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        ),
        v = (await r.json()) as {
          record?: TransferRequestRecord;
          error?: string;
        };
      if (!r.ok) throw Error(v.error);
      if (v.record) setActive(v.record);
      await load();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (data.destination === "On Vacation") return;
    if (await action({ action: "save", requestId, data }))
      setNotice(
        "Solicitud y voucher preparados. Descarga el PDF y elige cómo enviar la solicitud al operador.",
      );
  }
  async function saveTours(tours: string, tourNotes: string) {
    if (busy || !editingTours) return;
    if (
      await action({
        action: "updateTours",
        id: editingTours.id,
        editVersion: editingTours.editVersion,
        tours,
        tourNotes,
      })
    ) {
      setEditingTours(null);
      setNotice(
        "Tours actualizados en la solicitud y el voucher. Vuelve a descargar el PDF." +
          (editingTours.state !== "pending"
            ? " Comunica la corrección al operador."
            : ""),
      );
    }
  }
  function editTours(record: TransferRequestRecord) {
    if (!canEdit || busy || record.state === "sending" || !record.voucherId)
      return;
    if (
      !active &&
      data.holder &&
      !window.confirm("¿Dejar los datos sin guardar y editar esta solicitud?")
    )
      return;
    setActive(record);
    setEditingTours(record);
    setError("");
    setNotice("");
  }
  function fresh() {
    if (
      !active &&
      Object.values(data).some(
        (v, i) => v !== Object.values(newTransferRequest())[i],
      ) &&
      !window.confirm(
        "¿Descartar los datos sin guardar e iniciar otra solicitud?",
      )
    )
      return;
    setActive(null);
    setData(newTransferRequest());
    setRequestId(crypto.randomUUID());
    setError("");
    setNotice("");
  }
  async function remove(record: TransferRequestRecord) {
    if (!canEdit || busy) return;
    if (
      !window.confirm(
        `¿Eliminar la solicitud ${record.data.reservationCode} de ${record.data.holder}? Se quitará de la lista. El voucher guardado se conserva y esto no cancela el servicio con el operador.`,
      )
    )
      return;
    if (await action({ action: "delete", id: record.id, confirmed: true })) {
      setRecords((previous) =>
        previous.filter((item) => item.id !== record.id),
      );
      setActive((previous) => (previous?.id === record.id ? null : previous));
      if (active?.id === record.id) {
        setData(newTransferRequest());
        setRequestId(crypto.randomUUID());
      }
      setNotice(
        record.voucherId
          ? "Solicitud eliminada. El voucher se conserva en Voucher de traslados → Traslados guardados."
          : "Solicitud eliminada.",
      );
    }
  }
  const visible = records.filter((r) =>
    [r.data.reservationCode, r.data.holder, r.data.destination]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <section className="aux-card aux-transfer-request tr-native">
      <div className="aux-request-heading">
        <div className="aux-request-icon">
          <Bus size={30} />
        </div>
        <div>
          <span className="aux-request-eyebrow">AVIOA · OPERACIÓN</span>
          <h2>Solicitud de traslados</h2>
          <p>
            Completa los datos una vez: prepara la solicitud y su voucher de
            traslados.
          </p>
        </div>
        {canEdit && !editingTours && (
          <button type="button" onClick={fresh} disabled={busy}>
            <Plus size={16} /> Nueva solicitud
          </button>
        )}
      </div>
      <div className="tr-workspace">
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
        {!loaded ? (
          <p role="status">Cargando solicitudes…</p>
        ) : (
          <>
            {!emailConfigured && (
              <div className="tr-connection">
                <Mail size={22} />
                <div>
                  <strong>Correo automático pendiente de conexión</strong>
                  <p>
                    Puedes guardar la solicitud y abrir el correo preparado para
                    enviarlo desde reservas@avioa.co. Para Palomino, abre
                    WhatsApp y pulsa Enviar allí.
                  </p>
                  <a href={original} target="_blank" rel="noopener noreferrer">
                    Usar formulario anterior con su automatización ↗
                  </a>
                </div>
              </div>
            )}
            {!active && canEdit && (
              <form onSubmit={save}>
                <fieldset disabled={busy} className="tr-fieldset">
                  <label className="tr-destination-choice">
                    Destino u operador
                    <select
                      required
                      value={data.destination}
                      onChange={(e) => {
                        const destination = e.target.value;
                        setData({ ...data, destination });
                        if (destination === "On Vacation")
                          window.open(
                            onVacationForm,
                            "_blank",
                            "noopener,noreferrer",
                          );
                      }}
                    >
                      <option value="">Selecciona</option>
                      {Object.keys(transferOperators).map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                      <option value="On Vacation">
                        On Vacation · Formulario del operador
                      </option>
                    </select>
                  </label>
                  {data.destination === "On Vacation" ? (
                    <div className="tr-external-operator">
                      <Bus size={30} />
                      <h3>Traslados On Vacation</h3>
                      <p>
                        Completa la solicitud directamente en el formulario de
                        On Vacation. El operador recibe los datos y gestiona el
                        servicio por su proceso habitual.
                      </p>
                      <a
                        className="tr-external-link"
                        href={onVacationForm}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir formulario de On Vacation ↗
                      </a>
                      <p className="aux-muted">
                        Se abre en otra pestaña. Esta solicitud no se guarda ni
                        se envía desde el portal.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="tr-sections">
                        {groups.map((g, index) => (
                          <section className="tr-group" key={g.title}>
                            <h3>
                              <span>{index + 1}</span>
                              {g.title}
                            </h3>
                            <div className="tr-fields">
                              {g.keys.map((key) => {
                                const k = key as keyof TransferRequestData,
                                  required =
                                    k !== "tourNotes" || data.tours === "SI";
                                const choices =
                                  k === "destination"
                                    ? Object.keys(transferOperators)
                                    : k === "tours"
                                      ? ["SI", "NO"]
                                      : k.endsWith("Airline")
                                        ? [
                                            "Avianca",
                                            "Latam",
                                            "Wingo",
                                            "JetSmart",
                                            "Otra",
                                          ]
                                        : null;
                                const type = k.endsWith("Date")
                                  ? "date"
                                  : k.endsWith("Time")
                                    ? "time"
                                    : ["adults", "infants"].includes(k)
                                      ? "number"
                                      : k === "phone"
                                        ? "tel"
                                        : "text";
                                return (
                                  <label
                                    key={k}
                                    className={
                                      k === "tourNotes" ? "tr-wide" : ""
                                    }
                                  >
                                    {transferLabels[k]}
                                    {required ? " *" : ""}
                                    {choices ? (
                                      <select
                                        required
                                        value={data[k]}
                                        onChange={(e) =>
                                          setData({
                                            ...data,
                                            [k]: e.target.value,
                                          })
                                        }
                                      >
                                        <option value="">Selecciona</option>
                                        {choices.map((v) => (
                                          <option key={v}>{v}</option>
                                        ))}
                                      </select>
                                    ) : k === "tourNotes" ? (
                                      <textarea
                                        required={required}
                                        placeholder="Ej.: Playa Blanca con almuerzo"
                                        rows={3}
                                        maxLength={1200}
                                        value={data[k]}
                                        onChange={(e) =>
                                          setData({
                                            ...data,
                                            [k]: e.target.value,
                                          })
                                        }
                                      />
                                    ) : (
                                      <input
                                        required={required}
                                        type={type}
                                        min={
                                          k === "adults"
                                            ? 1
                                            : k === "infants"
                                              ? 0
                                              : k === "returnDate"
                                                ? data.arrivalDate || undefined
                                                : undefined
                                        }
                                        max={
                                          k === "adults"
                                            ? 500
                                            : k === "infants"
                                              ? 100
                                              : undefined
                                        }
                                        step={type === "number" ? 1 : undefined}
                                        maxLength={180}
                                        value={data[k]}
                                        onChange={(e) =>
                                          setData({
                                            ...data,
                                            [k]: e.target.value,
                                          })
                                        }
                                      />
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          </section>
                        ))}
                      </div>
                      <div className="tr-recipient">
                        <strong>
                          {op ? op.name : "Selecciona un destino"}
                        </strong>
                        <span>
                          {op?.whatsapp
                            ? "WhatsApp · +57 323 576 0342"
                            : op?.emails.length
                              ? op.emails.join(" · ")
                              : op
                                ? "Falta definir destinatario para este destino."
                                : ""}
                        </span>
                      </div>
                      <div className="tr-save">
                        <p>
                          Revisa fechas y horarios. Guardar prepara también el
                          voucher; todavía no envía la solicitud al operador.
                        </p>
                        <button
                          className="aux-primary"
                          disabled={!requestId || busy}
                        >
                          <Send size={16} />
                          {busy ? "Guardando…" : "Guardar solicitud y voucher"}
                        </button>
                      </div>
                    </>
                  )}
                </fieldset>
              </form>
            )}
            {editingTours && canEdit && (
              <TransferRequestToursEditor
                key={editingTours.id}
                record={editingTours}
                busy={busy}
                onCancel={() => setEditingTours(null)}
                onSave={saveTours}
              />
            )}
            {active && !editingTours && (
              <div className="tr-review">
                <div className="aux-section-head">
                  <h3>
                    Solicitud {active.data.reservationCode} ·{" "}
                    {operatorFor(active.data).name}
                  </h3>
                  <span className="tr-status">
                    {transferStateLabels[active.state] || active.state}
                  </span>
                </div>
                <p className="aux-muted">
                  Creada por {active.createdBy} ·{" "}
                  {new Date(active.createdAt).toLocaleString("es-CO", {
                    timeZone: "America/Bogota",
                  })}
                </p>
                <pre>{transferMessage(active.data)}</pre>
                <div className="aux-download">
                  {active.voucherId ? (
                    <>
                      <a
                        className="aux-download-button"
                        href={
                          "/api/auxiliary-operational/transfers/" +
                          active.voucherId +
                          "/pdf"
                        }
                      >
                        Descargar voucher de traslados en PDF
                      </a>
                      <p>
                        También está en Voucher de traslados → Traslados
                        guardados, donde puedes editarlo y adjuntar imágenes. El
                        PDF no implica confirmación del operador.
                      </p>
                    </>
                  ) : (
                    canEdit && (
                      <button
                        disabled={busy}
                        onClick={async () => {
                          if (
                            await action({ action: "voucher", id: active.id })
                          )
                            setNotice(
                              "Voucher preparado con los datos de esta solicitud.",
                            );
                        }}
                      >
                        Preparar voucher con estos datos
                      </button>
                    )
                  )}
                </div>
                {canEdit && (
                  <div className="tr-actions">
                    <button
                      type="button"
                      disabled={
                        busy || active.state === "sending" || !active.voucherId
                      }
                      onClick={() => editTours(active)}
                    >
                      <Pencil size={16} /> Editar tours
                    </button>
                    {active.state === "pending" && (
                      <>
                        {operatorFor(active.data).whatsapp ? (
                          <a
                            className="tr-whatsapp"
                            href={transferWhatsApp(active.data)!}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Abrir WhatsApp de Naio ↗
                          </a>
                        ) : operatorFor(active.data).emails.length > 0 ? (
                          emailConfigured ? (
                            <button
                              className="aux-primary"
                              disabled={busy}
                              onClick={async () => {
                                if (
                                  await action({
                                    action: "send",
                                    id: active.id,
                                  })
                                )
                                  setNotice(
                                    "El servicio de correo aceptó el envío. Falta la confirmación del operador.",
                                  );
                              }}
                            >
                              Enviar correo al operador
                            </button>
                          ) : (
                            <a
                              className="tr-email"
                              href={
                                "mailto:" +
                                operatorFor(active.data).emails.join(",") +
                                "?subject=" +
                                encodeURIComponent(
                                  transferSubject(active.data),
                                ) +
                                "&body=" +
                                encodeURIComponent(transferMessage(active.data))
                              }
                            >
                              Abrir correo preparado ↗
                            </a>
                          )
                        ) : (
                          <p>
                            Falta definir el operador y su canal para este
                            destino.
                          </p>
                        )}
                        <button
                          disabled={
                            busy ||
                            (!operatorFor(active.data).emails.length &&
                              !operatorFor(active.data).whatsapp)
                          }
                          onClick={() => {
                            if (
                              window.confirm(
                                "¿Ya enviaste esta solicitud por correo o WhatsApp? Este botón solo registra tu confirmación de envío.",
                              )
                            )
                              void action({
                                action: "manual",
                                id: active.id,
                                confirmed: true,
                              });
                          }}
                        >
                          Ya lo envié manualmente
                        </button>
                      </>
                    )}
                    {["sent", "manual", "correction"].includes(
                      active.state,
                    ) && (
                      <button
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              "¿El operador confirmó el servicio por correo o WhatsApp?",
                            )
                          )
                            void action({
                              action: "confirm",
                              id: active.id,
                              confirmed: true,
                            });
                        }}
                      >
                        <CheckCircle size={16} /> Registrar confirmación del
                        operador
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            transferSubject(active.data) +
                              "\n\n" +
                              transferMessage(active.data),
                          );
                          setNotice("Mensaje copiado.");
                        } catch {
                          setError(
                            "No se pudo copiar. Selecciona el texto del resumen.",
                          );
                        }
                      }}
                    >
                      <Copy size={16} /> Copiar mensaje
                    </button>
                    <button
                      type="button"
                      className="aux-delete tr-delete"
                      disabled={busy || active.state === "sending"}
                      onClick={() => void remove(active)}
                    >
                      <Trash2 size={16} /> Eliminar solicitud
                    </button>
                  </div>
                )}
                <p className="aux-muted">
                  Las respuestas llegan al correo o WhatsApp utilizado. Su
                  lectura no se sincroniza automáticamente con este tablero.
                  Abrir un mensaje no significa que se haya enviado. El PDF
                  queda disponible para descargar; si deseas enviarlo como
                  adjunto, añádelo al correo o WhatsApp.
                </p>
              </div>
            )}
            {!editingTours && (
              <section className="tr-history">
                <div className="aux-section-head">
                  <h3>Solicitudes guardadas</h3>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void load()}
                  >
                    Actualizar
                  </button>
                </div>
                <label>
                  Buscar reserva, pasajero o destino
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <div className="aux-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Reserva / pasajero</th>
                        <th>Destino</th>
                        <th>Llegada</th>
                        <th>Estado</th>
                        <th>Respuestas</th>
                        <th>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((r) => (
                        <tr key={r.id}>
                          <td>
                            {r.data.reservationCode}
                            <small>{r.data.holder}</small>
                          </td>
                          <td>
                            {r.data.destination}
                            <small>{operatorFor(r.data).name}</small>
                          </td>
                          <td>
                            {r.data.arrivalDate.split("-").reverse().join("/")}
                            <small>{r.data.arrivalTime}</small>
                          </td>
                          <td>{transferStateLabels[r.state] || r.state}</td>
                          <td>
                            {r.voucherId ? (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={busy}
                                onClick={() => setRepliesFor(r)}
                                title="Ver respuestas del operador"
                              >
                                <MessageSquare size={15} />
                              </button>
                            ) : (
                              <small className="text-gray-400">-</small>
                            )}
                          </td>
                          <td>
                            <button
                              disabled={busy}
                              onClick={() => {
                                if (
                                  !active &&
                                  data.holder &&
                                  !window.confirm(
                                    "¿Dejar los datos sin guardar y abrir esta solicitud?",
                                  )
                                )
                                  return;
                                setActive(r);
                                setError("");
                                setNotice("");
                              }}
                            >
                              Ver solicitud
                            </button>
                            {r.voucherId && (
                              <a
                                href={
                                  "/api/auxiliary-operational/transfers/" +
                                  r.voucherId +
                                  "/pdf"
                                }
                              >
                                Descargar voucher
                              </a>
                            )}
                            {canEdit && (
                              <button
                                type="button"
                                disabled={
                                  busy || r.state === "sending" || !r.voucherId
                                }
                                aria-label={
                                  "Editar tours de la solicitud " +
                                  r.data.reservationCode
                                }
                                onClick={() => editTours(r)}
                              >
                                <Pencil size={15} /> Editar tours
                              </button>
                            )}
                            {canEdit && (
                              <button
                                type="button"
                                className="aux-delete tr-delete"
                                disabled={busy || r.state === "sending"}
                                aria-label={
                                  "Eliminar solicitud " +
                                  r.data.reservationCode +
                                  " de " +
                                  r.data.holder
                                }
                                onClick={() => void remove(r)}
                              >
                                <Trash2 size={15} /> Eliminar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!visible.length && (
                  <p className="aux-muted">
                    No hay solicitudes para esta búsqueda.
                  </p>
                )}
                <small>
                  Últimas 100 solicitudes. Los registros anteriores se
                  conservan.
                </small>
              </section>
            )}
            {repliesFor && repliesFor.voucherId && (
              <TransferRepliesPanel
                voucherId={repliesFor.voucherId}
                reservationCode={repliesFor.data.reservationCode}
                holder={repliesFor.data.holder}
                onClose={() => setRepliesFor(null)}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}

function TransferRepliesPanel({
  voucherId,
  reservationCode,
  holder,
  onClose,
}: {
  voucherId: string;
  reservationCode: string;
  holder: string;
  onClose: () => void;
}) {
  console.log(voucherId);
  type Reply = { id: string; from: string; body: string; receivedAt: string };
  const [replies, setReplies] = useState<Reply[]>([]);
  const [raw, setRaw] = useState<Record<string, string | "loading">>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const r = await api.get(`/auxiliary-operational/${voucherId}/replies`);
        const v = (await r.data) as { replies?: Reply[]; error?: string };
        // if (!r.ok) throw Error(v.error);
        if (!cancelled) setReplies(v.replies ?? []);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [voucherId]);

  async function loadRaw(replyId: string) {
    setRaw((p) => ({ ...p, [replyId]: "loading" }));
    try {
      const r = await api.get(
        `/auxiliary-operational/${voucherId}/replies/${replyId}/raw`,
      );
      const v = (await r.data) as { rawBody?: string; error?: string };
      //   if (!r.ok) throw Error(v.error);
      setRaw((p) => ({ ...p, [replyId]: v.rawBody ?? "" }));
    } catch (e) {
      setRaw((p) => ({ ...p, [replyId]: "" }));
      setError((e as Error).message);
    }
  }

  function trimQuoted(text: string): string {
    if (!text) return "";

    const patterns = [
      /\n\s*(?:>\s*)?El\s[\s\S]{0,400}?(?:escribió|escribio):\s*\n/i,
      /\n\s*(?:>\s*)?On\s[\s\S]{0,400}?wrote:\s*\n/i,
      /\n-{2,}\s*Mensaje original\s*-{2,}/i,
      /\n-{2,}\s*Original Message\s*-{2,}/i,
    ];

    for (const p of patterns) {
      const m = text.match(p);
      if (m && m.index !== undefined) return text.slice(0, m.index).trim();
    }

    return text.trim();
  }

  const MAX_PREVIEW = 320;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Respuestas de la reserva ${reservationCode}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5"
      >
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <MessageSquare size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900 leading-tight truncate">
                Conversación · {reservationCode}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {holder}
                {!loading && (
                  <>
                    {" · "}
                    {replies.length}{" "}
                    {replies.length === 1 ? "respuesta" : "respuestas"}
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex-shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
              <span className="text-sm">Cargando respuestas…</span>
            </div>
          ) : replies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
                <Mail size={22} />
              </div>
              <p className="text-sm font-medium text-slate-700">
                Aún no hay respuestas
              </p>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Cuando el operador responda al correo, la respuesta aparecerá
                aquí.
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {replies.map((r) => {
                const displayName = getDisplayName(r.from);
                const email = extractEmail(r.from);
                const initials = getInitials(r.from);
                const isOwn = email.toLowerCase().includes("@avioa.co");
                const cleanBody = trimQuoted(r.body);
                const isEmpty = !cleanBody || cleanBody.length < 3;
                const isLong = cleanBody.length > MAX_PREVIEW;
                const isExpanded = !!expanded[r.id];
                const shown =
                  isLong && !isExpanded
                    ? cleanBody.slice(0, MAX_PREVIEW).trimEnd() + "…"
                    : cleanBody;
                const value = raw[r.id];

                return (
                  <li key={r.id} className="flex gap-3">
                    <div
                      className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-white shadow-sm ${
                        isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                      aria-hidden
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {displayName}
                          </span>
                          {isOwn && (
                            <span className="flex-shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                              Tú
                            </span>
                          )}
                        </div>
                        <span
                          className="flex-shrink-0 text-[11px] text-slate-500"
                          title={new Date(r.receivedAt).toLocaleString("es-CO")}
                        >
                          {formatReplyDate(r.receivedAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2 truncate">
                        {email}
                      </p>

                      <div className="rounded-xl rounded-tl-sm bg-slate-50 border border-slate-100 px-4 py-3 text-[14px] leading-relaxed text-slate-800">
                        {isEmpty ? (
                          <em className="text-slate-400">
                            (Sin contenido reconocido. Abre el correo original
                            abajo.)
                          </em>
                        ) : (
                          <p className="whitespace-pre-wrap break-words m-0">
                            {shown}
                          </p>
                        )}
                        {isLong && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpanded((p) => ({
                                ...p,
                                [r.id]: !p[r.id],
                              }))
                            }
                            className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            {isExpanded ? "Mostrar menos" : "Mostrar más"}
                          </button>
                        )}
                      </div>

                      <div className="mt-2">
                        {value === undefined && (
                          <button
                            type="button"
                            onClick={() => void loadRaw(r.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            <ChevronDown size={12} /> Ver correo original
                          </button>
                        )}
                        {value === "loading" && (
                          <small className="text-[11px] text-slate-400">
                            Cargando original…
                          </small>
                        )}
                        {typeof value === "string" && value !== "loading" && (
                          <details
                            open
                            className="group mt-2"
                            onToggle={(e) =>
                              setRaw((p) => ({
                                ...p,
                                [`${r.id}__open`]: (
                                  e.target as HTMLDetailsElement
                                ).open
                                  ? "1"
                                  : "",
                              }))
                            }
                          >
                            <summary className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 list-none">
                              {raw[`${r.id}__open`] === "" ? (
                                <>
                                  <ChevronDown size={12} /> Ver correo original
                                </>
                              ) : (
                                <>
                                  <ChevronUp size={12} /> Ocultar original
                                </>
                              )}
                            </summary>
                            <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-relaxed font-mono text-slate-100">
                              {value || "(sin contenido)"}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-slate-100 bg-slate-50/60">
          <p className="text-[11px] text-slate-500">
            Actualiza bajo demanda. Cierra y vuelve a abrir para refrescar.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function extractEmail(from: string): string {
  const m = from.match(/<([^>\s]+@[^>\s]+)>/);
  return (m ? m[1] : from).replace(/"/g, "").trim();
}

function getDisplayName(from: string): string {
  const m = from.match(/^\s*"?([^"<]+?)"?\s*</);
  if (m) return m[1].trim();
  return extractEmail(from);
}

function getInitials(from: string): string {
  const name = getDisplayName(from);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (extractEmail(from)[0] || "?").toUpperCase();
}

function formatReplyDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();

  const sameDay =
    d.toLocaleDateString("es-CO", { timeZone: "America/Bogota" }) ===
    now.toLocaleDateString("es-CO", { timeZone: "America/Bogota" });

  return sameDay
    ? d.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Bogota",
      })
    : d.toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Bogota",
      });
}
