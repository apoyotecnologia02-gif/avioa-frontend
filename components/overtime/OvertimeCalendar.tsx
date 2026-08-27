"use client";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type OvertimeStatus = "APPROVED" | "PENDING" | "REJECTED";
type DayAggStatus = OvertimeStatus | "PARTIAL";

interface OvertimeCalendarProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  daySummaries: DaySummary[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  isLoading?: boolean;
  daysToColor?: {
    dateStr: string;
    status: OvertimeStatus;
  }[];
}

export interface OvertimeEntry {
  overtimeRequestId: string;
  date: string;
  totalHours: number;
  status: OvertimeStatus;
  userId: string;
  description: string;
  startTime: string;
  endTime: string;
  comment?: string;
}

export interface DaySummary {
  date: string;
  totalHours: number;
  entries: OvertimeEntry[];
  description?: string;
}

const STATUS_BADGE: Record<DayAggStatus, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber text-amber-700 border-amber-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  PARTIAL: "bg-purple-50 text-purple-700 border-purple-200",
};

const STATUS_LABEL: Record<DayAggStatus, string> = {
  APPROVED: "Aprobado",
  PENDING: "Pendiente",
  REJECTED: "Rechazado",
  PARTIAL: "Parcial",
};

const STATUS_DOT: Record<OvertimeStatus, string> = {
  APPROVED: "bg-emerald-500",
  PENDING: "bg-amber-500",
  REJECTED: "bg-red-500",
};

const FILTERS: { value: OvertimeStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "APPROVED", label: "Aprobados" },
  { value: "REJECTED", label: "Rechazadas" },
];

function getStatusCounts(summary: DaySummary) {
  const counts = { APPROVED: 0, PENDING: 0, REJECTED: 0 };
  summary.entries.forEach((e) => {
    counts[e.status]++;
  });
  return counts;
}

function getDayStatus(counts: {
  APPROVED: number;
  PENDING: number;
  REJECTED: number;
}): DayAggStatus | null {
  const distincStatuses = Object.values(counts).filter((c) => c > 0).length;
  if (distincStatuses === 0) return null;

  if (counts.PENDING > 0) return "PENDING";
  if (distincStatuses > 1) return "PARTIAL";
  if (counts.APPROVED > 0) return "APPROVED";
  return "REJECTED";
}

function matchesFilter(
  counts: { APPROVED: number; PENDING: number; REJECTED: number },
  filter: OvertimeStatus | "ALL",
) {
  if (filter === "ALL") return true;
  return counts[filter] > 0;
}

function getDominantStatus(summary: DaySummary): OvertimeStatus | null {
  if (!summary.entries?.length) return null;
  if (summary.entries.some((e) => e.status === "PENDING")) return "PENDING";
  if (summary.entries.some((e) => e.status === "REJECTED")) return "REJECTED";
  return "APPROVED";
}

export function OvertimeCalendar({
  currentDate,
  onMonthChange,
  daySummaries,
  selectedDate,
  onSelectDate,
  isLoading,
  daysToColor,
}: OvertimeCalendarProps) {
  const [filter, setFilter] = useState<OvertimeStatus | "ALL">("ALL");

  const summaryMap = useMemo(
    () => new Map(daySummaries.map((s) => [s.date, s])),
    [daySummaries],
  );

  const monthLabel = format(currentDate, "MMMM yyyy", { locale: es });

  const handlePrev = () =>
    onMonthChange(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const handleNext = () =>
    onMonthChange(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const leadingBlanks = (monthStart.getDay() + 6) % 7; // lunes = 0

  const monthTotalHours = daySummaries.reduce(
    (acc, s) => acc + s.totalHours,
    0,
  );

  const listItems = useMemo(() => {
    return daySummaries
      .filter((s) => matchesFilter(getStatusCounts(s), filter))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [daySummaries, filter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
      {/* columna principal */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.value
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : listItems.length ? (
          <div className="flex flex-col gap-2">
            {listItems.map((summary) => {
              // const dominant = getDominantStatus(summary);
              const counts = getStatusCounts(summary);
              const dayStatus = getDayStatus(counts);
              const distinctCount = Object.values(counts).filter(
                (c) => c > 0,
              ).length;
              const isSelected = selectedDate === summary.date;
              const entryCount = summary.entries.length;

              return (
                <button
                  key={summary.date}
                  onClick={() => onSelectDate(isSelected ? "" : summary.date)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border bg-card hover:bg-accent",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                        isSelected ? "bg-primary-foreground/15" : "bg-muted",
                      )}
                    >
                      {format(parseISO(summary.date), "d")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium capitalize truncate">
                        {format(parseISO(summary.date), "EEEE d 'de' MMMM", {
                          locale: es,
                        })}
                      </p>
                      <p
                        className={cn(
                          "text-xs truncate",
                          isSelected
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {entryCount}{" "}
                        {entryCount === 1 ? "solicitud" : "solicitudes"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isSelected
                          ? "text-primary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {summary.totalHours.toFixed(1)}h
                    </span>

                    {!isSelected && distinctCount > 1 ? (
                      <div>
                        {counts.APPROVED > 0 && (
                          <span className="flex items-center gap-0.5 text-[11px] font-medium">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                STATUS_DOT.APPROVED,
                              )}
                            />
                            <span>{counts.APPROVED}</span>
                          </span>
                        )}

                        {counts.PENDING > 0 && (
                          <span className="flex items-center gap-0.5 text-[11px] font-medium">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                STATUS_DOT.PENDING,
                              )}
                            />
                            <span>{counts.PENDING}</span>
                          </span>
                        )}

                        {counts.REJECTED > 0 && (
                          <span className="flex items-center gap-0.5 text-[11px] font-medium">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                STATUS_DOT.REJECTED,
                              )}
                            />
                            <span>{counts.REJECTED}</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      !isSelected &&
                      dayStatus && (
                        <span
                          className={cn(
                            "text-[11px] font-medium border rounded-full px-2 py-0.5",
                            STATUS_BADGE[dayStatus],
                          )}
                        >
                          {STATUS_LABEL[dayStatus]}
                        </span>
                      )
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center rounded-xl border border-dashed border-border">
            <Inbox className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No hay solicitudes{" "}
              {filter !== "ALL" ? STATUS_LABEL[filter].toLowerCase() + "s" : ""}{" "}
              este mes.
            </p>
          </div>
        )}
      </div>

      {/* columna lateral mini calendario + total del mes */}
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handlePrev}
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-semibold capitalize">
              {monthLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleNext}
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[10px] text-muted-foreground text-center mb-1">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {/* {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const status = daysToColor?.find(
                (d) => d.dateStr === dateStr,
              )?.status;
              const isSelected = selectedDate === dateStr;
              const todayDay = isToday(day);

              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDate(isSelected ? "" : dateStr)}
                  className={cn(
                    "h-6 rounded-md text-[10px] flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold"
                      : status
                        ? cn(STATUS_BADGE[status], "font-medium")
                        : todayDay
                          ? "border border-primary/50 text-primary"
                          : "text-muted-foreground hover:bg-accent",
                    !isSameMonth(day, currentDate) && "opacity-30",
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })} */}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const daySummary = summaryMap.get(dateStr);
              const dayStatus = daySummary
                ? getDayStatus(getStatusCounts(daySummary))
                : null;
              const isSelected = selectedDate === dateStr;
              const todayDay = isToday(day);

              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDate(isSelected ? "" : dateStr)}
                  className={cn(
                    "h-6 rounded-md text-[10px] flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold"
                      : dayStatus
                        ? cn(STATUS_BADGE[dayStatus], "font-medium")
                        : todayDay
                          ? "border border-primary/50 text-primary"
                          : "text-muted-foreground hover:bg-accent",
                    !isSameMonth(day, currentDate) && "opacity-30",
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Total del mes
          </p>
          <p className="text-2xl font-bold tracking-tight">
            {monthTotalHours.toFixed(1)} h
          </p>
        </div>
      </div>
    </div>
  );
}
