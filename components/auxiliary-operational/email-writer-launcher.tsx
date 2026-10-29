import { ArrowRight, Mail, Sparkles } from "lucide-react";
export default function EmailWriterLauncher({ href }: { href: string }) {
  return (
    <section className="mb-6 flex w-full items-center gap-6 rounded-[22px] border-2 border-l-[7px] border-[#0878c9] bg-[#f7fbff] px-10 py-7 max-sm:flex-col max-sm:items-stretch max-sm:gap-5 max-sm:px-5 max-sm:py-6">
      <span className="grid size-[78px] shrink-0 place-items-center rounded-[20px] bg-[#0878c9] text-white max-sm:size-16 max-sm:rounded-2xl">
        <Mail size={36} strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="mb-3 inline-flex items-center gap-2 rounded-lg bg-[#ffedaa] px-3 py-1 text-sm font-extrabold tracking-wide text-[#352b0b] max-sm:mb-2 max-sm:text-xs">
          <Sparkles size={17} aria-hidden="true" /> INTELIGENCIA ARTIFICIAL
        </span>
        <h2 className="m-0 text-[32px] font-extrabold leading-tight text-[#123d69] max-sm:text-2xl">
          Redacta tus correos con IA
        </h2>
        <p className="mb-0 mt-1 text-base text-[#315779] max-sm:text-sm">
          Escribe tu idea y prepara un correo listo para revisar, editar y
          copiar.
        </p>
      </div>
      <a
        className="inline-flex min-h-[68px] shrink-0 items-center justify-center gap-4 rounded-2xl bg-[#0878c9] px-7 text-lg font-bold !text-white shadow-[0_8px_18px_#0878c933] transition-colors hover:bg-[#066bb4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0878c9] max-sm:min-h-14 max-sm:w-full max-sm:text-base"
        href={href}
      >
        Abrir redactor con IA
        <ArrowRight size={22} aria-hidden="true" />
      </a>
    </section>
  );
}
