import apiClient from './client.js';

/**
 * Admin login: signs a fixed message with MetaMask and exchanges it for a JWT.
 * Stores token, role, and wallet in localStorage.
 */
export async function adminLogin() {
  if (!window.ethereum) throw new Error('MetaMask not installed');

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const address = accounts[0];
  const message = 'Admin Login';

  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, address],
  });

  const { data } = await apiClient.post('/auth/login', { address, signature });

  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.role);
  localStorage.setItem('wallet', data.address);

  return data;
}

/**
 * Fetch a user's record by wallet address.
 * Auto-registers as "patient" if the address is new.
 */
export async function checkUserRole(address) {
  try {
    const normalized = address.toLowerCase();

    const { data } = await apiClient.get(`/users/${normalized}`);
    return data;
  } catch (err) {
    if (err.response?.status === 404) {
      // Not registered yet → auto-register as patient
      try {
        const { data } = await apiClient.post('/users/register', {
          address: address.toLowerCase(),
          role: 'patient',
        });
        return data;
      } catch {
        return null;
      }
    }
    console.error('checkUserRole error:', err);
    return null;
  }
}

/**
 * Explicitly register a user with a given role.
 */
export async function registerUser(address, role = 'patient') {
  try {
    const { data } = await apiClient.post('/users/register', {
      address: address.toLowerCase(),
      role,
    });
    return data;
  } catch (err) {
    console.error('registerUser error:', err);
    return null;
  }
}
