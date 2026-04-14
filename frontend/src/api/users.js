import apiClient from './client.js';

/** Get all users — requires admin JWT (attached automatically by interceptor) */
export async function getAllUsers() {
  const { data } = await apiClient.get('/users');
  return data;
}

/** Update a user's role — requires admin JWT */
export async function updateUserRole(address, role) {
  const { data } = await apiClient.put(`/users/${address}/role`, { role });
  return data;
}
