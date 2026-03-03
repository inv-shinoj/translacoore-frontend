"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/user";

interface Props {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const roleHome: Record<UserRole, string> = {
  Admin: "/admin/dashboard",
  Manager: "/manager/project",
  "Team Lead": "/admin/dashboard",
  Employee: "/admin/dashboard",
};

export default function RoleGuard({ allowedRoles, children }: Props) {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const isRehydrated = useAppSelector(
    (s) => (s.auth as any)._persist?.rehydrated ?? false
  );

  useEffect(() => {
    if (!isRehydrated || !user) return;
    if (!allowedRoles.includes(user.role)) {
      console.log(`[RoleGuard] Role "${user.role}" not allowed — redirecting`);
      router.replace(roleHome[user.role] ?? "/login");
    }
  }, [user, isRehydrated]);

  if (!isRehydrated || !user) return null;
  if (!allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
