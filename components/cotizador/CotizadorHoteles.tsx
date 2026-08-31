"use client";

import { formatoCOP } from "@/lib/cotizador-parser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { HotelResultado } from "@/types/cotizador.types";

export function CotizadorHoteles({
  resultados,
  texto,
}: {
  resultados: HotelResultado[];
  texto: string;
}) {
  if (resultados.length === 0) {
    return (
      <Card className="rounded-2xl p-6 text-center text-sm text-muted-foreground">
        No se encontraron hoteles para ese destino y fechas.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hotel</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Por persona</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Condiciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resultados.map((h, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{h.hotel}</TableCell>
                <TableCell>{h.plan}</TableCell>
                <TableCell className="text-right">{formatoCOP(h.pp)}</TableCell>
                <TableCell className="text-right">
                  {formatoCOP(h.backend_total)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                  {h.conditions}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="rounded-2xl p-5">
        <p className="mb-2 text-sm font-medium">Texto comercial hoteles</p>
        <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap text-sm">
          {texto}
        </pre>
      </Card>
    </div>
  );
}
