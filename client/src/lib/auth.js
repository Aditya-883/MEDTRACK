const BASE_URL = "http://localhost:5000/api";

// 🔐 ADMIN LOGIN ONLY (signature)
export async function adminLogin() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const address = accounts[0];

  const message = `Admin Login`;

  const signature = await window.ethereum.request({
    method: "personal_sign",
    params: [message, address],
  });

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, signature }),
  });

  const data = await res.json();

  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("wallet", data.address);

  return data;
}

// ✅ NORMAL ROLE CHECK (NO SIGNATURE)
export async function checkUserRole(address) {
  const res = await fetch(`${BASE_URL}/users/${address}`);
  
  if (!res.ok) return null;

  return await res.json();
}