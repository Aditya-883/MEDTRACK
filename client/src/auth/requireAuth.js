"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./authContext";

export function RequireAuth({ role, children }) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user.isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace("/login");
    }
  }, [user, role, router]);

  // While redirecting, render nothing
  if (!user.isAuthenticated || (role && user.role !== role)) {
    return null;
  }

  return children;
}
