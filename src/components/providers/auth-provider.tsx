"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else if (status === "unauthenticated") {
      setAccessToken(null);
    }
  }, [session, status, setAccessToken]);

  return <>{children}</>;
}
