"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Inbox, CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import { LEAVE_TYPE_META, type LeaveRequest } from "@/types/leaves.types";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import { isHoliday } from "@/lib/business-days";

interface TeamLeavesViewProps {
  leaves: LeaveRequest[];
  isLoading: boolean;
  onReviewClick: (leave: LeaveRequest) => void;
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}

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
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function TeamLeavesView({
  leaves,
  isLoading,
  onReviewClick,
}: TeamLeavesViewProps) {
  const pending = leaves.filter((l) => l.status === "PENDING");

  return (
    <Tabs defaultValue="inbox" className="w-full">
      <TabsList>
        <TabsTrigger value="inbox" className="gap-1.5">
          <Inbox className="h-4 w-4" />
          Bandeja
          {pending.length > 0 && (
            <span className="ml-1 rounded-full bg-amber-100 px-1.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {pending.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="calendar" className="gap-1.5">
          <CalendarRange className="h-4 w-4" />
          Calendario de equipo
        </TabsTrigger>
      </TabsList>

      {/* --- BANDEJA --- */}
      <TabsContent value="inbox" className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
            <Inbox className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No hay solicitudes</p>
            <p className="text-xs text-muted-foreground">
              Cuando tu equipo solicite ausencias, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pendientes primero */}
            {[...leaves]
              .sort((a, b) =>
                a.status === "PENDING" && b.status !== "PENDING" ? -1 : 1,
              )
              .map((leave) => {
                const meta = LEAVE_TYPE_META[leave.type];
                return (
                  <div
                    key={leave.leaveRequestId}
                    className="flex items-center gap-3 rounded-xl border bg-card p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {leave.user?.name?.charAt(0) ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {leave.user?.name}
                        </p>
                        <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                        <span className="truncate text-xs text-muted-foreground">
                          {meta.short}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {fmt(leave.startDate)} – {fmt(leave.endDate)} ·{" "}
                        {leave.businessDays}d
                      </p>
                    </div>
                    {leave.status === "PENDING" ? (
                      <Button size="sm" onClick={() => onReviewClick(leave)}>
                        Revisar
                      </Button>
                    ) : (
                      <LeaveStatusBadge status={leave.status} />
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </TabsContent>

      {/* --- CALENDARIO DE EQUIPO --- */}
      <TabsContent value="calendar" className="mt-4">
        <TeamCalendar leaves={leaves} />
      </TabsContent>
    </Tabs>
  );
}

function TeamCalendar({ leaves }: { leaves: LeaveRequest[] }) {
  const [cursor, setCursor] = useState(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const dayMap = useMemo(() => {
    const map = new Map<string, LeaveRequest[]>();

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
        const k = toKey(cur);
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(leave);
        cur.setDate(cur.getDate() + 1);
      }
    }

    return map;
  }, [leaves]);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: Array<Date | null> = [];

    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 0; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [year, month]);

  return (
    <div className="rounded-xl border bg-card p-4">
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

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const people = dayMap.get(toKey(date)) ?? [];
          const weekend = date.getDay() === 0 || date.getDay() === 6;
          const holiday = isHoliday(date);
          return (
            <div
              key={i}
              className={`min-h-[52px] rounded-lg border p-1 text-xs ${
                weekend || holiday
                  ? "border-transparent bg-muted/30"
                  : "border-border/50"
              }`}
            >
              <span className="text-muted-foreground">{date.getDate()}</span>
              <div className="mt-0.5 flex flex-wrap gap-0.5">
                {people.slice(0, 3).map((p, j) => {
                  const meta = LEAVE_TYPE_META[p.type];
                  return (
                    <span
                      key={j}
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-medium ${meta.accent}`}
                      title={`${p.user?.name} · ${meta.short}`}
                    >
                      {p.user?.name?.charAt(0) ?? "?"}
                    </span>
                  );
                })}
                {people.length > 3 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{people.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
        Cada círculo es una persona ausente ese día. Úsalo para ver traslapes
        antes de aprobar.
      </p>
    </div>
  );
}
