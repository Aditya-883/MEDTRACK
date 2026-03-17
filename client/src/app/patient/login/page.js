'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PatientLogin() {
  const router = useRouter()
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    const ok = loginUser(id, password, "patient")
    if (!ok) {
      setError("❌ Invalid Patient ID or Password")
      return
    }
    router.push("/patient")
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>👦 Patient Login</h2>

        <label>Patient ID</label>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>➡️ Login</button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  )
}
