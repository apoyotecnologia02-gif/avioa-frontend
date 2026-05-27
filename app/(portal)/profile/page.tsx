"use client";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, Palette, Bell } from "lucide-react";
import { useState } from "react";
import { ProfileForm } from "./profile-form";
import { Separator } from "@/components/ui/separator";
const SECTIONS = [
  {
    id: "profile",
    label: "Perfil",
    icon: User,
    description: "Administra tu información pública y privada.",
  },
  //   {
  //     id: "account",
  //     label: "Cuenta",
  //     icon: Settings,
  //     description: "Configuración de seguridad y credenciales de tu cuenta.",
  //   },
  //   {
  //     id: "appearance",
  //     label: "Apariencia",
  //     icon: Palette,
  //     description: "Personaliza el aspecto de la aplicación.",
  //   },
  //   {
  //     id: "notifications",
  //     label: "Notificaciones",
  //     icon: Bell,
  //     description: "Configura cómo quieres recibir las notificaciones.",
  //   },
];
export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<string>("profile");
  const activeSectionData = SECTIONS.find((s) => s.id === activeSection);
  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-10">
      <div className="space-y-0.5 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Administra la configuración de tu cuenta y preferencias.
        </p>
      </div>
      <Separator className="my-6" />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        {/* Navegación lateral */}
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <section.icon className="mr-3 h-4 w-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </aside>
        {/* Contenido */}
        <div className="flex-1 lg:max-w-2xl">
          <div className="mb-6">
            <h3 className="text-xl font-medium">{activeSectionData?.label}</h3>
            <p className="text-sm text-muted-foreground">
              {activeSectionData?.description}
            </p>
          </div>
          <Separator className="my-4" />

          <div className="pt-2">
            {activeSection === "profile" ? (
              <ProfileForm />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center animate-in fade-in-50">
                <div className="rounded-full bg-muted p-4 mb-4">
                  {activeSectionData && (
                    <activeSectionData.icon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-lg font-medium mb-1">
                  Sección en construcción
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Estamos trabajando para traerte las mejores opciones de
                  configuración en el apartado de{" "}
                  {activeSectionData?.label.toLowerCase()}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
