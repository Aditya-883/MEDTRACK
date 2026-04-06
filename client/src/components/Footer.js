"use client";

import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400 border-t border-gray-700">

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* BRAND */}
          <div className="text-center md:text-left">
            <h1 className="text-xl font-semibold text-white tracking-wide">
              MedTrack
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Secure • Transparent • Decentralized Healthcare
            </p>
          </div>

          {/* FEATURES */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="hover:text-white transition duration-300 cursor-default">
              Blockchain Security
            </span>
            <span className="hover:text-white transition duration-300 cursor-default">
              End-to-End Encryption
            </span>
            <span className="hover:text-white transition duration-300 cursor-default">
              Privacy First
            </span>
          </div>

          {/* SOCIAL ICONS */}
          <div className="flex gap-5 text-lg">

            {/* GitHub */}
            <a
              href="https://github.com/Aditya-883/MEDTRACK"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Repository"
            >
              <FaGithub className="hover:text-white cursor-pointer transition duration-300" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/khushi-tripathi-6423b0253/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn Profile"
            >
              <FaLinkedin className="hover:text-blue-500 cursor-pointer transition duration-300" />
            </a>

            {/* Email */}
            <a
              href="mailto:khushitripathi0706@gmail.com"
              title="Send Email"
            >
              <FaEnvelope className="hover:text-red-400 cursor-pointer transition duration-300" />
            </a>

          </div>

        </div>

        {/* DIVIDER */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-2">

          <p>
            © {new Date().getFullYear()} MedTrack. All rights reserved.
          </p>

          <p className="hover:text-gray-300 transition duration-300 cursor-pointer">
            Designed with ❤️ for Secure Healthcare
          </p>

        </div>

      </div>

    </footer>
  );
}