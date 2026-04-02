"use client";

import { useState } from "react";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-all">

      {/* MAIN CONTENT */}
      <div className="flex flex-col items-center flex-grow px-6 py-10">

        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 max-w-6xl w-full">

          {/* TEXT */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold mb-6">
              Smart Healthcare Management System
            </h1>

            <h2 className="text-2xl font-semibold mb-4">
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

          {/* IMAGE 1 */}
          <img
            src="hero.png"
            alt="hero"
            className="w-[350px] md:w-[420px]"
          />
        </div>

        {/* FEATURES */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-6xl w-full">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-xl hover:-translate-y-2 transition text-center">
            <img src="images.png" className="w-16 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">🔐 Secure Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Patient data is protected using blockchain technology.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-xl hover:-translate-y-2 transition text-center">
            <img src="images (1).png" className="w-16 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">⚡ Fast Access</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Doctors can quickly access patient records when needed.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-xl hover:-translate-y-2 transition text-center">
            <img src="images(2).jpg" className="w-16 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">📊 Smart Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Track medical history and insights efficiently.
            </p>
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

        {/* DOCTOR + PATIENT */}
        <div className="grid md:grid-cols-2 gap-10 mt-16 max-w-6xl items-center">

          <img src="image4.png" className="w-[400px]" />

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

      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}