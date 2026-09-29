export function computeTotalHours(
  startTime?: string | null,
  endTime?: string | null,
): number | null {
  if (!startTime || !endTime) return null;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return null;
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return null;
  return Math.round((mins / 60) * 100) / 100;
}

export function formatHours(h: number): string {
  const total = Math.round(h * 60);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
