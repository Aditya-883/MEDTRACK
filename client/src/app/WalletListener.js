'use client';

import { useEffect } from 'react';

export default function WalletListener() {

  useEffect(() => {
    if (!window.ethereum) return;

    let currentAccount = null;

    const syncWallet = async () => {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      const acc = accounts[0] || null;

      if (currentAccount !== acc) {
        currentAccount = acc;

        if (acc) {
          localStorage.setItem("wallet", acc);
        } else {
          localStorage.removeItem("wallet");
        }

        console.log("🔥 Wallet Synced:", acc);

        window.dispatchEvent(
          new CustomEvent("walletChanged", { detail: acc })
        );
      }
    };

    // initial load
    syncWallet();

    window.ethereum.on('accountsChanged', syncWallet);

    return () => {
      window.ethereum.removeListener('accountsChanged', syncWallet);
    };
  }, []);

  return null;
}