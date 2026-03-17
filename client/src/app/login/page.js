"use client";

import { useWeb3 } from "../../context/Web3Context";

export default function LoginPage() {
  const { account, connectWallet, loading } = useWeb3();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-6">MedTrack Login</h1>

      {account ? (
        <>
          <p className="mb-2">Connected Wallet:</p>
          <p className="text-green-600 font-mono break-all">
            {account}
          </p>
        </>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
}