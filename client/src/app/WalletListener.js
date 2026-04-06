'use client';

import { useEffect } from 'react';

export default function WalletListener() {
  useEffect(() => {
    if (!window.ethereum) return;

    let currentAccount = null;

    const getInitialAccount = async () => {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      currentAccount = accounts[0];
    };

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) return;

      const newAccount = accounts[0];

      // ✅ Only reload if account ACTUALLY changed
      if (currentAccount && newAccount !== currentAccount) {
        window.location.reload();
      }

      currentAccount = newAccount;
    };

    getInitialAccount();

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  return null;
}