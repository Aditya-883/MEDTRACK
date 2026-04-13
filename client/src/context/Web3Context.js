"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { NETWORK } from "../web3/config";

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (address) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${address}`);
      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
        return data.role;
      }
    } catch (err) {
      console.error("Role fetch error:", err);
    }
    return null;
  };

  const connectWallet = async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      await switchNetwork();

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const addr = accounts[0];
      setAccount(addr);
      await fetchRole(addr);
    } catch (err) {
      console.error("Wallet connection error:", err);
      alert("Wallet connection failed");
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainId }],
      });
    } catch (err) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [NETWORK],
          });
        } catch (addErr) {
          console.error("Add network error:", addErr);
        }
      } else {
        console.error("Switch network error:", err);
      }
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (typeof window !== "undefined" && window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            const addr = accounts[0];
            setAccount(addr);
            await fetchRole(addr);
          }
        }
      } catch (err) {
        console.error("Check connection error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountChange = async (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setRole(null);
        } else {
          const addr = accounts[0];
          setAccount(addr);
          await fetchRole(addr);
        }
      };
      window.ethereum.on("accountsChanged", handleAccountChange);
      return () => window.ethereum.removeListener("accountsChanged", handleAccountChange);
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, role, connectWallet, loading }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error("useWeb3 must be used within Web3Provider");
  return context;
};
