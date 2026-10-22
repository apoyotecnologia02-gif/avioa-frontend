"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Plus, Copy, Download, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  AuxiliaryKind,
  AuxiliaryRecord,
  AuxiliaryPayload,
  AuxiliaryPermissions,
  Asset,
  SaveInput,
} from "@/types/auxiliary";
import { validateInput } from "@/lib/auxiliary/validation-auxiliar";
import {
  auxiliaryPdfUrl,
  auxiliaryImageUrl,
  createAuxiliaryRepository,
  downloadAuxiliaryPdf,
} from "@/lib/auxiliary/auxiliar-repository";
import {
  applyHotelDefaults,
  isHotelTemplate,
  voucherFormLabels,
  voucherTemplates,
  type HotelVoucher,
} from "@/lib/auxiliary/domain/aux-voucher";
import {
  newTourVoucher,
  transferDestinations,
  type TransferVoucher,
} from "@/lib/auxiliary/domain/aux-transfer";
import {
  transferLabels,
  transferMessage,
  transferOperators,
  type TransferRequestData,
} from "@/lib/auxiliary/domain/transfer-requests";
import { transferProfiles } from "@/lib/auxiliary/domain/aux-transfer-profiles";
import { ReplyList } from "./ReplyList";
import { quickReplyHtml } from "@/lib/auxiliary/domain/quick-reply-html";

const repository = createAuxiliaryRepository();

type FormValue = string | number | boolean | undefined;

interface Props {
  kind: AuxiliaryKind;
  initial: AuxiliaryRecord | null;
  seed: AuxiliaryPayload | null;
  permissions: AuxiliaryPermissions;
  notify: (s: string) => void;
  copy: (s: string) => void;
  onSaved: (row: AuxiliaryRecord) => void;
  onNew: () => void;
}

const fresh = (kind: AuxiliaryKind): AuxiliaryPayload => {
  // misma función que en Workspace.tsx
  const { newHotelVoucher } = require("@/lib/auxiliary/domain/aux-voucher");
  const { newTransferVoucher } = require("@/lib/auxiliary/domain/aux-transfer");
  const {
    newTransferRequest,
  } = require("@/lib/auxiliary/domain/transfer-requests");
  const {
    newFlightItinerary,
  } = require("@/lib/auxiliary/domain/flight-itinerary");
  return kind === "hotel"
    ? newHotelVoucher("general")
    : kind === "transfer"
      ? newTransferVoucher()
      : kind === "request"
        ? newTransferRequest()
        : kind === "flight"
          ? newFlightItinerary()
          : { title: "", category: "General", body: "", html: "" };
};

const newId = () => crypto.randomUUID();

export function DocumentEditor({
  kind,
  initial,
  seed,
  permissions,
  notify,
  copy,
  onSaved,
  onNew,
}: Props) {
  const [payload, setPayload] = useState<AuxiliaryPayload>(
    () => initial?.payload || seed || fresh(kind),
  );
  const [record, setRecord] = useState(initial);
  const [assets, setAssets] = useState<Asset[]>(initial?.assets || []);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [state, setState] = useState<AuxiliaryRecord["state"]>(
    initial?.state || (kind === "request" ? "pending" : "ready"),
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const idRef = useRef(initial?.auxiliaryRecordId || newId());
  const data = payload as unknown as Record<string, FormValue>;

  const dirty =
    JSON.stringify(payload) !==
      JSON.stringify(record?.payload || fresh(kind)) ||
    files.length > 0 ||
    JSON.stringify(assets) !== JSON.stringify(record?.assets || []) ||
    state !== record?.state;

  const canWrite = record ? permissions.canUpdate : permissions.canCreate;

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  const update = (key: string, value: FormValue) => {
    setPayload(
      (old) =>
        ({
          ...old,
          [key]: value,
          ...(Object.hasOwn(old, "confirmed")
            ? { confirmed: key === "confirmed" ? value : false }
            : {}),
        }) as AuxiliaryPayload,
    );
    setError("");
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!canWrite || busy) return;

    const input: SaveInput = {
      id: idRef.current,
      kind,
      payload,
      revision: record?.revision || 0,
      assets,
      state,
    };

    try {
      validateInput(input);
    } catch (e) {
      setError((e as Error).message);
      return;
    }

    setBusy(true);
    try {
      const row = await repository.save(input, files);
      setRecord(row);
      setPayload(row.payload);
      setAssets(row.assets);
      setFiles([]);
      onSaved(row);
      notify("Documento guardado. Puedes descargar su PDF.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // ---- PATRÓN DE CAMPO REUTILIZABLE ----
  const renderField = (
    key: string,
    label: string,
    options: {
      type?: string;
      required?: boolean;
      wide?: boolean;
      choices?: [string, string][];
      multiline?: boolean;
      max?: number;
      placeholder?: string;
    } = {},
  ) => {
    const multiline =
      options.multiline ||
      [
        "passengers",
        "included",
        "notes",
        "accommodation",
        "tourNotes",
        "body",
      ].includes(key);
    const type =
      options.type ||
      (/Date$/.test(key) || ["checkIn", "checkOut", "date"].includes(key)
        ? "date"
        : /Time$/.test(key) || key === "time"
          ? "time"
          : [
                "passengerCount",
                "adults",
                "children",
                "rooms",
                "infants",
              ].includes(key)
            ? "number"
            : "text");

    return (
      <div
        key={key}
        className={cn(
          "space-y-1.5",
          (options.wide || multiline) && "sm:col-span-2",
        )}
      >
        <Label className="text-xs font-semibold text-muted-foreground">
          {label}
        </Label>
        {options.choices ? (
          <Select
            value={String(data[key] ?? "")}
            onValueChange={(v) => update(key, v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.choices
                .filter(([value]) => value !== "")
                .map(([value, title]) => (
                  <SelectItem key={value} value={value}>
                    {title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        ) : multiline ? (
          <Textarea
            rows={key === "passengers" || key === "body" ? 5 : 3}
            maxLength={
              key === "body" ? 20000 : key === "tourNotes" ? 1200 : 6000
            }
            required={options.required}
            value={String(data[key] ?? "")}
            onChange={(e) => update(key, e.target.value)}
          />
        ) : (
          <Input
            type={type}
            min={
              type === "number"
                ? ["infants", "children"].includes(key)
                  ? 0
                  : 1
                : undefined
            }
            max={type === "number" ? 600 : undefined}
            maxLength={options.max || 400}
            required={options.required}
            value={String(data[key] ?? "")}
            onChange={(e) =>
              update(
                key,
                type === "number" && kind !== "request"
                  ? e.target.value === ""
                    ? undefined
                    : Number(e.target.value)
                  : e.target.value,
              )
            }
          />
        )}
      </div>
    );
  };

  // ---- Resto del JSX (sin cambios respecto a la lógica original) ----
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={save} className="space-y-6">
          {/* HEADER */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                {record
                  ? "Editar documento"
                  : kind === "request"
                    ? "Nueva solicitud de traslado"
                    : kind === "reply"
                      ? "Nueva respuesta rápida"
                      : "Nuevo " + kind.toLowerCase()}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {record
                  ? `Reserva ${record.reference} · versión ${record.revision}`
                  : "Completa los datos y revisa antes de guardar."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm(
                    "¿Descartar los cambios sin guardar y crear otro documento?",
                  )
                )
                  onNew();
              }}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <fieldset
            disabled={!canWrite || busy}
            className="space-y-6 border-0 p-0"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {/* ── HOTEL ── */}
              {kind === "hotel" && (
                <>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Formato del hotel</Label>
                    <Select
                      value={String(data.template || "general")}
                      onValueChange={(v) => {
                        setPayload(
                          applyHotelDefaults({
                            ...(payload as HotelVoucher),
                            template: v as keyof typeof voucherTemplates,
                            confirmed: false,
                          }),
                        );
                        setError("");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(voucherTemplates).map(
                          ([key, title]) => (
                            <SelectItem key={key} value={key}>
                              {title}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {isHotelTemplate(payload as HotelVoucher) && (
                    <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground sm:col-span-2">
                      <strong className="block text-sm text-foreground">
                        {String(data.hotelName)}
                      </strong>
                      {String(data.destination)} · {String(data.mealPlan)}
                      <br />
                      Datos de plantilla del repositorio de origen. Verifica que
                      corresponden a los servicios reservados.
                    </div>
                  )}

                  {voucherFormLabels(payload as HotelVoucher).map(
                    ([key, label]) =>
                      renderField(key, label, {
                        required: isHotelTemplate(payload as HotelVoucher)
                          ? [
                              "reservationCode",
                              "passengerCount",
                              "checkIn",
                              "checkOut",
                              "passengers",
                              "accommodation",
                            ].includes(key)
                          : [
                              "reservationCode",
                              "operatorReference",
                              "hotelName",
                              "checkIn",
                              "checkOut",
                              "adults",
                              "children",
                              "rooms",
                              "passengers",
                            ].includes(key),
                      }),
                  )}
                </>
              )}

              {/* ── REQUEST ── */}
              {kind === "request" && (
                <>
                  {Object.entries(transferLabels).map(([key, label]) =>
                    renderField(key, label, {
                      required: key !== "tourNotes" || data.tours === "SI",
                      choices:
                        key === "destination"
                          ? [
                              ["", "Selecciona un destino"],
                              ...Object.keys(transferOperators).map(
                                (x) => [x, x] as [string, string],
                              ),
                            ]
                          : key === "tours"
                            ? [
                                ["NO", "No"],
                                ["SI", "Sí"],
                              ]
                            : undefined,
                      max: 180,
                    }),
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Estado registrado</Label>
                    <Select
                      value={state}
                      onValueChange={(v) =>
                        setState(v as AuxiliaryRecord["state"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          Pendiente de envío
                        </SelectItem>
                        <SelectItem value="manual">
                          Envío manual registrado
                        </SelectItem>
                        <SelectItem value="confirmed">
                          Confirmado por operador · registro manual
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground sm:col-span-2">
                    <strong className="block text-sm text-foreground">
                      Gestión manual con el operador
                    </strong>
                    Guardar no envía correos ni mensajes. Marca un envío o
                    confirmación únicamente después de verificarlo fuera del
                    sitio.
                  </div>
                </>
              )}

              {/* ── TRANSFER / FLIGHT / REPLY — siguen el mismo patrón ── */}
              {kind === "transfer" && (
                <>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Formato de traslado</Label>
                    <Select
                      value={String(data.template || "general")}
                      onValueChange={(v) => {
                        setPayload(
                          v === "general"
                            ? ({
                                ...payload,
                                template: "general",
                              } as TransferVoucher)
                            : newTourVoucher(
                                v as keyof typeof transferProfiles,
                              ),
                        );
                        setAssets([]);
                        setFiles([]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General aVioa</SelectItem>
                        {Object.entries(transferProfiles).map(([key, p]) => (
                          <SelectItem key={key} value={key}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {renderField("destination", "Destino", {
                    required: true,
                    placeholder: "Selecciona un destino",
                    choices: Object.keys(transferDestinations).map(
                      (x) => [x, x] as [string, string],
                    ),
                  })}
                  {renderField("service", "Tipo de servicio", {
                    choices: [
                      ["roundtrip", "Ida y regreso"],
                      ["oneway", "Solo ida"],
                    ],
                  })}
                  {Object.entries({
                    reservationCode: "Número de reserva",
                    passengerCount: "Cantidad de pasajeros",
                    passengers: "Pasajeros",
                    origin: "Origen / aeropuerto",
                    dropoff: "Hotel o punto de llegada",
                    date: "Fecha de llegada",
                    time: "Hora del vuelo de llegada",
                    flight: "Vuelo de llegada",
                    returnDate: "Fecha de regreso",
                    returnTime: "Hora del vuelo de regreso",
                    returnFlight: "Vuelo de regreso",
                    operator: "Operador",
                    operatorReference: "Confirmación del operador",
                    notes: "Observaciones",
                  })
                    .filter(
                      ([key]) =>
                        data.service === "roundtrip" ||
                        !key.startsWith("return"),
                    )
                    .map(([key, label]) =>
                      renderField(key, label, {
                        required:
                          [
                            "reservationCode",
                            "passengerCount",
                            "passengers",
                            "origin",
                            "dropoff",
                            "date",
                          ].includes(key) ||
                          (data.service === "roundtrip" &&
                            key === "returnDate"),
                      }),
                    )}
                </>
              )}

              {kind === "flight" && (
                <>
                  {renderField("reservationCode", "Código de reserva", {
                    required: true,
                  })}
                  {renderField(
                    "passengers",
                    "Pasajeros · un viajero por línea",
                    {
                      required: true,
                      wide: true,
                      multiline: true,
                    },
                  )}
                </>
              )}

              {kind === "reply" && (
                <>
                  {renderField("title", "Título", { required: true, max: 250 })}
                  {renderField("category", "Categoría", {
                    required: true,
                    max: 150,
                  })}
                  {renderField("body", "Respuesta", {
                    required: true,
                    wide: true,
                    multiline: true,
                  })}
                </>
              )}

              {/* IMÁGENES */}
              {(kind === "flight" || kind === "transfer") && (
                <div className="space-y-3 sm:col-span-2">
                  <Label className="text-xs">
                    Imágenes del itinerario · JPG o PNG
                  </Label>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={(e) => {
                      const incoming = Array.from(e.target.files || []);
                      e.target.value = "";
                      if (assets.length + files.length + incoming.length > 3) {
                        setError("Adjunta hasta tres imágenes.");
                        return;
                      }
                      if (
                        incoming.some(
                          (f) =>
                            !["image/jpeg", "image/png"].includes(f.type) ||
                            f.size > 5 * 1024 * 1024 ||
                            !f.size,
                        )
                      ) {
                        setError("Usa JPG o PNG de hasta 5 MB.");
                        return;
                      }
                      setFiles((old) => [...old, ...incoming]);
                      update("confirmed", false);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Hasta 3 imágenes de 5 MB.{" "}
                    {kind === "flight"
                      ? "Se requiere al menos una."
                      : "Opcional."}
                  </p>

                  {(assets.length > 0 || files.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {assets.map((a) => (
                        <div
                          key={a.id}
                          className="relative w-32 rounded-lg border border-border bg-muted p-1.5"
                        >
                          <img
                            alt={a.name}
                            src={auxiliaryImageUrl(idRef.current, a.id)}
                            className="h-24 w-full rounded object-contain"
                          />
                          <p className="mt-1 truncate text-[10px] text-muted-foreground">
                            {a.name}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-6 w-6 bg-background/80"
                            onClick={() => {
                              setAssets((old) =>
                                old.filter((x) => x.id !== a.id),
                              );
                              update("confirmed", false);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {files.map((f, i) => (
                        <div
                          key={i}
                          className="relative w-32 rounded-lg border border-border bg-muted p-1.5"
                        >
                          <img
                            alt={f.name}
                            src={previews[i]}
                            className="h-24 w-full rounded object-contain"
                          />
                          <p className="mt-1 truncate text-[10px] text-muted-foreground">
                            {f.name}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-6 w-6 bg-background/80"
                            onClick={() => {
                              setFiles((old) =>
                                old.filter((_, idx) => idx !== i),
                              );
                              update("confirmed", false);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CONFIRMACIÓN */}
              {Object.hasOwn(payload, "confirmed") && (
                <label className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-xs sm:col-span-2">
                  <input
                    required
                    type="checkbox"
                    checked={data.confirmed === true}
                    onChange={(e) => update("confirmed", e.target.checked)}
                    className="mt-0.5"
                  />
                  Revisé la reserva, los pasajeros, las fechas y los servicios
                  de este documento.
                </label>
              )}
            </div>
          </fieldset>

          {/* ACTIONS */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button disabled={busy || !canWrite} className="gap-1.5">
              {busy
                ? "Guardando…"
                : record
                  ? "Guardar cambios"
                  : "Guardar documento"}
            </Button>
            {record && !dirty && (
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() =>
                  downloadAuxiliaryPdf(
                    record.auxiliaryRecordId,
                    `avioa-${record.reference}.pdf`,
                  )
                }
                disabled={!record.auxiliaryRecordId}
              >
                <Download className="h-4 w-4" /> Descargar PDF
              </Button>
            )}
            {record && dirty && (
              <p className="text-xs text-muted-foreground">
                Guarda los cambios para descargar la versión actualizada.
              </p>
            )}
            {kind === "request" && (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  try {
                    validateInput({
                      id: idRef.current,
                      kind,
                      payload,
                      assets: [],
                      state,
                      revision: record?.revision || 0,
                    });
                    copy(transferMessage(payload as TransferRequestData));
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                <Copy className="h-4 w-4" /> Copiar solicitud
              </Button>
            )}
            {kind === "reply" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => copy(String(data.body || ""))}
                >
                  <Copy className="h-4 w-4" /> Copiar respuesta
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copy(quickReplyHtml(String(data.body || "")))}
                >
                  Copiar HTML
                </Button>
              </>
            )}
          </div>
        </form>
      </Card>

      {/* LISTA DE RESPUESTAS GUARDADAS — migrar con el mismo patrón (Card + grid) */}
      {kind === "reply" && (
        <ReplyList
          copy={copy}
          notify={notify}
          setError={setError}
          permissions={permissions}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

// Sub-componente para ReplyList — omitido aquí por brevedad, mismo patrón
// function ReplyList({
//   rows,
//   copy,
// }: {
//   rows: AuxiliaryRecord[];
//   copy: (s: string) => void;
// }) {
//   // ...mismo patrón que tenía, ahora con Card, Input, Button de shadcn
//   return null;
// }
