"use client";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import "./email-writer-launcher.css";
type Props =
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void };
export default function EmailWriterLauncher(props: Props) {
  const label = (
    <>
      <span>Abrir redactor con IA</span>
      <ArrowRight size={20} aria-hidden="true" />
    </>
  );
  return (
    <section
      className="ai-email-launcher"
      aria-label="Redactor de correos con inteligencia artificial"
    >
      <div className="ai-email-launcher-icon" aria-hidden="true">
        <Mail size={30} />
      </div>
      <div className="ai-email-launcher-copy">
        <span className="ai-email-launcher-badge">
          <Sparkles size={14} aria-hidden="true" /> INTELIGENCIA ARTIFICIAL
        </span>
        <h2>Redacta tus correos con IA</h2>
        <p>
          Escribe tu idea y prepara un correo listo para revisar, editar y
          copiar.
        </p>
      </div>
      {props.href ? (
        <a className="ai-email-launcher-action" href={props.href}>
          {label}
        </a>
      ) : (
        <button
          className="ai-email-launcher-action"
          type="button"
          onClick={props.onClick}
        >
          {label}
        </button>
      )}
    </section>
  );
}
