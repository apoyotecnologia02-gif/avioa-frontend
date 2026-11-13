'use client';

import { Plane, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { BlockData, BlockEditData } from '@/types/block.types';

export interface BlockEditorProps {
  open: boolean;
  data: BlockEditData;
  capacityText: string;
  aliasesText: string;
  onChange: (patch: Partial<BlockData>) => void;
  onFieldsChange: (patch: { capacityText?: string; aliasesText?: string }) => void;
  onSave: () => void | Promise<unknown>;
  onCancel: () => void;
  busy?: boolean;
  error?: string;
  idPrefix?: string;
}

const fields = [
  { name: 'code', label: 'Código del bloqueo', type: 'text', required: true },
  { name: 'title', label: 'Destino / nombre del bloqueo', type: 'text', required: true },
  { name: 'departDate', label: 'Fecha de ida', type: 'date', required: true },
  { name: 'returnDate', label: 'Fecha de regreso', type: 'date', required: false },
  { name: 'departTime', label: 'Hora de ida', type: 'time', required: false },
  { name: 'returnTime', label: 'Hora de regreso', type: 'time', required: false },
  { name: 'origin', label: 'Origen (código de aeropuerto)', type: 'text', required: false },
  { name: 'destination', label: 'Destino (código de aeropuerto)', type: 'text', required: false },
  { name: 'flight', label: 'Número de vuelo de ida', type: 'text', required: false },
] as const;

export default function BlockEditor({ open, data, capacityText, aliasesText,
  onChange, onFieldsChange, onSave, onCancel, busy = false, error,
  idPrefix = 'block-editor' }: BlockEditorProps) {
  const managedByDrive = !!data.drive;
  return (
    <Dialog open={open} onOpenChange={next => { if (!next && !busy) onCancel(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
        onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}
        onInteractOutside={event => { if (busy) event.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plane className="size-5" aria-hidden="true" />
            {data.id ? 'Editar bloqueo' : 'Crear bloqueo'}</DialogTitle>
          <DialogDescription>Completa las fechas, la ruta y el cupo total contratado.</DialogDescription>
        </DialogHeader>
        <form onSubmit={event => { event.preventDefault(); if (!busy && !managedByDrive) void onSave(); }}
          aria-busy={busy} className="space-y-5">
          {managedByDrive && <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
            Este bloqueo se administra desde Drive. Utiliza el editor de inventario para ajustar sus cupos.
          </p>}
          <fieldset disabled={busy || managedByDrive} className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <legend className="sr-only">Datos del bloqueo</legend>
            {fields.map(field => (
              <div key={field.name} className="min-w-0 space-y-2">
                <Label htmlFor={`${idPrefix}-${field.name}`}>{field.label}</Label>
                <Input id={`${idPrefix}-${field.name}`} name={field.name} type={field.type}
                  required={field.required} maxLength={200} value={data[field.name]}
                  min={field.name === 'returnDate' ? data.departDate || undefined : undefined}
                  onChange={event => onChange({ [field.name]: event.target.value })} />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-capacity`}>Cupo total contratado</Label>
              <Input id={`${idPrefix}-capacity`} name="capacity" type="number" inputMode="numeric"
                min={1} max={10000} step={1} required value={capacityText}
                onChange={event => onFieldsChange({ capacityText: event.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-aliases`}>Referencias adicionales de TC (separadas por coma)</Label>
              <Input id={`${idPrefix}-aliases`} name="aliases" value={aliasesText} maxLength={1000}
                onChange={event => onFieldsChange({ aliasesText: event.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-notes`}>Observaciones</Label>
              <Textarea id={`${idPrefix}-notes`} name="notes" rows={4} maxLength={2000}
                value={data.notes} onChange={event => onChange({ notes: event.target.value })} />
            </div>
          </fieldset>
          <p className="text-xs text-muted-foreground">Cambiar la fecha de ida o el cupo contratado reabre las gestiones de pago y datos para revisión.</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
              <X className="size-4" aria-hidden="true" />Cancelar
            </Button>
            <Button type="submit" disabled={busy || managedByDrive}>
              <Save className="size-4" aria-hidden="true" />{busy ? 'Guardando…' : 'Guardar bloqueo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
