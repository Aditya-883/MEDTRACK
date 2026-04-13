"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const SESSION_TIME = 30 * 60 * 1000;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function Sidebar({ onConnect }) {
  const [expanded, setExpanded] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Apply theme change
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Restore session on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("wallet");
    const savedRole = localStorage.getItem("role");
    const sessionTime = localStorage.getItem("sessionTime");

    if (savedWallet && sessionTime) {
      const now = Date.now();
      if (now - Number(sessionTime) < SESSION_TIME) {
        setWallet(savedWallet);
        setRole(savedRole);
        const remaining = SESSION_TIME - (now - Number(sessionTime));
        setTimeout(() => disconnectWallet(), remaining);
      } else {
        disconnectWallet();
      }
    }

    // Listen for wallet changes from MetaMask
    if (window.ethereum) {
      const handleChange = (accounts) => {
        if (accounts.length === 0) disconnectWallet();
        else {
          window.location.reload();
        }
      };
      window.ethereum.on("accountsChanged", handleChange);
      return () => window.ethereum.removeListener("accountsChanged", handleChange);
    }
  }, []);

  const shortenAddress = (addr) => addr.slice(0, 6) + "..." + addr.slice(-4);

  const registerUser = async (address) => {
    try {
      const res = await fetch(`${BASE_URL}/users/${address}`);
      if (res.ok) {
        const user = await res.json();
        return user.role;
      }
      const createRes = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, role: "patient" }),
      });
      if (createRes.ok) {
        const user = await createRes.json();
        return user.role;
      }
    } catch (err) {
      console.error("Register error:", err);
    }
    return "patient";
  };

  const connectWallet = async () => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      // Switch/add Sepolia
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0xaa36a7",
              chainName: "Sepolia Testnet",
              rpcUrls: ["https://rpc.sepolia.org"],
              nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            }],
          });
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const message = `Login to MedTrack at ${new Date().toISOString()}`;
      const signature = await signer.signMessage(message);
      const recovered = ethers.verifyMessage(message, signature);

      if (recovered.toLowerCase() !== address.toLowerCase()) {
        alert("Signature verification failed");
        return;
      }

      const userRole = await registerUser(address.toLowerCase());

      setWallet(address);
      setRole(userRole);

      localStorage.setItem("wallet", address);
      localStorage.setItem("role", userRole);
      localStorage.setItem("sessionTime", Date.now().toString());

      if (onConnect) onConnect(true);

      setTimeout(() => disconnectWallet(), SESSION_TIME);
    } catch (err) {
      console.error("Connect error:", err);
      alert("Wallet connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setRole(null);
    localStorage.removeItem("wallet");
    localStorage.removeItem("role");
    localStorage.removeItem("sessionTime");
    localStorage.removeItem("token");
  };

  const roleColors = {
    admin: "text-purple-400",
    doctor: "text-blue-400",
    patient: "text-green-400",
  };

  return (
    <>
      {expanded && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-3
        shadow-lg flex flex-col justify-between transition-all duration-300
        ${expanded ? "w-64" : "w-16"}`}
      >
        {/* TOP */}
        <div>
          {/* Burger */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mb-6 w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            ☰
          </button>

          {/* Brand */}
          {expanded && (
            <div className="mb-4 px-2">
              <p className="text-white font-bold text-lg">🏥 MedTrack</p>
              <p className="text-gray-400 text-xs">Blockchain Healthcare</p>
            </div>
          )}

          {/* Nav Links */}
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="flex items-center gap-3 hover:text-blue-400 px-2 py-2 rounded hover:bg-gray-800 transition">
              🏠 {expanded && "Home"}
            </Link>
            <Link href="/patient" className="flex items-center gap-3 hover:text-blue-400 px-2 py-2 rounded hover:bg-gray-800 transition">
              👤 {expanded && "Patient Portal"}
            </Link>
            <Link href="/doctor" className="flex items-center gap-3 hover:text-blue-400 px-2 py-2 rounded hover:bg-gray-800 transition">
              🩺 {expanded && "Doctor Dashboard"}
            </Link>
            <Link href="/admin" className="flex items-center gap-3 hover:text-blue-400 px-2 py-2 rounded hover:bg-gray-800 transition">
              🛠 {expanded && "Admin Panel"}
            </Link>
          </div>

          {/* Theme Toggle */}
          <div className="mt-4">
            <button
              onClick={() => setDark((prev) => !prev)}
              className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-800 transition text-sm w-full ${expanded ? "" : "justify-center"}`}
            >
              {dark ? "🌙" : "☀️"} {expanded && (dark ? "Dark Mode" : "Light Mode")}
            </button>
          </div>
        </div>

        {/* BOTTOM - Wallet */}
        <div>
          {!wallet ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className={`flex items-center justify-center rounded-lg text-sm font-medium transition
              ${expanded ? "w-full py-2 px-3 gap-2" : "w-10 h-10"}
              ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : expanded ? "🔗 Connect Wallet" : "🔗"}
            </button>
          ) : (
            <div className={`bg-gray-800 rounded-lg border border-gray-700 ${expanded ? "p-3" : "w-10 h-10 flex items-center justify-center"}`}>
              {expanded ? (
                <>
                  <p className="text-green-400 text-xs mb-1">● Connected</p>
                  <p className="text-xs text-gray-300 font-mono mb-1">{shortenAddress(wallet)}</p>
                  {role && (
                    <p className={`text-xs mb-2 font-semibold ${roleColors[role] || "text-gray-400"}`}>
                      {role.toUpperCase()}
                    </p>
                  )}
                  <button
                    onClick={disconnectWallet}
                    className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs w-full transition"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <span title={`Connected: ${wallet}`}>🟢</span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
