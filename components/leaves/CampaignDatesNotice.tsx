import {
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  Megaphone,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Campaign = {
  id: string;
  label: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
};

const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const CAMPAIGNS: Campaign[] = [
  {
    id: "enero",
    label: "Mejor mes del año",
    startMonth: 1,
    startDay: 1,
    endMonth: 1,
    endDay: 31,
  },
  {
    id: "hot-sale",
    label: "Hot Sale",
    startMonth: 3,
    startDay: 12,
    endMonth: 3,
    endDay: 17,
  },
  {
    id: "travel-sale-jun",
    label: "Travel Sale",
    startMonth: 6,
    startDay: 9,
    endMonth: 6,
    endDay: 15,
  },
  {
    id: "aniversario",
    label: "Aniversario aVioa",
    startMonth: 9,
    startDay: 15,
    endMonth: 9,
    endDay: 30,
  },
  {
    id: "travel-sale-oct",
    label: "Travel Sale",
    startMonth: 10,
    startDay: 17,
    endMonth: 10,
    endDay: 21,
  },
  {
    id: "black-days",
    label: "Black Days",
    startMonth: 11,
    startDay: 15,
    endMonth: 12,
    endDay: 2,
  },
  {
    id: "cyber-monday",
    label: "CyberMonday",
    startMonth: 12,
    startDay: 2,
    endMonth: 12,
    endDay: 2,
  },
  {
    id: "travel-tuesday",
    label: "Travel Tuesday",
    startMonth: 12,
    startDay: 3,
    endMonth: 12,
    endDay: 3,
  },
];

function parseLocalDate(v: string | Date | null | undefined): Date | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function isInCampaign(date: Date, c: Campaign): boolean {
  const val = (date.getMonth() + 1) * 100 + date.getDate();
  const startVal = c.startMonth * 100 + c.startDay;
  const endVal = c.endMonth * 100 + c.endDay;
  if (startVal <= endVal) return val >= startVal && val <= endVal;
  return val >= startVal || val <= endVal;
}

function daysInMonth(month: number, year = 2024): number {
  return new Date(year, month, 0).getDate();
}

function fmtRange(c: Campaign): string {
  const isFullMonth = c.startDay === 1 && c.endDay === daysInMonth(c.endMonth);

  const startMonthName = MONTHS_SHORT[c.startMonth - 1];
  const endMonthName = MONTHS_SHORT[c.endMonth - 1];

  if (isFullMonth && c.startMonth === c.endMonth) {
    return `Todo ${startMonthName}`;
  }

  if (isFullMonth) {
    return `${startMonthName} – ${endMonthName}`;
  }

  const start = `${c.startDay} ${startMonthName}`;
  const end = `${c.endDay} ${endMonthName}`;

  if (c.startMonth === c.endMonth && c.startDay === c.endDay) return start;
  return `${start} – ${end}`;
}
interface CampaignDatesNoticeProps {
  startDate?: string | Date | null;
  endDate?: string | Date | null;
}

export function CampaignDateNotice({
  startDate,
  endDate,
}: CampaignDatesNoticeProps) {
  const [open, setOpen] = useState(false);

  const overlappingIds = useMemo(() => {
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate) ?? start;
    if (!start || !end || end < start) return new Set<string>();

    const ids = new Set<string>();
    const cur = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
    );
    const endNorm = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (cur <= endNorm) {
      for (const c of CAMPAIGNS) {
        if (isInCampaign(cur, c)) ids.add(c.id);
      }
      cur.setDate(cur.getDate() + 1);
    }

    return ids;
  }, [startDate, endDate]);

  const hasOverlap = overlappingIds.size > 0;

  const overlappingNames = useMemo(
    () => CAMPAIGNS.filter((c) => overlappingIds.has(c.id)).map((c) => c.label),
    [overlappingIds],
  );

  useEffect(() => {
    if (hasOverlap) setOpen(true);
  }, [hasOverlap]);

  return (
    <div
      className={`rounded-xl border transition-colors ${
        hasOverlap
          ? "border-amber-300 bg-amber-50/70 dark:border-amber-800/60 dark:bg-amber-900/15"
          : "border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-900/10"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2.5 p-3 text-left"
        aria-expanded={open}
      >
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {hasOverlap
              ? "Tus fechas coinciden con campañas"
              : "Fechas de alta demanda"}
          </p>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
            {hasOverlap
              ? `Coincide con: ${overlappingNames.join(", ")}.`
              : "Evita solicitar permisos en estas fechas salvo que sea estrictamente necesario."}
          </p>
        </div>
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-amber-600 transition-transform dark:text-amber-400 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Contenido expandible */}
      {open && (
        <div className="border-t border-amber-200/70 px-3 pb-3 pt-3 dark:border-amber-900/40">
          {hasOverlap && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-100/70 p-2.5 dark:border-amber-800/60 dark:bg-amber-900/25">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
              <p className="text-xs text-amber-900 dark:text-amber-200">
                Las fechas seleccionadas coinciden con una o más campañas.
                Considera elegir otras fechas o coordinar con tu líder con
                anticipación.
              </p>
            </div>
          )}

          <p className="mb-3 text-xs text-amber-900/90 dark:text-amber-200/90">
            En estas fechas tendremos ofertas y campañas comerciales. La idea es
            contar con todo el equipo completo, sin importar el área, y
            organizarnos con anticipación.
          </p>

          <ul className="space-y-1.5">
            {CAMPAIGNS.map((c) => {
              const isHit = overlappingIds.has(c.id);
              return (
                <li
                  key={c.id}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                    isHit
                      ? "bg-amber-100/80 ring-1 ring-amber-300 dark:bg-amber-900/30 dark:ring-amber-800/60"
                      : ""
                  }`}
                >
                  <span className="inline-flex min-w-[88px] justify-center rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    {fmtRange(c)}
                  </span>
                  <span className="flex-1 text-amber-900/90 dark:text-amber-200/90">
                    {c.label}
                  </span>
                  {isHit && (
                    <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                      Coincide
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="mt-3 flex items-start gap-1.5 border-t border-amber-200/70 pt-3 text-[11px] text-amber-800/80 dark:border-amber-900/40 dark:text-amber-300/80">
            <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Si necesitas solicitar en una de estas fechas, hazlo con la mayor
            anticipación posible.
          </p>
        </div>
      )}
    </div>
  );
}
