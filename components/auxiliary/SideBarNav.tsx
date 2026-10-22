"use client";

import {
  Plane,
  Files,
  LockKeyhole,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import {
  LayoutDashboard,
  Hotel,
  Send,
  Bus,
  History as HistoryIcon,
  MessagesSquare,
  KeyRound,
  Mail,
  Layers,
  ScanText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AuxiliaryPermissions } from "@/types/auxiliary";
import type { View } from "./Workspace";

const NAV_GROUPS = [
  {
    label: "Espacio operativo",
    items: [
      ["overview", "Resumen", LayoutDashboard],
      ["passengers", "Documentos y pasajeros", ScanText],
    ] as const,
  },
  {
    label: "Preparar documentos",
    items: [
      ["hotel", "Voucher de hotel", Hotel],
      ["request", "Solicitud de traslados", Send],
      ["transfer", "Voucher de traslados", Bus],
      ["flight", "Itinerarios de vuelo", Plane],
      ["history", "Historial de documentos", HistoryIcon],
    ] as const,
  },
  {
    label: "Recursos del equipo",
    items: [
      ["reply", "Respuestas rápidas", MessagesSquare],
      ["passwords", "Contraseñas", KeyRound],
      ["email", "Asistente de correos", Mail],
      ["integration", "Integración nativa", Layers],
    ] as const,
  },
] as const;

interface Props {
  view: View;
  onNavigate: (view: View) => void;
  permissions: AuxiliaryPermissions;
}

export function SidebarNav({ view, onNavigate }: Props) {
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-6">
      {/* Brand */}
      <button
        onClick={() => onNavigate("overview")}
        className="mb-6 flex items-center gap-2.5 px-2 text-left"
        aria-label="aVioa Inicio"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Plane className="h-5 w-5" />
        </span>
        <span className="text-2xl font-bold tracking-tight text-foreground">
          aVioa<span className="text-primary">.</span>
        </span>
      </button>

      {/* Workspace selector */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
          <Files className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            Auxiliares
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            Apoyo al equipo comercial
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(([key, label, Icon]) => {
                const active = view === key;
                return (
                  <button
                    key={key}
                    onClick={() => onNavigate(key)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto space-y-3">
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <LockKeyhole className="h-3.5 w-3.5" />
            Cada detalle, protegido
          </span>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Documentos e imágenes cifrados en este espacio privado.
          </p>
          <button
            onClick={() => onNavigate("integration")}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Ver integración <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <Separator />

        <div className="flex items-center gap-2.5 px-1 py-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              AV
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">
              Equipo aVioa
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              Auxiliares operativos
            </p>
          </div>
          <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
