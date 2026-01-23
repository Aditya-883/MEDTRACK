"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../auth/authContext";
import { ROLES } from "../../auth/roles";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginAsPatient, loginAsDoctor } = useAuth();

  useEffect(() => {
    if (user.isAuthenticated) {
      if (user.role === ROLES.PATIENT) router.replace("/patient");
      if (user.role === ROLES.DOCTOR) router.replace("/doctor");
    }
  }, [user, router]);

  return (
    <section className="space-y-6 max-w-xl">
      <h1 className="text-3xl font-bold">Login</h1>

      <p className="text-gray-700">
        Select your role to continue. Wallet-based authentication will replace
        this step later.
      </p>

      <div className="flex gap-4">
        <button
          onClick={loginAsPatient}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Continue as Patient
        </button>

        <button
          onClick={loginAsDoctor}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Continue as Doctor
        </button>
      </div>
    </section>
  );
}
