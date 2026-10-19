"use client";

import { useState } from "react";
import { Zap, X } from "lucide-react";
import { FeedQuickActions } from "./FeedQuickActions";
import { cn } from "@/lib/utils";
import { FlightDealsContent  } from "./FlightDealsContent";

export function FeedQuickActionsMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFlightDealsOpen, setIsFlightDealsOpen] = useState(false);

  const handleFlightDealsClick = () => {
    setIsOpen(false);             // cerrar el modal de acciones
    setIsFlightDealsOpen(true);   // abrir el de FlightDeals
  };

  return (
    <>
      {/* FAB flotante — solo mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 lg:hidden",
          "w-14 h-14 rounded-full bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
          "flex items-center justify-center transition-all",
        )}
        aria-label="Abrir acciones rápidas"
      >
        <Zap className="w-6 h-6" />
      </button>

      {/* Modal de Acciones Rápidas */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-sm shadow-2xl border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con botón de cierre */}
            <div className="flex justify-end p-2">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Contenido — pasamos la prop para que muestre el botón */}
            <div className="px-4 pb-4">
              <FeedQuickActions onFlightDealsClick={handleFlightDealsClick} />
            </div>
          </div>
        </div>
      )}

      {/* Modal de FlightDeals */}
      {isFlightDealsOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 lg:hidden"
          onClick={() => setIsFlightDealsOpen(false)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl border border-border/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con título y cierre */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-base font-semibold text-foreground">
                ✈️ Ofertas de vuelos
              </h2>
              <button
                onClick={() => setIsFlightDealsOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto p-4">
              <FlightDealsContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}