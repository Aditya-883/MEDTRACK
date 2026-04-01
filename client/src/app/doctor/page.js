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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Unauthorized Access
          </h2>
          <p className="text-gray-600 mb-4">
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

      // Access history
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <button
            onClick={() => {
              clearSession();
              window.location.reload();
            }}
            className="bg-red-100 text-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          <b>Account:</b> {account}
        </p>

        {/* ACCESS CHECK */}
        <div className="mb-5">
          <h2 className="font-semibold mb-2">Patient Access Check</h2>

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

        {/* FETCH */}
        <button
          onClick={fetchRecords}
          disabled={!accessStatus || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 mb-4"
        >
          {loading ? "Fetching..." : "Fetch Records"}
        </button>

        {message && (
          <p className="mb-3 text-sm text-gray-600">{message}</p>
        )}

        <hr className="my-5" />

        {/* RECORDS */}
        <div className="space-y-4">
          {!loading && records.length === 0 && (
            <p className="text-gray-500">
              No records found or access not granted
            </p>
          )}

          {records.map((rec, i) => (
            <div key={i} className="border p-4 rounded bg-gray-50 shadow-sm">

              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">{rec.fileName}</p>

                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                  {rec.fileType.includes("pdf") ? "PDF" : "Image"}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                Uploaded: {rec.timestamp}
              </p>

              {/* ✅ ONLY THIS — NO DUPLICATES */}
              <FileViewer
                url={getIPFSUrl(rec.hash)}
                fileType={rec.fileType}
              />

            </div>
          ))}
        </div>

        {/* ACCESS HISTORY */}
        <hr className="my-6" />

        <h2 className="text-lg font-semibold mb-2">Access History</h2>

        <div className="space-y-2">
          {accessHistory.length === 0 && (
            <p className="text-gray-400">No access history yet</p>
          )}

          {accessHistory.map((entry, i) => (
            <div key={i} className="border p-2 rounded bg-gray-100 text-sm">
              <p><b>Doctor:</b> {entry.doctor}</p>
              <p><b>Patient:</b> {entry.patient}</p>
              <p><b>Time:</b> {entry.time}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}