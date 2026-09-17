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
import { Checkbox } from "../ui/checkbox";
import { useGetLeaders } from "@/hooks/useGetLeaders";
import { User } from "@/types/auth.types";

interface RequestLeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dto: CreateLeaveDto) => Promise<void>;
  isSubmitting: boolean;
  balance: VacationBalance | null;
  user: User | null;
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
  "DILIGENCIA_PERSONAL",
  "OBLIGACION_COMO_ACUDIENTE",
  "CITA_MEDICA_PARTICULAR",
  "OTRO",
];

export function RequestLeaveModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  balance,
  user,
}: RequestLeaveModalProps) {
  const [type, setType] = useState<LeaveType>("VACACIONES");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [esCompensada, setEsCompensada] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderId, setLeaderId] = useState("");

  const { requests: leaders } = useGetLeaders();

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

    if (!user?.leaderId && !leaderId) {
      setError("Selecciona un líder");
      return;
    }

    try {
      await onSubmit({
        type,
        startDate,
        endDate,
        esCompensada,
        reason: reason.trim(),
        attachmentUrl: attachmentUrl.trim() || undefined,
        leaderId: leaderId.trim() || undefined,
      });
      reset();
    } catch {
      /* el hook ya mostró el toast */
    }
  };

  const defaultLeaderId = user?.leaderId;
  const isLeaderRequired = !defaultLeaderId && !leaderId;
  const hasLeaders = leaders.length > 0;

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

          {/* compensacion en dinero (solo si el tipo es VACACIONES) */}
          {/* {type === "VACACIONES" && (
            <div className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5">
              <Checkbox
                id="es-compensada"
                checked={esCompensada}
                onCheckedChange={(checked) => setEsCompensada(!!checked)}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor="es-compensada"
                  className="text-sm font-medium leading-none"
                >
                  Prefiero que me las paguen en dinero
                </Label>
                <p className="text-xs text-muted-foreground">
                  Si la marcas, seguirás trabajando estos días y recibirás el
                  pago correspondiente en tu nómina. Si no lo marcas, se
                  registran como días de descanso.
                </p>
              </div>
            </div>
          )} */}

          {/* Fechas */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          {hasLeaders && (
            <div className="space-y-1.5">
              <Label htmlFor="leader">
                Lider (Si necesitas enviarle la solicitud a otro lider)
              </Label>
              <Select
                value={leaderId}
                onValueChange={(leaderId) => setLeaderId(leaderId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un lider" />
                </SelectTrigger>
                <SelectContent>
                  {leaders.map(({ userId, name }) => (
                    <SelectItem key={userId} value={userId}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {user?.leaderName && !leaderId && defaultLeaderId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Usando tu líder asignado:{" "}
                  <span className="font-medium text-foreground">
                    {user.leaderName}
                  </span>
                </p>
              )}
              {isLeaderRequired && !leaderId && (
                <p className="text-xs text-destructive mt-1">
                  No tienes un líder asignado. Selecciona uno para continuar.
                </p>
              )}
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
