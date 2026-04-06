"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ ADDED
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

/* ⏳ SKELETON */
function Skeleton() {
  return <div className="h-20 bg-gray-300 animate-pulse rounded"></div>;
}

export default function PatientPage() {

  const router = useRouter(); // ✅ ADDED

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [account, setAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [records, setRecords] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [authorized, setAuthorized] = useState(null);
  const [initLoading, setInitLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");

  const [doctorAddress, setDoctorAddress] = useState("");
  const [requests, setRequests] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;

  useEffect(() => {
    init();
  }, []);

  // ✅ ADDED: redirect when unauthorized
  useEffect(() => {
    if (authorized === false) {
      router.push("/unauthorized");
    }
  }, [authorized]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  async function init() {
    try {
      setInitLoading(true);

      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const acc = accounts[0];
      setAccount(acc);

      if (!acc) return setAuthorized(false);

      const user = await checkUserRole(acc);
      if (!user || user.role !== "patient") return setAuthorized(false);

      setAuthorized(true);
      fetchDoctors(acc);
      fetchRecords();
      fetchRequests();

    } catch {
      setAuthorized(false);
    } finally {
      setInitLoading(false);
    }
  }

  async function fetchDoctors(acc) {
    try {
      const contract = await getContract(false);
      const docs = await contract.getAuthorizedDoctors(acc);
      setDoctorList(docs);
    } catch {
      setDoctorList([]);
    }
  }

  async function fetchRecords() {
    try {
      const contract = await getContract(false);
      const data = await contract.viewMyRecords();

      let sorted = [...data];
      sorted.sort((a, b) =>
        sortOrder === "newest"
          ? Number(b.timestamp) - Number(a.timestamp)
          : Number(a.timestamp) - Number(b.timestamp)
      );

      setRecords(sorted);
      setCurrentPage(1);

    } catch {
      setRecords([]);
    }
  }

  async function fetchRequests() {
    try {
      const contract = await getContract(false);
      if (!contract.getAccessRequests) return;

      const req = await contract.getAccessRequests();
      setRequests(req);

    } catch {
      setRequests([]);
    }
  }

  async function approveRequest(addr) {
    try {
      const contract = await getContract(true);
      if (!contract.approveRequest) return;

      const tx = await contract.approveRequest(addr);
      await tx.wait();

      showToast("Approved ✅");
      fetchRequests();

    } catch {
      showToast("Failed", "error");
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
      fetchRecords();

    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  async function grantAccess() {
    try {
      const contract = await getContract(true);
      const tx = await contract.grantAccess(doctorAddress);
      await tx.wait();

      showToast("Access Granted");
      fetchDoctors(account);

    } catch {
      showToast("Failed", "error");
    }
  }

  const totalPages = Math.ceil(records.length / recordsPerPage);

  const currentRecords = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  if (initLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 space-y-3">
          <Skeleton /><Skeleton /><Skeleton />
        </div>
      </div>
    );
  }

  // ✅ REPLACED (no UI flash, redirect handles it)
  if (authorized === false) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">

      <Sidebar />

      <div className="flex-1 p-6 text-black dark:text-white">

        <Toast toast={toast} />

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Patient</h1>
        </div>

        {/* DOCTOR ACCESS */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-2">Give Doctor Access</h2>

          <input
            type="text"
            placeholder="Doctor Address"
            value={doctorAddress}
            onChange={(e) => setDoctorAddress(e.target.value)}
            className="border p-2 mr-2 rounded text-black"
          />

          <button
            onClick={grantAccess}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Grant
          </button>
        </div>

        {/* REQUESTS */}
        {requests.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
            <h2 className="font-semibold mb-2">Doctor Requests</h2>

            {requests.map((addr, i) => (
              <div key={i} className="flex justify-between mb-2">
                <span>{addr}</span>
                <button
                  onClick={() => approveRequest(addr)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}

        {/* SORT */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="mb-4 border border-gray-300 dark:border-gray-600 p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* UPLOAD */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button
            onClick={uploadRecord}
            className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* RECORDS */}
        <div className="space-y-3">
          {currentRecords.length === 0 ? (
            <p className="text-gray-400">No records</p>
          ) : (
            currentRecords.map((r, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <p className="font-semibold">{r.fileName}</p>
                <p className="text-sm text-gray-500">
                  {r.fileType?.includes("pdf") ? "PDF 📄" : "Image 🖼️"}
                </p>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="px-3 py-1 bg-blue-500 text-white rounded">Prev</button>

            <span>Page {currentPage} / {totalPages}</span>

            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="px-3 py-1 bg-blue-500 text-white rounded">Next</button>
          </div>
        )}

      </div>
    </div>
  );
}