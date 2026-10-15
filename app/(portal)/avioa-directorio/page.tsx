"use client";

export default function AvioaDirectorioPage() {
  return (
    <main className="w-full min-w-0 max-w-none">
      <iframe
        src={process.env.NEXT_PUBLIC_DIRECTORIO_AVIOA ?? "#"}
        title="Herramienta interna"
        className="block h-[calc(100vh-80px)] w-full min-w-0 border-0"
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
