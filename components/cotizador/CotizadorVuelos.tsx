"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ResultadoIA, VueloItem } from "@/types/cotizador.types";

export function CotizadorVuelos({ resultadoIA }: { resultadoIA: ResultadoIA }) {
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible defaultValue="tablas">
        {resultadoIA.tablas.map((bloque, i) => (
          <AccordionItem key={i} value={`bloque-${i}`}>
            <AccordionTrigger className="text-sm font-medium">
              📅 {bloque.label}
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <VuelosSubTabla titulo="Ida" vuelos={bloque.ida} />
              <VuelosSubTabla titulo="Regreso" vuelos={bloque.regreso} />

              {bloque.observaciones && bloque.observaciones.length > 0 && (
                <div className="rounded-lg bg-muted p-3 text-xs">
                  <p className="mb-1 font-medium">Observaciones técnicas</p>
                  <ul className="list-inside list-disc space-y-0.5">
                    {bloque.observaciones.map((obs, j) => (
                      <li key={j}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card className="rounded-2xl p-5">
        <p className="mb-2 text-sm font-medium">Recomendación completa (IA)</p>
        <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
          {resultadoIA.recomendacion}
        </pre>
      </Card>
    </div>
  );
}

function VuelosSubTabla({
  titulo,
  vuelos,
}: {
  titulo: string;
  vuelos: VueloItem[];
}) {
  if (vuelos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No se encontraron vuelos de {titulo.toLowerCase()}.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium">{titulo}</p>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aerolínea</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead>Llegada</TableHead>
              <TableHead>Vuelo</TableHead>
              <TableHead>Paradas</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead className="text-right">Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vuelos.map((v, i) => (
              <TableRow key={i}>
                <TableCell>{v.aerolinea}</TableCell>
                <TableCell>{v.hora_salida}</TableCell>
                <TableCell>{v.hora_llegada}</TableCell>
                <TableCell>{v.numero_vuelo}</TableCell>
                <TableCell>{v.paradas}</TableCell>
                <TableCell>{v.duracion}</TableCell>
                <TableCell className="text-right">
                  {v.precio} {v.moneda}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Total vuelos {titulo.toLowerCase()} detectados: {vuelos.length}
      </p>
    </div>
  );
}
