const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ADMIN LOGIN (signature-based, stores JWT)
export async function adminLogin() {
  if (!window.ethereum) throw new Error("MetaMask not installed");

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const address = accounts[0];
  const message = "Admin Login";

  const signature = await window.ethereum.request({
    method: "personal_sign",
    params: [message, address],
  });

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, signature }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Admin login failed");
  }

  const data = await res.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("wallet", data.address);
  return data;
}

// CHECK USER ROLE — auto-registers if not found
export async function checkUserRole(address) {
  try {
    const normalizedAddress = address.toLowerCase();

    // Try fetching existing user
    const res = await fetch(`${BASE_URL}/users/${normalizedAddress}`);

    if (res.ok) {
      return await res.json();
    }

    // 404 = not registered yet → auto-register as patient
    if (res.status === 404) {
      const createRes = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: normalizedAddress, role: "patient" }),
      });
      if (createRes.ok) return await createRes.json();
    }

    return null;
  } catch (err) {
    console.error("checkUserRole error:", err);
    return null;
  }
}

// REGISTER USER explicitly
export async function registerUser(address, role = "patient") {
  try {
    const res = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: address.toLowerCase(), role }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("registerUser error:", err);
    return null;
  }
}
