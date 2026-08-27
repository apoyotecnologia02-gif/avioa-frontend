const LEVEL_TO_COUNT: Record<string, number> = {
  VERY_WEAK: 1,
  WEAK: 2,
  MEDIUM: 3,
  STRONG: 4,
  VERY_STRONG: 5,
};

const LEVEL_TO_COLOR: Record<string, string> = {
  VERY_WEAL: "bg-red-500",
  WEAK: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  STRONG: "bg-green-500",
  VERY_STRONG: "bg-emerald-600",
};

export function StrengthDots({ level }: { level?: string }) {
  if (!level) return null;
  const filled = LEVEL_TO_COUNT[level] ?? 0;
  const color = LEVEL_TO_COLOR[level] ?? "bg-muted";

  return (
    <div className="flex gap-0.5" title={level}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < filled ? color : "bg-muted"}`}
        />
      ))}
    </div>
  );
}
