"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAppSelector(state => state.auth);
  const isRehydrated = useAppSelector(
    state => (state.auth as any)._persist?.rehydrated ?? false
  );

  useEffect(() => {
    if (isRehydrated && !loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, isRehydrated, router]);

  if (!isRehydrated || loading || !user) {
    return <div>Checking authentication...</div>;
  }

  return <>{children}</>;
}
