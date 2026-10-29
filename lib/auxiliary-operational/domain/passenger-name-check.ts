/** Comparison aids for names entered by the operator; no identity lookup occurs here. */
export const cleanPassengerName = (value: string) =>
  value.normalize("NFC").replace(/\s+/gu, " ").trim();
export const identityNumberForCopy = (value: string) =>
  value.replace(/[.\s]/gu, "");
export const validIdentityNumber = (value: string) =>
  /^\d{1,15}$/.test(identityNumberForCopy(value));
export function comparePassengerNames(
  reservation: string,
  names: string,
  surnames: string,
): "empty" | "match" | "different" {
  const a = cleanPassengerName(reservation),
    b = cleanPassengerName(names) + " " + cleanPassengerName(surnames);
  if (!a || !cleanPassengerName(names) || !cleanPassengerName(surnames))
    return "empty";
  return a.toLocaleUpperCase("es-CO") === b.toLocaleUpperCase("es-CO")
    ? "match"
    : "different";
}
