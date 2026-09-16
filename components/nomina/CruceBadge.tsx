import { ArrowLeftRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface CruceBadgeProps {
  cruzaAnterior: boolean;
  cruzaSiguiente: boolean;
  fechaInicioReal: string;
  fechaFinReal: string;
}

export function CruceBadge({
  cruzaAnterior,
  cruzaSiguiente,
  fechaInicioReal,
  fechaFinReal,
}: CruceBadgeProps) {
  if (!cruzaAnterior && !cruzaSiguiente) return null;

  const formatear = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
    });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
          <ArrowLeftRight className="w-3 h-3" />
          Recortada
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          La novedad real va del {formatear(fechaInicioReal)} al{" "}
          {formatear(fechaFinReal)}. Solo se cuentan los días dentro del periodo
          filtrado.
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
