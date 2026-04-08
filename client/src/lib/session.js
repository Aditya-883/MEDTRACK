export function getSession() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const wallet = localStorage.getItem('wallet');

  if (!token || !role || !wallet) return null;

  return { token, role, wallet };
}

export function setSession({ token, role, wallet }) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('wallet', wallet);
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('wallet');
}