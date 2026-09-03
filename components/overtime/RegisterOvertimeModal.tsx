"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock, Moon } from "lucide-react";
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
import { useAuthStore } from "@/store/authStore";
import { OvertimeEntry } from "./OvertimeCalendar";

const overtimeSchema = z
  .object({
    date: z.string().min(1, "La fecha es obligatoria"),
    startTime: z
      .string()
      .min(1, "La hora de inicio es requerida")
      .regex(/^\d{2}:\d{2}$/, "Formato HH:mm"),
    endTime: z
      .string()
      .min(1, "La hora de fin es requerida")
      .regex(/^\d{2}:\d{2}$/, "Formato HH:mm"),
    description: z
      .string()
      .min(3, "La descripción es requerida")
      .max(500, "La descripción no puede superar los 500 caracteres"),
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
  existingRequests?: OvertimeEntry[];
}

function hasOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && startB < endA;
}

export function RegisterOvertimeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  leaders,
  leaderId: defaultLeaderId,
  existingRequests,
}: RegisterOvertimeModalProps) {
  const { user } = useAuthStore();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<OvertimeFormData>({
    resolver: zodResolver(overtimeSchema),
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
      description: "",
      leaderId: defaultLeaderId || "",
    },
    mode: "onChange",
  });

  const watchDate = watch("date");
  const watchStart = watch("startTime");
  const watchEnd = watch("endTime");
  const watchLeaderId = watch("leaderId");

  const totalHours = calcHours(watchStart, watchEnd);
  const crossesMidnight = watchStart && watchEnd && watchStart >= watchEnd;

  useEffect(() => {
    if (!watchDate || !watchStart || !watchEnd) {
      clearErrors("startTime");
      return;
    }

    let newStart = new Date(`${watchDate}T${watchStart}:00-05:00`);
    let newEnd = new Date(`${watchDate}T${watchEnd}:00-05:00`);

    if (newEnd <= newStart) {
      newEnd = addDays(newEnd, 1);
    }

    const activeRequests = existingRequests?.filter(
      (req) => req.status !== "REJECTED",
    );

    // const overlap = existingRequests?.some((req) => {
    //   if (req.status === "REJECTED") return false;

    //   return hasOverlap(
    //     newStart,
    //     newEnd,
    //     new Date(req.startTime),
    //     new Date(req.endTime),
    //   );
    // });

    const overlap = activeRequests?.some((req) => {
      const reqStart = new Date(req.startTime);
      const reqEnd = new Date(req.endTime);
      return hasOverlap(newStart, newEnd, reqStart, reqEnd);
    });

    if (overlap) {
      setError("startTime", {
        type: "manual",
        message:
          "Ya tienes una solicitud de horas extra en este rango de tiempo.",
      });
    } else {
      clearErrors("startTime");
    }
  }, [
    watchDate,
    watchStart,
    watchEnd,
    existingRequests,
    setError,
    clearErrors,
  ]);

  useEffect(() => {
    if (isOpen) {
      reset({ date: "", startTime: "", endTime: "", description: "" });
      setServerError(null);
    }
  }, [isOpen, reset]);

  const selectedDate = watchDate
    ? new Date(watchDate + "T12:00:00")
    : undefined;
  const isToday = selectedDate ? isSameDay(selectedDate, new Date()) : false;
  const dateError =
    watchDate && !isToday
      ? "Solo puedes registrar horas para el día de hoy"
      : "";

  const onFormSubmit = async (data: OvertimeFormData) => {
    const payload: CreateOvertimeDto & { leaderId?: string } = {
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      description: data.description,
      leaderId: data.leaderId,
    };
    try {
      setServerError(null);
      await onSubmit(data);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  // const selectedDate = watchDate
  //   ? new Date(watchDate + "T12:00:00")
  //   : undefined;

  // const dateError =
  //   selectedDate && !isSameDay(selectedDate, new Date())
  //     ? "Solo puedes registrar horas para el día de hoy."
  //     : "";

  const isLeaderRequired = !defaultLeaderId;

  return (
    // <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    //   <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
    //     <DialogHeader>
    //       <DialogTitle>Registrar Horas Extra</DialogTitle>
    //       <DialogDescription>
    //         Completa los datos para registrar tus horas extra. Tu líder recibirá
    //         la solicitud para revisión.
    //       </DialogDescription>
    //     </DialogHeader>

    //     <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 py-2">
    //       <FieldGroup className="flex flex-col gap-5">
    //         {/* Date */}
    //         <Field>
    //           <FieldLabel htmlFor="date">Fecha</FieldLabel>
    //           <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
    //             <PopoverTrigger asChild>
    //               <Button
    //                 id="date"
    //                 variant="outline"
    //                 className={cn(
    //                   "w-full justify-start text-left font-normal",
    //                   !watchDate && "text-muted-foreground",
    //                 )}
    //               >
    //                 <CalendarIcon className="mr-2 h-4 w-4" />
    //                 {watchDate
    //                   ? format(selectedDate!, "d 'de' MMMM yyyy", {
    //                       locale: es,
    //                     })
    //                   : "Selecciona una fecha"}
    //               </Button>
    //             </PopoverTrigger>
    //             <PopoverContent className="w-auto p-0" align="start">
    //               <Calendar
    //                 mode="single"
    //                 selected={selectedDate}
    //                 onSelect={(d) => {
    //                   if (d) {
    //                     setValue("date", format(d, "yyyy-MM-dd"), {
    //                       shouldValidate: true,
    //                     });
    //                     setCalendarOpen(false);
    //                   }
    //                 }}
    //                 initialFocus
    //               />
    //             </PopoverContent>
    //           </Popover>
    //           {errors.date && (
    //             <p className="text-xs text-destructive mt-1">
    //               {errors.date.message}
    //             </p>
    //           )}
    //           {dateError && (
    //             <p className="text-xs text-destructive mt-1">{dateError}</p>
    //           )}
    //         </Field>

    //         {/* Start / End time */}
    //         <div className="grid grid-cols-2 gap-4">
    //           <Field>
    //             <FieldLabel htmlFor="startTime">Hora de inicio</FieldLabel>
    //             <Input id="startTime" type="time" {...register("startTime")} />
    //             {errors.startTime && (
    //               <p className="text-xs text-destructive mt-1">
    //                 {errors.startTime.message}
    //               </p>
    //             )}
    //           </Field>
    //           <Field>
    //             <FieldLabel htmlFor="endTime">Hora de fin</FieldLabel>
    //             <Input id="endTime" type="time" {...register("endTime")} />
    //             {errors.endTime && (
    //               <p className="text-xs text-destructive mt-1">
    //                 {errors.endTime.message}
    //               </p>
    //             )}
    //           </Field>
    //         </div>

    //         {/* Live hours preview */}
    //         {totalHours > 0 && (
    //           <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
    //             <Clock className="h-4 w-4 text-primary shrink-0" />
    //             <p className="text-sm font-semibold text-primary">
    //               Total estimado: {totalHours.toFixed(2)} horas
    //             </p>
    //           </div>
    //         )}

    //         {/* Description */}
    //         <Field>
    //           <FieldLabel htmlFor="description">
    //             Descripción / Actividad
    //           </FieldLabel>
    //           <Textarea
    //             id="description"
    //             placeholder="Describe la actividad o motivo de las horas extra..."
    //             className="min-h-[90px] resize-none"
    //             {...register("description")}
    //           />
    //           {errors.description && (
    //             <p className="text-xs text-destructive mt-1">
    //               {errors.description.message}
    //             </p>
    //           )}
    //         </Field>

    //         <div className="md:col-span-2">
    //           {user?.leaderName ? (
    //             <p className="text-sm text-muted-foreground">
    //               Tu líder asociado es{" "}
    //               <span className="font-semibold text-foreground">
    //                 {user.leaderName}.{" "}
    //               </span>
    //               Puedes seleccionar otro líder si lo deseas.
    //             </p>
    //           ) : (
    //             <p className="text-sm text-destructive font-medium">
    //               No tienes un líder asignado. Por favor selecciona uno para
    //               enviar tu solicitud.
    //             </p>
    //           )}
    //         </div>

    //         {/* SELECTOR DE LIDERES */}
    //         <Field>
    //           <FieldLabel>Selecciona a tu lider</FieldLabel>
    //           <Select
    //             onValueChange={(leaderId) => {
    //               setValue("leaderId", leaderId);
    //             }}
    //           >
    //             <SelectTrigger>
    //               <SelectValue placeholder="Selecciona un lider" />
    //             </SelectTrigger>
    //             <SelectContent>
    //               {leaders.map((leader) => (
    //                 <SelectItem key={leader.userId} value={leader.userId}>
    //                   {leader.name}
    //                 </SelectItem>
    //               ))}
    //             </SelectContent>
    //           </Select>
    //         </Field>

    //         {/* Server error */}
    //         {serverError && (
    //           <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2 border border-destructive/20">
    //             {serverError}
    //           </p>
    //         )}
    //       </FieldGroup>

    //       <DialogFooter>
    //         <Button
    //           type="button"
    //           variant="outline"
    //           onClick={onClose}
    //           disabled={isSubmitting}
    //         >
    //           Cancelar
    //         </Button>
    //         <Button
    //           type="submit"
    //           disabled={
    //             isSubmitting ||
    //             !isValid ||
    //             (!user?.leaderId && !watch("leaderId")) ||
    //             dateError
    //               ? true
    //               : false
    //           }
    //         >
    //           {isSubmitting ? "Guardando..." : "Guardar"}
    //         </Button>
    //       </DialogFooter>
    //     </form>
    //   </DialogContent>
    // </Dialog>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Modal más ancho */}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Registrar Horas Extra
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Completa los datos para solicitar horas extra. Tu líder recibirá la
            notificación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel htmlFor="date" className="font-medium">
                Fecha <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="flex flex-wrap items-center gap-2">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal min-w-[180px]",
                        !watchDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
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
                      disabled={(date) => !isSameDay(date, new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    setValue("date", format(today, "yyyy-MM-dd"), {
                      shouldValidate: true,
                    });
                    setCalendarOpen(false);
                  }}
                  className="shrink-0 px-3 py-1 text-sm"
                >
                  Hoy
                </Button>
              </div>
              {errors.date && (
                <p className="text-xs text-destructive mt-1">
                  {errors.date.message}
                </p>
              )}
              {dateError && (
                <p className="text-xs text-destructive mt-1">{dateError}</p>
              )}
            </Field>

            {/* HORAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field>
                <FieldLabel
                  htmlFor="startTime"
                  className="font-medium whitespace-nowrap"
                >
                  Hora de inicio <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="startTime"
                  type="time"
                  step="900"
                  className="w-full"
                  {...register("startTime")}
                />
                {errors.startTime && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.startTime.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel
                  htmlFor="endTime"
                  className="font-medium whitespace-nowrap"
                >
                  Hora de fin <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="endTime"
                  type="time"
                  step="900"
                  className="w-full"
                  {...register("endTime")}
                />
                {errors.endTime && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.endTime.message}
                  </p>
                )}
              </Field>
            </div>

            {/* RESUMEN DE HORAS */}
            {totalHours > 0 && (
              <div
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3",
                  crossesMidnight
                    ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700"
                    : "bg-primary/5 border-primary/20",
                )}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-semibold">
                    Total estimado:{" "}
                    <span className="text-primary">
                      {totalHours.toFixed(2)} horas
                    </span>
                  </span>
                </div>
                {crossesMidnight && (
                  <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                    <Moon className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      Cruza medianoche
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* DESCRIPCIÓN */}
            <Field>
              <FieldLabel htmlFor="description" className="font-medium">
                Descripción / Actividad{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea
                id="description"
                placeholder="Describe brevemente la actividad realizada..."
                className="min-h-[90px] resize-none"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </Field>

            {/* LÍDER */}
            {leaders.length > 0 && (
              <Field>
                <FieldLabel className="font-medium">
                  Líder{" "}
                  {isLeaderRequired && (
                    <span className="text-destructive">*</span>
                  )}
                </FieldLabel>
                <Select
                  value={watchLeaderId}
                  onValueChange={(val) =>
                    setValue("leaderId", val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un líder" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaders.map((leader) => (
                      <SelectItem key={leader.userId} value={leader.userId}>
                        {leader.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {user?.leaderName && !watchLeaderId && defaultLeaderId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Usando tu líder asignado:{" "}
                    <span className="font-medium text-foreground">
                      {user.leaderName}
                    </span>
                  </p>
                )}
                {isLeaderRequired && !watchLeaderId && (
                  <p className="text-xs text-destructive mt-1">
                    No tienes un líder asignado. Selecciona uno para continuar.
                  </p>
                )}
              </Field>
            )}

            {/* ERROR DEL SERVIDOR */}
            {serverError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {serverError}
              </div>
            )}
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !isValid ||
                (isLeaderRequired && !watchLeaderId) || // Solo requerido si no tiene líder por defecto
                !!dateError ||
                !watchDate ||
                !watchStart ||
                !watchEnd
              }
            >
              {isSubmitting ? "Guardando..." : "Enviar solicitud"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
