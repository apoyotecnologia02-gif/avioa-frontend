"use client";

import { useState, type FormEvent } from "react";
import { Copy, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { toast } from "sonner";

export function EmailTemplateForm() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Seguimiento de propuesta");
  const [details, setDetails] = useState("");
  const [draft, setDraft] = useState("");

  function prepare(e: FormEvent) {
    e.preventDefault();
    setDraft(
      `Asunto: ${subject}\n\nHola, ${name}:\n\n${details}\n\nQuedo pendiente de tus comentarios y con gusto te ayudo a dar el siguiente paso.\n\nSaludos,\nEquipo aVioa`,
    );
  }

  async function copy() {
    try {
      await copyCommercialText(draft);
      toast.success("Borrador copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary/10 p-2 text-primary">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">
              Un mensaje con el tono correcto
            </h2>
            <p className="text-sm text-muted-foreground">
              Prepara una plantilla editable.
            </p>
          </div>
        </div>

        <form onSubmit={prepare} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="e-name">Nombre del cliente</Label>
            <Input
              id="e-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="¿Para quién es?"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-subject">Asunto</Label>
            <Input
              id="e-subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del correo"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-details">Información del mensaje</Label>
            <Textarea
              id="e-details"
              required
              rows={6}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Indica los detalles que necesitas comunicar…"
            />
          </div>

          <Button type="submit" className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Preparar borrador
          </Button>
        </form>

        <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          Preparación manual, sin envío automático. La redacción con IA requiere
          conectar un proveedor en el backend.
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Borrador editable
        </span>
        <h2 className="mt-1 text-lg font-semibold">
          {draft ? "Listo para darle tu toque" : "Tu borrador aparecerá aquí"}
        </h2>

        {draft ? (
          <>
            <Textarea
              aria-label="Editar borrador"
              rows={18}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="mt-3 font-mono text-sm"
            />
            <Button variant="outline" onClick={copy} className="mt-3 w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copiar borrador
            </Button>
          </>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
            <Send className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-sm font-semibold">
              Una buena conversación comienza aquí
            </h3>
            <p className="max-w-sm text-xs text-muted-foreground">
              Completa los datos para preparar el primer borrador.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}