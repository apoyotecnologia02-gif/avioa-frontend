"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plane, History, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  AuxiliaryKind,
  AuxiliaryRecord,
  AuxiliaryPayload,
  AuxiliaryPermissions,
} from "@/types/auxiliary";
import { newHotelVoucher } from "@/lib/auxiliary/domain/aux-voucher";
import { newTransferVoucher } from "@/lib/auxiliary/domain/aux-transfer";
import { newTransferRequest } from "@/lib/auxiliary/domain/transfer-requests";
import { newFlightItinerary } from "@/lib/auxiliary/domain/flight-itinerary";
import { createAuxiliaryRepository } from "@/lib/auxiliary/auxiliar-repository";
import { DocumentEditor } from "./DocumentEditor";
import { Overview } from "./Overview";
import { HistoryView } from "./HistoryView";
import { PassengerPanel } from "./PassengerPanel";
import { EmailPanel } from "./EmailPanel";
import { PasswordsPanel } from "./PasswordsPanel";
import { IntegrationPanel } from "./IntegrationPanel";
import { Topbar } from "./Topbar";
import { SidebarNav } from "./SideBarNav";

export type View =
  | "overview"
  | "passengers"
  | AuxiliaryKind
  | "history"
  | "passwords"
  | "email"
  | "integration";

export const viewLabels: Record<View, string> = {
  overview: "Tu apoyo operativo",
  passengers: "Documentos y pasajeros",
  hotel: "Voucher de hotel",
  request: "Solicitud de traslados",
  transfer: "Voucher de traslados",
  flight: "Itinerarios de vuelo",
  history: "Historial de documentos",
  reply: "Respuestas rápidas",
  passwords: "Contraseñas",
  email: "Asistente de correos",
  integration: "Integración nativa",
};

export const kindLabels: Record<AuxiliaryKind, string> = {
  hotel: "Hotel",
  request: "Solicitud de traslado",
  transfer: "Voucher de traslado",
  flight: "Itinerario de vuelo",
  reply: "Respuesta rápida",
};

export const fresh = (kind: AuxiliaryKind): AuxiliaryPayload =>
  kind === "hotel"
    ? newHotelVoucher("general")
    : kind === "transfer"
      ? newTransferVoucher()
      : kind === "request"
        ? newTransferRequest()
        : kind === "flight"
          ? newFlightItinerary()
          : { title: "", category: "General", body: "", html: "" };

const repository = createAuxiliaryRepository();

interface Props {
  embedded?: boolean;
  permissions?: AuxiliaryPermissions;
}

export default function Workspace({
  embedded = false,
  permissions = { canCreate: true, canUpdate: true, canDelete: true },
}: Props = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<View>("overview");
  const [rows, setRows] = useState<AuxiliaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AuxiliaryRecord | null>(null);
  const [seed, setSeed] = useState<AuxiliaryPayload | null>(null);
  const [version, setVersion] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [history, setHistory] = useState<View[]>([]);

  const h1Ref = useRef<HTMLHeadingElement>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await repository.list());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const initial = searchParams.get("section");
    if (initial && Object.hasOwn(viewLabels, initial)) {
      setView(initial as View);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  //   const go = (next: View) => {
  //     setView(next);
  //     setMobileOpen(false);
  //     setSelected(null);
  //     setSeed(null);
  //     setVersion((n) => n + 1);
  //     const url = new URL(window.location.href);
  //     url.searchParams.set("section", next);
  //     router.replace(url.pathname + url.search);
  //     setTimeout(() => h1Ref.current?.focus(), 0);
  //   };

  const go = useCallback(
    (next: View, options: { pushHistory?: boolean } = {}) => {
      const { pushHistory = true } = options;

      if (next === "overview") {
        setHistory([]);
      } else if (pushHistory && next !== view) {
        setHistory((h) => [...h, view]);
      }

      setView(next);
      setMobileOpen(false);
      setSelected(null);
      setSeed(null);
      setVersion((n) => n + 1);

      const url = new URL(window.location.href);
      url.searchParams.set("section", next);
      router.replace(url.pathname + url.search);
      setTimeout(() => h1Ref.current?.focus(), 0);
    },
    [view, router],
  );

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      go(prev, { pushHistory: false });
    } else {
      go("overview", { pushHistory: false });
    }
  }, [history, go]);

  const open = (row: AuxiliaryRecord) => {
    go(row.kind);
    setSelected(row);
  };

  const notify = (message: string) => {
    toast(message, { position: "bottom-center" });
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      notify("Texto copiado. Revisa los datos antes de compartir.");
    } catch {
      notify("No se pudo copiar. Selecciona el texto manualmente.");
    }
  };

  const archive = async (row: AuxiliaryRecord) => {
    if (!permissions.canDelete) return;
    try {
      await repository.archive(
        row.auxiliaryRecordId,
        row.revision,
        !!row.archivedAt,
      );
      await load();
      notify(
        row.archivedAt
          ? "Documento restaurado."
          : "Documento archivado. Puedes restaurarlo desde el historial.",
      );
    } catch (e) {
      notify((e as Error).message);
    }
  };

  const canGoBack = view !== "overview";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* SIDEBAR — desktop */}
      {!embedded && (
        <aside className="hidden w-[249px] shrink-0 border-r border-border bg-card md:flex md:flex-col">
          <SidebarNav view={view} onNavigate={go} permissions={permissions} />
        </aside>
      )}

      {/* SIDEBAR — mobile sheet */}
      {!embedded && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[249px] p-0">
            <SidebarNav view={view} onNavigate={go} permissions={permissions} />
          </SheetContent>
        </Sheet>
      )}

      {/* MAIN */}
      <div className={cn("flex min-w-0 flex-1 flex-col", embedded && "w-full")}>
        {!embedded && (
          <Topbar
            view={view}
            onOpenMobile={() => setMobileOpen(true)}
            onGoHistory={() => go("history")}
          />
        )}

        <ScrollArea className="flex-1">
          <div
            className={cn(
              "mx-auto w-full max-w-[1450px] px-5 pb-16 pt-8 md:px-10 md:pt-10",
              embedded && "max-w-full px-4 pt-6 md:px-6",
            )}
          >
            {/* HEADER DE PÁGINA */}
            <PageHeader
              view={view}
              embedded={embedded}
              h1Ref={h1Ref}
              onGoHistory={() => go("history")}
              onGoBack={goBack}
              canGoBack={canGoBack}
            />

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={load}
                >
                  Reintentar
                </Button>
              </div>
            )}

            {/* VISTAS */}
            {view === "overview" && (
              <Overview
                rows={rows}
                loading={loading}
                onNavigate={go}
                onOpen={open}
                onArchive={archive}
                permissions={permissions}
                onRefresh={load}
              />
            )}

            {(
              ["hotel", "transfer", "request", "flight", "reply"] as View[]
            ).includes(view) && (
              <DocumentEditor
                key={view + "-" + version}
                kind={view as AuxiliaryKind}
                initial={selected}
                seed={seed}
                permissions={permissions}
                notify={notify}
                copy={copy}
                onSaved={(row) => {
                  setSelected(row);
                  void load();
                }}
                onNew={() => go(view)}
              />
            )}

            {view === "history" && (
              <HistoryView
                rows={rows}
                loading={loading}
                permissions={permissions}
                onOpen={open}
                onArchive={archive}
                onSeedTransfer={(payload) => {
                  go("transfer");
                  setSeed({ ...payload, confirmed: false });
                }}
                onNew={() => go("hotel")}
                notify={notify}
              />
            )}

            {view === "passengers" && <PassengerPanel copy={copy} />}
            {view === "email" && <EmailPanel copy={copy} />}
            {view === "passwords" && (
              <PasswordsPanel
                embedded={embedded}
                onGoIntegration={() => go("integration")}
              />
            )}
            {view === "integration" && <IntegrationPanel embedded={embedded} />}

            {/* FOOTER */}
            <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                aVioa<span className="text-primary">.</span>
                <span className="mx-2 font-normal text-border">/</span>
                Auxiliares
              </span>
              <span className="flex items-center gap-2">
                Cada detalle cuenta <Plane className="h-3.5 w-3.5" />
              </span>
            </footer>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function PageHeader({
  view,
  embedded,
  h1Ref,
  onGoHistory,
  onGoBack,
  canGoBack,
}: {
  view: View;
  embedded: boolean;
  h1Ref: React.RefObject<HTMLHeadingElement | null>;
  onGoHistory: () => void;
  onGoBack: () => void;
  canGoBack: boolean;
}) {
  return (
    <div className="mb-6 space-y-3">
      {canGoBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoBack}
          className="-ml-3 h-8 gap-1.5 px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Button>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {embedded ? "Auxiliares" : "aVioa / Auxiliares operativos"}
          </p>
          <h1
            ref={h1Ref}
            tabIndex={-1}
            className="mt-2 text-2xl font-semibold tracking-tight text-foreground outline-none md:text-3xl"
          >
            {viewLabels[view]}
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {view === "overview"
              ? "Los detalles en orden. Los viajeros, listos para salir."
              : "Prepara, revisa y organiza cada detalle del viaje."}
          </p>
        </div>
        <Button variant="outline" onClick={onGoHistory} className="gap-2">
          <History className="h-4 w-4" />
          Ver historial
        </Button>
      </div>
    </div>
  );
}
