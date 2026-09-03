"use client";

import { Clock, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { OvertimeSummary } from "@/types/overtime.types";

interface OvertimeSummaryCardsProps {
  summary: OvertimeSummary | null;
  isLoading: boolean;
}

export function OvertimeSummaryCards({
  summary,
  isLoading,
}: OvertimeSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const totalHoursNumber = Number(summary?.totalHours);
  const totalHoursValue = Number.isFinite(totalHoursNumber)
    ? `${totalHoursNumber.toFixed(1)} hrs`
    : "—";

  const cards = [
    {
      label: "Total de horas solicitadas",
      value: totalHoursValue,
      icon: Clock,
      iconClass: "text-primary",
      bgClass: "bg-primary/5 border-primary/20",
      infoIcon: true,
    },
    {
      label: "Pendientes",
      value: summary?.totalPending ?? "—",
      icon: AlertCircle,
      iconClass: "text-amber-500",
      bgClass:
        "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
    },
    {
      label: "Aprobadas",
      value: summary?.totalApproved ?? "—",
      icon: CheckCircle2,
      iconClass: "text-emerald-500",
      bgClass:
        "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
    },
    {
      label: "Rechazadas",
      value: summary?.totalRejected ?? "—",
      icon: XCircle,
      iconClass: "text-red-500",
      bgClass:
        "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const InfoIcon = card.infoIcon ? Info : null;
        return (
          <div
            key={card.label}
            className={`rounded-xl border p-4 flex flex-col gap-2 ${card.bgClass}`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 shrink-0 ${card.iconClass}`} />
              <span className="text-xs font-medium text-muted-foreground">
                {card.label}
              </span>
              {InfoIcon && (
                <div className="relative group w-fit">
                  <InfoIcon className="h-4 w-4 shrink-0 text-primary cursor-pointer" />

                  <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded-md shadow-md whitespace-nowrap z-50">
                    La suma de todas tus horas extra aprobadas, pendientes y
                    rechazadas.
                  </div>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold tracking-tight">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
