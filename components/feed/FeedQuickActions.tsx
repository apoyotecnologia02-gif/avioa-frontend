"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, FileText, Gift, FileCheck, Sparkles } from "lucide-react";
import { AbsencesModal } from "@/components/leaves-container/page";
import { CertificatesModal } from "@/components/certficados/page";
import { useAuth } from "@/hooks/useAuth";

const getInitials = (name: string | null | undefined): string => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

export function FeedQuickActions() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAbsencesOpen, setIsAbsencesOpen] = useState(false);
  const [isCertificatesOpen, setIsCertificatesOpen] = useState(false);

  const actions = [
    {
      icon: Calendar,
      label: "Solicitar Vacaciones",
      onClick: () => router.push("/leaves"),
    },
    {
      icon: FileText,
      label: "Ausencias",
      onClick: () => setIsAbsencesOpen(true),
    },
    {
      icon: Gift,
      label: "Ver Beneficios",
      onClick: () => router.push("/points"),
    },
    {
      icon: FileCheck,
      label: "Certificados laborales",
      onClick: () => setIsCertificatesOpen(true),
    },
  ];

  const userInitials = getInitials(user?.name);

  return (
    <>
      <div className="h-full w-full bg-card rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col">
        {/* Header */}
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Acciones rápidas
        </h2>

        {/* Botones */}
        <div className="space-y-2 flex-1">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/60 transition-colors text-sm text-muted-foreground group text-left"
            >
              <action.icon className="w-5 h-5 text-primary shrink-0" />
              <span className="group-hover:text-foreground transition-colors leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Sesión activa */}
        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-background"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 ring-2 ring-background">
                {userInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.name || "Usuario"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
            <div className="relative shrink-0">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Sesión activa
          </p>
        </div>
      </div>

      {/* Modales */}
      <AbsencesModal
        isOpen={isAbsencesOpen}
        onClose={() => setIsAbsencesOpen(false)}
      />


      {/* esto queda sin uso hasta que se implemente la logica para certificados */}
      {/* <CertificatesModal
        // isOpen={isCertificatesOpen}
        // onClose={() => setIsCertificatesOpen(false)}
      /> */}
    </>
  );
}