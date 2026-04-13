"use client";
import { useAuth } from "./authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function requireAuth(Component, role) {
  return function Protected() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!user || user.role !== role) {
        router.replace("/");
      }
    }, [user, router]);

    if (!user) return <p className="container">Loading...</p>;

    return <Component />;
  };
}
