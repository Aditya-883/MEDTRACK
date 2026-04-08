"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const SESSION_TIME = 30 * 60 * 1000;

export default function Sidebar({ onConnect }) {
  const [expanded, setExpanded] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedWallet = localStorage.getItem("wallet");
    const sessionTime = localStorage.getItem("sessionTime");

    if (savedWallet && sessionTime) {
      const now = Date.now();

      if (now - sessionTime < SESSION_TIME) {
        setWallet(savedWallet);

        const remaining = SESSION_TIME - (now - sessionTime);
        setTimeout(() => disconnectWallet(), remaining);
      } else {
        disconnectWallet();
      }
    }
  }, []);

  const shortenAddress = (addr) =>
    addr.slice(0, 6) + "..." + addr.slice(-4);

  const connectWallet = async () => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        alert("Install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const message = `Login to MedTrack at ${new Date().toISOString()}`;
      const signature = await signer.signMessage(message);

      const recovered = ethers.verifyMessage(message, signature);

      if (recovered.toLowerCase() === address.toLowerCase()) {
        setWallet(address);

        localStorage.setItem("wallet", address);
        localStorage.setItem("sessionTime", Date.now());

        if (onConnect) onConnect();

        setTimeout(() => disconnectWallet(), SESSION_TIME);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    localStorage.removeItem("wallet");
    localStorage.removeItem("sessionTime");
  };

  return (
    <>
      {/* 🔥 OVERLAY (only when expanded) */}
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
            className="mb-6 w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded"
          >
            ☰
          </button>

          {/* Menu */}
          <div className="flex flex-col gap-4 text-sm">
            <Link href="/" className="flex items-center gap-2 hover:text-blue-400">
              🏠 {expanded && "Home"}
            </Link>

            <Link href="/patient" className="flex items-center gap-2 hover:text-blue-400">
              👤 {expanded && "Patient"}
            </Link>

            <Link href="/doctor" className="flex items-center gap-2 hover:text-blue-400">
              🩺 {expanded && "Doctor"}
            </Link>

            <Link href="/admin" className="flex items-center gap-2 hover:text-blue-400">
              🛠 {expanded && "Admin"}
            </Link>
          </div>
        </div>

        {/* BOTTOM */}
        <div>
          {!wallet ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className={`flex items-center justify-center rounded-lg text-sm
              ${expanded ? "w-full py-2" : "w-10 h-10"}
              ${loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                expanded ? "🔗 Connect" : "🔗"
              )}
            </button>
          ) : (
            <div
              className={`bg-gray-800 rounded-lg border border-gray-700 text-center
              ${expanded ? "p-3" : "w-10 h-10 flex items-center justify-center"}`}
            >
              {expanded ? (
                <>
                  <p className="text-green-400 text-xs mb-1">● Connected</p>
                  <p className="text-xs text-gray-400 mb-2">
                    {shortenAddress(wallet)}
                  </p>
                  <button
                    onClick={disconnectWallet}
                    className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button onClick={disconnectWallet}>🔌</button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}