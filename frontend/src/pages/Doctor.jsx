import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import NotConnected from '../components/ui/NotConnected.jsx';
import WrongRole from '../components/ui/WrongRole.jsx';
import { ToastSingle } from '../components/ui/Toast.jsx';
import FileViewer from '../components/FileViewer.jsx';
import { checkUserRole } from '../api/auth.js';
import { getContract } from '../web3/contract.js';
import { decryptData } from '../utils/encryption.js';
import { getIPFSUrl } from '../utils/ipfsGateway.js';
import { shortenAddress } from '../utils/wallet.js';

export default function DoctorPage() {
  const [account, setAccount] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [patientAddress, setPatientAddress] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState('loading');
  const [accessStatus, setAccessStatus] = useState(null);
  const [toast, setToast] = useState(null);
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({ patientsChecked: 0, recordsViewed: 0 });

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function addActivity(text) {
    setActivity((prev) => [{ text, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
  }

  async function requestAndInit() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts?.length > 0) await init(accounts[0]);
      else setPageState('notconnected');
    } catch {
      setPageState('notconnected');
    }
  }

  async function init(forcedAccount) {
    try {
      setPageState('loading');
      if (!window.ethereum) { setPageState('notconnected'); return; }

      let acc = forcedAccount;
      if (!acc) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        acc = accounts?.[0];
      }
      if (!acc) { setPageState('notconnected'); return; }

      setAccount(acc);

      const user = await checkUserRole(acc);
      if (!user) {
        showToast('Cannot reach backend. Is the server running?', 'error');
        setPageState('notconnected');
        return;
      }

      setUserRole(user.role);
      if (user.role !== 'doctor') { setPageState('wrongrole'); return; }

      setPageState('ready');
    } catch (err) {
      console.error('Doctor init error:', err);
      showToast('Something went wrong. Check console.', 'error');
      setPageState('notconnected');
    }
  }

  useEffect(() => {
    init();
    if (window.ethereum) {
      const handleChange = () => window.location.reload();
      window.ethereum.on('accountsChanged', handleChange);
      return () => window.ethereum.removeListener('accountsChanged', handleChange);
    }
  }, []);

  async function checkAccess() {
    if (!patientAddress || !patientAddress.startsWith('0x') || patientAddress.length !== 42) {
      return showToast('Enter a valid patient address (0x… 42 chars)', 'error');
    }
    try {
      const contract = await getContract();
      const hasAccess = await contract.checkAccess(patientAddress, account);
      setAccessStatus(hasAccess);
      setRecords([]);
      setStats((prev) => ({ ...prev, patientsChecked: prev.patientsChecked + 1 }));
      addActivity(`Checked ${shortenAddress(patientAddress)}`);
      showToast(
        hasAccess ? '✅ Access granted!' : '❌ No access to this patient',
        hasAccess ? 'success' : 'error'
      );
    } catch (err) {
      console.error('checkAccess error:', err);
      showToast('Contract call failed. Check network/contract address.', 'error');
    }
  }

  async function fetchRecords() {
    if (accessStatus === null) return showToast('Check access first', 'error');
    if (!accessStatus) return showToast("You don't have access to this patient's records", 'error');
    try {
      setLoading(true);
      const contract = await getContract();
      const data = await contract.viewRecords(patientAddress);
      const formatted = data.map((r) => {
        let hash = r.ipfsHash;
        try {
          const dec = decryptData(r.ipfsHash);
          if (dec) hash = dec;
        } catch {}
        return {
          hash,
          fileType: r.fileType,
          fileName: r.fileName,
          timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
        };
      });
      setRecords(formatted);
      setStats((prev) => ({ ...prev, recordsViewed: prev.recordsViewed + formatted.length }));
      addActivity(`Fetched ${formatted.length} record(s) for ${shortenAddress(patientAddress)}`);
      showToast(`Loaded ${formatted.length} record(s) ✅`);
    } catch (err) {
      console.error('fetchRecords error:', err);
      showToast(err.reason || 'Failed to fetch records', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (pageState === 'loading') return <LoadingSpinner message="Checking access…" />;
  if (pageState === 'notconnected') return <NotConnected onConnect={requestAndInit} context="the Doctor Dashboard" />;
  if (pageState === 'wrongrole') return <WrongRole requiredRole="doctor" userRole={userRole} address={account} />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-16 flex-1 min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 dark:from-gray-900 dark:to-black p-6">
        <ToastSingle toast={toast} />

        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold dark:text-white">Doctor Dashboard</h1>

          {/* WALLET */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-5 rounded-xl shadow flex justify-between items-center">
            <div>
              <p className="text-xs opacity-80">Connected Wallet (Doctor)</p>
              <p className="font-mono text-sm">{account}</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(account); showToast('Copied 📋'); }}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-gray-100 transition"
            >
              Copy
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Patients Checked</p>
              <h2 className="text-2xl font-bold dark:text-white">{stats.patientsChecked}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Records Viewed</p>
              <h2 className="text-2xl font-bold dark:text-white">{stats.recordsViewed}</h2>
            </div>
          </div>

          {/* PATIENT LOOKUP */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow space-y-3">
            <h2 className="font-semibold text-lg dark:text-white">Patient Record Lookup</h2>
            <p className="text-sm text-gray-500">
              The patient must first grant you access from their Patient Dashboard.
            </p>
            <input
              placeholder="Patient wallet address (0x…)"
              value={patientAddress}
              onChange={(e) => { setPatientAddress(e.target.value); setAccessStatus(null); setRecords([]); }}
              className="border p-3 w-full rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={checkAccess}
                className="bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600 transition font-medium"
              >
                Check Access
              </button>
              <button
                onClick={fetchRecords}
                disabled={!accessStatus || loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-40 font-medium"
              >
                {loading ? 'Loading…' : 'Fetch Records'}
              </button>
            </div>
            {accessStatus !== null && (
              <div
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold
                  ${accessStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
              >
                {accessStatus
                  ? "✅ You have access to this patient's records"
                  : '❌ Patient has not granted you access'}
              </div>
            )}
          </div>

          {/* RECORDS */}
          {(records.length > 0 || loading) && (
            <div className="space-y-4">
              <h2 className="font-semibold text-xl dark:text-white">
                Patient Records ({records.length})
              </h2>
              {loading ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : (
                records.map((rec, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold dark:text-white">{rec.fileName}</p>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        {rec.fileType?.includes('pdf') ? 'PDF' : 'Image'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{rec.timestamp}</p>
                    <FileViewer url={getIPFSUrl(rec.hash)} fileType={rec.fileType} />
                  </div>
                ))
              )}
            </div>
          )}

          {/* ACTIVITY */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
            <h2 className="font-semibold mb-3 dark:text-white">Recent Activity</h2>
            {activity.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No activity yet. Check a patient's access to get started.
              </p>
            ) : (
              activity.map((a, i) => (
                <div key={i} className="flex justify-between text-sm border-b dark:border-gray-700 py-2">
                  <span className="dark:text-gray-300">{a.text}</span>
                  <span className="text-gray-400 ml-4 shrink-0">{a.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
