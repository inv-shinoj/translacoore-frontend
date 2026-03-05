import { UserRole } from "@/types/user";

/**
 * Maps each user role to its home route.
 * Used in login redirect and RoleGuard to keep routing consistent.
 */
export const roleHome: Record<UserRole, string> = {
  Admin: "/admin/dashboard",
  Manager: "/manager/project",
  "Team Lead": "/employee/project",
  Employee: "/employee/project",
};

export function getRoleHome(role: UserRole): string {
  return roleHome[role] ?? "/login";
}
