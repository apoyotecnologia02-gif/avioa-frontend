"use client";

import { useState, type FormEvent } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { toast } from "sonner";
import { OfferCard, type PresentedOffer } from "./OfferCard";

const rows = (value: string) =>
  value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const emptyForm = {
  title: "",
  origin: "",
  duration: "",
  accommodation: "",
  detail: "",
  hotels: "",
  dates: "",
  includes: "",
  excludes: "",
  paymentTerms: "",
  conditions: "",
  source: "",
};

export function QuoteForm() {
  const [form, setForm] = useState(emptyForm);
  const [offer, setOffer] = useState<PresentedOffer | null>(null);
  const [copiedText, setCopiedText] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("El nombre del plan es obligatorio.");
      return;
    }

    if (form.source && !/^https:\/\//i.test(form.source)) {
      setError("Usa un enlace HTTPS para la fuente.");
      return;
    }

    setOffer({
      title: form.title,
      detail: form.detail,
      sourceIds: form.source ? [form.source] : [],
      closureNote:
        "Disponibilidad y cierre de ventas por confirmar con el operador.",
      hotels: rows(form.hotels).map((line) => {
        const [name, rateText, closureNote] = line
          .split("|")
          .map((s) => s.trim());
        return {
          name,
          rateText: rateText || "",
          closureNote: closureNote || "",
        };
      }),
      presentation: {
        origin: form.origin,
        duration: form.duration,
        accommodation: form.accommodation,
        dates: rows(form.dates),
        includes: rows(form.includes),
        excludes: rows(form.excludes),
        paymentTerms: rows(form.paymentTerms),
        conditions: rows(form.conditions),
      },
    });
  }

  async function handleCopy(text: string) {
    try {
      await copyCommercialText(text);
      setCopiedText(text);
      toast.success("Texto copiado");
      setTimeout(() => setCopiedText(""), 2000);
    } catch {
      toast.error("No se pudo copiar el texto");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Nueva propuesta</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Transcribe los datos confirmados en tu fuente. Cada hotel conserva su
          tarifa. Las fechas y los pagos se copian por separado.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="q-title">
              Nombre del plan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="q-title"
              required
              maxLength={250}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Cartagena, 4 días 3 noches"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="q-origin">Salida desde</Label>
              <Input
                id="q-origin"
                maxLength={80}
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="Medellín"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="q-duration">Duración</Label>
              <Input
                id="q-duration"
                maxLength={80}
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: e.target.value })
                }
                placeholder="4 días / 3 noches"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="q-accommodation">Acomodación</Label>
            <Input
              id="q-accommodation"
              maxLength={120}
              value={form.accommodation}
              onChange={(e) =>
                setForm({ ...form, accommodation: e.target.value })
              }
              placeholder="Doble, 2 adultos"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="q-detail">Descripción</Label>
            <Textarea
              id="q-detail"
              rows={2}
              maxLength={4000}
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              placeholder="Resumen breve del plan y condiciones generales."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="q-hotels">
              Hoteles y tarifas · un hotel por línea
            </Label>
            <Textarea
              id="q-hotels"
              rows={3}
              maxLength={4000}
              value={form.hotels}
              onChange={(e) => setForm({ ...form, hotels: e.target.value })}
              placeholder="Hotel | tarifa | condición del hotel"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="q-dates">Fechas · una por línea</Label>
            <Textarea
              id="q-dates"
              rows={2}
              maxLength={4000}
              value={form.dates}
              onChange={(e) => setForm({ ...form, dates: e.target.value })}
              placeholder="Del 12 al 16 de noviembre"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="q-includes">Incluye · uno por línea</Label>
              <Textarea
                id="q-includes"
                rows={2}
                maxLength={4000}
                value={form.includes}
                onChange={(e) =>
                  setForm({ ...form, includes: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="q-excludes">No incluye · uno por línea</Label>
              <Textarea
                id="q-excludes"
                rows={2}
                maxLength={4000}
                value={form.excludes}
                onChange={(e) =>
                  setForm({ ...form, excludes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="q-payments">Pagos · una condición por línea</Label>
            <Textarea
              id="q-payments"
              rows={2}
              maxLength={4000}
              value={form.paymentTerms}
              onChange={(e) =>
                setForm({ ...form, paymentTerms: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="q-conditions">
              Otras condiciones · una por línea
            </Label>
            <Textarea
              id="q-conditions"
              rows={2}
              maxLength={4000}
              value={form.conditions}
              onChange={(e) =>
                setForm({ ...form, conditions: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="q-source">Enlace a la fuente</Label>
            <Input
              id="q-source"
              type="url"
              maxLength={2000}
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="https://…"
            />
          </div>

          {error && (
            <p className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Preparar propuesta
          </Button>
        </form>

        <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          Borrador manual. No consulta IA, no calcula precios, no guarda datos
          del cliente. Confirma tarifas y disponibilidad antes de enviar.
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Propuesta para revisión
          </span>
        </div>
        {offer ? (
          <OfferCard
            offer={offer}
            onCopy={handleCopy}
            copiedText={copiedText}
            copyKey="offer-"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-sm font-semibold">
              Tu propuesta aparecerá aquí
            </h3>
            <p className="max-w-sm text-xs text-muted-foreground">
              Completa el formulario con datos verificados para generar el
              borrador.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}