"use client";

import { useState } from "react";
import { ScanText, X, Plus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { passengersEmailText } from "@/lib/auxiliary/domain/auxiliary-text";
import { passportAlert } from "@/lib/auxiliary/domain/passport-validity";

const empty = () => ({
  names: "",
  surnames: "",
  documentNumber: "",
  birthDate: "",
  expirationDate: "",
  documentType: "idcard" as "idcard" | "passport",
});

export function PassengerPanel({ copy }: { copy: (s: string) => void }) {
  const [passengers, setPassengers] = useState([empty()]);
  const update = (index: number, key: string, value: string) =>
    setPassengers((old) =>
      old.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    );

  const text = passengersEmailText(passengers);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
          <ScanText className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">Los datos, tal como deben ir</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ingresa la información y revísala en el documento original. Este texto
          permanece en memoria y se borra al salir.
        </p>

        <div className="mt-5 space-y-4">
          {passengers.map((p, index) => {
            const warning = passportAlert({
              documentType: p.documentType,
              expirationDate: p.expirationDate,
            });
            return (
              <div
                key={index}
                className="rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">Pasajero {index + 1}</p>
                  {passengers.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setPassengers((old) =>
                          old.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["names", "Nombres"],
                    ["surnames", "Apellidos"],
                    ["documentNumber", "Número de documento"],
                  ].map(([key, label]) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-xs">{label}</Label>
                      <Input
                        value={p[key as keyof typeof p] as string}
                        onChange={(e) => update(index, key, e.target.value)}
                      />
                    </div>
                  ))}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Fecha de nacimiento</Label>
                    <Input
                      type="date"
                      value={p.birthDate}
                      onChange={(e) =>
                        update(index, "birthDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tipo de documento</Label>
                    <Select
                      value={p.documentType}
                      onValueChange={(v) => update(index, "documentType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idcard">
                          Documento de identidad
                        </SelectItem>
                        <SelectItem value="passport">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {p.documentType === "passport" && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs">
                        Vencimiento del pasaporte
                      </Label>
                      <Input
                        type="date"
                        value={p.expirationDate}
                        onChange={(e) =>
                          update(index, "expirationDate", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
                {warning && (
                  <div
                    className={`mt-3 rounded-md border px-3 py-2 text-xs ${
                      warning.level === "danger"
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : "border-amber-300/40 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                    }`}
                  >
                    {warning.message} Es una alerta interna de revisión, no una
                    regla de ingreso al destino.
                  </div>
                )}
              </div>
            );
          })}

          <Button
            variant="outline"
            disabled={passengers.length >= 10}
            onClick={() => setPassengers((old) => [...old, empty()])}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" /> Añadir pasajero
          </Button>
        </div>

        <div className="mt-4 rounded-lg bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          OCR de imágenes/PDF y consulta automatizada de identidad pendientes de
          conexión. No se cargan documentos originales desde esta vista.
        </div>
      </Card>

      <Card className="flex flex-col bg-card p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Listo para revisar
        </p>
        <h2 className="mt-1 text-lg font-semibold">Un pasajero por línea</h2>
        <pre className="mt-4 flex-1 whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
          {text || "El texto organizado aparecerá aquí."}
        </pre>
        <Button
          disabled={!text.trim()}
          onClick={() => copy(text)}
          className="mt-4 gap-1.5 self-start"
        >
          <Copy className="h-4 w-4" /> Copiar texto revisado
        </Button>
      </Card>
    </div>
  );
}
