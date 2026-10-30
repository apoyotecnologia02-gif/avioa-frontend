"use client";

import {
  Compass,
  FileText,
  MessagesSquare,
  Video,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/axios";
import type { CommercialResource } from "@/types/commercial.types";

interface StatDef {
  kind: "offer" | "reply" | "document" | "video";
  label: string;
  href: string;
  Icon: LucideIcon;
  color: string;
}

const STATS: StatDef[] = [
  {
    kind: "offer",
    label: "Ofertas",
    href: "/comercial/ofertas",
    Icon: Compass,
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  {
    kind: "reply",
    label: "Respuestas rápidas",
    href: "/comercial/respuestas",
    Icon: MessagesSquare,
    color: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
  },
  {
    kind: "document",
    label: "Documentos",
    href: "/comercial/documentos",
    Icon: FileText,
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  {
    kind: "video",
    label: "Videos",
    href: "/comercial/videos",
    Icon: Video,
    color: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
  },
];

/** Hook mínimo para traer todos los recursos y agrupar por kind */
function useResourceCounts() {
  return useQuery({
    queryKey: ["commercial", "resources", "all"],
    queryFn: async () => {
      const { data } = await api.get<CommercialResource[]>(
        "/commercial/resources",
      );
      return data;
    },
    staleTime: 60_000,
  });
}

export function OverviewStats() {
  const { data = [], isLoading } = useResourceCounts();

  const counts = STATS.reduce<Record<string, number>>((acc, s) => {
    acc[s.kind] = data.filter((r) => r.kind === s.kind).length;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map(({ kind, label, href, Icon, color }) => (
        <Link
          key={kind}
          href={href}
          className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
        >
          <span className={`rounded-md p-2 ${color}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums">
              {isLoading ? "—" : counts[kind] ?? 0}
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      ))}
    </div>
  );
}