"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { NETWORK } from "../web3/config";
import { getRole } from "../lib/roles";

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔌 CONNECT WALLET
  const connectWallet = async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      // 👉 Switch network FIRST
      await switchNetwork();

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const addr = accounts[0];

      console.log("Connected Address:", addr);

      setAccount(addr);

      // 👉 SET ROLE
      const userRole = getRole(addr);
      console.log("Detected Role:", userRole);

      setRole(userRole);
    } catch (err) {
      console.error("Wallet connection error:", err);
      alert("Wallet connection failed");
    }
  };

  // 🌐 SWITCH NETWORK
  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainId }],
      });
    } catch (err) {
      // 👉 Network not added
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

  // 🔄 CHECK EXISTING CONNECTION (ON LOAD)
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
            setRole(getRole(addr));
          }
        }
      } catch (err) {
        console.error("Check connection error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        role,
        connectWallet,
        loading,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// 🔁 CUSTOM HOOK
export const useWeb3 = () => {
  const context = useContext(Web3Context);

  if (!context) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }

  return context;
};