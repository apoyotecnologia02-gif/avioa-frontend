"use client";

import { Bell, ChevronRight, Palette, Settings, User } from "lucide-react";
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
  const [activeSection, setActiveSection] = useState("profile");
  const activeSectionData = SECTIONS.find((section) => section.id === activeSection)!;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-2xl border bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-2 text-sm font-medium text-primary">Mi cuenta</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Configuración
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            Administra la configuración de tu cuenta y tus preferencias personales.
          </p>
        </div>
      </header>

      <div className="mt-6 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
        <aside className="lg:border-r lg:border-border lg:pr-6">
          <nav
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
            aria-label="Secciones de configuración"
          >
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "group flex min-w-32 shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-full lg:justify-start",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{section.label}</span>
                  {isActive && (
                    <ChevronRight className="ml-auto hidden size-4 lg:block" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="mt-6 min-w-0 lg:mt-0">
          <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <activeSectionData.icon className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {activeSectionData.label}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {activeSectionData.description}
                </p>
              </div>
            </div>

            <Separator className="my-6 sm:my-8" />

            {activeSection === "profile" ? (
              <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <ProfileForm />
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-6 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <activeSectionData.icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold">Sección en desarrollo</h3>
                <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                  Estamos preparando las opciones de {activeSectionData.label.toLowerCase()}.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
