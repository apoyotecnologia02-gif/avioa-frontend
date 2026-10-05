"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownMessage({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // estilos base para cualquier contexto (dentro de burbuja o no)
        "prose prose-sm max-w-none break-words",
        // neutraliza el color del prose para que herede del contenedor
        "prose-headings:mt-2 prose-headings:mb-1 prose-headings:font-semibold",
        "prose-p:my-1.5 prose-p:leading-relaxed",
        "prose-ul:my-1.5 prose-ul:pl-4 prose-ol:my-1.5 prose-ol:pl-4",
        "prose-li:my-0.5 prose-li:marker:text-current",
        "prose-strong:font-semibold prose-strong:text-current",
        "prose-code:rounded prose-code:bg-black/10 prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:my-2 prose-pre:bg-black/80 prose-pre:text-white prose-pre:text-xs",
        "prose-blockquote:my-2 prose-blockquote:border-l-2 prose-blockquote:pl-3",
        "prose-hr:my-3",
        "prose-a:underline prose-a:underline-offset-2",
        "prose-table:my-2 prose-table:text-xs",
        "prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Enlaces seguros
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          // Evita que bloques de código generen warnings de key
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
