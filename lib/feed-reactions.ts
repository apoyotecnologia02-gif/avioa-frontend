import { ReactionType } from "@/types/feed.types";

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] =
  [
    { type: ReactionType.LIKE, emoji: "👍", label: "Me gusta" },
    { type: ReactionType.CELEBRATE, emoji: "🎉", label: "Celebrar" },
    { type: ReactionType.SUPPORT, emoji: "💪", label: "Apoyo" },
    { type: ReactionType.LOVE, emoji: "❤️", label: "Me encanta" },
  ];
