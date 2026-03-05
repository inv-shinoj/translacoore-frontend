export type UserRole = "Admin" | "Manager" | "Team Lead" | "Employee";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
}
