import type { ReactionType } from "@/types/feed.types";

export const REACTIONS_META: Record<
  ReactionType,
  { emoji: string; label: string; color: string; bg: string }
> = {
  LIKE: {
    emoji: "👍",
    label: "Me gusta",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  LOVE: {
    emoji: "❤️",
    label: "Me encanta",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  CELEBRATE: {
    emoji: "🎉",
    label: "Celebrar",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  SUPPORT: {
    emoji: "🤗",
    label: "Apoyo",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  INSIGHTFUL: {
    emoji: "💡",
    label: "Interesante",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
};

export const REACTIONS_ORDER: ReactionType[] = [
  "LIKE",
  "LOVE",
  "CELEBRATE",
  "SUPPORT",
  "INSIGHTFUL",
];

export const POST_TYPE_LABELS: Record<
  "PUBLICATION" | "RECOGNITION" | "ANNOUNCEMENT",
  string
> = {
  PUBLICATION: "Publicación",
  RECOGNITION: "Reconocimiento",
  ANNOUNCEMENT: "Comunicado oficial",
};

export const POST_TYPE_BADGE: Record<
  "PUBLICATION" | "RECOGNITION" | "ANNOUNCEMENT",
  { label: string; className: string }
> = {
  PUBLICATION: {
    label: "Publicación",
    className: "bg-secondary text-secondary-foreground",
  },
  RECOGNITION: {
    label: "🏆 Reconocimiento",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  ANNOUNCEMENT: {
    label: "📢 Comunicado oficial",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
};
