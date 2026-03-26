'use client';

import { useState, useEffect } from 'react';
import { getContract } from '../../web3/contract';
import { encryptData } from '../../utils/encryption';
import { uploadToIPFS } from '../../web3/ipfs';
import { decryptData } from '../../utils/encryption';
import RoleGuard from '../../components/RoleGuard';
import FileViewer from '../../components/FileViewer';
import { getIPFSUrl } from '../../utils/ipfsGateway';

function PatientPage() {
  const [account, setAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [doctorAddress, setDoctorAddress] = useState('');

  const [records, setRecords] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [granting, setGranting] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [message, setMessage] = useState('');

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

  // ========================
  // FILE VALIDATION
  // ========================
  function validateFile(file) {
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg"
    ];

    if (!allowed.includes(file.type)) {
      alert("Only PDF/Image allowed");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Max size 10MB");
      return false;
    }

    return true;
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;

    if (!validateFile(f)) {
      e.target.value = null;
      return;
    }

    setFile(f);
    setMessage(`Selected: ${f.name}`);
  }

  // ========================
  // UPLOAD
  // ========================
  async function uploadRecord() {
    if (!file) return alert("Select file");

    try {
      setUploading(true);
      setMessage("Uploading to IPFS...");

      const contract = await getContract();

      const ipfsHash = await uploadToIPFS(file);
      const encryptedHash = encryptData(ipfsHash);

      const tx = await contract.uploadRecord(
        account,
        encryptedHash,
        file.type,
        file.name
      );

      await tx.wait();

      setMessage("✅ Uploaded successfully");
      setFile(null);

      fetchMyRecords(); // auto refresh

    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ========================
  // FETCH OWN RECORDS
  // ========================
  async function fetchMyRecords() {
    try {
      setLoadingRecords(true);

      const contract = await getContract();
      const data = await contract.viewMyRecords();

      const formatted = [];

      for (let r of data) {
        try {
          const hash = decryptData(r.ipfsHash);

          formatted.push({
            hash,
            fileType: r.fileType,
            fileName: r.fileName,
            timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
          });

        } catch {}
      }

      setRecords(formatted);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }
  }

  // ========================
  // GRANT / REVOKE
  // ========================
  async function grantAccess() {
    if (!doctorAddress) return alert("Enter doctor");

    try {
      setGranting(true);
      setMessage("Granting access...");

      const contract = await getContract();
      const tx = await contract.grantAccess(doctorAddress);

      await tx.wait();

      setDoctorAddress('');
      setMessage("✅ Access granted");

    } catch (err) {
      console.error(err);
      setMessage("❌ Failed");
    } finally {
      setGranting(false);
    }
  }

  async function revokeAccess() {
    if (!doctorAddress) return alert("Enter doctor");

    try {
      const contract = await getContract();
      const tx = await contract.revokeAccess(doctorAddress);

      await tx.wait();

      setMessage("❌ Access revoked");

    } catch (err) {
      console.error(err);
    }
  }

  // ========================
  // UI
  // ========================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">

        <h1 className="text-2xl font-bold mb-3">Patient Dashboard</h1>
        <p className="text-sm text-gray-600 mb-4">
          <b>Account:</b> {account}
        </p>

        {/* Upload */}
        <h2 className="font-semibold mb-2">Upload Record</h2>

        <input type="file" onChange={handleFileChange} />

        <button
          onClick={uploadRecord}
          disabled={uploading}
          className="ml-2 bg-blue-500 text-white px-4 py-1 rounded"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {message && <p className="mt-2 text-sm">{message}</p>}

        <hr className="my-5" />

        {/* Access */}
        <h2 className="font-semibold mb-2">Manage Access</h2>

        <input
          type="text"
          placeholder="Doctor address"
          value={doctorAddress}
          onChange={(e) => setDoctorAddress(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />

        <div className="flex gap-2">
          <button
            onClick={grantAccess}
            className="bg-green-500 text-white px-4 py-1 rounded"
          >
            Grant
          </button>

          <button
            onClick={revokeAccess}
            className="bg-red-500 text-white px-4 py-1 rounded"
          >
            Revoke
          </button>
        </div>

        <hr className="my-5" />

        {/* Records */}
        <h2 className="font-semibold mb-2">My Records</h2>

        <button
          onClick={fetchMyRecords}
          className="bg-gray-800 text-white px-3 py-1 rounded mb-3"
        >
          {loadingRecords ? "Loading..." : "Load Records"}
        </button>

        <div className="space-y-4">
          {records.map((rec, i) => (
            <div key={i} className="border p-3 rounded bg-gray-50">

              <p><b>{rec.fileName}</b></p>
              <p className="text-sm text-gray-600">{rec.timestamp}</p>

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

export default function PatientWrapper() {
  return (
    <RoleGuard allowedRole="patient">
      <PatientPage />
    </RoleGuard>
  );
}