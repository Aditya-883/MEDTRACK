'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginUser } from "@/lib/auth"

export default function AdminLogin() {
  const router = useRouter()
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    const ok = loginUser(id, password, "admin")
    if (!ok) {
      setError("❌ Invalid Admin ID or Password")
      return
    }
    router.push("/admin")
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>🛠️ Admin Login</h2>

        <label>Admin ID</label>
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
