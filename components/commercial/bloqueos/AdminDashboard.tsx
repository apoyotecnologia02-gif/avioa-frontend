"use client";

import type { ReactNode } from "react";

import {
  AlertTriangle,
  CalendarDays,
  Check,
  CreditCard,
  FileText,
  History,
  Link2,
  Search,
  Send,
  ShieldAlert,
  Split,
  Upload,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AdminBlock,
  Alert,
  Attachment,
  Block,
  BlockingEvent,
  Filters,
  Service,
  Tab,
  TaskKind,
} from "@/types/block.types";

export type AdminTab = Extract<
  Tab,
  "reservations" | "paymentAlerts" | "dataAlerts" | "history"
>;
export type AdminFilters = Pick<
  Filters,
  "search" | "arrival" | "inbox" | "selected" | "allDates" | "reviewOnly"
>;

export interface AdminDashboardProps {
  /** Reservas del board, sin prefiltrar; los filtros se derivan de estas props. */
  services: readonly Service[];
  alerts: readonly Alert[];
  events: readonly BlockingEvent[];
  blocks: readonly Block[];
  files: readonly Attachment[];
  canEdit: boolean;
  canAdmin: boolean;
  /** Fecha YYYY-MM-DD de board.today, calculada por el backend. */
  today: string;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  filters: AdminFilters;
  onFiltersChange: (patch: Partial<AdminFilters>) => void;
  onLink: (service: Service) => void;
  onSplit: (service: Service) => void;
  onReview: (service: Service) => void | Promise<unknown>;
  onUpload: (
    file: File,
    blockId: string,
    kind: TaskKind,
  ) => void | Promise<unknown>;
  /** Sin soporte, esta función debe solicitar confirmación expresa en el padre. */
  onCompleteTask: (
    block: AdminBlock,
    kind: TaskKind,
    reopen?: boolean,
  ) => void | Promise<unknown>;
  /** Prefijo único si se monta más de una instancia en la página. */
  idPrefix?: string;
}

const isAdminBlock = (block: Block): block is AdminBlock =>
  "revision" in block && "signature" in block;
const isAdminTab = (value: string): value is AdminTab =>
  value === "reservations" ||
  value === "paymentAlerts" ||
  value === "dataAlerts" ||
  value === "history";
const formatDay = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value || "Sin fecha";
};
const formatStamp = (value: string | null): string => {
  if (!value || !Number.isFinite(Date.parse(value))) return "Sin registro";
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};
const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const actionLabels: Record<string, string> = {
  adjust_inventory: "Cupos ajustados",
  split_reservation: "División de pasajeros",
  review_reservation: "Reserva revisada",
  manual_reservation: "Reserva manual creada",
  delete_manual_reservation: "Reserva manual eliminada",
  delete_block: "Bloqueo eliminado",
  drive_import: "Saldo inicial de Drive importado",
  api: "Reserva actualizada desde TC",
  edit_block: "Bloqueo editado",
  create_block: "Bloqueo creado",
  link: "Reserva vinculada",
  complete_payment: "Pago completado",
  reopen_payment: "Pago reabierto",
  complete_names: "Datos enviados",
  reopen_names: "Envío de datos reabierto",
  attachment: "Soporte adjuntado",
  source_not_seen: "Reserva pendiente de verificar en TC",
};

function Empty({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground"
    >
      {children}
    </div>
  );
}

function ReservationFilters({
  filters,
  blocks,
  onChange,
  idPrefix,
}: {
  filters: AdminFilters;
  blocks: readonly Block[];
  onChange: AdminDashboardProps["onFiltersChange"];
  idPrefix: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Filtros de reservas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-search`}>Buscar</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={`${idPrefix}-search`}
              className="pl-9"
              value={filters.search}
              placeholder="AVI, pasajero, asesor o código"
              onChange={(event) => onChange({ search: event.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-arrival`}>Origen de la reserva</Label>
          <Select
            value={filters.arrival}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "after" ||
                value === "before" ||
                value === "unknown" ||
                value === "manual"
              )
                onChange({ arrival: value });
            }}
          >
            <SelectTrigger id={`${idPrefix}-arrival`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="after">
                Posteriores a la integración
              </SelectItem>
              <SelectItem value="before">
                Anteriores a la integración
              </SelectItem>
              <SelectItem value="unknown">Fecha por confirmar</SelectItem>
              <SelectItem value="manual">Manuales</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-inbox`}>Estado de revisión</Label>
          <Select
            value={filters.inbox}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "pending" ||
                value === "new" ||
                value === "changed" ||
                value === "reviewed"
              )
                onChange({ inbox: value });
            }}
          >
            <SelectTrigger id={`${idPrefix}-inbox`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="new">Nuevas</SelectItem>
              <SelectItem value="changed">Con cambios</SelectItem>
              <SelectItem value="reviewed">Revisadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-block`}>Bloqueo</Label>
          <Select
            value={filters.selected ?? "__all__"}
            onValueChange={(value) =>
              onChange({ selected: value === "__all__" ? null : value })
            }
          >
            <SelectTrigger id={`${idPrefix}-block`} className="w-full">
              <SelectValue placeholder="Todos los bloqueos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos los bloqueos</SelectItem>
              {blocks.map((block) => (
                <SelectItem key={block.id} value={block.id}>
                  {block.code} · {formatDay(block.departDate)}
                </SelectItem>
              ))}
              {filters.selected &&
                !blocks.some((block) => block.id === filters.selected) && (
                  <SelectItem value={filters.selected}>
                    Bloqueo no disponible
                  </SelectItem>
                )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2 xl:col-span-4">
          <Button
            type="button"
            variant={filters.allDates ? "secondary" : "outline"}
            aria-pressed={filters.allDates}
            onClick={() => onChange({ allDates: !filters.allDates })}
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            Histórico, canceladas y sin fecha
          </Button>
          <Button
            type="button"
            variant={filters.reviewOnly ? "secondary" : "outline"}
            aria-pressed={filters.reviewOnly}
            onClick={() => onChange({ reviewOnly: !filters.reviewOnly })}
          >
            <AlertTriangle className="size-4" aria-hidden="true" />
            Solo pendientes de vinculación
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onChange({
                search: "",
                arrival: "all",
                inbox: "all",
                selected: null,
                allDates: false,
                reviewOnly: false,
              })
            }
          >
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewBadge({ service }: { service: Service }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge
        variant={service.reviewState === "reviewed" ? "secondary" : "outline"}
      >
        {service.reviewState === "reviewed"
          ? "Revisada"
          : service.reviewState === "changed"
            ? "Con cambios"
            : "Nueva"}
      </Badge>
      <Badge
        variant={
          service.cancelled || service.deletedAt ? "destructive" : "outline"
        }
      >
        {service.deletedAt
          ? "Eliminada"
          : service.cancelled
            ? "Cancelada"
            : service.confirmed
              ? "Confirmada"
              : service.status || "Por confirmar"}
      </Badge>
      {service.splitStale && (
        <Badge variant="destructive">Revisar divisiones</Badge>
      )}
    </div>
  );
}

function ReservationActions({
  service,
  canEdit,
  onLink,
  onSplit,
  onReview,
}: {
  service: Service;
  canEdit: boolean;
  onLink: AdminDashboardProps["onLink"];
  onSplit: AdminDashboardProps["onSplit"];
  onReview: AdminDashboardProps["onReview"];
}) {
  if (!canEdit)
    return <span className="text-xs text-muted-foreground">Solo consulta</span>;
  const inactive = service.cancelled || !!service.deletedAt;
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={inactive}
        aria-label={`Vincular ${service.avi}`}
        onClick={() => onLink(service)}
      >
        <Link2 className="size-4" aria-hidden="true" />
        Vincular
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={inactive || !service.splitReady}
        aria-label={`Dividir ${service.avi}`}
        onClick={() => onSplit(service)}
      >
        <Split className="size-4" aria-hidden="true" />
        Dividir
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={service.reviewBlocked || service.reviewState === "reviewed"}
        title={
          service.reviewBlocked
            ? "Revisa la vinculación, los cupos y las divisiones."
            : undefined
        }
        aria-label={`Marcar ${service.avi} revisada`}
        onClick={() => {
          void onReview(service);
        }}
      >
        <Check className="size-4" aria-hidden="true" />
        {service.reviewState === "reviewed" ? "Revisada" : "Marcar revisada"}
      </Button>
    </div>
  );
}

function ReservationsView({
  services,
  blocks,
  canEdit,
  onLink,
  onSplit,
  onReview,
}: {
  services: readonly Service[];
  blocks: readonly Block[];
  canEdit: boolean;
  onLink: AdminDashboardProps["onLink"];
  onSplit: AdminDashboardProps["onSplit"];
  onReview: AdminDashboardProps["onReview"];
}) {
  if (!services.length)
    return <Empty>No hay reservas para estos filtros.</Empty>;
  const blockById = new Map(blocks.map((block) => [block.id, block]));
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>AVI / referencia</TableHead>
              <TableHead>Pasajero / asesor</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead>Bloqueo / cupos</TableHead>
              <TableHead>Revisión</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => {
              const block = service.blockId
                ? blockById.get(service.blockId)
                : undefined;
              return (
                <TableRow key={service.id}>
                  <TableCell className="max-w-52 whitespace-normal align-top">
                    <p className="break-words font-semibold">
                      {service.avi || "Sin AVI"}
                    </p>
                    <p className="break-words text-xs text-muted-foreground">
                      {service.reference || "Sin referencia"}
                    </p>
                    {service.source === "manual" && (
                      <Badge variant="outline" className="mt-1">
                        Manual
                      </Badge>
                    )}
                    {service.splits.length > 0 && (
                      <p className="mt-2 break-words text-xs">
                        Divisiones:{" "}
                        {service.splits
                          .map((part) => `${part.code} (${part.passengers})`)
                          .join(", ")}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="max-w-56 whitespace-normal align-top">
                    <p className="break-words font-medium">
                      {service.passenger || "Sin pasajero"}
                    </p>
                    <p className="break-words text-xs text-muted-foreground">
                      Asesor: {service.advisor || "Sin asignar"}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap align-top text-sm">
                    <p>Ida: {formatDay(service.date)}</p>
                    <p>Regreso: {formatDay(service.returnDate)}</p>
                  </TableCell>
                  <TableCell className="max-w-64 whitespace-normal align-top">
                    <p className="font-medium">
                      {block?.code ||
                        (service.blockId
                          ? "Bloqueo no disponible"
                          : "Sin vincular")}
                    </p>
                    {block && (
                      <p className="text-xs text-muted-foreground">
                        {block.title}
                      </p>
                    )}
                    <p className="mt-1 text-xs">
                      {service.seats === null
                        ? "Cupos por confirmar"
                        : `${service.seats} cupos`}
                    </p>
                    {service.reason && (
                      <p className="mt-2 flex items-start gap-1 text-xs text-amber-700 dark:text-amber-400">
                        <AlertTriangle
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        {service.reason}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="max-w-56 whitespace-normal align-top">
                    <ReviewBadge service={service} />
                    {service.reviewedAt && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {service.reviewedBy || "Sin responsable"} ·{" "}
                        {formatStamp(service.reviewedAt)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="min-w-64 align-top">
                    <ReservationActions
                      service={service}
                      canEdit={canEdit}
                      onLink={onLink}
                      onSplit={onSplit}
                      onReview={onReview}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="border-t p-3 text-xs text-muted-foreground">
        Los cupos se cuentan una vez por AVI y bloqueo. Los tramos de ida y
        regreso no duplican la venta.
      </p>
    </div>
  );
}

function TaskCard({
  block,
  kind,
  due,
  files,
  services,
  canEdit,
  onUpload,
  onCompleteTask,
  idPrefix,
}: {
  block: AdminBlock;
  kind: TaskKind;
  due: string;
  files: readonly Attachment[];
  services: readonly Service[];
  canEdit: boolean;
  onUpload: AdminDashboardProps["onUpload"];
  onCompleteTask: AdminDashboardProps["onCompleteTask"];
  idPrefix: string;
}) {
  const supports = files.filter(
    (file) => file.blockId === block.id && file.kind === kind,
  );
  const payment = kind === "payment";
  const complete = payment ? !!block.paidAt : block.namesComplete;
  const staleSplits = services.some(
    (service) =>
      service.blockId === block.id &&
      !service.cancelled &&
      !service.deletedAt &&
      service.splitStale,
  );
  const blocked =
    !payment &&
    (block.unresolved > 0 || block.inventoryUnresolved > 0 || staleSplits);
  const inputId = `${idPrefix}-${kind}-${block.id}-file`;
  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="break-words text-base">
              {block.code} · {block.title}
            </CardTitle>
            <CardDescription>
              Ida {formatDay(block.departDate)} · Regreso{" "}
              {formatDay(block.returnDate)}
            </CardDescription>
          </div>
          <Badge variant={complete ? "secondary" : "outline"}>
            {complete ? "Completado" : "Pendiente"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Fecha límite</dt>
            <dd className="font-semibold">{formatDay(due)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Ventas / disponible</dt>
            <dd>
              {block.sold} / {block.available ?? "Por revisar"}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Último registro</dt>
            <dd>
              {formatStamp(payment ? block.paidAt : block.namesAt)} ·{" "}
              {(payment ? block.paidBy : block.namesBy) || "Sin responsable"}
            </dd>
          </div>
        </dl>
        {blocked && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-300 p-3 text-sm text-amber-800 dark:border-amber-800 dark:text-amber-300">
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            Revisa las reservas, los cupos y las divisiones antes de confirmar
            el envío de datos.
          </p>
        )}
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium">
            <FileText className="size-4" aria-hidden="true" />
            Soportes
          </p>
          {supports.length ? (
            <ul className="space-y-2">
              {supports.map((file) => (
                <li key={file.id} className="rounded-lg border p-2 text-xs">
                  <p className="break-words font-medium">{file.name}</p>
                  <p className="break-words text-muted-foreground">
                    {file.by} · {formatStamp(file.at)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              Sin archivo. Para cerrar una gestión anterior se solicitará
              confirmación expresa.
            </p>
          )}
        </div>
        {canEdit && (
          <div className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor={inputId} className="flex items-center gap-2">
                <Upload className="size-4" aria-hidden="true" />
                Subir archivo de soporte
              </Label>
              <Input
                id={inputId}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (file) void onUpload(file, block.id, kind);
                }}
              />
              <p className="text-xs text-muted-foreground">
                PDF, JPG, PNG o WebP · Máximo 10 MB.
              </p>
            </div>
            <Button
              type="button"
              className="w-full"
              variant={complete ? "outline" : "default"}
              disabled={!complete && blocked}
              onClick={() => {
                void onCompleteTask(block, kind, complete);
              }}
            >
              <Check className="size-4" aria-hidden="true" />
              {complete
                ? "Reabrir gestión"
                : supports.length
                  ? "Confirmar gestión"
                  : "Confirmar gestión anterior"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TasksView({
  kind,
  alerts,
  blocks,
  files,
  services,
  canEdit,
  onUpload,
  onCompleteTask,
  idPrefix,
}: {
  kind: TaskKind;
  alerts: readonly Alert[];
  blocks: readonly Block[];
  files: readonly Attachment[];
  services: readonly Service[];
  canEdit: boolean;
  onUpload: AdminDashboardProps["onUpload"];
  onCompleteTask: AdminDashboardProps["onCompleteTask"];
  idPrefix: string;
}) {
  const selected = [
    ...new Map(
      alerts
        .filter((alert) => alert.kind === kind)
        .map((alert) => [alert.blockId, alert]),
    ).values(),
  ].sort((a, b) => a.due.localeCompare(b.due));
  if (!selected.length)
    return (
      <Empty>
        {kind === "payment"
          ? "No hay alertas de pago pendientes."
          : "No hay alertas de envío de datos pendientes."}
      </Empty>
    );
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {selected.map((alert) => {
        const block = blocks.find((item) => item.id === alert.blockId);
        if (!block || !isAdminBlock(block))
          return (
            <Card key={alert.blockId}>
              <CardContent className="flex items-start gap-2 p-4 text-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
                No se puede mostrar la alerta de {alert.blockId}: faltan los
                datos administrativos del bloqueo.
              </CardContent>
            </Card>
          );
        return (
          <TaskCard
            key={block.id}
            block={block}
            kind={kind}
            due={alert.due}
            files={files}
            services={services}
            canEdit={canEdit}
            onUpload={onUpload}
            onCompleteTask={onCompleteTask}
            idPrefix={idPrefix}
          />
        );
      })}
    </div>
  );
}

function HistoryView({
  events,
  blocks,
}: {
  events: readonly BlockingEvent[];
  blocks: readonly Block[];
}) {
  if (!events.length) return <Empty>No hay movimientos registrados.</Empty>;
  const ordered = [...events].sort(
    (a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id),
  );
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha · Colombia</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Bloqueo / servicio</TableHead>
              <TableHead>Responsable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordered.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="whitespace-nowrap align-top">
                  {formatStamp(event.at)}
                </TableCell>
                <TableCell className="max-w-72 whitespace-normal align-top">
                  {actionLabels[event.action] || event.action}
                </TableCell>
                <TableCell className="max-w-64 whitespace-normal align-top">
                  <p className="break-words">
                    {blocks.find((block) => block.id === event.blockId)?.code ||
                      event.blockId ||
                      "Sin bloqueo"}
                  </p>
                  {event.serviceId && (
                    <p className="break-words text-xs text-muted-foreground">
                      {event.serviceId}
                    </p>
                  )}
                </TableCell>
                <TableCell className="max-w-64 whitespace-normal align-top">
                  <p className="break-words">{event.by}</p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="border-t p-3 text-xs text-muted-foreground">
        Se muestran los {events.length} movimientos recibidos del backend. Los
        filtros de reservas no alteran el historial.
      </p>
    </div>
  );
}

export default function AdminDashboard({
  services,
  alerts,
  events,
  blocks,
  files,
  canEdit,
  canAdmin,
  today,
  activeTab,
  onTabChange,
  filters,
  onFiltersChange,
  onLink,
  onSplit,
  onReview,
  onUpload,
  onCompleteTask,
  idPrefix = "flight-admin",
}: AdminDashboardProps) {
//   if (!canAdmin)
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-base">
//             <ShieldAlert className="size-5" aria-hidden="true" />
//             Administración restringida
//           </CardTitle>
//           <CardDescription>
//             Necesitas permisos administrativos para consultar reservas, soportes
//             e historial.
//           </CardDescription>
//         </CardHeader>
//       </Card>
//     );

  const query = normalize(filters.search.trim());
  const visibleServices = services
    .filter((service) => {
      const departure =
        blocks.find((block) => block.id === service.blockId)?.departDate ||
        service.date;
      const changed = service.reviewState === "changed";
      const inPeriod =
        filters.allDates ||
        changed ||
        ((!service.cancelled || service.reviewState !== "reviewed") &&
          !!departure &&
          departure >= today);
      return (
        (!service.deletedAt || changed || filters.allDates) &&
        inPeriod &&
        (filters.arrival === "all" ||
          service.arrivalGroup === filters.arrival) &&
        (filters.inbox === "all" ||
          (filters.inbox === "pending" && service.reviewState !== "reviewed") ||
          filters.inbox === service.reviewState) &&
        (!filters.selected || service.blockId === filters.selected) &&
        (!filters.reviewOnly ||
          (!service.cancelled &&
            !service.deletedAt &&
            (!service.blockId || !!service.reason))) &&
        (!query ||
          normalize(
            [
              service.avi,
              service.reference,
              service.passenger,
              service.advisor,
              ...service.splits.map((part) => part.code),
            ].join(" "),
          ).includes(query))
      );
    })
    .sort(
      (a, b) =>
        (b.arrivalCreatedAt || b.sourceAt || "").localeCompare(
          a.arrivalCreatedAt || a.sourceAt || "",
        ) || a.id.localeCompare(b.id),
    );
  const pending = new Set(
    services
      .filter((service) => service.reviewState !== "reviewed")
      .map((service) => service.reviewKey),
  ).size;
  const paymentCount = new Set(
    alerts
      .filter((alert) => alert.kind === "payment")
      .map((alert) => alert.blockId),
  ).size;
  const namesCount = new Set(
    alerts
      .filter((alert) => alert.kind === "names")
      .map((alert) => alert.blockId),
  ).size;

  return (
    <section
      className="space-y-5"
      aria-label="Administración de bloqueos JetSMART"
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Administración de bloqueos
        </h1>
        <p className="text-sm text-muted-foreground">
          Reservas, pagos, envío de datos y trazabilidad de gestiones.
        </p>
        {!canEdit && <Badge variant="outline">Solo consulta</Badge>}
      </header>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (isAdminTab(value)) onTabChange(value);
        }}
        className="space-y-5"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 lg:grid-cols-4">
          <TabsTrigger value="reservations" className="gap-2 py-2">
            <Users className="size-4" aria-hidden="true" />
            Reservas <Badge variant="secondary">{pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="paymentAlerts" className="gap-2 py-2">
            <CreditCard className="size-4" aria-hidden="true" />
            Pago bloqueos <Badge variant="secondary">{paymentCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="dataAlerts" className="gap-2 py-2">
            <Send className="size-4" aria-hidden="true" />
            Envío de datos <Badge variant="secondary">{namesCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 py-2">
            <History className="size-4" aria-hidden="true" />
            Historial
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reservations" className="space-y-4">
          <ReservationFilters
            filters={filters}
            blocks={blocks}
            onChange={onFiltersChange}
            idPrefix={idPrefix}
          />
          <p role="status" className="text-sm text-muted-foreground">
            {visibleServices.length} servicios ·{" "}
            {
              new Set(
                visibleServices.map((service) => service.avi || service.id),
              ).size
            }{" "}
            reservas ·{" "}
            {filters.allDates
              ? "Todas las fechas"
              : `Salidas desde ${formatDay(today)} y cambios pendientes de revisión`}
          </p>
          <ReservationsView
            services={visibleServices}
            blocks={blocks}
            canEdit={canEdit}
            onLink={onLink}
            onSplit={onSplit}
            onReview={onReview}
          />
        </TabsContent>
        <TabsContent value="paymentAlerts" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pagos pendientes · Fecha límite: 30 días antes de la salida.
          </p>
          <TasksView
            kind="payment"
            alerts={alerts}
            blocks={blocks}
            files={files}
            services={services}
            canEdit={canEdit}
            onUpload={onUpload}
            onCompleteTask={onCompleteTask}
            idPrefix={idPrefix}
          />
        </TabsContent>
        <TabsContent value="dataAlerts" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Envío de datos pendientes · Fecha límite: 15 días antes de la
            salida.
          </p>
          <TasksView
            kind="names"
            alerts={alerts}
            blocks={blocks}
            files={files}
            services={services}
            canEdit={canEdit}
            onUpload={onUpload}
            onCompleteTask={onCompleteTask}
            idPrefix={idPrefix}
          />
        </TabsContent>
        <TabsContent value="history">
          <HistoryView events={events} blocks={blocks} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
