// components/forms/GoogleFormsModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Maximize2, Minimize2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoogleFormsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: {
    form_id: string;
    title: string;
    description: string | null;
    category: string;
    embed_url: string | null;
    status: string | null;
    created_at: string;
  } | null;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}

export function GoogleFormsModal({
  open,
  onOpenChange,
  form,
  onFullscreen,
  isFullscreen = false,
}: GoogleFormsModalProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Limpiar el popup cuando se cierra el modal
  useEffect(() => {
    if (!open && popupWindow) {
      popupWindow.close();
      setPopupWindow(null);
      setIsPopupOpen(false);
    }
  }, [open, popupWindow]);

  // Abrir el formulario en una ventana emergente
  const openPopup = () => {
    if (!form?.embed_url) return;

    setIsLoading(true);

    const width = 900;
    const height = 750;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      form.embed_url,
      `form-${form.form_id}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes`
    );

    if (popup) {
      setPopupWindow(popup);
      setIsPopupOpen(true);
      setIsLoading(false);

      // Detectar cuando el popup se cierra
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          setPopupWindow(null);
          setIsPopupOpen(false);
          clearInterval(checkPopupClosed);
        }
      }, 500);
    } else {
      // Si el popup fue bloqueado, abrir en nueva pestaña
      window.open(form.embed_url, "_blank");
      setIsLoading(false);
    }
  };

  // Cerrar el popup
  const closePopup = () => {
    if (popupWindow) {
      popupWindow.close();
      setPopupWindow(null);
      setIsPopupOpen(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 overflow-hidden",
          isFullscreen
            ? "max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh]"
            : "max-w-2xl max-h-[80vh] w-[90vw]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <DialogTitle className="truncate flex items-center gap-2">
              <span>📋</span>
              {form.title}
            </DialogTitle>
            <DialogDescription className="truncate">
              {form.description || "Formulario de Google"}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-1 ml-4 flex-shrink-0">
            {onFullscreen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onFullscreen}
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                closePopup();
                onOpenChange(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cuerpo del modal */}
        <div className="flex-1 min-h-0 bg-gray-50 flex flex-col items-center justify-center p-6 overflow-y-auto">
          {isPopupOpen ? (
            // Estado: Popup abierto
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Formulario abierto
                </h3>
                <p className="text-sm text-gray-600">
                  El formulario se abrió en una ventana emergente.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Si no ves la ventana, verifica que tu navegador no esté bloqueando popups.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={closePopup}>
                  Cerrar ventana
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    if (popupWindow && !popupWindow.closed) {
                      popupWindow.focus();
                    } else {
                      openPopup();
                    }
                  }}
                >
                  Reabrir
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            // Estado: Cargando
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-gray-600">Abriendo formulario...</p>
            </div>
          ) : (
            // Estado: Mostrar opciones
            <div className="w-full max-w-md flex flex-col items-center gap-6">
              {/* Icono */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">📄</span>
              </div>

              {/* Información */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800">{form.title}</h3>
                <p className="text-gray-600 mt-1">{form.description || "Completa este formulario de Google"}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="secondary">{form.category}</Badge>
                  <Badge variant={form.status === "active" ? "default" : "secondary"}>
                    {form.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              {/* Botón principal */}
              <Button
                size="lg"
                className="gap-2 text-base px-8 w-full"
                onClick={openPopup}
                disabled={!form.embed_url}
              >
                <ExternalLink className="h-5 w-5" />
                Abrir formulario
              </Button>

              {/* URL */}
              {form.embed_url && (
                <div className="w-full p-3 bg-white rounded-lg border text-sm text-gray-600 break-all">
                  <span className="truncate">{form.embed_url}</span>
                </div>
              )}

              {/* Info adicional */}
              <div className="grid grid-cols-2 gap-4 w-full text-sm text-gray-500">
                <div className="text-center">
                  <span className="font-medium">Creado</span>
                  <p>{formatDate(form.created_at)}</p>
                </div>
                <div className="text-center">
                  <span className="font-medium">ID</span>
                  <p className="font-mono text-xs">{form.form_id.substring(0, 12)}...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t bg-muted/50 flex-shrink-0 text-xs text-muted-foreground">
          <span>Google Forms</span>
          <div className="flex items-center gap-3">
            {form.embed_url && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => window.open(form.embed_url!, "_blank")}
              >
                <ExternalLink className="h-3 w-3" />
                Abrir en nueva pestaña
              </Button>
            )}
            {isPopupOpen && (
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => {
                  if (popupWindow && !popupWindow.closed) {
                    popupWindow.focus();
                  } else {
                    openPopup();
                  }
                }}
              >
                Enfocar popup
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}