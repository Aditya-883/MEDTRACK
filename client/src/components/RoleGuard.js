'use client';

import { useEffect, useState } from 'react';
import { getRole } from '../lib/roles';

export default function RoleGuard({ children, allowedRole }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    async function checkRole() {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      const user = accounts[0];
      const role = getRole(user);

      if (role !== allowedRole) {
        alert(`Access Denied: Not a ${allowedRole}`);
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    }

    checkRole();
  }, [allowedRole]);

  if (authorized === null) return <p>Checking access...</p>;

  if (!authorized) return <p>Unauthorized</p>;

  return children;
}