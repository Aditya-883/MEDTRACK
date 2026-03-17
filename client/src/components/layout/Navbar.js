"use client";

import { useWeb3 } from "../../context/Web3Context";

export default function Navbar() {
  const { account, connectWallet } = useWeb3();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <h1 className="text-xl font-bold">MedTrack</h1>

      {account ? (
        <span className="text-green-400 font-mono">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      )}
    </nav>
  );
}