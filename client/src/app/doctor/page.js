'use client';

import { useState, useEffect } from 'react';
import { getContract } from '../../web3/contract';
import { decryptData } from '../../utils/encryption';
import RoleGuard from '../../components/RoleGuard';
import { getIPFSUrl } from '../../utils/ipfsGateway';
import FileViewer from '../../components/FileViewer';

function DoctorPage() {
  const [account, setAccount] = useState(null);
  const [patientAddress, setPatientAddress] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.ethereum) return;

    async function init() {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
    }

    init();
  }, []);

  function isValidCID(hash) {
    return hash && hash.startsWith("Qm") && hash.length > 40;
  }


  async function fetchRecords() {
    if (!patientAddress) {
      alert("Enter patient address");
      return;
    }

    try {
      setLoading(true);

      const contract = await getContract();
      const data = await contract.viewRecords(patientAddress);

      const validRecords = [];

      for (let r of data) {
        try {
          const hash = decryptData(r.ipfsHash);

          if (!isValidCID(hash)) continue;

          validRecords.push({
            hash,
            fileType: r.fileType,
            fileName: r.fileName,
            uploadedBy: r.uploadedBy,
            timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
          });

        } catch {}
      }

      setRecords(validRecords);

    } catch (err) {
      console.error(err);
      alert(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">

        <h1 className="text-2xl font-bold mb-2">Doctor Dashboard</h1>

        <p className="text-sm text-gray-600 mb-4">
          <b>Account:</b> {account}
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter patient address"
            value={patientAddress}
            onChange={(e) => setPatientAddress(e.target.value)}
            className="flex-1 border p-2 rounded"
          />

          <button
            onClick={fetchRecords}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {loading ? "Fetching..." : "Fetch"}
          </button>
        </div>

        {!loading && records.length === 0 && (
          <p className="text-gray-500">No valid records found</p>
        )}

        <div className="space-y-4">
          {records.map((rec, i) => (
            <div key={i} className="border p-4 rounded bg-gray-50">

              <p><b>File:</b> {rec.fileName}</p>
              <p><b>Type:</b> {rec.fileType}</p>
              <p><b>Uploaded By:</b> {rec.uploadedBy}</p>
              <p><b>Time:</b> {rec.timestamp}</p>
              <FileViewer
                url={getIPFSUrl(rec.hash)}
                fileType={rec.fileType}
              />

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* ✅ ONLY ONE DEFAULT EXPORT */
export default function DoctorPageWrapper() {
  return (
    <RoleGuard allowedRole="doctor">
      <DoctorPage />
    </RoleGuard>
  );
}