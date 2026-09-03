export function normalizeRole(role: unknown): string {
  if (typeof role !== "string") return "";
  return role.trim().toLowerCase();
}

export function isAdminRole(role: unknown): boolean {
  return normalizeRole(role) === "admin";
}

export function isLeaderOrManagerOrAdminRole(
  roleOrUser: unknown,
  isLeaderParam?: boolean,
): boolean {
  if (roleOrUser && typeof roleOrUser === "object") {
    const userObj = roleOrUser as { role?: unknown; isLeader?: boolean };
    if (userObj.isLeader === true) return true;
    return isLeaderOrManagerOrAdminRole(userObj.role, userObj.isLeader);
  }

  return (
    Boolean(isLeaderParam) ||
    normalizeRole(roleOrUser) === "leader" ||
    normalizeRole(roleOrUser) === "manager" ||
    normalizeRole(roleOrUser) === "admin"
  );
}

export function isLeaderRole(
  roleOrUser: unknown,
  isLeaderParam?: boolean,
): boolean {
  if (roleOrUser && typeof roleOrUser === "object") {
    const userObj = roleOrUser as { role?: unknown; isLeader?: boolean };
    if (userObj.isLeader === true) return true;
    return isLeaderRole(userObj.role, userObj.isLeader);
  }

  return Boolean(isLeaderParam) || normalizeRole(roleOrUser) === "leader";
}

