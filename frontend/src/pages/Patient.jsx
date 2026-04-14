import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import NotConnected from '../components/ui/NotConnected.jsx';
import WrongRole from '../components/ui/WrongRole.jsx';
import { ToastStack } from '../components/ui/Toast.jsx';
import FileViewer from '../components/FileViewer.jsx';
import { checkUserRole } from '../api/auth.js';
import { getContract } from '../web3/contract.js';
import { encryptData, decryptData } from '../utils/encryption.js';
import { uploadToIPFS } from '../web3/ipfs.js';
import { getIPFSUrl } from '../utils/ipfsGateway.js';

const STAGES = {
  idle:    { label: 'Upload Record',        color: 'bg-blue-500 hover:bg-blue-600' },
  ipfs:    { label: 'Uploading to IPFS…',   color: 'bg-yellow-500 cursor-not-allowed' },
  signing: { label: 'Confirm in MetaMask…', color: 'bg-orange-500 cursor-not-allowed' },
  mining:  { label: 'Confirming on chain…', color: 'bg-purple-500 cursor-not-allowed' },
  success: { label: '✓ Uploaded!',          color: 'bg-green-500 cursor-not-allowed' },
  error:   { label: '✗ Failed — Retry',     color: 'bg-red-500 hover:bg-red-600' },
};

function UploadProgress({ stage }) {
  if (stage === 'idle' || stage === 'error') return null;

  const steps = [
    { key: 'ipfs',    label: 'IPFS Upload' },
    { key: 'signing', label: 'MetaMask Sign' },
    { key: 'mining',  label: 'On-chain Confirm' },
    { key: 'success', label: 'Done' },
  ];
  const stageIndex = steps.findIndex((s) => s.key === stage);

  return (
    <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, i) => {
          const done = i < stageIndex || stage === 'success';
          const active = i === stageIndex && stage !== 'success';
          return (
            <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-500 text-white ring-4 ring-blue-200' : 'bg-gray-200 dark:bg-gray-600 text-gray-400'}`}
              >
                {done ? '✓' : active ? (
                  <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                ) : i + 1}
              </div>
              <span
                className={`text-xs text-center leading-tight hidden sm:block
                  ${done ? 'text-green-600 dark:text-green-400' : active ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1 mx-3">
        <div
          className="absolute top-0 left-0 h-1 bg-blue-500 rounded-full transition-all duration-700"
          style={{ width: stage === 'success' ? '100%' : `${(stageIndex / (steps.length - 1)) * 100}%` }}
        />
      </div>
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
        {stage === 'ipfs'    && 'Storing file on IPFS via Pinata…'}
        {stage === 'signing' && 'Please open MetaMask and confirm the transaction.'}
        {stage === 'mining'  && 'Transaction submitted. Waiting for Sepolia confirmation (~15–30s)…'}
        {stage === 'success' && 'Record is stored on the blockchain! ✅'}
      </p>
    </div>
  );
}

export default function PatientPage() {
  const toastIdRef = useRef(0);

  const [account, setAccount]             = useState(null);
  const [userRole, setUserRole]           = useState(null);
  const [file, setFile]                   = useState(null);
  const [records, setRecords]             = useState([]);
  const [doctorList, setDoctorList]       = useState([]);
  const [pageState, setPageState]         = useState('loading');
  const [uploadStage, setUploadStage]     = useState('idle');
  const [toasts, setToasts]               = useState([]);
  const [doctorAddress, setDoctorAddress] = useState('');
  const [currentPage, setCurrentPage]     = useState(1);
  const recordsPerPage = 4;

  function addToast(msg, type = 'info') {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
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
        addToast('Cannot reach backend. Is the server running?', 'error');
        setPageState('notconnected');
        return;
      }

      setUserRole(user.role);
      if (user.role !== 'patient') { setPageState('wrongrole'); return; }

      setPageState('ready');
      await fetchDoctors(acc);
      await fetchRecords();
    } catch (err) {
      console.error('Init error:', err);
      addToast('Initialisation failed: ' + err.message, 'error');
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

  async function fetchDoctors(acc) {
    try {
      const contract = await getContract();
      const docs = await contract.getAuthorizedDoctors(acc);
      setDoctorList([...docs]);
    } catch (err) {
      console.error('Fetch doctors error:', err);
    }
  }

  async function fetchRecords() {
    try {
      const contract = await getContract();
      const data = await contract.viewMyRecords();
      const formatted = data.map((r) => {
        let hash = r.ipfsHash;
        try { const d = decryptData(r.ipfsHash); if (d) hash = d; } catch {}
        return {
          hash,
          fileType: r.fileType,
          fileName: r.fileName,
          timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
        };
      });
      setRecords(formatted);
      setCurrentPage(1);
    } catch (err) {
      console.error('Fetch records error:', err);
    }
  }

  async function uploadRecord() {
    if (!file) return addToast('Please select a file first', 'error');
    if (uploadStage !== 'idle' && uploadStage !== 'error') return;

    try {
      setUploadStage('ipfs');
      const ipfsHash = await uploadToIPFS(file);

      setUploadStage('signing');
      const enc = encryptData(ipfsHash);
      const contract = await getContract();
      const tx = await contract.uploadRecord(account, enc, file.type, file.name);

      setUploadStage('mining');
      const receipt = await tx.wait();
      console.log('✅ TX confirmed:', receipt.hash);

      setUploadStage('success');
      addToast('Record uploaded & stored on Sepolia! 🚀', 'success');

      setTimeout(async () => {
        setUploadStage('idle');
        setFile(null);
        const fi = document.getElementById('fileInput');
        if (fi) fi.value = '';
        await fetchRecords();
      }, 2500);
    } catch (err) {
      console.error('Upload error:', err);
      let msg = 'Upload failed';
      if (err.message?.includes('IPFS')) {
        msg = 'IPFS upload failed — check your Pinata API keys';
      } else if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        msg = 'Transaction rejected in MetaMask';
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        msg = 'Not enough Sepolia ETH for gas';
      } else if (err.reason) {
        msg = 'Contract error: ' + err.reason;
      } else if (err.message) {
        msg = err.message.slice(0, 100);
      }
      addToast(msg, 'error');
      setUploadStage('error');
      setTimeout(() => setUploadStage('idle'), 4000);
    }
  }

  async function grantAccess(addr) {
    if (!addr || !addr.startsWith('0x') || addr.length !== 42)
      return addToast('Enter a valid 0x wallet address (42 chars)', 'error');
    if (addr.toLowerCase() === account?.toLowerCase())
      return addToast("You can't grant access to yourself", 'error');
    try {
      if (doctorList.some((d) => d.toLowerCase() === addr.toLowerCase()))
        return addToast('That doctor already has access', 'error');
      const contract = await getContract();
      addToast('Confirm in MetaMask…', 'info');
      const tx = await contract.grantAccess(addr);
      addToast('Waiting for confirmation…', 'info');
      await tx.wait();
      addToast('Access granted ✅', 'success');
      setDoctorAddress('');
      setDoctorList((prev) => [...prev, addr]);
    } catch (err) {
      const msg = err.code === 4001 ? 'Rejected in MetaMask' : (err.reason || 'Failed to grant access');
      addToast(msg, 'error');
    }
  }

  async function revokeAccess(addr) {
    try {
      const contract = await getContract();
      addToast('Confirm in MetaMask…', 'info');
      const tx = await contract.revokeAccess(addr);
      addToast('Waiting for confirmation…', 'info');
      await tx.wait();
      addToast('Access revoked ✅', 'success');
      setDoctorList((prev) => prev.filter((d) => d.toLowerCase() !== addr.toLowerCase()));
    } catch (err) {
      const msg = err.code === 4001 ? 'Rejected in MetaMask' : (err.reason || 'Failed to revoke');
      addToast(msg, 'error');
    }
  }

  if (pageState === 'loading')      return <LoadingSpinner message="Checking access…" />;
  if (pageState === 'notconnected') return <NotConnected onConnect={requestAndInit} context="the Patient Dashboard" />;
  if (pageState === 'wrongrole')    return <WrongRole requiredRole="patient" userRole={userRole} address={account} />;

  const totalPages     = Math.ceil(records.length / recordsPerPage);
  const currentRecords = records.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  const stage          = STAGES[uploadStage];
  const isBusy         = !['idle', 'error'].includes(uploadStage);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div className="ml-16 flex-1 p-6 text-black dark:text-white">
        <ToastStack toasts={toasts} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold">Patient Dashboard</h1>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl shadow flex items-center gap-3">
            <div>
              <p className="text-xs opacity-80">Connected</p>
              <span className="font-mono text-sm">{account?.slice(0, 6)}…{account?.slice(-4)}</span>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(account); addToast('Address copied 📋'); }}
              className="bg-white text-blue-600 px-3 py-1 rounded text-xs hover:bg-gray-100 transition"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Grant Access */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-1 text-xl">Grant Doctor Access</h2>
          <p className="text-sm text-gray-500 mb-4">
            Enter a doctor's wallet address to allow them to view your records.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={doctorAddress}
              onChange={(e) => setDoctorAddress(e.target.value)}
              placeholder="0x… doctor wallet address"
              className="flex-1 border p-3 rounded-lg text-black dark:text-white dark:bg-gray-700"
            />
            <button
              onClick={() => grantAccess(doctorAddress)}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium"
            >
              Grant Access
            </button>
          </div>
        </div>

        {/* Authorized Doctors */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-4 text-xl">Authorized Doctors ({doctorList.length})</h2>
          {doctorList.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No doctors authorized yet.</p>
          ) : (
            <div className="space-y-2">
              {doctorList.map((addr, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-mono text-sm break-all flex-1 mr-3 dark:text-gray-300">{addr}</span>
                  <button
                    onClick={() => revokeAccess(addr)}
                    className="bg-red-500 px-3 py-1 text-white rounded hover:bg-red-600 transition text-sm whitespace-nowrap"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-1 text-xl">Upload Medical Record</h2>
          <p className="text-sm text-gray-500 mb-4">
            File → IPFS (Pinata) → encrypted hash → Sepolia blockchain. Supports PDF and images.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="fileInput"
              type="file"
              accept="image/*,application/pdf"
              disabled={isBusy}
              onChange={(e) => {
                setFile(e.target.files[0]);
                if (uploadStage === 'error') setUploadStage('idle');
              }}
              className="flex-1 border p-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:opacity-50"
            />
            <button
              onClick={uploadRecord}
              disabled={isBusy || !file}
              className={`text-white px-6 py-3 rounded-lg transition font-medium min-w-[180px] flex items-center justify-center gap-2
                ${!file && uploadStage === 'idle' ? 'bg-gray-400 cursor-not-allowed' : stage.color}
                disabled:opacity-60`}
            >
              {isBusy && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              {uploadStage === 'success' && <span>✓</span>}
              {stage.label}
            </button>
          </div>
          <UploadProgress stage={uploadStage} />
        </div>

        {/* Records */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-2xl">My Medical Records ({records.length})</h2>
            <button onClick={fetchRecords} className="text-blue-500 hover:underline text-sm">
              ↻ Refresh
            </button>
          </div>

          {currentRecords.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow text-center text-gray-400">
              No records yet. Upload your first medical record above!
            </div>
          ) : (
            currentRecords.map((rec, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <p className="font-semibold text-lg dark:text-white">{rec.fileName}</p>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    {rec.fileType?.includes('pdf') ? 'PDF' : 'Image'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{rec.timestamp}</p>
                <FileViewer url={getIPFSUrl(rec.hash)} fileType={rec.fileType} />
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
