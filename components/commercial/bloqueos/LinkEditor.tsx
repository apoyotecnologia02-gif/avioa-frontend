'use client';

import { AlertTriangle, Link2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Block, LinkDraft, Service } from '@/types/block.types';

export interface LinkEditorProps {
  open: boolean;
  service: Service;
  blocks: readonly Block[];
  draft: LinkDraft;
  onChange: (patch: Partial<LinkDraft>) => void;
  onSave: (blockId: string, seats: number) => void | Promise<unknown>;
  onCancel: () => void;
  busy?: boolean;
  error?: string;
  idPrefix?: string;
}

export default function LinkEditor({ open, service, blocks, draft, onChange,
  onSave, onCancel, busy = false, error, idPrefix = 'link-editor' }: LinkEditorProps) {
  const selectedBlock = blocks.find(block => block.id === draft.blockId);
  const seats = draft.seatsText.trim() ? Number(draft.seatsText) : NaN;
  const validSeats = Number.isSafeInteger(seats) && seats >= 1 && seats <= 500;
  const inactive = service.cancelled || !!service.deletedAt;
  const canSave = !!selectedBlock && !selectedBlock.deletedAt && validSeats && !inactive;

  return (
    <Dialog open={open} onOpenChange={next => { if (!next && !busy) onCancel(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
        onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}
        onInteractOutside={event => { if (busy) event.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Link2 className="size-5" aria-hidden="true" />Vincular reserva · {service.avi}</DialogTitle>
          <DialogDescription>Selecciona el bloqueo y confirma los pasajeros que ocupan asiento.</DialogDescription>
        </DialogHeader>
        <form className="space-y-5" aria-busy={busy} onSubmit={event => {
          event.preventDefault();
          if (!busy && canSave) void onSave(draft.blockId, seats);
        }}>
          <p className="break-words text-sm text-muted-foreground">{service.passenger || 'Sin pasajero'} · Referencia: {service.reference || 'Sin referencia'}</p>
          <fieldset disabled={busy || inactive} className="min-w-0 space-y-4">
            <legend className="sr-only">Vinculación de la reserva</legend>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-block`}>Bloqueo</Label>
              <Select value={draft.blockId} required disabled={busy || inactive} onValueChange={blockId => onChange({ blockId })}>
                <SelectTrigger id={`${idPrefix}-block`} className="w-full"><SelectValue placeholder="Selecciona un bloqueo" /></SelectTrigger>
                <SelectContent>{blocks.map(block => (
                  <SelectItem key={block.id} value={block.id} disabled={!!block.deletedAt}>
                    {block.code} · {block.title} · {block.departDate} → {block.returnDate || 'Sin regreso'}
                  </SelectItem>
                ))}</SelectContent>
              </Select>
              {!blocks.length && <p className="text-sm text-muted-foreground">No hay bloqueos disponibles para seleccionar.</p>}
              {!!draft.blockId && !selectedBlock && <p className="text-sm text-destructive">El bloqueo seleccionado ya no está en la lista. Selecciona otro.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-seats`}>Cupos que ocupa esta reserva</Label>
              <Input id={`${idPrefix}-seats`} type="number" inputMode="numeric" min={1} max={500} step={1}
                required value={draft.seatsText} onChange={event => onChange({ seatsText: event.target.value })} />
              <p className="text-xs text-muted-foreground">Entre 1 y 500 pasajeros con asiento. Esta acción puede aumentar o reducir los cupos asignados.</p>
            </div>
          </fieldset>
          <p className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Si la reserva tiene divisiones, revísalas después de cambiar su total. El servidor valida la vinculación y recalcula el inventario.
          </p>
          {inactive && <p role="alert" className="text-sm text-destructive">No se puede vincular una reserva cancelada o eliminada.</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={onCancel}><X className="size-4" aria-hidden="true" />Cancelar</Button>
            <Button type="submit" disabled={busy || !canSave}><Save className="size-4" aria-hidden="true" />{busy ? 'Guardando…' : 'Vincular y confirmar cupos'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
