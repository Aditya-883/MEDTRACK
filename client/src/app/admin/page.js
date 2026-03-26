'use client';

import RoleGuard from '../../components/RoleGuard';

function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">🛠️ Admin Dashboard</h1>
      <p>System control panel</p>
    </div>
  );
}

export default function AdminWrapper() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminDashboard />
    </RoleGuard>
  );
}