export function normalizeRole(role: unknown): string {
  if (typeof role !== 'string') return ''
  return role.trim().toLowerCase()
}

export function isAdminRole(role: unknown): boolean {
  return normalizeRole(role) === 'admin'
}
