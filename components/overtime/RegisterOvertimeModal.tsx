"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { CreateOvertimeDto } from "@/types/overtime.types";
import { LeadersData } from "@/hooks/useGetLeaders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const overtimeSchema = z
  .object({
    date: z.string().min(1, "La fecha es requerida"),
    startTime: z
      .string()
      .min(1, "La hora de inicio es requerida")
      .regex(/^\d{2}:\d{2}$/, "Formato HH:mm"),
    endTime: z
      .string()
      .min(1, "La hora de fin es requerida")
      .regex(/^\d{2}:\d{2}$/, "Formato HH:mm"),
    description: z.string().min(3, "La descripción es requerida"),
    leaderId: z.string().optional(),
  })
  .refine(
    (d) => {
      if (!d.startTime || !d.endTime) return true;
      return d.endTime > d.startTime;
    },
    {
      message: "La hora de fin debe ser mayor a la hora de inicio",
      path: ["endTime"],
    },
  );

type OvertimeFormData = z.infer<typeof overtimeSchema>;

function calcHours(start: string, end: string): number {
  if (!start || !end || end <= start) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

interface RegisterOvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateOvertimeDto) => Promise<void>;
  isSubmitting: boolean;
  leaders: LeadersData[];
  leaderId?: string;
}

export function RegisterOvertimeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  leaders,
  leaderId,
}: RegisterOvertimeModalProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<OvertimeFormData>({
    resolver: zodResolver(overtimeSchema),
    defaultValues: { date: "", startTime: "", endTime: "", description: "" },
    mode: "onChange",
  });

  const watchDate = watch("date");
  const watchStart = watch("startTime");
  const watchEnd = watch("endTime");
  const totalHours = calcHours(watchStart, watchEnd);

  useEffect(() => {
    if (isOpen) {
      reset({ date: "", startTime: "", endTime: "", description: "" });
      setServerError(null);
    }
  }, [isOpen, reset]);

  const onFormSubmit = async (data: OvertimeFormData) => {
    try {
      setServerError(null);
      await onSubmit(data as CreateOvertimeDto);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  const selectedDate = watchDate
    ? new Date(watchDate + "T12:00:00")
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Horas Extra</DialogTitle>
          <DialogDescription>
            Completa los datos para registrar tus horas extra. Tu líder recibirá
            la solicitud para revisión.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 py-2">
          <FieldGroup className="grid grid-cols-1 gap-5">
            {/* Date */}
            <Field>
              <FieldLabel htmlFor="date">Fecha</FieldLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchDate
                      ? format(selectedDate!, "d 'de' MMMM yyyy", {
                          locale: es,
                        })
                      : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => {
                      if (d) {
                        setValue("date", format(d, "yyyy-MM-dd"), {
                          shouldValidate: true,
                        });
                        setCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-xs text-destructive mt-1">
                  {errors.date.message}
                </p>
              )}
            </Field>

            {/* Start / End time */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="startTime">Hora de inicio</FieldLabel>
                <Input id="startTime" type="time" {...register("startTime")} />
                {errors.startTime && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.startTime.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="endTime">Hora de fin</FieldLabel>
                <Input id="endTime" type="time" {...register("endTime")} />
                {errors.endTime && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.endTime.message}
                  </p>
                )}
              </Field>
            </div>

            {/* Live hours preview */}
            {totalHours > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm font-semibold text-primary">
                  Total estimado: {totalHours.toFixed(2)} horas
                </p>
              </div>
            )}

            {/* Description */}
            <Field>
              <FieldLabel htmlFor="description">
                Descripción / Actividad
              </FieldLabel>
              <Textarea
                id="description"
                placeholder="Describe la actividad o motivo de las horas extra..."
                className="min-h-[90px] resize-none"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </Field>

            {/* SELECTOR DE LIDERES */}
            {!leaderId && (
              <Field>
                <FieldLabel>Selecciona a tu lider</FieldLabel>
                <Select
                  onValueChange={(leaderId) => {
                    setValue("leaderId", leaderId);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un lider" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaders.map((leader) => (
                      <SelectItem key={leader.userId} value={leader.userId}>
                        {leader.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            {/* Server error */}
            {serverError && (
              <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2 border border-destructive/20">
                {serverError}
              </p>
            )}
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
