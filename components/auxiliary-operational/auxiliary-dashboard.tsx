"use client";
import {
  auxiliaryFetch,
  isRequestCanceled,
} from "@/lib/auxiliary-operational/client";

import { useRefreshableEffect } from "@/hooks/useAuxiliaryOperational";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Files,
  Upload,
  ScanText,
  Copy,
  Search,
  Download,
  Hotel,
  ArrowLeft,
  Save,
  History,
  Plus,
  Trash2,
  KeyRound,
  Bus,
  Plane,
} from "lucide-react";
import EmailWriterLauncher from "@/components/auxiliary-operational/email-writer-launcher";
import BrandLogo from "@/components/auxiliary-operational/brand-logo";
import type { AuxDocument } from "@/lib/auxiliary-operational/domain/auxiliary-data";
import {
  emptyHotelVoucher,
  voucherLabels,
  voucherTemplates,
  newHotelVoucher,
  applyHotelDefaults,
  isHotelTemplate,
  voucherFormLabels,
  hotelTemplateForName,
  type HotelVoucher,
  type SavedHotelVoucher,
} from "@/lib/auxiliary-operational/domain/aux-voucher";
import {
  passengersEmailText,
  documentPassengers,
} from "@/lib/auxiliary-operational/domain/auxiliary-text";
import AuxiliaryPasswords from "./password-panel";
import TransferPanel from "./transfer-panel";
import TransferRequestPanel from "./transfer-request-panel";
import FlightPanel from "./flight-panel";
import QuickReplies from "./quick-replies";
import PassengerNameCheck from "./passenger-name-check";
import { passportAlert } from "@/lib/auxiliary-operational/domain/passport-validity";
import { auxiliaryTailwindStyles } from "./auxiliary-tailwind";
type Meta = {
  permissions: { edit: boolean; name: string };
  aiEnabled: boolean;
  model: string;
};
type HotelResult = {
  id: string;
  reservationCode: string;
  operatorReference: string;
  operator: string;
  hotelName: string;
  checkIn: string;
  contactName: string;
  updatedAt: string;
};
const when = (s: string) =>
  new Date(s).toLocaleString("es-CO", { timeZone: "America/Bogota" });
async function read<T>(url: string, init?: RequestInit) {
  const r = await auxiliaryFetch(url, { cache: "no-store", ...init }),
    d = (await r.json()) as T & { error?: string };
  if (!r.ok) throw Error(d.error || "No se pudo completar la solicitud.");
  return d;
}
const post = <T,>(url: string, body: unknown) =>
  read<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
export default function AuxiliaryDashboard({
  canAdminBlocks = false,
  documentsOnly = false,
}: {
  canAdminBlocks?: boolean;
  documentsOnly?: boolean;
}) {
  const [tab, setTab] = useState<
      | "documents"
      | "voucher"
      | "history"
      | "passwords"
      | "transfers"
      | "quick"
      | "flights"
      | "transferRequests"
    >("documents"),
    [meta, setMeta] = useState<Meta | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(""),
    [files, setFiles] = useState<File[]>([]),
    [emailText, setEmailText] = useState("");
  const [voucher, setVoucher] = useState<HotelVoucher>(() => newHotelVoucher()),
    [savedVoucher, setSavedVoucher] = useState<SavedHotelVoucher | null>(null),
    [vouchers, setVouchers] = useState<SavedHotelVoucher[]>([]),
    [voucherQuery, setVoucherQuery] = useState(""),
    [avi, setAvi] = useState(""),
    [hotels, setHotels] = useState<HotelResult[]>([]);
  const [transferRequestOpened, setTransferRequestOpened] = useState(false);
  const [readDocuments, setReadDocuments] = useState<AuxDocument[]>([]);
  const [uploadProgress, setUploadProgress] = useState(""),
    [documents, setDocuments] = useState<AuxDocument[]>([]),
    [docPage, setDocPage] = useState(1),
    [docPages, setDocPages] = useState(1),
    [docTotal, setDocTotal] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null),
    uploadIds = useRef<string[]>([]),
    mounted = useRef(true);
  const canEdit = !!meta?.permissions.edit;
  useRefreshableEffect(() => {
    mounted.current = true;
    const c = new AbortController();
    read<Meta>("/api/auxiliary-operational", { signal: c.signal })
      .then(setMeta)
      .catch((e) => {
        if (!isRequestCanceled(e)) setError(e.message);
      });
    return () => {
      mounted.current = false;
      c.abort();
    };
  }, []);
  const loadDocs = useCallback(
    async (signal?: AbortSignal) => {
      const d = await read<{
        documents: AuxDocument[];
        pages: number;
        total: number;
      }>("/api/auxiliary-operational/documents?page=" + docPage, { signal });
      setDocuments(d.documents);
      setDocPages(d.pages);
      setDocTotal(d.total);
      if (docPage > d.pages) setDocPage(d.pages);
    },
    [docPage],
  );
  useRefreshableEffect(() => {
    const c = new AbortController();
    void loadDocs(c.signal).catch((e) => {
      if (!isRequestCanceled(e)) setError(e.message);
    });
    return () => c.abort();
  }, [loadDocs]);
  async function removeDocument(doc: AuxDocument) {
    if (
      busy ||
      !canEdit ||
      !window.confirm(
        "¿Eliminar las fotos y los datos guardados de este documento? El texto que ya transcribiste en la caja se conserva.",
      )
    )
      return;
    setBusy("delete-document");
    setError("");
    setNotice("");
    try {
      await read("/api/auxiliary-operational/documents/" + doc.id, {
        method: "DELETE",
      });
      uploadIds.current = [];
      setFiles([]);
      if (fileInput.current) fileInput.current.value = "";
      await loadDocs();
      setNotice("Fotos y datos guardados eliminados. Espacio liberado.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function removeVoucher(v: SavedHotelVoucher) {
    if (
      busy ||
      !canEdit ||
      !window.confirm(
        "¿Eliminar el voucher " +
          (v.data.reservationCode || v.id.slice(0, 8)) +
          "? Ya no estará disponible para descargar.",
      )
    )
      return;
    setBusy("delete-voucher");
    setError("");
    setNotice("");
    try {
      await read("/api/auxiliary-operational/vouchers/" + v.id, {
        method: "DELETE",
      });
      if (savedVoucher?.id === v.id) {
        setSavedVoucher(null);
        setVoucher(newHotelVoucher());
        setHotels([]);
        setAvi("");
      }
      await loadVouchers();
      setNotice("Voucher eliminado.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  const loadVouchers = useCallback(
    async (signal?: AbortSignal) => {
      const d = await read<{ vouchers: SavedHotelVoucher[] }>(
        "/api/auxiliary-operational/vouchers?q=" +
          encodeURIComponent(voucherQuery),
        { signal },
      );
      setVouchers(d.vouchers);
    },
    [voucherQuery],
  );
  useRefreshableEffect(() => {
    if (documentsOnly) return;
    const c = new AbortController(),
      timer = setTimeout(
        () =>
          void loadVouchers(c.signal).catch((e) => {
            if (!isRequestCanceled(e)) setError(e.message);
          }),
        200,
      );
    return () => {
      c.abort();
      clearTimeout(timer);
    };
  }, [loadVouchers, documentsOnly]);
  async function upload(e: FormEvent) {
    e.preventDefault();
    if (!canEdit || busy || !files.length) return;
    if (!meta?.aiEnabled) {
      setError(
        "La transcripción de IA no está activa. Solicita a Gerencia activar la conexión.",
      );
      return;
    }
    if (
      files.length > 10 ||
      files.some((f) => f.size < 1 || f.size > 8 * 1024 * 1024)
    ) {
      setError("Selecciona hasta 10 archivos de hasta 8 MB cada uno.");
      return;
    }
    if (files.reduce((sum, f) => sum + f.size, 0) > 16 * 1024 * 1024) {
      setError(
        "Máximo 16 MB en total. Reduce el tamaño o selecciona menos archivos.",
      );
      return;
    }
    setBusy("upload");
    setError("");
    setNotice("");
    setUploadProgress("Guardando archivos…");
    try {
      if (!uploadIds.current[0]) uploadIds.current[0] = crypto.randomUUID();
      const form = new FormData();
      form.set("requestId", uploadIds.current[0]);
      form.set("kind", "idcard");
      form.set("reservationCode", "");
      files.forEach((file) => form.append("files", file));
      let { document } = await read<{ document: AuxDocument }>(
        "/api/auxiliary-operational/documents",
        { method: "POST", body: form },
      );
      if (document.state === "uploaded") {
        setUploadProgress("Leyendo y relacionando documentos…");
        document = (
          await post<{ document: AuxDocument }>(
            "/api/auxiliary-operational/documents/" + document.id + "/extract",
            { requestId: crypto.randomUUID() },
          )
        ).document;
      }
      const passengers = documentPassengers(document);
      setReadDocuments([document]);
      setEmailText(passengersEmailText(passengers.map((p) => p.fields)));
      const warnings = passengers.flatMap((p, i) =>
        p.warnings.map((w) => "Pasajero " + (i + 1) + ": " + w),
      );
      if (warnings.length) setError(warnings.join(" · "));
      uploadIds.current = [];
      setFiles([]);
      if (fileInput.current) fileInput.current.value = "";
      setNotice(
        "Lectura completada: " +
          passengers.length +
          " pasajero(s) en " +
          document.attachments.length +
          " archivo(s). Revisa los datos y la agrupación antes de copiar.",
      );
      await loadDocs();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (mounted.current) {
        setBusy("");
        setUploadProgress("");
      }
    }
  }
  async function copyPassengers() {
    try {
      await navigator.clipboard.writeText(emailText);
      setNotice(
        "Texto copiado: un pasajero por renglón, listo para pegar en el correo.",
      );
    } catch {
      setError("Selecciona y copia el texto del panel para correo.");
    }
  }
  function updateVoucher<K extends keyof HotelVoucher>(
    key: K,
    value: HotelVoucher[K],
  ) {
    setVoucher((v) => ({
      ...v,
      [key]: value,
      confirmed: key === "confirmed" ? (value as boolean) : false,
    }));
    setNotice("");
  }
  async function lookup(e: FormEvent) {
    e.preventDefault();
    setBusy("lookup");
    setError("");
    setNotice("");
    try {
      const d = await read<{ hotels: HotelResult[] }>(
        "/api/auxiliary-operational/hotels?avi=" + encodeURIComponent(avi),
      );
      setHotels(d.hotels);
      if (!d.hotels.length)
        setNotice(
          "No hay hoteles activos guardados para ese AVI. Puedes completar el voucher manualmente.",
        );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  function useHotel(h: HotelResult) {
    if (
      savedVoucher ||
      (voucher.reservationCode &&
        voucher.reservationCode.trim().toUpperCase() !==
          h.reservationCode.trim().toUpperCase())
    ) {
      setError("Crea un voucher nuevo antes de cargar otra reserva.");
      return;
    }
    const detected = hotelTemplateForName(h.hotelName),
      template = detected || voucher.template;
    if (isHotelTemplate(voucher) && !detected) {
      setError(
        "Ese hotel no corresponde a los formatos configurados. Selecciona el formato general para cargarlo.",
      );
      return;
    }
    setVoucher((v) =>
      applyHotelDefaults({
        ...v,
        template,
        reservationCode: h.reservationCode,
        operatorReference: h.operatorReference,
        operator: h.operator,
        hotelName: h.hotelName,
        checkIn: h.checkIn,
        confirmed: false,
      }),
    );
    setNotice(
      "Datos del hotel cargados. Completa las fechas, pasajeros y acomodación.",
    );
    setError("");
  }
  async function saveVoucher(e: FormEvent) {
    e.preventDefault();
    setBusy("voucher");
    setError("");
    setNotice("");
    try {
      const d = await post<{ voucher: SavedHotelVoucher }>(
        "/api/auxiliary-operational/vouchers",
        {
          id: savedVoucher?.id || null,
          data: voucher,
          revision: savedVoucher?.revision || 0,
          requestId: crypto.randomUUID(),
        },
      );
      setSavedVoucher(d.voucher);
      setVoucher({ ...emptyHotelVoucher, ...d.voucher.data });
      setNotice("Voucher guardado. Ya puedes descargar el PDF.");
      await loadVouchers();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  function openVoucher(v: SavedHotelVoucher) {
    setSavedVoucher(v);
    setVoucher({ ...emptyHotelVoucher, ...v.data });
    setTab("voucher");
    setError("");
    setNotice("");
  }
  const voucherDirty =
    savedVoucher &&
    JSON.stringify(voucher) !==
      JSON.stringify({ ...emptyHotelVoucher, ...savedVoucher.data });
  const documentsPanel = (
    <>
      <PassengerNameCheck
        canEdit={canEdit}
        disabled={!!busy}
        onAppend={(line) => {
          setEmailText((previous) =>
            previous.split(/\r?\n/).some((existing) => existing.trim() === line)
              ? previous
              : [previous.trimEnd(), line].filter(Boolean).join("\n"),
          );
          setNotice(
            "Datos de la consulta manual añadidos. Revisa el texto antes de copiarlo.",
          );
        }}
      />
      <section className="aux-card aux-email-panel">
        <h2>
          <ScanText size={21} /> Transcribir pasajeros
        </h2>
        <p>
          Adjunta fotos o PDF de cédulas y pasaportes. Puedes incluir el frente
          y el reverso en archivos separados: se leen juntos para reunir los
          datos del mismo documento. Los documentos de otras personas se
          muestran por separado, con un pasajero por renglón. Si no se puede
          confirmar una coincidencia, verás una advertencia para revisarla. En
          pasaportes se mostrará una alerta si quedan menos de 12 meses de
          vigencia desde hoy.
        </p>
        <form onSubmit={upload}>
          <fieldset disabled={!canEdit || !!busy} className="aux-form">
            <label className="aux-wide">
              Fotos de documentos
              <input
                type="file"
                ref={fileInput}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple
                required
                onChange={(e) => {
                  setFiles(Array.from(e.target.files || []));
                  uploadIds.current = [];
                }}
              />
            </label>
            <small className="aux-wide">
              Hasta 10 archivos · máximo 8 MB por archivo y 16 MB en total.{" "}
              {files.length
                ? `${files.length} archivo(s) seleccionado(s).`
                : ""}
            </small>
            <button
              type="submit"
              className="aux-primary aux-wide"
              disabled={!files.length || !meta?.aiEnabled}
            >
              <ScanText size={18} />
              {busy === "upload"
                ? uploadProgress || "Transcribiendo…"
                : "Transcribir"}
            </button>
          </fieldset>
        </form>
        <div aria-live="polite">
          {readDocuments.flatMap((doc) =>
            documentPassengers(doc).map((passenger, index) => {
              const alert = passportAlert(passenger.passport);
              return (
                <div key={doc.id + ":" + index} className="aux-notice">
                  <strong>
                    Pasajero {index + 1} ·{" "}
                    {[passenger.fields.names, passenger.fields.surnames]
                      .filter(Boolean)
                      .join(" ") || "Datos incompletos"}
                  </strong>
                  <p>
                    Archivos:{" "}
                    {passenger.sources
                      .map(
                        (n) =>
                          doc.attachments[n - 1]?.fileName || "Archivo " + n,
                      )
                      .join(" · ")}
                  </p>
                  {passenger.sources.length > 1 && passenger.groupingReason && (
                    <p>{passenger.groupingReason}</p>
                  )}
                  {passenger.warnings.map((warning, i) => (
                    <p key={i}>{warning}</p>
                  ))}
                  {alert && (
                    <div
                      className={"aux-passport-alert " + alert.level}
                      role="alert"
                    >
                      {alert.message}
                    </div>
                  )}
                </div>
              );
            }),
          )}
        </div>
        <label>
          Datos de pasajeros
          <textarea
            rows={7}
            value={emailText}
            wrap="off"
            disabled={!!busy}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Nombre Apellido · Documento: 123456789 · Nacimiento: 15/05/1990"
          />
        </label>
        <div className="aux-actions">
          <button
            type="button"
            className="aux-primary"
            disabled={!!busy || !emailText.trim()}
            onClick={() => void copyPassengers()}
          >
            <Copy size={16} /> Copiar texto
          </button>
          <button
            type="button"
            disabled={!!busy || (!emailText && !files.length)}
            onClick={() => {
              setEmailText("");
              setReadDocuments([]);
              setFiles([]);
              uploadIds.current = [];
              if (fileInput.current) fileInput.current.value = "";
              setError("");
              setNotice("");
            }}
          >
            Limpiar texto
          </button>
        </div>
        <details className="aux-storage">
          <summary>Fotos y documentos guardados · {docTotal}</summary>
          <p className="aux-muted">
            Elimina los archivos que ya no necesitas para liberar espacio. El
            texto de arriba y los vouchers se conservan.
          </p>
          <div className="aux-record-list">
            {documents.map((doc) => (
              <div className="aux-storage-row" key={doc.id}>
                <div>
                  <strong>
                    {doc.attachments.map((f) => f.fileName).join(" · ") ||
                      "Documento"}
                  </strong>
                  <small>{passportAlert(doc.passport)?.message}</small>
                  <small>
                    {when(doc.createdAt)} ·{" "}
                    {(
                      doc.attachments.reduce((n, f) => n + f.size, 0) /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </small>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    className="aux-delete"
                    disabled={!!busy}
                    onClick={() => void removeDocument(doc)}
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                )}
              </div>
            ))}
            {!documents.length && (
              <p className="aux-muted">No hay documentos guardados.</p>
            )}
          </div>
          <div className="aux-actions">
            <button
              type="button"
              disabled={!!busy || docPage <= 1}
              onClick={() => setDocPage((v) => v - 1)}
            >
              Anterior
            </button>
            <small>
              {docPage} / {docPages}
            </small>
            <button
              type="button"
              disabled={!!busy || docPage >= docPages}
              onClick={() => setDocPage((v) => v + 1)}
            >
              Siguiente
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => void loadDocs().catch((e) => setError(e.message))}
            >
              Actualizar
            </button>
          </div>
        </details>
      </section>
    </>
  );
  if (documentsOnly)
    return (
      <div className={`aux-shell aux-documents-embedded ${auxiliaryTailwindStyles}`}>
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
        {!meta && <p role="status">Cargando documentos…</p>}
        {meta && !canEdit && (
          <p className="aux-notice">
            Tienes acceso de consulta a tus documentos.
          </p>
        )}
        {documentsPanel}
      </div>
    );
  return (
    <div className={`aux-shell ${auxiliaryTailwindStyles}`}>
      <header className="aux-top">
        <a href="/dashboard" aria-label="Inicio del portal">
          <BrandLogo />
        </a>
        <a href="/dashboard">
          <ArrowLeft size={17} /> Volver al portal
        </a>
      </header>
      <main
        className={
          tab === "transferRequests"
            ? "aux-main aux-main-transfers"
            : "aux-main"
        }
      >
        <section className="aux-hero">
          <div>
            <span>AVIOA · APOYO AL EQUIPO COMERCIAL</span>
            <h1>Auxiliares operativos</h1>
            <p>
              Documentos de pasajeros, transcripción de datos y vouchers de
              hotel en un solo lugar.
            </p>
          </div>
          <Files size={62} />
        </section>
        <nav className="aux-tabs" aria-label="Secciones de Auxiliares">
          {(
            [
              {
                id: "documents",
                label: "Transcribir datos personales",
                icon: ScanText,
              },
              { id: "voucher", label: "Voucher de hotel", icon: Hotel },
              {
                id: "transferRequests",
                label: "Solicitud traslados",
                icon: Bus,
              },
              { id: "transfers", label: "Voucher de traslados", icon: Bus },
              { id: "flights", label: "Itinerarios de vuelos", icon: Plane },
              { id: "history", label: "Vouchers guardados", icon: History },
              // { id: "passwords", label: "Contraseñas", icon: KeyRound },
              { id: "quick", label: "Respuestas rápidas", icon: Copy },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tab === t.id}
              onClick={() => {
                setTab(t.id);
                if (t.id === "transferRequests") setTransferRequestOpened(true);
                setError("");
                setNotice("");
              }}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          ))}
          {canAdminBlocks && (
            <a className="aux-primary" href="/bloqueos/control">
              Administración de bloqueos
            </a>
          )}
        </nav>
        {canEdit && <EmailWriterLauncher href="/auxiliares/correos" />}
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
        {!meta && <p role="status">Cargando módulo…</p>}
        {meta && !canEdit && (
          <p className="aux-notice">
            Tienes acceso de consulta. Puedes revisar los documentos y descargar
            vouchers guardados.
          </p>
        )}
        {tab === "documents" && documentsPanel}
        {tab === "voucher" && (
          <>
            <section className="aux-card">
              <div className="aux-section-head">
                <h2>
                  <Hotel size={21} /> Voucher de hotel
                </h2>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => {
                    if (
                      voucherDirty &&
                      !window.confirm(
                        "¿Descartar los cambios sin guardar de este voucher?",
                      )
                    )
                      return;
                    setVoucher(newHotelVoucher());
                    setSavedVoucher(null);
                    setHotels([]);
                    setAvi("");
                    setNotice("");
                  }}
                >
                  <Plus size={17} /> Nuevo voucher
                </button>
              </div>
              <label>
                Formato del voucher
                <select
                  disabled={!!busy || !canEdit}
                  value={voucher.template || "general"}
                  onChange={(e) => {
                    const template = e.target
                      .value as keyof typeof voucherTemplates;
                    setVoucher((v) =>
                      applyHotelDefaults({ ...v, template, confirmed: false }),
                    );
                    setNotice(
                      "Hotel configurado. Completa número de reserva, cantidad de pasajeros, fechas y acomodación.",
                    );
                  }}
                >
                  {Object.entries(voucherTemplates).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <p>
                {isHotelTemplate(voucher)
                  ? "El hotel ya está configurado. Completa número de reserva, cantidad de pasajeros, fechas de viaje, datos de pasajeros y acomodación."
                  : "Completa los datos del voucher general."}{" "}
                Puedes pegar los datos transcritos de los pasajeros.
              </p>
              <details>
                <summary>Vincular una reserva AVI · opcional</summary>
                <form className="aux-lookup" onSubmit={lookup}>
                  <label>
                    Buscar reserva AVI
                    <input
                      required
                      maxLength={200}
                      value={avi}
                      onChange={(e) => setAvi(e.target.value)}
                      disabled={!!busy}
                    />
                  </label>
                  <button type="submit" disabled={!!busy || !canEdit}>
                    <Search size={17} />
                    {busy === "lookup"
                      ? "Buscando…"
                      : "Cargar hoteles de la reserva"}
                  </button>
                </form>
                {hotels.length > 0 && (
                  <div className="aux-hotel-results">
                    {hotels.map((h) => (
                      <button
                        type="button"
                        disabled={!!busy || !canEdit}
                        key={h.id}
                        onClick={() => useHotel(h)}
                      >
                        <strong>{h.hotelName}</strong>
                        <span>
                          {h.reservationCode} · {h.operator} ·{" "}
                          {h.operatorReference || "Sin confirmación guardada"}
                        </span>
                        <small>Registro actualizado: {when(h.updatedAt)}</small>
                      </button>
                    ))}
                  </div>
                )}
              </details>
            </section>
            <section className="aux-card">
              <form onSubmit={saveVoucher}>
                <fieldset
                  disabled={!!busy || !canEdit}
                  className="aux-form aux-voucher-form"
                >
                  {voucherFormLabels(voucher).map(([key, label]) => {
                    const k = key as keyof typeof voucherLabels,
                      isNumber = [
                        "passengerCount",
                        "adults",
                        "children",
                        "rooms",
                      ].includes(k),
                      isText = [
                        "passengers",
                        "included",
                        "notes",
                        "accommodation",
                      ].includes(k);
                    return (
                      <label key={k} className={isText ? "aux-wide" : ""}>
                        {label}
                        {isText ? (
                          <textarea
                            rows={k === "passengers" ? 5 : 3}
                            maxLength={k === "accommodation" ? 400 : 6000}
                            required={
                              k === "passengers" ||
                              (k === "accommodation" &&
                                isHotelTemplate(voucher))
                            }
                            value={String(voucher[k] || "")}
                            onChange={(e) =>
                              updateVoucher(k, e.target.value as never)
                            }
                          />
                        ) : (
                          <input
                            type={
                              isNumber
                                ? "number"
                                : k === "checkIn" || k === "checkOut"
                                  ? "date"
                                  : "text"
                            }
                            min={
                              isNumber ? (k === "children" ? 0 : 1) : undefined
                            }
                            max={isNumber ? 100 : undefined}
                            maxLength={400}
                            required={[
                              "reservationCode",
                              "operatorReference",
                              "hotelName",
                              "checkIn",
                              "checkOut",
                              "passengerCount",
                              "adults",
                              "children",
                              "rooms",
                            ].includes(k)}
                            value={
                              isNumber && k !== "children" && !voucher[k]
                                ? ""
                                : (voucher[k] ?? "")
                            }
                            onChange={(e) =>
                              updateVoucher(
                                k,
                                (isNumber
                                  ? Number(e.target.value)
                                  : e.target.value) as never,
                              )
                            }
                          />
                        )}
                      </label>
                    );
                  })}
                  <label className="aux-check aux-wide">
                    <input
                      type="checkbox"
                      required
                      checked={voucher.confirmed}
                      onChange={(e) =>
                        updateVoucher("confirmed", e.target.checked)
                      }
                    />{" "}
                    Revisé las fechas de viaje, los datos de pasajeros y la
                    acomodación.
                  </label>
                  <button type="submit" className="aux-primary aux-wide">
                    <Save size={18} />
                    {busy === "voucher"
                      ? "Guardando…"
                      : savedVoucher
                        ? "Guardar cambios del voucher"
                        : "Guardar y preparar PDF"}
                  </button>
                </fieldset>
              </form>
              {savedVoucher && (
                <div className="aux-download">
                  <span>
                    Voucher{" "}
                    {savedVoucher.data.reservationCode ||
                      savedVoucher.id.slice(0, 8).toUpperCase()}{" "}
                    ·{" "}
                    {voucherDirty
                      ? "Cambios sin guardar"
                      : `Versión ${savedVoucher.revision}`}
                  </span>
                  {voucherDirty ? (
                    <p>Guarda los cambios para descargar el PDF actualizado.</p>
                  ) : (
                    <a
                      href={
                        "/api/auxiliary-operational/vouchers/" +
                        savedVoucher.id +
                        "/pdf"
                      }
                      className="aux-download-button"
                    >
                      <Download size={18} /> Descargar voucher en PDF
                    </a>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      className="aux-delete"
                      disabled={!!busy}
                      onClick={() => void removeVoucher(savedVoucher)}
                    >
                      <Trash2 size={16} /> Eliminar voucher
                    </button>
                  )}
                </div>
              )}
            </section>
          </>
        )}
        {tab === "history" && (
          <section className="aux-card">
            <div className="aux-section-head">
              <h2>
                <History size={21} /> Vouchers guardados
              </h2>
              <button
                type="button"
                onClick={() =>
                  void loadVouchers().catch((e) => setError(e.message))
                }
              >
                Actualizar
              </button>
            </div>
            <label>
              Buscar por código de reserva
              <input
                maxLength={200}
                value={voucherQuery}
                onChange={(e) => setVoucherQuery(e.target.value)}
              />
            </label>
            <div className="aux-table">
              <table>
                <thead>
                  <tr>
                    <th>Reserva</th>
                    <th>Hotel y fechas</th>
                    <th>Creado por</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <strong>
                          {v.data.reservationCode || "Sin número de reserva"}
                        </strong>
                        <small>
                          Voucher{" "}
                          {v.data.reservationCode ||
                            v.id.slice(0, 8).toUpperCase()}{" "}
                          · v{v.revision}
                        </small>
                      </td>
                      <td>
                        {v.data.hotelName}
                        <small>
                          {v.data.checkIn} → {v.data.checkOut}
                        </small>
                      </td>
                      <td>
                        {v.createdBy}
                        <small>{when(v.updatedAt)}</small>
                      </td>
                      <td>
                        <div className="aux-actions">
                          <button
                            type="button"
                            disabled={!!busy}
                            onClick={() => openVoucher(v)}
                          >
                            {canEdit ? "Abrir / editar" : "Consultar"}
                          </button>
                          <a
                            href={
                              "/api/auxiliary-operational/vouchers/" +
                              v.id +
                              "/pdf"
                            }
                          >
                            <Download size={15} /> PDF
                          </a>
                          {canEdit && (
                            <button
                              type="button"
                              className="aux-delete"
                              disabled={!!busy}
                              onClick={() => void removeVoucher(v)}
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
            {!vouchers.length && (
              <p className="aux-muted">No hay vouchers para este filtro.</p>
            )}
            <small className="aux-muted">
              Se muestran los últimos 50 vouchers que coinciden con la búsqueda.
            </small>
          </section>
        )}
        {meta && transferRequestOpened && (
          <div hidden={tab !== "transferRequests"}>
            <TransferRequestPanel canEdit={canEdit} />
          </div>
        )}
        {meta && (
          <div hidden={tab !== "transfers"}>
            <TransferPanel canEdit={canEdit} passengerText={emailText} />
          </div>
        )}
        {meta && (
          <div hidden={tab !== "flights"}>
            <FlightPanel canEdit={canEdit} passengerText={emailText} />
          </div>
        )}
        {tab === "passwords" && meta && (
          <AuxiliaryPasswords canEdit={canEdit} />
        )}
        {tab === "quick" && meta && <QuickReplies canEdit={canEdit} />}
      </main>
    </div>
  );
}
