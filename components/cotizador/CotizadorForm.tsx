"use client";

import { useState } from "react";
import { useCotizadorStore } from "@/store/useCotizadorStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

const EJEMPLO =
  "Quiero un viaje de Medellín a Santa Marta del 12 al 15 de noviembre de 2026 para 2 adultos";

export function CotizadorForm() {
  const submit = useCotizadorStore((s) => s.submit);
  const status = useCotizadorStore((s) => s.status);

  const [texto, setTexto] = useState(EJEMPLO);
  const [planHoteles, setPlanHoteles] = useState("TODOS");
  const [maxHoteles, setMaxHoteles] = useState(5);
  const [soloFechaExacta, setSoloFechaExacta] = useState(true);

  const isLoading = status === "waiting" || status === "active";

  const handleSubmit = () => {
    if (!texto.trim() || isLoading) return;
    submit({
      texto_usuario: texto.trim(),
      plan_hoteles: planHoteles as any,
      max_hoteles: maxHoteles,
      solo_fecha_exacta: soloFechaExacta,
    });
  };

  return (
    <Card className="rounded-2xl p-6">
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block text-sm font-medium">
            Solicitud en lenguaje natural
          </Label>
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="min-h-[100px] resize-none rounded-xl"
            placeholder={EJEMPLO}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Alimentación hoteles
            </Label>
            <Select value={planHoteles} onValueChange={setPlanHoteles}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["TODOS", "FULL", "DESAYUNO", "D-A-C", "D-C"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">
              Cantidad de hoteles a mostrar
            </Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={maxHoteles}
              onChange={(e) => setMaxHoteles(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border p-3">
          <div>
            <p className="text-sm font-medium">Solo fecha exacta</p>
            <p className="text-xs text-muted-foreground">
              Si lo desactivas, también busca vuelos ±1 día (más lento)
            </p>
          </div>
          <Switch
            checked={soloFechaExacta}
            onCheckedChange={setSoloFechaExacta}
          />
        </div>

        <Button
          className="w-full"
          disabled={!texto.trim() || isLoading}
          onClick={handleSubmit}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? "Procesando..." : "Procesar solicitud"}
        </Button>
      </div>
    </Card>
  );
}
