export const users = {
  admin: { id: "admin", password: "admin123" },
  doctor: { id: "doctor", password: "doctor123" },
  patient: { id: "patient", password: "patient123" }
}

export function loginUser(id, password, role) {
  const user = users[role]
  if (!user) return false
  return user.id === id && user.password === password
}
