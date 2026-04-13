"use client";

import { useEffect } from "react";

export default function WalletListener() {
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const syncWallet = async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        const acc = accounts[0] || null;

        if (acc) {
          localStorage.setItem("wallet", acc);
        } else {
          localStorage.removeItem("wallet");
        }
      } catch (err) {
        console.error("WalletListener sync error:", err);
      }
    };

    syncWallet();
    window.ethereum.on("accountsChanged", syncWallet);

    return () => {
      window.ethereum.removeListener("accountsChanged", syncWallet);
    };
  }, []);

  return null;
}
