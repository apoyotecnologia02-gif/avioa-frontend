"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isHoliday } from "@/lib/business-days";
import { LEAVE_TYPE_META, type LeaveRequest } from "@/types/leaves.types";

interface LeaveCalendarProps {
  leaves: LeaveRequest[];
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function LeaveCalendar({ leaves }: LeaveCalendarProps) {
  const [cursor, setCursor] = useState(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Mapa fecha -> solicitud (solo aprobadas y pendientes, no rechazadas)
  const dayMap = useMemo(() => {
    const map = new Map<string, LeaveRequest>();
    for (const leave of leaves) {
      if (leave.status === "REJECTED" || leave.status === "CANCELLED") continue;
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const cur = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      );
      while (cur <= end) {
        map.set(toKey(cur), leave);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [leaves]);

  // Construir la grilla del mes (empezando en lunes)
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: Array<{ date: Date | null }> = [];
    for (let i = 0; i < startOffset; i++) arr.push({ date: null });
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({ date: new Date(year, month, d) });
    }
    return arr;
  }, [year, month]);

  const todayKey = toKey(new Date());

  return (
    <div className="rounded-xl border bg-card p-4">
      {/* Header de navegación */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">
          {MONTHS[month]} {year}
        </p>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grilla */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={i} />;
          const k = toKey(cell.date);
          const leave = dayMap.get(k);
          const meta = leave ? LEAVE_TYPE_META[leave.type] : null;
          const weekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
          const holiday = isHoliday(cell.date);
          const isToday = k === todayKey;

          return (
            <div
              key={i}
              className={`relative aspect-square rounded-lg border text-center text-sm ${
                meta
                  ? `${meta.accent} font-medium`
                  : weekend || holiday
                    ? "border-transparent bg-muted/30 text-muted-foreground"
                    : "border-transparent"
              }`}
              title={
                leave
                  ? `${meta?.label} · ${leave.status === "PENDING" ? "Pendiente" : "Aprobada"}`
                  : holiday
                    ? "Festivo"
                    : undefined
              }
            >
              <span
                className={`absolute inset-0 flex items-center justify-center ${
                  isToday ? "font-bold" : ""
                }`}
              >
                {cell.date.getDate()}
              </span>
              {isToday && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
              {leave?.status === "PENDING" && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-primary/20 border border-primary/30" />
          Ausencia
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-muted/50" />
          Fin de semana / festivo
        </span>
      </div>
    </div>
  );
}
