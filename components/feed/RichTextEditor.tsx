"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Bold,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Smile,
  Strikethrough,
} from "lucide-react";

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Caras",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "😉",
      "😍",
      "🥰",
      "😘",
      "😎",
      "🤩",
      "🥳",
      "🤔",
      "🤨",
      "😐",
      "😴",
      "😢",
      "😭",
      "😡",
      "🤯",
      "😱",
      "🤗",
      "🤝",
      "🙏",
    ],
  },
  {
    label: "Gestos",
    emojis: [
      "👍",
      "👎",
      "👏",
      "🙌",
      "🤝",
      "💪",
      "✌️",
      "🤞",
      "👌",
      "🫶",
      "✋",
      "🖐️",
      "🤙",
      "☝️",
      "👋",
      "🫡",
    ],
  },
  {
    label: "Símbolos",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "💯",
      "🔥",
      "✨",
      "⭐",
      "🌟",
      "💫",
      "🎉",
      "🎊",
      "🏆",
      "🥇",
      "🎯",
      "🚀",
      "💡",
      "📌",
      "✅",
      "❌",
      "⚠️",
      "❗",
      "❓",
      "💬",
      "📲",
      "🛩️",
    ],
  },
];

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  disabled?: boolean;
  className?: string;
  /** Muestra la barra de herramientas. Default: true */
  showToolbar?: boolean;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "¿Qué quieres compartir?",
  onFocus,
  disabled,
  className,
  showToolbar = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2",
        },
      }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          "focus:outline-none",
          "min-h-[52px] px-4 py-3 text-sm leading-relaxed",
          className,
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onFocus: () => onFocus?.(),
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const rerender = () => forceUpdate((n) => n + 1);
    editor.on("selectionUpdate", rerender);
    editor.on("transaction", rerender);
    return () => {
      editor.off("selectionUpdate", rerender);
      editor.off("transaction", rerender);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 transition-colors focus-within:ring-1 focus-within:ring-ring">
      {showToolbar && <Toolbar editor={editor} disabled={!!disabled} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 px-2 py-1.5">
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={disabled}
        title="Negrita (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={disabled}
        title="Itálica (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={disabled}
        title="Tachado"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border/60" />

      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={disabled}
        title="Lista con viñetas"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={disabled}
        title="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border/60" />

      <LinkButton editor={editor} disabled={disabled} />

      <EmojiPicker
        disabled={disabled}
        onPick={(emoji) => editor.chain().focus().insertContent(emoji).run()}
      />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  disabled,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active && "bg-primary/10 text-primary",
      )}
    >
      {children}
    </button>
  );
}

function LinkButton({
  editor,
  disabled,
}: {
  editor: Editor;
  disabled?: boolean;
}) {
  const isActive = editor.isActive("link");

  const handleClick = () => {
    if (isActive) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("URL del enlace:");
    if (!url) return;
    // Normaliza: si no tiene protocolo, agrega https://
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalized })
      .run();
  };

  return (
    <ToolbarButton
      active={isActive}
      onClick={handleClick}
      disabled={disabled}
      title={isActive ? "Quitar enlace" : "Agregar enlace"}
    >
      <LinkIcon className="h-4 w-4" />
    </ToolbarButton>
  );
}

function EmojiPicker({
  onPick,
  disabled,
}: {
  onPick: (emoji: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          title="Emojis"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground",
            "disabled:cursor-not-allowed disabled:opacity-40",
            open && "bg-primary/10 text-primary",
          )}
        >
          <Smile className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-72 overflow-y-auto p-3">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label} className="mb-3 last:mb-0">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <div className="grid grid-cols-10 gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onPick(emoji);
                      setOpen(false);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-lg transition-colors hover:bg-muted"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
