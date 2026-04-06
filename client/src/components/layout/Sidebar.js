"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const SESSION_TIME = 30 * 60 * 1000; // 30 minutes

export default function Sidebar({ onConnect }) {
  const [open, setOpen] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔄 Load wallet + check session expiry
  useEffect(() => {
    const savedWallet = localStorage.getItem("wallet");
    const sessionTime = localStorage.getItem("sessionTime");

    if (savedWallet && sessionTime) {
      const now = Date.now();

      if (now - sessionTime < SESSION_TIME) {
        setWallet(savedWallet);

        // 🔥 auto logout timer
        const remaining = SESSION_TIME - (now - sessionTime);
        setTimeout(() => {
          disconnectWallet();
        }, remaining);

      } else {
        disconnectWallet();
      }
    }
  }, []);

  // Shorten wallet address
  const shortenAddress = (addr) => {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  // 🔗 CONNECT
  const connectWallet = async () => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        alert("Please install MetaMask");
        setLoading(false);
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
        localStorage.setItem("sessionTime", Date.now()); // 🔥 SAVE TIME

        let users = JSON.parse(localStorage.getItem("users")) || [];
        let isNew = false;

        if (!users.includes(address)) {
          users.push(address);
          localStorage.setItem("users", JSON.stringify(users));
          isNew = true;
        }

        if (onConnect) onConnect(isNew);

        // 🔥 AUTO LOGOUT AFTER 30 MIN
        setTimeout(() => {
          disconnectWallet();
        }, SESSION_TIME);

      } else {
        alert("Verification failed ❌");
      }
    } catch (error) {
      console.error(error);
      alert("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔌 DISCONNECT
  const disconnectWallet = () => {
    setWallet(null);
    localStorage.removeItem("wallet");
    localStorage.removeItem("sessionTime");
  };

  return (
    <div
      className={`${
        open ? "w-64" : "w-20"
      } bg-gradient-to-b from-gray-900 to-gray-950 text-white min-h-screen p-4 transition-all duration-300`}
    >
      {/* Toggle */}
<button
  onClick={() => setOpen(!open)}
  className="mb-6 flex flex-col justify-center items-center gap-1 w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded"
>
  <span className={`block h-0.5 w-5 bg-white transition-all ${open ? "rotate-45 translate-y-1.5" : ""}`}></span>
  <span className={`block h-0.5 w-5 bg-white transition-all ${open ? "opacity-0" : ""}`}></span>
  <span className={`block h-0.5 w-5 bg-white transition-all ${open ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
</button>

      {/* Menu */}
      <div className="flex flex-col gap-4 items-center">

        <Link href="/" className="hover:text-blue-400 w-full">
          🏠 {open && "Home"}
        </Link>

        <Link href="/patient" className="hover:text-blue-400 w-full">
          👤 {open && "Patient"}
        </Link>

        <Link href="/doctor" className="hover:text-blue-400 w-full">
          🩺 {open && "Doctor"}
        </Link>

        <Link href="/admin" className="hover:text-blue-400 w-full">
          🛠 {open && "Admin"}
        </Link>

        {/* CONNECT SECTION */}
        <div className="mt-6 w-full flex justify-center">

          {!wallet ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className={`flex items-center justify-center gap-2
              ${open ? "w-full px-3 py-2" : "w-10 h-10"} 
              rounded-lg text-sm
              ${
                loading
                  ? "bg-gray-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>🔗 {open && "Connect"}</>
              )}
            </button>
          ) : (
            <div
              className={`bg-gray-800 rounded-lg shadow border border-gray-700
              ${open ? "p-4 w-full text-center" : "w-10 h-10 flex items-center justify-center"}`}
            >
              {open ? (
                <>
                  <p className="text-green-400 text-sm mb-2">● Connected</p>

                  <p className="text-xs text-gray-400 mb-3">
                    {shortenAddress(wallet)}
                  </p>

                  <button
                    onClick={disconnectWallet}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={disconnectWallet}
                  title="Disconnect Wallet"
                  className="text-red-400 text-lg"
                >
                  🔌
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}