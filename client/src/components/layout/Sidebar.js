"use client";

import Link from "next/link";
import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <div className={`${open ? "w-64" : "w-20"} bg-gray-900 text-white min-h-screen p-4 transition-all duration-300`}>

      {/* TOGGLE */}
      <button
        onClick={() => setOpen(!open)}
        className="mb-6 text-sm bg-gray-700 px-2 py-1 rounded"
      >
        {open ? "⬅" : "➡"}
      </button>

      {/* MENU */}
      <div className="flex flex-col gap-4">

        <Link href="/" className="hover:text-blue-400">
          🏠 {open && "Home"}
        </Link>

        <Link href="/patient" className="hover:text-blue-400">
          👤 {open && "Patient"}
        </Link>

        <Link href="/doctor" className="hover:text-blue-400">
          🩺 {open && "Doctor"}
        </Link>

        <Link href="/admin" className="hover:text-blue-400">
          🛠 {open && "Admin"}
        </Link>

      </div>
    </div>
  );
}