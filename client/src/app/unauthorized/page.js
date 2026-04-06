"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 dark:from-gray-900 dark:to-black px-6">

      <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl text-center max-w-md w-full">

        {/* ICON */}
        <div className="text-5xl mb-4">🚫</div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Unauthorized Access
        </h1>

        {/* MESSAGE */}
        <p className="text-gray-500 dark:text-gray-300 mb-6">
          You do not have permission to view this page.
        </p>

        {/* BUTTON */}
        <button
          onClick={() => router.push("/")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
        >
          Back to Home
        </button>

      </div>
    </div>
  );
}