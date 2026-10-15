"use client";

export default function AviClickPage() {
  return (
    <main className="w-full min-w-0 max-w-none">
      <iframe
        src="https://avioa-formatos.avioa-8387.chatgpt.site/"
        title="Redactor"
        className="block h-[calc(100vh-80px)] w-full border-0"
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
