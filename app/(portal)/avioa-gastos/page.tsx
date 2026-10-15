"use client";

export default function AvioGastosPage() {
  return (
    <main className="w-full min-w-0 max-w-none">
      <iframe
        src={process.env.NEXT_PUBLIC_AVIOA_GASTOS ?? "#"}
        title="Herramienta interna"
        className="block h-[calc(100vh-80px)] w-full min-w-0 border-0"
        sandbox="
            allow-scripts
            allow-forms
            allow-same-origin
            allow-popups
            allow-popups-to-escape-sandbox
            allow-top-navigation-by-user-activation
        "
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
