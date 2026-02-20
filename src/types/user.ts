export type UserRole = "Admin" | "Manager" | "Team Lead" | "Employee";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}
