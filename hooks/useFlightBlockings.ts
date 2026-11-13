"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AdminBlock,
  Block,
  BlockData,
  BlockEditData,
  Board,
  Confirmation,
  EditorState,
  Filters,
  FlightArrival,
  FlightBlockingAction,
  InventoryAdjustment,
  InventoryDraft,
  ManualReservationInput,
  ManualReservationDraft,
  LinkDraft,
  PassengerSplit,
  ReviewCounts,
  Service,
  Tab,
  TaskKind,
  UseFlightBlockingsOptions,
} from "@/types/block.types";

export const isAdminBlock = (block: Block): block is AdminBlock =>
  "revision" in block && "signature" in block;

export function blockDestination(
  block: Pick<BlockData, "title" | "destination">,
): string {
  const known: Record<string, string> = {
    ADZ: "San Andrés",
    SMR: "Santa Marta",
    CTG: "Cartagena",
    PUJ: "Punta Cana",
  };
  const title = block.title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  for (const [term, name] of Object.entries({
    "SAN ANDRES": "San Andrés",
    "SANTA MARTA": "Santa Marta",
    CARTAGENA: "Cartagena",
    "PUNTA CANA": "Punta Cana",
  }))
    if (title.includes(term)) return name;
  return (
    known[block.destination.toUpperCase().trim()] ||
    block.destination.trim() ||
    block.title.replace(/\s*\d+\s*NOCHES?.*$/i, "").trim() ||
    "Otros"
  );
}

export function blockNights(
  block: Pick<BlockData, "departDate" | "returnDate">,
): number | null {
  const nights =
    (Date.parse(block.returnDate + "T12:00:00Z") -
      Date.parse(block.departDate + "T12:00:00Z")) /
    86_400_000;
  return Number.isInteger(nights) && nights >= 0 ? nights : null;
}

export function inventoryInitial(block: Block): number | null {
  return block.drive?.inventoryMode === "total"
    ? block.capacity
    : (block.drive?.available ?? block.capacity);
}

function inventorySignature(block: AdminBlock): string {
  return JSON.stringify([
    block.code,
    block.departDate,
    block.returnDate,
    block.capacity,
    block.drive?.at,
    block.drive?.available,
    block.drive?.inventoryMode || "remaining",
    Object.entries(block.drive?.prior || {}).sort(([a], [b]) =>
      a.localeCompare(b),
    ),
  ]);
}

function relatedToBlock(
  service: Service,
  block: Block,
  blocks: Block[],
): boolean {
  if (service.blockId === block.id) return true;
  if (service.blockId || service.date !== block.departDate) return false;
  const key = (value: string): string =>
    value.trim().toUpperCase().replace(/\s/g, "");
  const references = (service.references || []).map(key).filter(Boolean);
  const identified = blocks.filter((candidate) =>
    [candidate.code, ...candidate.aliases].some(
      (code) => !!code && references.includes(key(code)),
    ),
  );
  if (identified.length)
    return identified.some((candidate) => candidate.id === block.id);
  return (
    !(
      service.returnDate &&
      block.returnDate &&
      service.returnDate !== block.returnDate
    ) &&
    !(
      service.origin &&
      block.origin &&
      key(service.origin) !== key(block.origin)
    ) &&
    !(
      service.destination &&
      block.destination &&
      key(service.destination) !== key(block.destination)
    )
  );
}

const initialFilters = (control: boolean): Filters => ({
  search: "",
  allDates: false,
  selected: null,
  destination: "",
  nights: "",
  arrival: control ? "after" : "all",
  inbox: control ? "pending" : "all",
  related: false,
  reviewOnly: false,
});
const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "No se pudo completar la operación.";
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

async function readResponse(response: Response): Promise<unknown> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `La API no devolvió JSON válido (HTTP ${response.status}).`,
    );
  }
  if (!response.ok)
    throw new Error(
      isRecord(data) && typeof data.error === "string"
        ? data.error
        : `La solicitud falló (HTTP ${response.status}).`,
    );
  return data;
}

// Comprueba el contenedor del contrato; los tipos de cada entidad requieren
// que la API mantenga el contrato de types.ts. No es un validador profundo.
function readBoard(data: unknown): Board {
  if (
    !isRecord(data) ||
    typeof data.today !== "string" ||
    typeof data.edit !== "boolean" ||
    typeof data.admin !== "boolean" ||
    !isRecord(data.drive) ||
    !isRecord(data.sync) ||
    ![
      "blocks",
      "services",
      "unmatched",
      "references",
      "alerts",
      "files",
      "events",
    ].every((key) => Array.isArray(data[key]))
  ) {
    throw new Error("La respuesta no cumple el contrato del tablero.");
  }
  return data as unknown as Board;
}

export function useFlightBlockings(options: UseFlightBlockingsOptions = {}) {
  const {
    control = false,
    endpoint = "/api/flight-blockings",
    filesEndpoint = endpoint.replace(/\/$/, "") + "/files",
    refreshIntervalMs = 60_000,
    inventoryPath = "/bloqueos",
    controlPath = "/bloqueos/control",
    navigate,
  } = options;
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<Tab>(control ? "reservations" : "inventory");
  const [filters, setFilters] = useState<Filters>(() =>
    initialFilters(control),
  );
  const [editor, setEditor] = useState<EditorState>({ kind: "closed" });
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const confirmResolver = useRef<((accepted: boolean) => void) | null>(null);
  const mounted = useRef(false);
  const mutationLock = useRef(false);
  const readController = useRef<AbortController | null>(null);
  const writeController = useRef<AbortController | null>(null);
  const sequence = useRef(0);

  const patchFilters = useCallback((patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const load = useCallback(async (): Promise<boolean> => {
    if (!mounted.current) return false;
    const current = ++sequence.current;
    readController.current?.abort();
    const controller = new AbortController();
    readController.current = controller;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        cache: "no-store",
        credentials: "same-origin",
        signal: controller.signal,
      });
      const data = readBoard(await readResponse(response));
      if (!mounted.current || current !== sequence.current) return false;
      setBoard(data);
      return true;
    } catch (cause: unknown) {
      if (
        !controller.signal.aborted &&
        mounted.current &&
        current === sequence.current
      ) {
        setError(errorMessage(cause));
      }
      return false;
    } finally {
      if (mounted.current && current === sequence.current) setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    mounted.current = true;
    void load();
    const interval =
      refreshIntervalMs > 0
        ? window.setInterval(() => {
            if (!document.hidden && !mutationLock.current) void load();
          }, refreshIntervalMs)
        : undefined;
    return () => {
      mounted.current = false;
      sequence.current++;
      if (interval !== undefined) window.clearInterval(interval);
      readController.current?.abort();
      writeController.current?.abort();
      confirmResolver.current?.(false);
      confirmResolver.current = null;
    };
  }, [load, refreshIntervalMs]);

  useEffect(() => {
    setTab(control ? "reservations" : "inventory");
    const next = initialFilters(control);
    if (control) {
      const params = new URLSearchParams(window.location.search);
      const selected = params.get("block");
      if (selected)
        Object.assign(next, {
          selected,
          inbox: "all",
          arrival: "all",
          related: params.get("related") === "1",
        });
      const inbox = params.get("inbox");
      if (
        inbox === "all" ||
        inbox === "pending" ||
        inbox === "new" ||
        inbox === "changed" ||
        inbox === "reviewed"
      )
        next.inbox = inbox;
      const arrival = params.get("arrival");
      if (
        arrival === "all" ||
        arrival === "after" ||
        arrival === "before" ||
        arrival === "unknown" ||
        arrival === "manual"
      )
        next.arrival = arrival;
      const section = params.get("tab");
      if (
        section === "reservations" ||
        section === "paymentAlerts" ||
        section === "dataAlerts" ||
        section === "history" ||
        section === "setup"
      )
        setTab(section);
    }
    setFilters(next);
    setEditor({ kind: "closed" });
  }, [control]);

  const settleConfirmation = useCallback((accepted: boolean) => {
    const resolve = confirmResolver.current;
    confirmResolver.current = null;
    setConfirmation(null);
    resolve?.(accepted);
  }, []);

  const askConfirmation = useCallback(
    (data: Confirmation): Promise<boolean> => {
      if (!mounted.current || confirmResolver.current)
        return Promise.resolve(false);
      setConfirmation(data);
      return new Promise((resolve) => {
        confirmResolver.current = resolve;
      });
    },
    [],
  );

  // Único punto para POST JSON y subida multipart. No reintenta escrituras.
  const mutate = useCallback(
    async (
      url: string,
      body: string | FormData,
      success: string,
      keepEditor: boolean,
    ): Promise<boolean> => {
      if (!mounted.current || mutationLock.current || !board?.edit)
        return false;
      mutationLock.current = true;
      setBusy(true);
      setError("");
      setMessage("");
      const controller = new AbortController();
      writeController.current = controller;
      try {
        const response = await fetch(url, {
          method: "POST",
          credentials: "same-origin",
          body,
          signal: controller.signal,
          ...(typeof body === "string"
            ? { headers: { "Content-Type": "application/json" } }
            : {}),
        });
        await readResponse(response);
        if (!mounted.current || controller.signal.aborted) return false;
        setMessage(success);
        if (!keepEditor) setEditor({ kind: "closed" });
        // Si falla la recarga, se conserva el éxito de la escritura y se muestra
        // el error de lectura; no se invita a repetir una operación ya guardada.
        await load();
        return true;
      } catch (cause: unknown) {
        if (mounted.current && !controller.signal.aborted)
          setError(errorMessage(cause));
        return false;
      } finally {
        mutationLock.current = false;
        if (mounted.current) setBusy(false);
      }
    },
    [board?.edit, load],
  );

  const post = useCallback(
    (payload: FlightBlockingAction, success: string, keepEditor = false) =>
      mutate(endpoint, JSON.stringify(payload), success, keepEditor),
    [endpoint, mutate],
  );

  const upload = useCallback(
    (file: File, blockId: string, kind: TaskKind) => {
      const body = new FormData();
      body.set("file", file);
      body.set("blockId", blockId);
      body.set("kind", kind);
      return mutate(
        filesEndpoint,
        body,
        "Adjunto guardado. Ya puedes completar la gestión.",
        true,
      );
    },
    [filesEndpoint, mutate],
  );

  const closeEditor = useCallback(() => {
    if (!mutationLock.current) setEditor({ kind: "closed" });
  }, []);

  const openBlockEditor = useCallback(
    (data?: BlockEditData) => {
      if (!board?.edit || mutationLock.current) return;
      const initial: BlockEditData = data
        ? structuredClone(data)
        : {
            code: "",
            title: "",
            departDate: board.today,
            returnDate: "",
            departTime: "",
            returnTime: "",
            origin: "",
            destination: "",
            flight: "",
            capacity: null,
            notes: "",
            aliases: [],
          };
      setEditor({
        kind: "block",
        data: initial,
        capacityText: initial.capacity === null ? "" : String(initial.capacity),
        aliasesText: initial.aliases.join(", "),
      });
    },
    [board],
  );

  const openInventoryEditor = useCallback(
    (block: AdminBlock) => {
      if (board?.admin && board.edit && block.drive && !mutationLock.current) {
        setEditor({
          kind: "inventory",
          data: structuredClone(block),
          draft: {
            mode: block.drive.inventoryMode || "remaining",
            quantityText: String(inventoryInitial(block) ?? ""),
            reason: "",
          },
        });
      }
    },
    [board],
  );

  const openServiceEditor = useCallback(
    (kind: "link" | "split", service: Service) => {
      if (!board?.edit || mutationLock.current) return;
      const snapshot = structuredClone(service);
      setEditor(
        kind === "link"
          ? {
              kind,
              service: snapshot,
              draft: {
                blockId: service.blockId || "",
                seatsText: service.seats === null ? "" : String(service.seats),
              },
            }
          : {
              kind,
              service: snapshot,
              rows: service.splits.length
                ? structuredClone(service.splits)
                : [{ code: "", passengers: 1, note: "" }],
            },
      );
    },
    [board?.edit],
  );

  const openManual = useCallback(
    (blockId = "") => {
      if (board?.edit && !mutationLock.current) {
        const requestId = crypto.randomUUID();
        setEditor({
          kind: "manual",
          requestId,
          blockId,
          draft: {
            requestId,
            blockId,
            reference: "",
            passenger: "",
            advisor: "",
            seatsText: "1",
          },
        });
      }
    },
    [board?.edit],
  );

  const updateLinkDraft = useCallback((patch: Partial<LinkDraft>) => {
    if (!mutationLock.current)
      setEditor((current) =>
        current.kind === "link"
          ? { ...current, draft: { ...current.draft, ...patch } }
          : current,
      );
  }, []);

  const updateSplitRows = useCallback((rows: PassengerSplit[]) => {
    if (!mutationLock.current)
      setEditor((current) =>
        current.kind === "split"
          ? { ...current, rows: structuredClone(rows) }
          : current,
      );
  }, []);

  const updateManualDraft = useCallback(
    (patch: Partial<Omit<ManualReservationDraft, "requestId">>) => {
      if (!mutationLock.current)
        setEditor((current) =>
          current.kind === "manual"
            ? { ...current, draft: { ...current.draft, ...patch } }
            : current,
        );
    },
    [],
  );

  const saveBlock = useCallback(
    (data: BlockEditData, keepEditor = false) => {
      const {
        id,
        revision,
        suggestedSeats: _suggestedSeats,
        ...blockData
      } = data;
      return post(
        {
          action: "saveBlock",
          data: blockData,
          ...(id !== undefined ? { id } : {}),
          ...(revision !== undefined ? { revision } : {}),
        },
        "Bloqueo guardado. Los cupos se calculan con las reservas vinculadas.",
        keepEditor,
      );
    },
    [post],
  );

  const adjustInventory = useCallback(
    (block: AdminBlock, input: InventoryAdjustment) =>
      post(
        {
          action: "adjustDriveInventory",
          blockId: block.id,
          revision: block.revision,
          inventorySignature: inventorySignature(block),
          ...input,
        },
        "Cupos ajustados. Se reabrieron las gestiones de pago y datos para revisión.",
      ),
    [post],
  );

  const updateBlockDraft = useCallback((patch: Partial<BlockData>) => {
    if (!mutationLock.current)
      setEditor((current) =>
        current.kind === "block"
          ? { ...current, data: { ...current.data, ...patch } }
          : current,
      );
  }, []);

  const updateBlockFields = useCallback(
    (patch: { capacityText?: string; aliasesText?: string }) => {
      if (!mutationLock.current)
        setEditor((current) =>
          current.kind === "block" ? { ...current, ...patch } : current,
        );
    },
    [],
  );

  const updateInventoryDraft = useCallback((patch: Partial<InventoryDraft>) => {
    if (!mutationLock.current)
      setEditor((current) => {
        if (current.kind !== "inventory") return current;
        let quantityText = current.draft.quantityText;
        if (patch.mode && patch.mode !== current.draft.mode) {
          const initialMode = current.data.drive?.inventoryMode || "remaining";
          quantityText = String(
            patch.mode === initialMode
              ? (inventoryInitial(current.data) ?? "")
              : patch.mode === "total"
                ? (current.data.capacity ?? "")
                : (current.data.drive?.available ?? ""),
          );
        }
        return {
          ...current,
          draft: { ...current.draft, quantityText, ...patch },
        };
      });
  }, []);

  const submitBlockEditor = useCallback(async (): Promise<boolean> => {
    if (editor.kind !== "block") return false;
    const capacity = editor.capacityText.trim()
      ? Number(editor.capacityText)
      : NaN;
    if (
      !Number.isSafeInteger(capacity) ||
      capacity < 1 ||
      capacity > 10000 ||
      !editor.data.code.trim() ||
      !editor.data.title.trim() ||
      !editor.data.departDate
    ) {
      setError(
        "Revisa código, destino, fecha de ida y cupo total (1 a 10.000).",
      );
      return false;
    }
    return saveBlock({
      ...editor.data,
      capacity,
      aliases: editor.aliasesText
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    });
  }, [editor, saveBlock]);

  const submitInventoryEditor = useCallback(async (): Promise<boolean> => {
    if (editor.kind !== "inventory") return false;
    const { mode, quantityText, reason } = editor.draft;
    const quantity = quantityText.trim() ? Number(quantityText) : NaN;
    if (
      !Number.isSafeInteger(quantity) ||
      quantity < (mode === "total" ? 1 : 0) ||
      quantity > 10000 ||
      reason.trim().length < 5 ||
      reason.length > 1000
    ) {
      setError(
        "Revisa los cupos (hasta 10.000) y el motivo (5 a 1.000 caracteres).",
      );
      return false;
    }
    return adjustInventory(editor.data, { mode, quantity, reason });
  }, [adjustInventory, editor]);

  const addManualReservation = useCallback(
    (input: ManualReservationInput) =>
      post(
        { action: "addManualReservation", ...input },
        "Reserva manual guardada. Cupos descontados.",
      ),
    [post],
  );

  const linkReservation = useCallback(
    (service: Service, blockId: string, seats: number | null) =>
      post(
        {
          action: "link",
          serviceId: service.id,
          blockId,
          seats,
          signature: service.sourceSignature,
        },
        "Reserva vinculada. Cupos recalculados sin duplicar.",
      ),
    [post],
  );

  const splitReservation = useCallback(
    (service: Service, splits: PassengerSplit[]) =>
      post(
        {
          action: "splitReservation",
          serviceId: service.id,
          signature: service.splitSignature,
          revision: service.splitRevision,
          splits,
        },
        "Divisiones guardadas. El total de cupos de la reserva madre se conserva.",
      ),
    [post],
  );

  const reviewReservation = useCallback(
    (service: Service) =>
      post(
        {
          action: "reviewReservation",
          reviewKey: service.reviewKey,
          signature: service.reviewSignature,
        },
        "Reserva revisada. Se guardó el responsable y la fecha; los cupos no cambian.",
        true,
      ),
    [post],
  );

  const deleteBlock = useCallback(
    async (block: AdminBlock): Promise<boolean> => {
      if (!board?.edit || mutationLock.current) return false;
      if (
        !(await askConfirmation({
          title: "Eliminar bloqueo",
          message: `¿Eliminar el bloqueo ${block.code}? Las reservas y el historial se conservan. Si tiene reservas activas, primero debes vincularlas al bloqueo correcto.`,
        }))
      )
        return false;
      return post(
        { action: "deleteBlock", blockId: block.id, revision: block.revision },
        "Bloqueo eliminado. El historial se conserva.",
      );
    },
    [askConfirmation, board?.edit, post],
  );

  const deleteManualReservation = useCallback(
    async (service: Service): Promise<boolean> => {
      if (!board?.edit || mutationLock.current || service.source !== "manual")
        return false;
      if (
        !(await askConfirmation({
          title: "Eliminar reserva manual",
          message: "¿Eliminar esta reserva manual y devolver sus cupos?",
        }))
      )
        return false;
      return post(
        {
          action: "deleteManualReservation",
          serviceId: service.id,
          signature: service.sourceSignature,
        },
        "Reserva manual eliminada. Cupos devueltos.",
      );
    },
    [askConfirmation, board?.edit, post],
  );

  const completeTask = useCallback(
    async (
      block: AdminBlock,
      kind: TaskKind,
      reopen = false,
    ): Promise<boolean> => {
      if (!board?.edit || loading || mutationLock.current) return false;
      const hasSupport = board.files.some(
        (file) => file.blockId === block.id && file.kind === kind,
      );
      const previousPaymentConfirmed =
        !reopen && kind === "payment" && !hasSupport;
      const previousDataDeliveryConfirmed =
        !reopen && kind === "names" && !hasSupport;
      if (
        !reopen &&
        !hasSupport &&
        !(await askConfirmation({
          title:
            kind === "payment"
              ? "Confirmar pago anterior"
              : "Confirmar envío anterior",
          message:
            kind === "payment"
              ? `¿Confirmas que el bloqueo ${block.code} ya fue pagado anteriormente? Se cerrará la alerta sin comprobante y quedará registrada tu confirmación.`
              : `¿Confirmas que los datos del bloqueo ${block.code} ya fueron enviados anteriormente? Se cerrará la alerta sin soporte y quedará registrada tu confirmación.`,
        }))
      )
        return false;
      return post(
        {
          action: reopen ? "reopen" : "complete",
          kind,
          blockId: block.id,
          revision: block.revision,
          signature: block.signature,
          previousPaymentConfirmed,
          previousDataDeliveryConfirmed,
        },
        reopen
          ? "Gestión reabierta."
          : kind === "payment"
            ? "Pago registrado. Alerta cerrada."
            : "Envío de datos registrado. Alerta cerrada.",
      );
    },
    [askConfirmation, board, loading, post],
  );

  const importBlocks = useCallback(
    (rows: BlockData[]) =>
      post({ action: "importBlocks", rows }, "Bloqueos importados."),
    [post],
  );

  const openSection = useCallback(
    (section: Tab, reviewOnly = false) => {
      if (mutationLock.current) return;
      const url =
        section === "inventory" && control
          ? inventoryPath
          : section !== "inventory" && !control
            ? `${controlPath}?tab=${encodeURIComponent(section)}`
            : null;
      if (url) {
        if (navigate) navigate(url);
        else window.location.assign(url);
        return;
      }
      setTab(section);
      setFilters({
        ...initialFilters(control),
        inbox: section === "reservations" ? "pending" : "all",
        arrival: section === "reservations" ? "after" : "all",
        reviewOnly,
      });
      setEditor({ kind: "closed" });
    },
    [control, controlPath, inventoryPath, navigate],
  );

  const derived = useMemo(() => {
    const allBlocks = board?.blocks ?? [];
    const today = board?.today ?? "";
    const selectedBlock = allBlocks.find(
      (block) => block.id === filters.selected,
    );
    const periodBlocks = allBlocks.filter(
      (block) => filters.allDates || block.departDate >= today,
    );
    const blocks = periodBlocks
      .filter(
        (block) =>
          (!filters.destination ||
            blockDestination(block) === filters.destination) &&
          (!filters.nights || String(blockNights(block)) === filters.nights) &&
          [block.code, block.title, block.origin, block.destination]
            .join(" ")
            .toLowerCase()
            .includes(filters.search.toLowerCase()),
      )
      .sort((a, b) => a.departDate.localeCompare(b.departDate));
    const allServices = (board?.services ?? []).filter((service) => {
      const departure =
        allBlocks.find((block) => block.id === service.blockId)?.departDate ||
        service.date;
      return (
        (!service.deletedAt ||
          (control && service.reviewState === "changed")) &&
        (filters.allDates ||
          (control && service.reviewState === "changed") ||
          ((!service.cancelled ||
            (control && service.reviewState !== "reviewed")) &&
            !!departure &&
            departure >= today))
      );
    });
    const scope = allServices.filter(
      (service) =>
        filters.arrival === "all" || service.arrivalGroup === filters.arrival,
    );
    const pendingServices = scope.filter(
      (service) => !service.cancelled && (!service.blockId || !!service.reason),
    );
    const visibleServices = scope
      .filter(
        (service) =>
          [
            service.avi,
            service.reference,
            service.passenger,
            service.advisor,
            ...service.splits.map((part) => part.code),
          ]
            .join(" ")
            .toLowerCase()
            .includes(filters.search.toLowerCase()) &&
          (filters.inbox === "all" ||
            (filters.inbox === "pending" &&
              service.reviewState !== "reviewed") ||
            filters.inbox === service.reviewState) &&
          (!filters.selected ||
            service.blockId === filters.selected ||
            (filters.related &&
              !!selectedBlock &&
              (relatedToBlock(service, selectedBlock, allBlocks) ||
                (isAdminBlock(selectedBlock) &&
                  !!selectedBlock.inventoryIssues?.some(
                    (issue) => issue.avi === (service.avi || service.id),
                  ))))) &&
          (!filters.reviewOnly ||
            (!service.cancelled && (!service.blockId || !!service.reason))),
      )
      .sort((a, b) =>
        (b.arrivalCreatedAt || b.sourceAt || "").localeCompare(
          a.arrivalCreatedAt || a.sourceAt || "",
        ),
      );
    const count = (list: Service[]): number =>
      new Set(list.map((service) => service.reviewKey)).size;
    const reviewCounts: ReviewCounts = {
      pending: count(
        scope.filter((service) => service.reviewState !== "reviewed"),
      ),
      new: count(scope.filter((service) => service.reviewState === "new")),
      changed: count(
        scope.filter((service) => service.reviewState === "changed"),
      ),
      reviewed: count(
        scope.filter((service) => service.reviewState === "reviewed"),
      ),
    };
    const arrivalCounts: Record<FlightArrival, number> = {
      after: 0,
      before: 0,
      unknown: 0,
      manual: 0,
    };
    for (const group of ["after", "before", "unknown", "manual"] as const) {
      arrivalCounts[group] = count(
        allServices.filter(
          (service) =>
            service.arrivalGroup === group &&
            service.reviewState !== "reviewed",
        ),
      );
    }
    const reasons = pendingServices.reduce<Record<string, number>>(
      (result, service) => {
        const reason = service.reason || "Sin bloqueo vinculado.";
        result[reason] = (result[reason] ?? 0) + 1;
        return result;
      },
      {},
    );
    const paymentAlerts = (board?.alerts ?? []).filter(
      (alert) => alert.kind === "payment",
    );
    const dataAlerts = (board?.alerts ?? []).filter(
      (alert) => alert.kind === "names",
    );
    return {
      blocks,
      periodBlocks,
      selectedBlock,
      allServices,
      pendingServices,
      visibleServices,
      manualBlocks: allBlocks.filter((block) => block.departDate >= today),
      destinations: [...new Set(allBlocks.map(blockDestination))].sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
      nightOptions: [
        ...new Set([
          2,
          3,
          4,
          5,
          ...allBlocks
            .filter(
              (block) =>
                !filters.destination ||
                blockDestination(block) === filters.destination,
            )
            .map(blockNights)
            .filter((value): value is number => value !== null),
        ]),
      ].sort((a, b) => a - b),
      reviewCounts,
      arrivalCounts,
      reviewReasons: Object.entries(reasons),
      reservationCount: new Set(
        scope.map((service) => service.avi || service.id),
      ).size,
      pendingCount: new Set(
        pendingServices.map((service) => service.avi || service.id),
      ).size,
      changedCount: count(
        allServices.filter((service) => service.reviewState === "changed"),
      ),
      paymentAlerts,
      dataAlerts,
      activeAlerts:
        tab === "paymentAlerts"
          ? paymentAlerts
          : tab === "dataAlerts"
            ? dataAlerts
            : [],
    };
  }, [board, control, filters, tab]);

  return {
    board,
    loading,
    busy,
    error,
    message,
    tab,
    filters,
    editor,
    confirmation,
    canEdit: board?.edit ?? false,
    canAdmin: board?.admin ?? false,
    ...derived,
    load,
    post,
    upload,
    patchFilters,
    openSection,
    closeEditor,
    openBlockEditor,
    openInventoryEditor,
    openServiceEditor,
    openManual,
    updateLinkDraft,
    updateSplitRows,
    updateManualDraft,
    saveBlock,
    adjustInventory,
    addManualReservation,
    linkReservation,
    updateBlockDraft,
    updateBlockFields,
    updateInventoryDraft,
    submitBlockEditor,
    submitInventoryEditor,
    splitReservation,
    reviewReservation,
    deleteBlock,
    deleteManualReservation,
    completeTask,
    importBlocks,
    settleConfirmation,
    clearFeedback: () => {
      setError("");
      setMessage("");
    },
  };
}
