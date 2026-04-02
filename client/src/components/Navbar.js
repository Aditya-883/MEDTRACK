"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [dark, setDark] = useState(false);

  // ✅ Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // ✅ Apply theme change
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">

      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

        {/* LOGO */}
        <h1 className="text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
          🏥
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            MedTrack
          </span>
        </h1>

        {/* MENU */}
        <div className="flex items-center gap-8">

          {/* HOME */}
          <Link href="/" className="hover:text-blue-500 transition">
            Home
          </Link>

          {/* CONNECT DROPDOWN */}
          <div className="relative group">
            <span className="cursor-pointer flex items-center gap-1 hover:text-blue-500 transition">
              Connect
              <span className="text-xs">▼</span>
            </span>

            <div className="absolute left-0 mt-3 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-1">
              
              <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">

                <Link href="/patient" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Patient
                </Link>

                <Link href="/doctor" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Doctor
                </Link>

                <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Admin
                </Link>

              </div>
            </div>
          </div>

          {/* THEME TOGGLE */}
          <button
            onClick={() => setDark((prev) => !prev)} // ✅ safer toggle
            className="px-3 py-1 rounded-lg border hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {dark ? "🌙 Dark" : "☀️ Light"}
          </button>

        </div>
      </div>
    </nav>
  );
}