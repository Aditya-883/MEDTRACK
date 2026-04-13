"use client";

import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Sidebar from "../components/layout/Sidebar";

//  TOAST after wallet connect 
function Toast({ message, show }) {
  if (!show) return null;

  return (
    <div className="fixed top-6 right-6 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">
      {message}
    </div>
  );
}

function LoadingOverlay({ show }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="animate-pulse text-lg font-semibold">
        Loading...
      </div>
    </div>
  );
}

function ErrorUI({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      {message}
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Toast state (only for wallet connect)
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setTimeout(() => {
      try {
        setLoading(false);
      } catch {
        setError("Something went wrong!");
      }
    }, 1000);
  }, []);

  //  Sidebar Connect callback
  const handleConnect = (isNew) => {
    if (isNew) {
      setToastMessage("New wallet connected 🎉");
    } else {
      setToastMessage("Welcome back 👋");
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex">

      {/* SIDEBAR */}
      <Sidebar onConnect={handleConnect} />

      {/* MAIN */}
      <div className="flex-1 min-h-screen flex flex-col 
        bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 
        dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 
        text-black dark:text-white transition-all">

        <LoadingOverlay show={loading} />
        <ErrorUI message={error} />
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
                MedTrack is a secure blockchain-based platform that helps manage
                patient records, doctor access, and hospital data efficiently.
              </p>

              <p className="text-gray-600 dark:text-gray-300">
                It ensures transparency, security, and fast access to medical
                information for better healthcare services.
              </p>
            </div>

            <div className="relative">
              <img src="hero.png" className="w-[350px] md:w-[420px] drop-shadow-2xl" />
              <div className="absolute inset-0 bg-blue-400 opacity-20 blur-3xl rounded-full"></div>
            </div>
          </div>

          {/* SYSTEM HIGHLIGHTS */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-6xl w-full">
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">Patient Ownership</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Patients control access to their medical data securely.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">Doctor Access Control</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Only authorized doctors can view or update records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">Immutable Records</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Blockchain ensures data cannot be tampered with.
              </p>
            </div>
          </div>

          {/* FEATURES */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-6xl w-full">
            <div className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-2xl shadow-lg text-center">
              <img src="images.png" className="w-16 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-lg">🔐 Secure Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Patient data is protected using blockchain.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-2xl shadow-lg text-center">
              <img src="images (1).png" className="w-16 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-lg">⚡ Fast Access</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Doctors can quickly access records.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-2xl shadow-lg text-center">
              <img src="images(2).jpg" className="w-16 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-lg">📊 Smart Tracking</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Track medical history easily.
              </p>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="mt-20 max-w-6xl w-full text-center">
            <h2 className="text-3xl font-bold mb-10">How MedTrack Works</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 shadow">
                <h3 className="font-semibold text-lg mb-2 text-blue-600">1. Connect Wallet</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Secure login using blockchain wallet.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 shadow">
                <h3 className="font-semibold text-lg mb-2 text-blue-600">2. Manage Records</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Upload and control medical data.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 shadow">
                <h3 className="font-semibold text-lg mb-2 text-blue-600">3. Secure Access</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Doctors access data with permission.
                </p>
              </div>
            </div>
          </div>

          {/* MODULES */}
          <div className="mt-20 max-w-6xl w-full">
            <h2 className="text-3xl font-bold mb-10 text-center">Platform Modules</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-blue-500 text-white shadow-lg">
                <h3 className="text-xl font-semibold">Admin Panel</h3>
              </div>

              <div className="p-6 rounded-2xl bg-teal-500 text-white shadow-lg">
                <h3 className="text-xl font-semibold">Doctor Dashboard</h3>
              </div>

              <div className="p-6 rounded-2xl bg-purple-500 text-white shadow-lg">
                <h3 className="text-xl font-semibold">Patient Portal</h3>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}