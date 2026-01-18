"use client";

import Link from "next/link";
import { useAuth } from "../../auth/authContext";
import { ROLES } from "../../auth/roles";

export default function Navbar() {
  const {
    user,
    loginAsPatient,
    loginAsDoctor,
    loginAsAdmin,
    logout,
  } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          MedTrack
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          {!user.isAuthenticated && (
            <>
              <button
                onClick={loginAsPatient}
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                Login as Patient
              </button>
              <button
                onClick={loginAsDoctor}
                className="text-sm text-gray-700 hover:text-green-600"
              >
                Login as Doctor
              </button>
              <button
                onClick={loginAsAdmin}
                className="text-sm text-gray-700 hover:text-purple-600"
              >
                Login as Admin
              </button>
            </>
          )}

          {user.isAuthenticated && user.role === ROLES.PATIENT && (
            <Link href="/patient" className="font-medium text-blue-600">
              Patient Dashboard
            </Link>
          )}

          {user.isAuthenticated && user.role === ROLES.DOCTOR && (
            <Link href="/doctor" className="font-medium text-green-600">
              Doctor Dashboard
            </Link>
          )}

          {user.isAuthenticated && user.role === ROLES.ADMIN && (
            <Link href="/admin" className="font-medium text-purple-600">
              Admin Console
            </Link>
          )}

          {user.isAuthenticated && (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
