import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { checkUserRole } from '../../api/auth.js';
import { SESSION_TIME, shortenAddress, connectAndSign } from '../../utils/wallet.js';

export default function Sidebar({ onConnect }) {
  const [expanded, setExpanded] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Apply theme
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  // Restore session on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('wallet');
    const savedRole = localStorage.getItem('role');
    const sessionTime = localStorage.getItem('sessionTime');

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

    if (window.ethereum) {
      const handleChange = (accounts) => {
        if (accounts.length === 0) disconnectWallet();
        else window.location.reload();
      };
      window.ethereum.on('accountsChanged', handleChange);
      return () => window.ethereum.removeListener('accountsChanged', handleChange);
    }
  }, []);

  const disconnectWallet = () => {
    setWallet(null);
    setRole(null);
    localStorage.removeItem('wallet');
    localStorage.removeItem('role');
    localStorage.removeItem('sessionTime');
    localStorage.removeItem('token');
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const address = await connectAndSign();

      // Register / fetch role — uses VITE_API_URL via apiClient
      const user = await checkUserRole(address.toLowerCase());
      const userRole = user?.role ?? 'patient';

      setWallet(address);
      setRole(userRole);
      localStorage.setItem('wallet', address);
      localStorage.setItem('role', userRole);
      localStorage.setItem('sessionTime', Date.now().toString());

      if (onConnect) onConnect(true);
      setTimeout(() => disconnectWallet(), SESSION_TIME);
    } catch (err) {
      console.error('Connect error:', err);
      alert(err.message || 'Wallet connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleColors = {
    admin: 'text-purple-400',
    doctor: 'text-blue-400',
    patient: 'text-green-400',
  };

  const navLinks = [
    { to: '/', icon: '🏠', label: 'Home' },
    { to: '/patient', icon: '👤', label: 'Patient Portal' },
    { to: '/doctor', icon: '🩺', label: 'Doctor Dashboard' },
    { to: '/admin', icon: '🛠', label: 'Admin Panel' },
  ];

  return (
    <>
      {expanded && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setExpanded(false)} />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-3
          shadow-lg flex flex-col justify-between transition-all duration-300
          ${expanded ? 'w-64' : 'w-16'}`}
      >
        {/* TOP */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mb-6 w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            ☰
          </button>

          {expanded && (
            <div className="mb-4 px-2">
              <p className="text-white font-bold text-lg">🏥 MedTrack</p>
              <p className="text-gray-400 text-xs">Blockchain Healthcare</p>
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm">
            {navLinks.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 hover:text-blue-400 px-2 py-2 rounded hover:bg-gray-800 transition"
              >
                {icon} {expanded && label}
              </Link>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={() => setDark((prev) => !prev)}
              className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-800 transition text-sm w-full ${expanded ? '' : 'justify-center'}`}
            >
              {dark ? '🌙' : '☀️'} {expanded && (dark ? 'Dark Mode' : 'Light Mode')}
            </button>
          </div>
        </div>

        {/* BOTTOM — Wallet */}
        <div>
          {!wallet ? (
            <button
              onClick={handleConnect}
              disabled={loading}
              className={`flex items-center justify-center rounded-lg text-sm font-medium transition
                ${expanded ? 'w-full py-2 px-3 gap-2' : 'w-10 h-10'}
                ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : expanded ? (
                '🔗 Connect Wallet'
              ) : (
                '🔗'
              )}
            </button>
          ) : (
            <div
              className={`bg-gray-800 rounded-lg border border-gray-700 ${expanded ? 'p-3' : 'w-10 h-10 flex items-center justify-center'}`}
            >
              {expanded ? (
                <>
                  <p className="text-green-400 text-xs mb-1">● Connected</p>
                  <p className="text-xs text-gray-300 font-mono mb-1">{shortenAddress(wallet)}</p>
                  {role && (
                    <p className={`text-xs mb-2 font-semibold ${roleColors[role] ?? 'text-gray-400'}`}>
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
