import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home.jsx';
import AdminPage from './pages/Admin.jsx';
import DoctorPage from './pages/Doctor.jsx';
import PatientPage from './pages/Patient.jsx';

// Syncs wallet address to localStorage whenever MetaMask account changes
function WalletListener() {
  useEffect(() => {
    if (!window.ethereum) return;

    const sync = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts[0]) localStorage.setItem('wallet', accounts[0]);
        else localStorage.removeItem('wallet');
      } catch (err) {
        console.error('WalletListener sync error:', err);
      }
    };

    sync();
    window.ethereum.on('accountsChanged', sync);
    return () => window.ethereum.removeListener('accountsChanged', sync);
  }, []);

  return null;
}

export default function App() {
  return (
    <>
      <WalletListener />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/doctor" element={<DoctorPage />} />
        <Route path="/patient" element={<PatientPage />} />
      </Routes>
    </>
  );
}
