"use client";

import { useState } from "react";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-black dark:text-white transition-all">

      {/* MAIN CONTENT */}
      <div className="flex flex-col items-center flex-grow px-6 py-10">

        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 max-w-6xl w-full">

          {/* TEXT */}
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

          {/* IMAGE */}
          <div className="relative">
            <img
              src="hero.png"
              alt="hero"
              className="w-[350px] md:w-[420px] drop-shadow-2xl"
            />
            <div className="absolute inset-0 bg-blue-400 opacity-20 blur-3xl rounded-full"></div>
          </div>
        </div>

        {/* 🔥 NEW: SYSTEM HIGHLIGHTS */}
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

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition text-center">
            <img src="images.png" className="w-16 mx-auto mb-4" />
            <h3 className="font-semibold mb-2 text-lg">🔐 Secure Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Patient data is protected using blockchain technology.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition text-center">
            <img src="images (1).png" className="w-16 mx-auto mb-4" />
            <h3 className="font-semibold mb-2 text-lg">⚡ Fast Access</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Doctors can quickly access patient records when needed.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition text-center">
            <img src="images(2).jpg" className="w-16 mx-auto mb-4" />
            <h3 className="font-semibold mb-2 text-lg">📊 Smart Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Track medical history and insights efficiently.
            </p>
          </div>
        </div>

        {/* 🔥 NEW: HOW IT WORKS */}
        <div className="mt-20 max-w-6xl w-full text-center">
          <h2 className="text-3xl font-bold mb-10">How MedTrack Works</h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg shadow">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">1. Connect Wallet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Secure login using blockchain wallet.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg shadow">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">2. Manage Records</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Upload and control medical data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg shadow">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">3. Secure Access</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Doctors access data with permission.
              </p>
            </div>

          </div>
        </div>

        {/* WHY SECTION */}
        <div className="mt-20 max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose MedTrack?</h2>
          <p className="text-gray-600 dark:text-gray-300">
            MedTrack leverages blockchain to eliminate data tampering, ensure
            patient privacy, and provide seamless communication between doctors
            and patients.
          </p>
        </div>

        {/* 🔥 NEW: PLATFORM MODULES */}
        <div className="mt-20 max-w-6xl w-full">
          <h2 className="text-3xl font-bold mb-10 text-center">Platform Modules</h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Admin Panel</h3>
              <p className="text-sm opacity-90">
                Manage users and monitor system activity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Doctor Dashboard</h3>
              <p className="text-sm opacity-90">
                Access patient records and manage treatments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Patient Portal</h3>
              <p className="text-sm opacity-90">
                Control your health data and permissions.
              </p>
            </div>

          </div>
        </div>

        {/* DOCTOR + PATIENT */}
        <div className="grid md:grid-cols-2 gap-10 mt-16 max-w-6xl items-center">

          <img src="image4.png" className="w-[400px] drop-shadow-xl" />

          <div>
            <h3 className="text-xl font-semibold mb-3">For Doctors</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Access patient history instantly, manage appointments, and provide
              better treatment with accurate data.
            </p>

            <h3 className="text-xl font-semibold mb-3">For Patients</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Keep your medical records safe and accessible anytime, anywhere.
            </p>
          </div>
        </div>

        {/* FUTURE */}
        <div className="mt-20 max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-4">Future of Healthcare</h2>
          <p className="text-gray-600 dark:text-gray-300">
            With MedTrack, we aim to revolutionize healthcare by integrating
            secure systems, improving efficiency, and building trust between all
            stakeholders.
          </p>
        </div>

        {/* 🔥 TRUST STRIP */}
        <div className="mt-20 w-full py-6 border-t border-gray-300 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Built with Blockchain • End-to-End Encryption • Privacy First
          </p>
        </div>

      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}