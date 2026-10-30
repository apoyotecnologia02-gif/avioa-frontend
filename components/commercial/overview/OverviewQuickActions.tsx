"use client";

import Link from "next/link";
import {
  Compass,
  Sparkles,
  FileText,
  Video,
  BookOpen,
  MessagesSquare,
  Tags,
  Link2,
  Mail,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface Action {
  href: string;
  label: string;
  description: string;
  Icon: LucideIcon;
}

const ACTIONS: Action[] = [
  {
    href: "/comercial/ofertas",
    label: "Ofertas y destinos",
    description: "Paquetes y promociones para tus clientes.",
    Icon: Compass,
  },
  {
    href: "/comercial/cotizaciones",
    label: "Cotizaciones",
    description: "Arma y comparte propuestas de viaje.",
    Icon: Sparkles,
  },
  {
    href: "/comercial/documentos",
    label: "Documentos y datos",
    description: "Guías y textos de referencia.",
    Icon: FileText,
  },
  {
    href: "/comercial/videos",
    label: "Videos de hoteles",
    description: "Material audiovisual de destinos.",
    Icon: Video,
  },
  {
    href: "/comercial/protocolo",
    label: "Protocolo de atención",
    description: "Pasos y lineamientos del servicio.",
    Icon: BookOpen,
  },
  {
    href: "/comercial/respuestas",
    label: "Respuestas rápidas",
    description: "Plantillas de mensajes listas.",
    Icon: MessagesSquare,
  },
  {
    href: "/comercial/tarifas",
    label: "Tarifas y planes",
    description: "Temporadas, precios y condiciones.",
    Icon: Tags,
  },
  {
    href: "/comercial/operadores",
    label: "Links de operadores",
    description: "Accesos directos a portales.",
    Icon: Link2,
  },
  {
    href: "/comercial/asistente-correos",
    label: "Asistente de correos",
    description: "Prepara borradores para clientes.",
    Icon: Mail,
  },
];

export function OverviewQuickActions() {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-semibold">Herramientas del equipo</h2>
        <p className="text-sm text-muted-foreground">
          Accesos rápidos a todo el espacio comercial.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map(({ href, label, description, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
          >
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{label}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
            <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Explorar <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}