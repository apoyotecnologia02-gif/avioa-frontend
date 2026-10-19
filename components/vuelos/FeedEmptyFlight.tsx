import { Plane } from "lucide-react";

export function FeedEmpty({ filtered }: { filtered: boolean }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <Plane className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="font-medium">
        {filtered
          ? "No hay ofertas con estos filtros"
          : "Aún no hay ofertas escaneadas"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {filtered
          ? "Prueba quitando algún filtro o ampliando el rango de fechas."
          : "Vuelve más tarde: el scanner corre todos los días a las 7 am."}
      </p>
    </div>
  );
}
