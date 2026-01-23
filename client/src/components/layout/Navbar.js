"use client";

import Link from "next/link";
import { useAuth } from "../../auth/authContext";
import { ROLES } from "../../auth/roles";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          MedTrack
        </Link>

        <div className="flex items-center gap-6">
          {!user.isAuthenticated && (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Login
            </Link>
          )}

          {user.isAuthenticated && user.role === ROLES.PATIENT && (
            <Link href="/patient" className="text-blue-600 font-medium">
              Patient
            </Link>
          )}

          {user.isAuthenticated && user.role === ROLES.DOCTOR && (
            <Link href="/doctor" className="text-green-600 font-medium">
              Doctor
            </Link>
          )}

          {user.isAuthenticated && (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
