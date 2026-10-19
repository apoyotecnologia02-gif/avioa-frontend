"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/axios";
import { LegalEntity } from "@/types/user.types";
import { Download, FileText, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

const LEGAL_ENTITY_LABELS: Record<LegalEntity, string> = {
  [LegalEntity.INVERSIONES_AVIOA_SAS]: "INVERSIONES AVIOA SAS",
  [LegalEntity.GESTION_TURISMO_SAS]: "GESTIÓN TURISMO SAS",
  [LegalEntity.AVIOA_MAYORISTA_SAS]: "AVIOA MAYORISTA SAS",
  //   [LegalEntity.HOTELES_DE_LA_MONTANA]: "HOTELES DE LA MONTAÑA",
};

export default function CertificadosPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLegalEntity, setSelectedLegalEntity] = useState<
    LegalEntity | ""
  >("");

  const hasLegalEntity = Boolean(user?.legalEntity);

  const pollJob = async (jobId: string): Promise<{ url: string }> => {
    const maxAttempts = 30;
    const delayMs = 1000;

    for (let i = 0; i < maxAttempts; i++) {
      const { data } = await api.get<{
        state: "waiting" | "active" | "completed" | "failed" | "delayed";
        progress?: { percentage?: number; message?: string };
        result?: { url: string };
        error?: string;
      }>(`/certificados/jobs/${jobId}`, { skip401Redirect: true });

      if (data.state === "completed" && data.result?.url) {
        return data.result;
      }

      if (data.state === "failed") {
        throw new Error(data.error ?? "La generación del certificado falló");
      }

      await new Promise((r) => setTimeout(r, delayMs));
    }

    throw new Error(
      "El certificado está tardando más de lo esperado. Intenta nuevamente en unos minutos.",
    );
  };

  const generateCertificate = async (legalEntity?: LegalEntity) => {
    setIsGenerating(true);
    try {
      const { data } = await api.post<{ jobId: string }>(
        "/certificados/certificado-laboral",
        legalEntity ? { legalEntity } : {},
        { skip401Redirect: true },
      );

      const result = await pollJob(data.jobId);

      window.open(result.url, "_blank", "noopener,noreferrer");

      toast({
        title: "Certificado generado",
        description: "Revisa la nueva pestaña para descargar el documento.",
      });

      setIsDialogOpen(false);
      setSelectedLegalEntity("");
    } catch (err) {
      toast({
        title: "No se pudo generar el certificado",
        description:
          err instanceof Error
            ? err.message
            : "Intenta nuevamente en unos minutos.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadClick = () => {
    if (hasLegalEntity) {
      generateCertificate();
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleConfirmLegalEntity = () => {
    if (!selectedLegalEntity) {
      toast({
        title: "Selecciona una razón social",
        variant: "destructive",
      });
      return;
    }
    generateCertificate(selectedLegalEntity);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Certificados</h1>
        <p className="text-sm text-muted-foreground">
          Descarga tus certificados laborales de forma inmediata.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ---------- Certificado laboral ---------- */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Certificado laboral</CardTitle>
                <CardDescription className="text-xs">
                  Documento oficial con cargo, salario y fecha de vinculación.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-between gap-4">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Firma y datos de la empresa
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Formato PDF (.pdf)
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Generación inmediata
              </li>
            </ul>

            <Button
              onClick={handleDownloadClick}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar certificado
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-dashed opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Próximamente</CardTitle>
                <CardDescription className="text-xs">
                  Más tipos de certificados estarán disponibles aquí.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecciona tu razón social</DialogTitle>
            <DialogDescription>
              No tenemos registrada tu razón social. Elige a qué empresa
              perteneces para generar el certificado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="legalEntity">Razón social</Label>
            <Select
              value={selectedLegalEntity}
              onValueChange={(v) => setSelectedLegalEntity(v as LegalEntity)}
            >
              <SelectTrigger id="legalEntity" className="w-full">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(LegalEntity).map((le) => (
                  <SelectItem key={le} value={le}>
                    {LEGAL_ENTITY_LABELS[le] ?? le}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmLegalEntity}
              disabled={isGenerating || !selectedLegalEntity}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar certificado
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
