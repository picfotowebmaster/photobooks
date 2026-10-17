export const ADMIN_ROLES = ["admin", "superadmin"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type AccountRole = AdminRole | "client";

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return role === "admin" || role === "superadmin";
}

export function isSuperadmin(role: string | null | undefined): boolean {
  return role === "superadmin";
}
