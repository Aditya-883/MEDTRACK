"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/Footer";

function Toast({ message, show }) {
  if (!show) return null;
  return (
    <div className="fixed top-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 border border-gray-700">
      {message}
    </div>
  );
}

export default function Home() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleConnect = () => {
    setToastMessage("Wallet connected 🎉");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex">
      <Sidebar onConnect={handleConnect} />

      <div className="ml-16 flex-1 min-h-screen flex flex-col
        bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100
        dark:from-gray-900 dark:via-gray-950 dark:to-gray-900
        text-black dark:text-white transition-all">

        <Toast message={toastMessage} show={showToast} />

        <div className="flex flex-col items-center flex-grow px-6 py-10">

          {/* HERO */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 max-w-6xl w-full">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                Smart Healthcare Management System
              </h1>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                Revolutionizing Healthcare with Blockchain
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                MedTrack is a secure blockchain-based platform that helps manage patient records,
                doctor access, and hospital data efficiently on the Sepolia testnet.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                It ensures transparency, security, and fast access to medical information for better healthcare services.
              </p>
            </div>
            <div className="relative">
              <img src="/hero.png" className="w-[350px] md:w-[420px] drop-shadow-2xl" alt="hero" />
              <div className="absolute inset-0 bg-blue-400 opacity-20 blur-3xl rounded-full"></div>
            </div>
          </div>

          {/* SYSTEM HIGHLIGHTS */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-6xl w-full">
            {[
              { title: "Patient Ownership", desc: "Patients control access to their medical data securely on the blockchain." },
              { title: "Doctor Access Control", desc: "Only authorized doctors can view patient records via smart contract." },
              { title: "Immutable Records", desc: "Blockchain ensures uploaded records cannot be tampered with." },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg shadow-md">
                <h3 className="font-semibold text-lg mb-2 text-blue-600">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* HOW IT WORKS */}
          <div className="mt-20 max-w-6xl w-full text-center">
            <h2 className="text-3xl font-bold mb-10">How MedTrack Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Connect Wallet", desc: "Connect MetaMask on Sepolia testnet." },
                { step: "2", title: "Get Registered", desc: "Auto-registered in the system with a role." },
                { step: "3", title: "Upload Records", desc: "Files go to IPFS; hash stored on blockchain." },
                { step: "4", title: "Grant Access", desc: "Authorize doctors to view your records." },
              ].map((item) => (
                <div key={item.step} className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 shadow">
                  <div className="text-3xl font-black text-blue-500 mb-2">{item.step}</div>
                  <h3 className="font-semibold text-lg mb-2 text-blue-600">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MODULES */}
          <div className="mt-20 max-w-6xl w-full">
            <h2 className="text-3xl font-bold mb-10 text-center">Platform Modules</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <a href="/admin" className="p-6 rounded-2xl bg-purple-500 text-white shadow-lg hover:bg-purple-600 transition">
                <h3 className="text-xl font-semibold">🛠 Admin Panel</h3>
                <p className="mt-2 text-sm opacity-90">Manage users and assign roles</p>
              </a>
              <a href="/doctor" className="p-6 rounded-2xl bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition">
                <h3 className="text-xl font-semibold">🩺 Doctor Dashboard</h3>
                <p className="mt-2 text-sm opacity-90">View authorized patient records</p>
              </a>
              <a href="/patient" className="p-6 rounded-2xl bg-teal-500 text-white shadow-lg hover:bg-teal-600 transition">
                <h3 className="text-xl font-semibold">👤 Patient Portal</h3>
                <p className="mt-2 text-sm opacity-90">Upload records and manage doctor access</p>
              </a>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
