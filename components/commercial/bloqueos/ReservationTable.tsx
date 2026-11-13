'use client';

import { AlertTriangle, CalendarDays, Check, Link2, Split } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Block, Service } from '@/types/block.types';

export interface ReservationTableProps {
  services: readonly Service[];
  blocks: readonly Block[];
  onLink: (service: Service) => void;
  onSplit: (service: Service) => void;
  onReview: (service: Service) => void | Promise<unknown>;
  busy?: boolean;
  canEdit?: boolean;
}

const dateLabel = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value || 'Sin fecha';
};

function Status({ service }: { service: Service }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant={service.cancelled ? 'destructive' : service.confirmed ? 'default' : 'secondary'}>
        {service.cancelled ? 'Cancelada' : service.confirmed ? 'Confirmada' : service.status || 'Por confirmar'}
      </Badge>
      <Badge variant="outline">
        {service.reviewState === 'reviewed' ? 'Revisada' : service.reviewState === 'changed' ? 'Con cambios' : 'Nueva'}
      </Badge>
      {service.splitStale && <Badge variant="destructive">Revisar divisiones</Badge>}
      {service.deletedAt && <Badge variant="destructive">Eliminada</Badge>}
    </div>
  );
}

function Actions({ service, busy, canEdit, onLink, onSplit, onReview }: {
  service: Service;
  busy: boolean;
  canEdit: boolean;
  onLink: ReservationTableProps['onLink'];
  onSplit: ReservationTableProps['onSplit'];
  onReview: ReservationTableProps['onReview'];
}) {
  if (!canEdit) return <span className="text-xs text-muted-foreground">Solo consulta</span>;
  const inactive = busy || service.cancelled || !!service.deletedAt;
  const splitDisabled = inactive || !service.splitReady;
  // Las canceladas o eliminadas pueden requerir revisión de su cambio.
  const reviewDisabled = busy || service.reviewBlocked || service.reviewState === 'reviewed';
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" disabled={inactive}
        aria-label={`Vincular o editar cupos de ${service.avi}`} onClick={() => onLink(service)}>
        <Link2 className="size-4" aria-hidden="true" />Vincular
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={splitDisabled}
        title={!service.splitReady ? 'Vincula y confirma los cupos antes de dividir.' : 'Dividir pasajeros sin descontar cupos adicionales.'}
        aria-label={`Dividir pasajeros de ${service.avi}`} onClick={() => onSplit(service)}>
        <Split className="size-4" aria-hidden="true" />Dividir
      </Button>
      <Button type="button" size="sm" variant="secondary" disabled={reviewDisabled}
        title={service.reviewBlocked ? 'Revisa la vinculación y los cupos pendientes.' : undefined}
        aria-label={`Marcar ${service.avi} como revisada`} onClick={() => { void onReview(service); }}>
        <Check className="size-4" aria-hidden="true" />
        {service.reviewState === 'reviewed' ? 'Revisada' : 'Marcar revisada'}
      </Button>
    </div>
  );
}

export default function ReservationTable({ services, blocks, onLink, onSplit, onReview,
  busy = false, canEdit = false }: ReservationTableProps) {
  const blockById = new Map(blocks.map(block => [block.id, block]));
  const actions = (service: Service) => <Actions service={service} busy={busy} canEdit={canEdit}
    onLink={onLink} onSplit={onSplit} onReview={onReview} />;

  if (!services.length) return (
    <div role="status" className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      No hay reservas para estos filtros.
    </div>
  );

  return (
    <section aria-label="Reservas de bloqueos" aria-busy={busy} className="space-y-4">
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table>
          <TableHeader><TableRow>
            <TableHead>AVI</TableHead><TableHead>Pasajero</TableHead><TableHead>Fechas</TableHead>
            <TableHead>Bloqueo</TableHead><TableHead>Estado</TableHead><TableHead>Acciones</TableHead>
          </TableRow></TableHeader>
          <TableBody>{services.map(service => {
            const block = service.blockId ? blockById.get(service.blockId) : undefined;
            return (
              <TableRow key={service.id}>
                <TableCell className="align-top">
                  <p className="font-semibold">{service.avi || 'Sin AVI'}</p>
                  <p className="text-xs text-muted-foreground">{service.reference || 'Sin referencia'}</p>
                  {service.splits.length > 0 && <p className="mt-1 max-w-48 break-words text-xs text-muted-foreground">
                    Divisiones: {service.splits.map(part => `${part.code} (${part.passengers})`).join(', ')}
                  </p>}
                </TableCell>
                <TableCell className="max-w-56 whitespace-normal align-top">
                  <p className="break-words">{service.passenger || 'Sin pasajero'}</p>
                  <p className="text-xs text-muted-foreground">Asesor: {service.advisor || 'Sin asesor'}</p>
                  <p className="mt-1 text-xs">{service.seats === null ? 'Cupos por confirmar' : `${service.seats} cupos`}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap align-top">
                  <p>Ida: {dateLabel(service.date)}</p><p>Regreso: {dateLabel(service.returnDate)}</p>
                </TableCell>
                <TableCell className="max-w-64 whitespace-normal align-top">
                  <p className="font-medium">{block?.code || (service.blockId ? 'Bloqueo no disponible' : 'Sin vincular')}</p>
                  {block && <p className="text-xs text-muted-foreground">{block.title}</p>}
                  {service.reason && <p className="mt-2 flex items-start gap-1 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />{service.reason}
                  </p>}
                </TableCell>
                <TableCell className="max-w-56 whitespace-normal align-top"><Status service={service} /></TableCell>
                <TableCell className="min-w-64 align-top">{actions(service)}</TableCell>
              </TableRow>
            );
          })}</TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">{services.map(service => {
        const block = service.blockId ? blockById.get(service.blockId) : undefined;
        return (
          <article key={service.id} className="min-w-0 space-y-4 rounded-xl border bg-card p-4 text-card-foreground">
            <header className="space-y-2">
              <h3 className="break-words font-semibold">{service.avi || 'Sin AVI'}</h3>
              <Status service={service} />
            </header>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
              <div className="col-span-2"><dt className="text-xs text-muted-foreground">Pasajero</dt>
                <dd className="break-words font-medium">{service.passenger || 'Sin pasajero'}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Asesor</dt><dd className="break-words">{service.advisor || 'Sin asesor'}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Cupos</dt><dd>{service.seats ?? 'Por confirmar'}</dd></div>
              <div><dt className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3" aria-hidden="true" />Ida</dt>
                <dd>{dateLabel(service.date)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Regreso</dt><dd>{dateLabel(service.returnDate)}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-muted-foreground">Bloqueo</dt>
                <dd className="break-words">{block ? `${block.code} · ${block.title}` : service.blockId ? 'Bloqueo no disponible' : 'Sin vincular'}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-muted-foreground">Referencia</dt><dd className="break-words">{service.reference || 'Sin referencia'}</dd></div>
              {service.splits.length > 0 && <div className="col-span-2"><dt className="text-xs text-muted-foreground">Divisiones</dt>
                <dd className="break-words">{service.splits.map(part => `${part.code} (${part.passengers})`).join(', ')}</dd></div>}
            </dl>
            {service.reason && <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />{service.reason}</p>}
            <footer className="border-t pt-3">{actions(service)}</footer>
          </article>
        );
      })}</div>
    </section>
  );
}
