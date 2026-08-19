import { PasswordStrengthEnum } from "./enums/password_strength.enum";

export function StrengthBadge({ level }: { level?: string }) {
  return (
    <span
      className={`${
        level === "WEAK" || level === "VERY_WEAK"
          ? "text-red-500"
          : "text-green-500"
      } text-sm font-medium`}
    >
      {PasswordStrengthEnum[level as keyof typeof PasswordStrengthEnum]}
    </span>
  );
}
