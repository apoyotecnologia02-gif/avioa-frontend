export function formatDateOnly(date: string | Date | null | undefined): string {
  if (!date) return "";

  const value =
    typeof date === "string"
      ? date.slice(0, 10)
      : date.toISOString().slice(0, 10);

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return "";

  return new Date(year, month - 1, day).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}
