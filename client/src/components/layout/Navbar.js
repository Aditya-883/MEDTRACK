'use client'
import Link from 'next/link'
import ThemeToggle from "./ThemeToggle"

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        🏥 <span className="brand">MedTrack</span>
      </div>

      {/* CENTER */}
      <div className="nav-links">
        <Link href="/">🏠 Home</Link>
        <Link href="/admin/login">🛠️ Admin</Link>
        <Link href="/doctor/login">🩺 Doctor</Link>
        <Link href="/patient/login">🧑 Patient</Link>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        <ThemeToggle />
      </div>
    </nav>
  )
}
