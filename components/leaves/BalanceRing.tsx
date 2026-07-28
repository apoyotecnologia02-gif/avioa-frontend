"use client";

import { VacationBalance } from "@/types/leaves.types";
import { Skeleton } from "../ui/skeleton";
import { Info } from "lucide-react";

interface BalanceRingProps {
  balance: VacationBalance | null;
  isLoading: boolean;
}

export function BalanceRing({ balance, isLoading }: BalanceRingProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
        <Skeleton className="h-44 w-44 rounded-full" />
        <div className="flex-1 space-y-3 w-full">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    );
  }

  const accrued = balance?.accrued ?? 0;
  const taken = balance?.taken ?? 0;
  const pending = balance?.pending ?? 0;
  const available = balance?.available ?? 0;

  // El mayot entre devengado y (tomado + pendiente), para que
  // nunca se desborde visualmente aunque haya pendientes que excedan saldo.
  const total = Math.max(accrued, taken + pending, 1);

  const radius = 78;
  const stroke = 16;
  const circumference = 2 * Math.PI * radius;

  const takenLen = (taken / total) * circumference;
  const pendingLen = (pending / total) * circumference;
  const availableLen = (Math.max(available, 0) / total) * circumference;

  const segments = [
    { len: takenLen, color: "var(--color-primary, #0578c8)", offset: 0 },
    {
      len: pendingLen,
      color: "#f59e0b",
      offset: takenLen,
    },
    {
      len: availableLen,
      color: "#10b981",
      offset: takenLen + pendingLen,
    },
  ];

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
      {/* Donut */}
      <div className="relative h-44 w-44 shrink-0">
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={`${available} días de vacaciones disponibles`}
        >
          {/* Pista de fondo */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="text-muted/30"
          />
          {segments.map((seg, i) =>
            seg.len > 0 ? (
              <circle
                key={i}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${seg.len} ${circumference - seg.len}`}
                strokeDashoffset={seg.offset}
                className="transition-all duration-700 ease-out"
              />
            ) : null,
          )}
        </svg>

        {/* centro */}
        <div className="min-w-0 flex-1 w-full space-y-3">
          <LegendRow color="bg-amber-500" label="En trámite" value={pending} />
          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Devengas 15 días hábiles por año trabajado (Art. 186 CST). Has
              acumulado <strong className="text-foreground">{accrued}</strong>{" "}
              días desde tu ingreso.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendRow({
  color,
  label,
  value,
  strong,
}: {
  color: string;
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="flex-1 text-sm text-muted-foreground">{label}</span>
      <span
        className={`tabular-nums ${
          strong
            ? "text-lg font-semibold text-foreground"
            : "text-sm font-medium text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
