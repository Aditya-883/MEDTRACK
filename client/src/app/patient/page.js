'use client';

import { useState, useEffect } from 'react';
import { getContract } from '../../web3/contract';
import { encryptData } from '../../utils/encryption';
import { uploadToIPFS } from '../../web3/ipfs';
import { checkUserRole } from '../../lib/auth';
import { clearSession } from '../../lib/session';

const BASE_URL = "http://localhost:5000/api";

export default function PatientPage() {
  const [account, setAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [doctorAddress, setDoctorAddress] = useState('');
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [authorized, setAuthorized] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  async function init() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const currentAccount = accounts[0];
      setAccount(currentAccount);

      if (!currentAccount) return setAuthorized(false);

      let user = await checkUserRole(currentAccount);

      if (!user) {
        try {
          const res = await fetch(`${BASE_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: currentAccount,
              role: "patient"
            })
          });

          if (!res.ok) throw new Error();
          user = await res.json();

        } catch {
          return setAuthorized(false);
        }
      }

      if (user.role !== 'patient') return setAuthorized(false);

      setAuthorized(true);

      await fetchMyRecords();
      await fetchDoctorAccessList();

    } catch (err) {
      console.error("Init error:", err);
      setAuthorized(false);
    }
  }

  async function fetchDoctorAccessList() {
    try {
      const contract = await getContract(false);
      const doctors = await contract.getAuthorizedDoctors(account);

      const list = [];
      for (let doc of doctors) {
        const status = await contract.checkAccess(account, doc);
        if (status) list.push({ address: doc });
      }

      setDoctorList(list);

    } catch {
      setDoctorList([]);
    }
  }

  async function fetchMyRecords() {
    try {
      const contract = await getContract(false);

      let data;

      try {
        data = await contract.viewMyRecords();
      } catch {
        setRecords([]);
        return;
      }

      if (!data || data.length === 0) {
        setRecords([]);
        return;
      }

      setRecords(data);

    } catch {
      setRecords([]);
    }
  }

  function validateFile(file) {
    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) {
      alert("Only PDF/Image allowed");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Max 10MB");
      return false;
    }
    return true;
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f || !validateFile(f)) return;

    setFile(f);
    setMessage(`Selected: ${f.name}`);
  }

  async function uploadRecord() {
    if (!file) return;

    try {
      setUploading(true);
      setMessage("Uploading...");

      const contract = await getContract(true);

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

    } catch {
      setMessage("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function grantAccess() {
    if (!doctorAddress) return;

    try {
      const contract = await getContract(true);
      const tx = await contract.grantAccess(doctorAddress);
      await tx.wait();

      setDoctorAddress('');
      await fetchDoctorAccessList();

    } catch {
      alert("Grant failed");
    }
  }

  async function revokeDoctor(address) {
    try {
      const contract = await getContract(true);
      const tx = await contract.revokeAccess(address);
      await tx.wait();

      await fetchDoctorAccessList();

    } catch {
      alert("Revoke failed");
    }
  }

  if (authorized === false) {
    return <div className="text-center mt-20 text-red-500">Unauthorized</div>;
  }

  if (authorized === null) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-6">

      <div className="flex-grow max-w-4xl mx-auto bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold dark:text-white">
            Patient Dashboard
          </h1>

          <button
            onClick={() => { clearSession(); location.reload(); }}
            className="text-red-500"
          >
            Logout
          </button>
        </div>

        {/* WALLET */}
        <div className="bg-blue-600 text-white p-4 rounded mb-6">
          <p className="text-sm opacity-80">Connected Wallet</p>
          <p className="font-semibold break-all">{account}</p>
        </div>

        {/* ABOUT */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-2 dark:text-white">
            About Patient Panel
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Manage your medical records securely using blockchain.
            Grant and revoke doctor access anytime with full control.
          </p>
        </div>

        {/* HEALTH TIPS */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl mb-6 shadow">
          <h2 className="font-semibold mb-2">Health Tips</h2>
          <ul className="text-sm list-disc ml-4">
            <li>Stay hydrated 💧</li>
            <li>Regular checkups 🏥</li>
            <li>Balanced diet 🥗</li>
          </ul>
        </div>

        {/* DOCTORS */}
        <h2 className="font-semibold mb-2 dark:text-white">Doctors Access</h2>

        {doctorList.length === 0 ? (
          <p className="text-gray-400 mb-4">No doctors added</p>
        ) : (
          doctorList.map((doc, i) => (
            <div key={i} className="flex justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2">
              <span>{doc.address}</span>
              <button
                onClick={() => revokeDoctor(doc.address)}
                className="text-red-500"
              >
                Revoke
              </button>
            </div>
          ))
        )}

        <input
          value={doctorAddress}
          onChange={(e) => setDoctorAddress(e.target.value)}
          placeholder="Doctor Address"
          className="border p-2 w-full my-2 rounded"
        />

        <button
          onClick={grantAccess}
          className="bg-green-500 text-white px-4 py-1 rounded"
        >
          Grant Access
        </button>

        {/* UPLOAD */}
        <h2 className="font-semibold mt-6 mb-2 dark:text-white">Upload File</h2>

        <div className="flex gap-2 mb-4">
          <input type="file" onChange={handleFileChange} />
          <button
            onClick={uploadRecord}
            disabled={uploading}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {message && <p className="text-sm">{message}</p>}

        {/* INFO SECTION (REPLACED FILES) */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mt-6">
          <h2 className="font-semibold mb-2 dark:text-white">
            Record Management Info
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your records are encrypted and securely stored using blockchain & IPFS.
            Only authorized doctors can access them.
          </p>
        </div>

      </div>

      {/* ✅ FIXED FOOTER */}
      <footer className="bg-gray-900 text-white text-center py-3 mt-6 rounded-xl">
        <p className="text-sm">
          © 2026 MedTrack • Secure Healthcare on Blockchain
        </p>
      </footer>

    </div>
  );
}