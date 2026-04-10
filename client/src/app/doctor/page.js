'use client';

import { useState, useEffect } from 'react';
import { getContract } from '../../web3/contract';
import { decryptData } from '../../utils/encryption';
import { getIPFSUrl } from '../../utils/ipfsGateway';
import FileViewer from '../../components/FileViewer';
import { checkUserRole } from '../../lib/auth';
import Sidebar from '../../components/layout/Sidebar';
import UnauthorizedPage from '../unauthorized/page'; //

function Toast({ message, show, type }) {
  if (!show) return null;

  return (
    <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg shadow-lg z-50 text-white
      ${type === "error" ? "bg-red-500" : "bg-black"}`}>
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

  function shortenAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function DoctorPage() {
  const [account, setAccount] = useState(null);
  const [patientAddress, setPatientAddress] = useState('');
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  const [authorized, setAuthorized] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);

  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({
    patientsChecked: 0,
    recordsViewed: 0
  });

  const [lastPatient, setLastPatient] = useState(null);

  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', init);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', init);
      }
    };
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  function addActivity(text) {
    setActivity(prev => [
      { text, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 5)
    ]);
  }

  async function init() {
    try {
      setInitLoading(true);

      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      const acc = accounts[0];
      setAccount(acc);

      if (!acc) return setAuthorized(false);

      const user = await checkUserRole(acc);
      if (!user || user.role !== 'doctor') return setAuthorized(false);

      setAuthorized(true);

    } catch {
      setAuthorized(false);
    } finally {
      setInitLoading(false);
    }
  }

  async function checkAccess() {
    if (!patientAddress) {
      return showToast("Enter patient address", "error");
    }

    try {
      const contract = await getContract(false);
      const hasAccess = await contract.checkAccess(patientAddress, account);

      setAccessStatus(hasAccess);
      setLastPatient(patientAddress);

      setStats(prev => ({
        ...prev,
        patientsChecked: prev.patientsChecked + 1
      }));

      addActivity(`Checked ${patientAddress}`);

      showToast(
        hasAccess ? "Access Granted ✅" : "Access Denied ❌",
        hasAccess ? "success" : "error"
      );
    } catch {
      setError("Failed to check access");
    }
  }

  async function fetchRecords() {
    if (!accessStatus) {
      return showToast("No access to this patient", "error");
    }

    try {
      setLoading(true);
      showToast("Fetching records...");

      const contract = await getContract(false);
      const data = await contract.viewRecords(patientAddress);

      const formatted = data.map(r => ({
        hash: decryptData(r.ipfsHash),
        fileType: r.fileType,
        fileName: r.fileName,
        timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
      }));

      setRecords(formatted);

      setStats(prev => ({
        ...prev,
        recordsViewed: prev.recordsViewed + formatted.length
      }));

      addActivity(`Viewed ${formatted.length} records`);
      showToast("Records fetched successfully ✅");

    } catch {
      setError("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  }

  if (initLoading) {
    return <LoadingOverlay show={true} />;
  }

  // UNAUTHORIZED HANDLING
  if (authorized === false) {
    return <UnauthorizedPage />;
  }

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 dark:from-gray-900 dark:to-black p-6">

        <LoadingOverlay show={loading} />
        <Toast message={toast?.msg} show={!!toast} type={toast?.type} />
        <ErrorUI message={error} />

        <div className="flex-grow max-w-6xl mx-auto space-y-6 w-full">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold dark:text-white">Doctor</h1>
          </div>

          {/* WALLET */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-5 rounded-xl shadow flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Connected Wallet</p>
              <p className="font-mono text-sm break-all">
                {shortenAddress(account)}
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(account);
                showToast("Copied 📋");
              }}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm"
            >
              Copy
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Patients Checked</p>
              <h2 className="text-xl font-bold">{stats.patientsChecked}</h2>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Records Viewed</p>
              <h2 className="text-xl font-bold">{stats.recordsViewed}</h2>
            </div>
          </div>

          {/* PATIENT LOOKUP */}
          <div className="bg-white p-5 rounded-xl shadow space-y-3">
            <h2 className="font-semibold">Patient Lookup</h2>

            <input
              placeholder="Enter Patient Address"
              value={patientAddress}
              onChange={(e) => {
                setPatientAddress(e.target.value);
                setAccessStatus(null);
              }}
              className="border p-2 w-full rounded"
            />

            <div className="flex gap-2">
              <button onClick={checkAccess} className="bg-yellow-500 text-white px-4 py-2 rounded">
                Check Access
              </button>

              <button onClick={fetchRecords} className="bg-blue-600 text-white px-4 py-2 rounded">
                Fetch Records
              </button>
            </div>

            {accessStatus !== null && (
              <span className={`inline-block px-3 py-1 rounded text-sm font-semibold
                ${accessStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {accessStatus ? "Access Granted" : "Access Denied"}
              </span>
            )}
          </div>

          {/* RECORDS */}
          <div className="space-y-4">
            {loading ? (
              <div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
            ) : records.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                No records found
              </div>
            ) : (
              records.map((rec, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow">
                  <div className="flex justify-between">
                    <p className="font-semibold">{rec.fileName}</p>
                    <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                      {rec.fileType.includes('pdf') ? 'PDF' : 'Image'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-2">
                    {rec.timestamp}
                  </p>

                  <FileViewer
                    url={getIPFSUrl(rec.hash)}
                    fileType={rec.fileType}
                  />
                </div>
              ))
            )}
          </div>

          {/* ACTIVITY */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Recent Activity</h2>

            {activity.length === 0 ? (
              <p className="text-gray-400 text-sm">No activity yet</p>
            ) : (
              activity.map((a, i) => (
                <div key={i} className="flex justify-between text-sm border-b py-1">
                  <span>{a.text}</span>
                  <span className="text-gray-400">{a.time}</span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}