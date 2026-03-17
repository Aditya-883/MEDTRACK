"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getProvider } from "../web3/provider";
import { NETWORK } from "../web3/config";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔌 Connect wallet
  const connectWallet = async () => {
    console.log("Ethereum object:", window.ethereum);
    try {
      if (!window.ethereum) {
        alert("Install MetaMask");
        return;
      }

      const provider = getProvider();

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);

      await switchNetwork();
    } catch (error) {
      console.error(error);
    }
  };

  // 🌐 Switch to Hardhat network
  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainId }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [NETWORK],
        });
      }
    }
  };

  // 🔄 Auto reconnect
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
      setLoading(false);
    };

    checkConnection();
  }, []);

  // 🔁 Account change listener
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        connectWallet,
        loading,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);