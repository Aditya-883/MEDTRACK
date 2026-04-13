"use client";
import { useAuth } from "./authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function requireAuth(Component, role) {
  return function Protected() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Only redirect if user is loaded (not null due to init) and role doesn't match
      if (user !== undefined && (!user || user.role !== role)) {
        router.replace("/unauthorized");
      }
    }, [user, router]);

    // Still initializing
    if (user === undefined) return <p className="container">Loading...</p>;

    // Not authorized
    if (!user || user.role !== role) return null;

    return <Component />;
  };
}
