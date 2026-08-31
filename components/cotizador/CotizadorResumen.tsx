// components/cotizador/CotizadorResumen.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download } from "lucide-react";

export function CotizadorResumen({ texto }: { texto: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cotizacion_completa.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="rounded-2xl p-5">
      <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
        {texto}
      </pre>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={handleCopy}>
          {copied ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? "Copiado" : "Copiar texto"}
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Descargar
        </Button>
      </div>
    </Card>
  );
}
