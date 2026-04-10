"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [dark, setDark] = useState(false);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // To Apply theme change
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

          {/* ❌ REMOVED HOME */}

          {/* ❌ REMOVED CONNECT DROPDOWN */}

          {/* THEME TOGGLE */}
          <button
            onClick={() => setDark((prev) => !prev)}
            className="px-3 py-1 rounded-lg border hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {dark ? "🌙 Dark" : "☀️ Light"}
          </button>

        </div>
      </div>
    </nav>
  );
}