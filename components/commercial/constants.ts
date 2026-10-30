import {
  Compass,
  FileText,
  Video,
  BookOpen,
  MessagesSquare,
  Tags,
  Link2,
  type LucideIcon,
} from "lucide-react";
import type { ResourceKind } from "@/types/commercial.types";

export interface KindMeta {
  /** Label visible al usuario */
  label: string;
  /** Label en plural para el título del catálogo */
  pluralLabel: string;
  /** Ícono de lucide */
  icon: LucideIcon;
  /** Placeholder del campo de búsqueda */
  searchPlaceholder: string;
  /** Descripción breve para el header */
  description: string;
}

export const KIND_META: Record<ResourceKind, KindMeta> = {
  offer: {
    label: "Oferta",
    pluralLabel: "Ofertas y destinos",
    icon: Compass,
    searchPlaceholder: "Buscar ofertas…",
    description:
      "Destinos, paquetes y promociones listas para compartir con tus clientes.",
  },
  document: {
    label: "Documento",
    pluralLabel: "Documentos y datos",
    icon: FileText,
    searchPlaceholder: "Buscar documentos…",
    description:
      "Guías, checklists y textos de referencia para el equipo.",
  },
  video: {
    label: "Video",
    pluralLabel: "Videos de hoteles",
    icon: Video,
    searchPlaceholder: "Buscar videos…",
    description: "Material audiovisual de hoteles y destinos.",
  },
  protocol: {
    label: "Protocolo",
    pluralLabel: "Protocolo de atención",
    icon: BookOpen,
    searchPlaceholder: "Buscar protocolos…",
    description: "Pasos y lineamientos para atender a los viajeros.",
  },
  reply: {
    label: "Respuesta",
    pluralLabel: "Respuestas rápidas",
    icon: MessagesSquare,
    searchPlaceholder: "Buscar respuestas…",
    description: "Plantillas de mensajes listas para adaptar.",
  },
  rate: {
    label: "Tarifa",
    pluralLabel: "Tarifas y planes",
    icon: Tags,
    searchPlaceholder: "Buscar tarifas…",
    description: "Temporadas, precios y condiciones de los planes.",
  },
  operator: {
    label: "Operador",
    pluralLabel: "Links de operadores",
    icon: Link2,
    searchPlaceholder: "Buscar operadores…",
    description: "Accesos directos a los portales de operadores.",
  },
};

/** Lista ordenada de kinds para menús / selects */
export const KIND_LIST = Object.keys(KIND_META) as ResourceKind[];