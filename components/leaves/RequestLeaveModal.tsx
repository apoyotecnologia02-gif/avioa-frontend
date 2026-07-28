"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Loader2, Paperclip, AlertCircle } from "lucide-react";
import { countBusinessDays } from "@/lib/business-days";
import {
  LEAVE_TYPE_META,
  type CreateLeaveDto,
  type LeaveType,
  type VacationBalance,
} from "@/types/leaves.types";

interface RequestLeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dto: CreateLeaveDto) => Promise<void>;
  isSubmitting: boolean;
  balance: VacationBalance | null;
}

const TYPE_ORDER: LeaveType[] = [
  "VACACIONES",
  "PERMISO_REMUNERADO",
  "PERMISO_NO_REMUNERADO",
  "INCAPACIDAD_EPS",
  "INCAPACIDAD_ARL",
  "LICENCIA_MATERNIDAD",
  "LICENCIA_PATERNIDAD",
  "LICENCIA_LUTO",
  "LICENCIA_MATRIMONIO",
  "CALAMIDAD_DOMESTICA",
  "OTRO",
];

export function RequestLeaveModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  balance,
}: RequestLeaveModalProps) {
  const [type, setType] = useState<LeaveType>("VACACIONES");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const meta = LEAVE_TYPE_META[type];

  // Preview de días hábiles en vivo
  const businessDays = useMemo(() => {
    if (!startDate || !endDate) return null;
    const [ys, ms, ds] = startDate.split("-").map(Number);
    const [ye, me, de] = endDate.split("-").map(Number);
    const s = new Date(ys, ms - 1, ds);
    const e = new Date(ye, me - 1, de);
    if (e < s) return 0;
    return countBusinessDays(s, e);
  }, [startDate, endDate]);

  const exceedsBalance =
    meta.consumesBalance &&
    businessDays !== null &&
    balance !== null &&
    businessDays > balance.available;

  const reset = () => {
    setType("VACACIONES");
    setStartDate("");
    setEndDate("");
    setReason("");
    setAttachmentUrl("");
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!startDate || !endDate) {
      setError("Selecciona las fechas de inicio y fin");
      return;
    }
    if (endDate < startDate) {
      setError("La fecha de fin no puede ser anterior a la de inicio");
      return;
    }
    if (!reason.trim()) {
      setError("Escribe el motivo de tu solicitud");
      return;
    }
    if (meta.needsAttachment && !attachmentUrl.trim()) {
      setError("Este tipo de ausencia requiere adjuntar el soporte");
      return;
    }
    if (exceedsBalance) {
      setError("No tienes saldo suficiente para estas fechas");
      return;
    }

    try {
      await onSubmit({
        type,
        startDate,
        endDate,
        reason: reason.trim(),
        attachmentUrl: attachmentUrl.trim() || undefined,
      });
      reset();
    } catch {
      /* el hook ya mostró el toast */
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Solicitar ausencia</DialogTitle>
          <DialogDescription>
            Tu líder recibirá la solicitud para aprobarla.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tipo */}
          <div className="space-y-1.5">
            <Label>Tipo de ausencia</Label>
            <Select value={type} onValueChange={(v) => setType(v as LeaveType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_ORDER.map((t) => (
                  <SelectItem key={t} value={t}>
                    {LEAVE_TYPE_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start">Desde</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end">Hasta</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Preview de días hábiles */}
          {businessDays !== null && businessDays > 0 && (
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                exceedsBalance
                  ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-900/20"
                  : "border-primary/20 bg-primary/5 text-foreground"
              }`}
            >
              <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong>{businessDays}</strong> día(s) hábiles
                {meta.consumesBalance && balance && (
                  <>
                    {" · "}
                    <span className="text-muted-foreground">
                      te quedarían {balance.available - businessDays} de{" "}
                      {balance.available}
                    </span>
                  </>
                )}
              </span>
            </div>
          )}

          {/* Motivo */}
          <div className="space-y-1.5">
            <Label htmlFor="reason">Motivo</Label>
            <Textarea
              id="reason"
              rows={3}
              placeholder="Cuéntale a tu líder el motivo de tu ausencia"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Adjunto (solo si el tipo lo requiere) */}
          {meta.needsAttachment && (
            <div className="space-y-1.5">
              <Label htmlFor="attachment" className="flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" />
                Soporte (URL del documento)
              </Label>
              <Input
                id="attachment"
                type="url"
                placeholder="https://..."
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Adjunta la incapacidad o soporte médico.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
