"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState("patient")
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleRegister = () => {
    if (!id || !password) {
      setError("❌ All fields are required")
      return
    }

    const success = registerUser(id, password, role)

    if (!success) {
      setError("❌ User already exists")
      return
    }

    router.push("/login")
  }

  return (
    <div style={{ padding: 40, maxWidth: 400 }}>
      <h1>📝 Register</h1>

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="admin">🛠️ Admin</option>
        <option value="doctor">🩺 Doctor</option>
        <option value="patient">🧑‍⚕️ Patient</option>
      </select>

      <br /><br />

      <input
        placeholder="Email / ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleRegister}>✅ Register</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}
