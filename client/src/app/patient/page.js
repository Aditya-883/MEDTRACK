"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/layout/Sidebar";
import { getContract } from "../../web3/contract";
import { encryptData } from "../../utils/encryption";
import { uploadToIPFS } from "../../web3/ipfs";
import { checkUserRole } from "../../lib/auth";

/* 🔔 TOAST */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow text-white z-50
      ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
      {toast.msg}
    </div>
  );
}

export default function PatientPage() {

  const router = useRouter();
  const runningRef = useRef(false); // 🔥 prevent duplicate runs

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

  /* ================= HELPERS ================= */

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

  function resetState() {
    setAccount(null);
    setAuthorized(null);
    setRecords([]);
    setDoctorList([]);
    setDoctorAddress("");
    setCurrentPage(1);
  }

  /* ================= INIT ================= */

  async function init() {
    try {
      // 🔥 HARD RESET
      resetState();

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
      console.error(err);
      setAuthorized(false);
    } finally {
      setAuthLoading(false);
    }
  }

  /* ================= EFFECT ================= */

  useEffect(() => {

    const handleWalletChange = async () => {
      if (runningRef.current) return;
      runningRef.current = true;

      setAuthLoading(true);

      await init();

      runningRef.current = false;
    };

    handleWalletChange(); // initial load

    window.addEventListener("walletChanged", handleWalletChange);

    return () => {
      window.removeEventListener("walletChanged", handleWalletChange);
    };
  }, []);

  /* ================= REDIRECT ================= */

  useEffect(() => {
    if (!authLoading && authorized === false) {
      router.push("/unauthorized");
    }
  }, [authLoading, authorized]);

  /* ================= FETCH ================= */

  async function fetchDoctors(acc) {
    try {
      const contract = await getContract(false);
      const docs = await contract.getAuthorizedDoctors(acc);
      setDoctorList([...docs]); // 🔥 force re-render
    } catch {
      setDoctorList([]);
    }
  }

  async function fetchRecords() {
    try {
      const contract = await getContract(false);
      const data = await contract.viewMyRecords();
      setRecords([...data]); // 🔥 force re-render
      setCurrentPage(1);
    } catch {
      setRecords([]);
    }
  }

  /* ================= ACTIONS ================= */

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

    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  async function grantAccess(addr) {
    try {
      const contract = await getContract(true);
      const tx = await contract.grantAccess(addr);
      await tx.wait();

      showToast("Granted ✅");
      await fetchDoctors(account);

    } catch {
      showToast("Failed", "error");
    }
  }

  async function revokeAccess(addr) {
    try {
      const contract = await getContract(true);
      const tx = await contract.revokeAccess(addr);
      await tx.wait();

      showToast("Revoked ❌");
      await fetchDoctors(account);

    } catch {
      showToast("Failed", "error");
    }
  }

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(records.length / recordsPerPage);

  const currentRecords = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  /* ================= LOADING ================= */

  if (authLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          Checking access...
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div key={account} className="flex min-h-screen bg-gray-100 dark:bg-gray-900">

      <Sidebar />

      <div className="flex-1 p-6 text-black dark:text-white">

        <Toast toast={toast} />

        <h1 className="text-2xl font-bold mb-4">Patient</h1>

        {account && (
          <div className="sticky top-4 z-40 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 
                            text-white px-6 py-3 rounded-xl shadow-lg
                            flex justify-between items-center">

              <span>{formatAddress(account)}</span>

              <button
                onClick={() => copyAddress(account)}
                className="bg-white text-blue-600 px-4 py-1 rounded"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* DOCTOR ACCESS */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-4">Give Doctor Access</h2>

          <div className="flex gap-4">
            <input
              value={doctorAddress}
              onChange={(e) => setDoctorAddress(e.target.value)}
              className="flex-1 border p-3 rounded text-black"
            />

            <button
              onClick={() => grantAccess(doctorAddress)}
              className="bg-green-500 text-white px-6 py-3 rounded"
            >
              Grant
            </button>
          </div>
        </div>

        {/* DOCTOR LIST */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-2">Authorized Doctors</h2>

          {doctorList.length === 0 ? (
            <p>No doctors</p>
          ) : (
            doctorList.map((addr, i) => (
              <div key={i} className="flex justify-between mb-2">
                <span>{addr}</span>
                <button
                  onClick={() => revokeAccess(addr)}
                  className="bg-red-500 px-2 py-1 text-white rounded"
                >
                  Revoke
                </button>
              </div>
            ))
          )}
        </div>

        {/* UPLOAD */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <input id="fileInput" type="file"
            onChange={(e) => setFile(e.target.files[0])} />

          <button
            onClick={uploadRecord}
            className="bg-blue-500 text-white px-4 py-2 ml-2 rounded"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* RECORDS */}
        {currentRecords.map((r, i) => (
          <div key={i} className="bg-white p-4 rounded shadow mb-2">
            {r.fileName}
          </div>
        ))}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="bg-blue-500 px-3 py-1 text-white rounded">
              Prev
            </button>

            <span>{currentPage}/{totalPages}</span>

            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="bg-blue-500 px-3 py-1 text-white rounded">
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}