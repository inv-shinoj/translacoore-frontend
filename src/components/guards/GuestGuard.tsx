"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!loading && user) {
      console.log("[GuestGuard] Already authenticated — redirecting to /admin/dashboard");
      router.replace("/admin/dashboard");
    }
  }, [user, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
