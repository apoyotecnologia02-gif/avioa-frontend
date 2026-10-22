"use client";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TABLE_ROWS = [
  [
    "Vouchers e historial",
    "Guardar, revisar, PDF, archivar y restaurar",
    "Prisma y cifrado del backend",
  ],
  [
    "Imágenes de itinerarios",
    "JPG/PNG, guardado cifrado y PDF",
    "StorageService de Supabase privado",
  ],
  [
    "Solicitud de traslado",
    "Formulario, texto y estados manuales",
    "Correo/Evolution requieren conexión",
  ],
  [
    "Documentos de pasajeros",
    "Editor manual y alerta de pasaporte",
    "OCR y consulta documental pendientes",
  ],
  [
    "Respuestas rápidas",
    "Crear, buscar, importar CSV/TSV y copiar HTML",
    "Mismo contrato de recursos",
  ],
  [
    "Hoteles y reservas AVI",
    "Ingreso manual y plantillas del origen",
    "Consulta de reservas pendiente",
  ],
  ["Contraseñas", "Preparación de conexión", "Bóveda /passwords existente"],
  [
    "Correos con IA",
    "Plantilla manual editable",
    "Proveedor IA e historial pendientes",
  ],
] as const;

export function IntegrationPanel({ embedded }: { embedded: boolean }) {
  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Preparado para tu ecosistema
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Auxiliares, dentro
          <br />
          de tu propio portal.
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Interfaz, validaciones y almacenamiento separados para facilitar su
          incorporación a tus proyectos actuales.
        </p>
        {!embedded && (
          <Button asChild className="mt-5 gap-1.5">
            <a href="/integration-kit.zip" download>
              <Download className="h-4 w-4" /> Descargar kit de integración
            </a>
          </Button>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Frontend
          </p>
          <h3 className="mt-2 text-base font-semibold">
            Next.js 16 · React 19
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Ruta /auxiliares, componentes TypeScript, modo integrado en tu
            layout y adaptador para Axios/TanStack Query.
          </p>
          <code className="mt-3 inline-block rounded-md bg-muted px-2 py-1 text-xs">
            avioa-frontend
          </code>
        </Card>
        <Card className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Backend
          </p>
          <h3 className="mt-2 text-base font-semibold">NestJS 11 · Prisma 7</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Módulo con JWT, permisos AUXILIARY, cifrado con la infraestructura
            existente y archivos privados en Supabase.
          </p>
          <code className="mt-3 inline-block rounded-md bg-muted px-2 py-1 text-xs">
            avioa-backend
          </code>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-base font-semibold">
          Qué está listo y qué necesita conexión
        </h3>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Función</th>
                  <th className="px-4 py-3">En este sitio</th>
                  <th className="px-4 py-3">Integración al portal</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => (
                  <tr key={row[0]} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row[0]}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row[1]}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row[2]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="rounded-lg bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Los repositorios originales no se modifican. El kit incluye las
        instrucciones de registro y migración; su integración debe verificarse
        en los proyectos de destino. Los PDF usan un formato aVioa común, con
        datos y textos de las plantillas originales.
      </p>
    </div>
  );
}
