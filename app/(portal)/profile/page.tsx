"use client";

import { useToast } from "@/hooks/use-toast";
import { User, Settings, Palette, Bell, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ProfileForm } from "./profile-form";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "profile",
    label: "Perfil",
    icon: User,
    description: "Administra tu información pública y privada.",
  },
  {
    id: "account",
    label: "Cuenta",
    icon: Settings,
    description: "Configuración de seguridad y credenciales de tu cuenta.",
  },
  {
    id: "appearance",
    label: "Apariencia",
    icon: Palette,
    description: "Personaliza el aspecto de la aplicación.",
  },
  {
    id: "notifications",
    label: "Notificaciones",
    icon: Bell,
    description: "Configura cómo quieres recibir las notificaciones.",
  },
];

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<string>("profile");
  const activeSectionData = SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        {/* Header con gradiente sutil */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/5 via-transparent to-transparent p-6 md:p-8">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="absolute bottom-0 left-1/4 h-24 w-24 rounded-full bg-blue-500/5 blur-xl" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Configuración
            </h2>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Administra la configuración de tu cuenta y preferencias personales.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Layout principal con mejor espaciado */}
        <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Navegación lateral mejorada */}
          <aside className="lg:w-[240px] lg:shrink-0">
            <nav className="flex flex-row gap-1 pb-2 lg:flex-col lg:pb-0">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      "hover:bg-muted/80 hover:scale-[1.02] active:scale-[0.98]",
                      "lg:w-full lg:justify-start",
                      isActive
                        ? "bg-blue-500/10 text-blue-600 shadow-sm ring-1 ring-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {/* Icono sin fondo, solo el color de las líneas */}
                    <section.icon 
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors duration-200",
                        isActive ? "text-blue-500" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    
                    <span className="hidden lg:inline">{section.label}</span>
                    
                    {/* Indicador de sección activa */}
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 text-blue-500/70 hidden lg:block" />
                    )}
                    
                    {/* Badge de estado (opcional) */}
                    {section.id === "notifications" && (
                      <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-background lg:hidden" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Separador vertical en desktop */}
          <div className="hidden lg:block">
            <Separator orientation="vertical" className="h-full" />
          </div>
          <Separator className="lg:hidden" />

          {/* Contenido - ocupa todo el espacio restante */}
          <div className="flex-1 min-w-0">
            {/* Encabezado de sección - Avatar completamente redondeado */}
            <div className="mb-6 flex items-start gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                  "bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-sm"
                )}
              >
                {activeSectionData && (
                  <activeSectionData.icon className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {activeSectionData?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeSectionData?.description}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Contenido dinámico */}
            <div className="pt-2">
              {activeSection === "profile" ? (
                <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <ProfileForm />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 p-12 text-center transition-all hover:bg-muted/10">
                  <div
                    className={cn(
                      "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                      "bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-sm"
                    )}
                  >
                    {activeSectionData && (
                      <activeSectionData.icon className="h-8 w-8" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium mb-1">
                    Sección en desarrollo
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Estamos trabajando para traerte las mejores opciones de
                    configuración en el apartado de{" "}
                    <span className="font-medium text-foreground">
                      {activeSectionData?.label.toLowerCase()}
                    </span>
                    .
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500/40" />
                    <span>Próximamente</span>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500/40" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}