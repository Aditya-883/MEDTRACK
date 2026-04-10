"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/layout/Sidebar";
import { getContract } from "../../web3/contract";
import { encryptData, decryptData } from "../../utils/encryption";
import { uploadToIPFS } from "../../web3/ipfs";
import { checkUserRole } from "../../lib/auth";
import { getIPFSUrl } from '../../utils/ipfsGateway';
import FileViewer from '../../components/FileViewer';

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow text-white z-50
      ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
      {toast.msg}
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

export default function PatientPage() {

  const router = useRouter();

  const [account, setAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [records, setRecords] = useState([]);
  const [doctorList, setDoctorList] = useState([]);

  const [authorized, setAuthorized] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const [doctorAddress, setDoctorAddress] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;

// Helpers
  function formatAddress(addr) {
    if (!addr) return "";
    return addr.slice(0, 4) + "..." + addr.slice(-4);
  }

  function copyAddress(addr) {
    navigator.clipboard.writeText(addr);
    showToast("Address copied 📋");
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  //  INIT 

  async function init() {
    try {
      setAuthLoading(true);

      if (!window.ethereum) {
        setAuthorized(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (!accounts || accounts.length === 0) {
        setAuthorized(false);
        return;
      }

      const acc = accounts[0];
      setAccount(acc);

      const user = await checkUserRole(acc);

      if (!user || user.role !== "patient") {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);

      await fetchDoctors(acc);
      await fetchRecords();

    } catch (err) {
      console.error("Init error:", err);
      setAuthorized(false);
    } finally {
      setAuthLoading(false);
    }
  }

    // re-init instead rather than doing the reload 
  const handleAccountsChanged = async (accounts) => {
    console.log("🔄 Patient: Account changed");

    const newAcc = accounts[0];

    setAuthorized(null); // reset UI
    setAccount(newAcc);

    await init(); // re-run full logic
  };


  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

// REDIRECT 
  useEffect(() => {
    if (!authLoading && authorized === false) {
      router.push("/unauthorized");
    }
  }, [authLoading, authorized, router]);

// Fetch 
  async function fetchDoctors(acc) {
    try {
      const contract = await getContract(false);
      const docs = await contract.getAuthorizedDoctors(acc);
      setDoctorList([...docs]);
    } catch (error) {
      console.error("Fetch doctors error:", error);
      setDoctorList([]);
    }
  }

  async function fetchRecords() {
    try {
      const contract = await getContract(false);
      const data = await contract.viewMyRecords();

      const formatted = data.map(r => {
        const decrypted = decryptData(r.ipfsHash);

        return {
          hash: decrypted,
          fileType: r.fileType,
          fileName: r.fileName,
          timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
        };
      });

      setRecords(formatted);
      setCurrentPage(1);
    } catch (error) {
      console.error("Fetch records error:", error);
      setRecords([]);
    }
  }


  async function uploadRecord() {
    if (!file) return showToast("Select file", "error");

    try {
      setUploading(true);

      const contract = await getContract(true);
      const hash = await uploadToIPFS(file);
      const enc = encryptData(hash);

      const tx = await contract.uploadRecord(account, enc, file.type, file.name);
      await tx.wait();

      showToast("Uploaded 🚀");

      setFile(null);
      document.getElementById("fileInput").value = "";

      await fetchRecords();

    } catch (error) {
      console.error("Upload error:", error);
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  async function grantAccess(addr) {
    if (!addr) {
      showToast("Please enter doctor address", "error");
      return;
    }

    try {
      const contract = await getContract(true);

      const exists = doctorList.some(d => d.toLowerCase() === addr.toLowerCase());
      if (exists) {
        return showToast("Already has access", "error");
      }

      const tx = await contract.grantAccess(addr);
      await tx.wait();

      showToast("Access Granted ✅");
      setDoctorAddress("");

      //   UI update
      setDoctorList(prev => [...prev, addr]);

    } catch (error) {
      console.error("Grant access error:", error);
      showToast("Failed to grant access", "error");
    }
  }

  async function revokeAccess(addr) {
    try {
      const contract = await getContract(true);
      const tx = await contract.revokeAccess(addr);
      await tx.wait();

      showToast("Access Revoked ❌");

      //  instant removal
      setDoctorList(prev =>
        prev.filter(d => d.toLowerCase() !== addr.toLowerCase())
      );

    } catch (error) {
      console.error("Revoke access error:", error);
      showToast("Failed to revoke access", "error");
    }
  }

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(records.length / recordsPerPage);

  const currentRecords = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

// Loading & Unauthorized handling
  if (authLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingOverlay show={true} />
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">

      <Sidebar />

      <div className="flex-1 p-6 text-black dark:text-white">

        <Toast toast={toast} />

        <h1 className="text-3xl font-bold mb-6">Patient Dashboard</h1>

        {account && (
          <div className="mb-6 w-full">
            <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 
                  text-white px-6 py-3 rounded-xl shadow-lg
                  flex items-center justify-between">

              <div>
                <p className="text-xs opacity-80">Connected Wallet</p>
                <span className="font-mono">{formatAddress(account)}</span>
              </div>

              <button
                  onClick={() => copyAddress(account)}
                  className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100 transition shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* DOCTOR ACCESS */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-4 text-xl">Grant Doctor Access</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              value={doctorAddress}
              onChange={(e) => setDoctorAddress(e.target.value)}
              placeholder="Enter doctor's wallet address"
              className="flex-1 border p-3 rounded text-black dark:text-white dark:bg-gray-700"
            />

            <button
              onClick={() => grantAccess(doctorAddress)}
              className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition"
            >
              Grant Access
            </button>
          </div>
        </div>

        {/* DOCTOR LIST */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-4 text-xl">Authorized Doctors</h2>

          {doctorList.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No doctors have access to your records yet</p>
          ) : (
            <div className="space-y-3">
              {doctorList.map((addr, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-mono text-sm break-all flex-1 mr-3">{addr}</span>
                  <button
                    onClick={() => revokeAccess(addr)}
                    className="bg-red-500 px-3 py-1 text-white rounded hover:bg-red-600 transition whitespace-nowrap"
                  >
                    Revoke Access
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UPLOAD */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-4 text-xl">Upload Medical Record</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              id="fileInput"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="flex-1 border p-2 rounded bg-white dark:bg-gray-700"
            />

            <button
              onClick={uploadRecord}
              disabled={uploading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Record"}
            </button>
          </div>
        </div>

        {/* RECORDS */}
        <div className="space-y-4">
          <h2 className="font-semibold text-2xl">My Medical Records</h2>

          {currentRecords.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow text-center text-gray-500">
              No records found. Upload your first medical record!
            </div>
          ) : (
            currentRecords.map((rec, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <p className="font-semibold text-lg">{rec.fileName}</p>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    {rec.fileType.includes('pdf') ? 'PDF Document' : 'Image File'}
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
            ))
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
            >
              Previous
            </button>

            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}