"use client";
import { useModulePermission } from "@/hooks/useModulePermission";
import EmailChat from "@/components/auxiliary-operational/email-chat";
export default function Page() {
  const permission = useModulePermission("AUXILIARY");
  if (!permission.canAccess)
    return <p>No tienes acceso a Auxiliares operativos.</p>;
  if (!permission.canCreate && !permission.canUpdate)
    return <p>Necesitas permiso de edición en Auxiliares operativos.</p>;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-5 text-[#203d4d] sm:px-6 md:py-8 lg:px-8">
      <a
        href="/auxiliares"
        className="w-fit font-semibold text-blue-700 underline-offset-4 hover:underline"
      >
        ← Volver a Auxiliares operativos
      </a>
      <h1 className="mb-0 mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Redactar correos
      </h1>
      <p className="mb-0 mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Mensajes cercanos, cordiales y concisos para el equipo de aVioa. Firma:
        Equipo Auxiliares.
      </p>
      <EmailChat module="auxiliary" />
    </main>
  );
}
