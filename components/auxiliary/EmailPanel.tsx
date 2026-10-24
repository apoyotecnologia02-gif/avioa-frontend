"use client";
import { useState } from "react";
import { Mail, Copy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EmailPanel({ copy }: { copy: (s: string) => void }) {
  const [subject, setSubject] = useState("Solicitud de información de reserva");
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState("");
  const [draft, setDraft] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
          <Mail className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">
          Un correo claro, de principio a fin
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Prepara un borrador para tu gestión y revísalo antes de compartirlo.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setDraft(
              "Asunto: " +
                subject +
                "\n\nCordial saludo, " +
                recipient +
                ".\n\n" +
                body +
                "\n\nAgradecemos su apoyo y quedamos pendientes de su respuesta.\n\nEquipo aVioa · Auxiliares",
            );
          }}
        >
          <div className="space-y-1.5">
            <Label className="text-xs">Nombre del destinatario</Label>
            <Input
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Asunto</Label>
            <Input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Datos del mensaje</Label>
            <Textarea
              required
              rows={7}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <Button className="gap-1.5">
            Preparar borrador <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-4 rounded-lg bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          Plantilla manual. La redacción con IA y el envío requieren conectar
          los servicios del backend.
        </div>
      </Card>

      <Card className="flex flex-col bg-card p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Borrador editable
        </p>
        <h2 className="mt-1 text-lg font-semibold">
          Listo para darle tu toque
        </h2>
        {draft ? (
          <>
            <Textarea
              aria-label="Editar borrador"
              rows={18}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="mt-4 flex-1"
            />
            <Button
              variant="outline"
              onClick={() => copy(draft)}
              className="mt-3 gap-1.5 self-start"
            >
              <Copy className="h-4 w-4" /> Copiar correo
            </Button>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <Mail
              className="h-9 w-9 text-muted-foreground/50"
              strokeWidth={1}
            />
            <p className="text-sm font-medium">
              La próxima conversación empieza aquí
            </p>
            <p className="text-xs">Completa los datos del mensaje.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
