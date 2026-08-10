export function StrengthBadge({ level }: { level?: string }) {
  return (
    <span
      className={`${
        level === "WEAK" ? "text-red-500" : "text-green-500"
      } text-sm font-medium`}
    >
      {level}
    </span>
  );
}
