"use client";
import { useState } from "react";
import { Copy, Code } from "lucide-react";
import { quickReplyHtml } from "@/lib/auxiliary-operational/domain/quick-reply-html";
export default function HtmlConverter({
  text,
  onChange,
}: {
  text: string;
  onChange: (text: string) => void;
}) {
  const [notice, setNotice] = useState("");
  const html = quickReplyHtml(text);
  async function copy() {
    try {
      await navigator.clipboard.writeText(html);
      setNotice("Código HTML copiado.");
    } catch {
      setNotice("Selecciona el código de abajo y cópialo manualmente.");
    }
  }
  return (
    <section className="aux-password-editor" id="quick-html-converter">
      <h3>
        <Code size={20} /> Convertidor automático de texto a HTML
      </h3>
      <p>
        Escribe o pega tu texto. El código y la vista previa se actualizan al
        instante. Conserva emojis, saltos de línea y viñetas; los títulos en
        MAYÚSCULAS se resaltan.
      </p>
      <div className="aux-form">
        <label>
          Texto normal
          <textarea
            rows={10}
            maxLength={20000}
            value={text}
            placeholder={
              "INCLUYE\n• Alojamiento\n• Desayuno\n\nNO INCLUYE\n• Gastos personales"
            }
            onChange={(e) => {
              onChange(e.target.value);
              setNotice("");
            }}
          />
        </label>
        <div>
          <strong>Vista previa</strong>
          <div
            className="aux-html-preview"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {!html && <small>La vista previa aparecerá al escribir.</small>}
        </div>
      </div>
      <div className="aux-actions">
        <button
          type="button"
          className="aux-primary"
          disabled={!html}
          onClick={() => void copy()}
        >
          <Copy size={16} /> Copiar HTML generado
        </button>
        <button
          type="button"
          disabled={!text}
          onClick={() => {
            if (window.confirm("¿Limpiar el texto del convertidor?")) {
              onChange("");
              setNotice("");
            }
          }}
        >
          Limpiar
        </button>
      </div>
      {notice && (
        <p role="status" className="aux-notice">
          {notice}
        </p>
      )}
      <details style={{ marginTop: 16 }}>
        <summary>Ver código HTML generado</summary>
        <label>
          Código listo para copiar
          <textarea
            readOnly
            rows={7}
            value={html}
            onFocus={(e) => e.target.select()}
          />
        </label>
      </details>
      <p className="aux-muted">
        El convertidor no modifica las respuestas guardadas. Para actualizar
        una, usa Editar; al cambiar su texto se regenerará su HTML.
      </p>
    </section>
  );
}
