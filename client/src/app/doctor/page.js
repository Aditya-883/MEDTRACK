'use client';

import { useState, useEffect } from 'react';
import { getContract } from '../../web3/contract';
import { decryptData } from '../../utils/encryption';
import { getIPFSUrl } from '../../utils/ipfsGateway';
import FileViewer from '../../components/FileViewer';
import { checkUserRole } from '../../lib/auth';
import { clearSession } from '../../lib/session';

export default function DoctorPage() {
  const [account, setAccount] = useState(null);
  const [patientAddress, setPatientAddress] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authorized, setAuthorized] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  const [accessHistory, setAccessHistory] = useState([]);

  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  async function init() {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });

    const currentAccount = accounts[0];
    setAccount(currentAccount);

    if (!currentAccount) {
      setAuthorized(false);
      return;
    }

    const user = await checkUserRole(currentAccount);

    if (!user || user.role !== 'doctor') {
      setAuthorized(false);
      return;
    }

    setAuthorized(true);
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Unauthorized Access
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Please switch to a doctor wallet
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (authorized === null) return null;

  async function checkAccess() {
    if (!patientAddress) {
      return setMessage("❌ Enter patient address");
    }

    try {
      const contract = await getContract(false);

      const hasAccess = await contract.checkAccess(
        patientAddress,
        account
      );

      setAccessStatus(hasAccess);

      setMessage(
        hasAccess ? "🟢 Access Granted" : "🔴 Access Denied"
      );

    } catch (err) {
      console.error(err);
      setMessage("❌ Error checking access");
    }
  }

  async function fetchRecords() {
    if (!accessStatus) {
      return setMessage("❌ You don’t have access to this patient");
    }

    try {
      setLoading(true);
      setMessage("Fetching records...");

      const contract = await getContract(false);
      const data = await contract.viewRecords(patientAddress);

      const formatted = data.map(r => ({
        hash: decryptData(r.ipfsHash),
        fileType: r.fileType,
        fileName: r.fileName,
        uploadedBy: r.uploadedBy,
        timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
      }));

      setRecords(formatted);

      setAccessHistory(prev => [
        {
          doctor: account,
          patient: patientAddress,
          time: new Date().toLocaleString()
        },
        ...prev
      ]);

      setMessage(
        formatted.length === 0
          ? "No records found"
          : "✅ Records loaded"
      );

    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch records");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">

      <div className="flex-grow max-w-4xl mx-auto bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">
            Doctor Dashboard
          </h1>

          <button
            onClick={() => {
              clearSession();
              window.location.reload();
            }}
            className="text-red-500"
          >
            Logout
          </button>
        </div>

        {/* ACCOUNT */}
        <div className="bg-indigo-600 text-white p-4 rounded-xl mb-6 shadow">
          <p className="text-sm opacity-80">Connected Wallet</p>
          <p className="font-semibold break-all">{account}</p>
        </div>

        {/* ABOUT */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-2 dark:text-white">
            About Doctor Panel
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Access patient medical records securely using blockchain technology.
            You can only view records when the patient grants you permission.
          </p>
        </div>

        {/* ACCESS CHECK */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2 dark:text-white">
            Patient Access Check
          </h2>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Enter Patient Wallet Address"
              value={patientAddress}
              onChange={(e) => {
                setPatientAddress(e.target.value);
                setAccessStatus(null);
              }}
              className="flex-1 border p-2 rounded"
            />

            <button
              onClick={checkAccess}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Check
            </button>
          </div>

          {accessStatus !== null && (
            <p className={`text-sm font-semibold ${accessStatus ? "text-green-600" : "text-red-500"}`}>
              {accessStatus ? "Access Granted" : "Access Denied"}
            </p>
          )}
        </div>

        {/* FETCH BUTTON */}
        <button
          onClick={fetchRecords}
          disabled={!accessStatus || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 mb-4"
        >
          {loading ? "Fetching..." : "Fetch Records"}
        </button>

        {message && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}

        {/* RECORDS */}
        <div className="space-y-4">
          {!loading && records.length === 0 && (
            <p className="text-gray-400">
              No records found or access not granted
            </p>
          )}

          {records.map((rec, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">

              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">{rec.fileName}</p>

                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                  {rec.fileType.includes("pdf") ? "PDF" : "Image"}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-3">
                Uploaded: {rec.timestamp}
              </p>

              <FileViewer
                url={getIPFSUrl(rec.hash)}
                fileType={rec.fileType}
              />
            </div>
          ))}
        </div>

        {/* ACCESS HISTORY */}
        <hr className="my-6" />

        <h2 className="text-lg font-semibold mb-2 dark:text-white">
          Access History
        </h2>

        <div className="space-y-2">
          {accessHistory.length === 0 ? (
            <p className="text-gray-400">No access history yet</p>
          ) : (
            accessHistory.map((entry, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
                <p><b>Doctor:</b> {entry.doctor}</p>
                <p><b>Patient:</b> {entry.patient}</p>
                <p><b>Time:</b> {entry.time}</p>
              </div>
            ))
          )}
        </div>

      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white text-center py-3 mt-6 rounded-xl">
        <p className="text-sm">
          © 2026 MedTrack • Secure Healthcare on Blockchain
        </p>
      </footer>

    </div>
  );
}