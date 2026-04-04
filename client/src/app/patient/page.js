"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import { getContract } from "../../web3/contract";
import { encryptData } from "../../utils/encryption";
import { uploadToIPFS } from "../../web3/ipfs";
import { checkUserRole } from "../../lib/auth";
import { clearSession } from "../../lib/session";

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
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", init);
    }

    return () => {
      window.ethereum?.removeListener("accountsChanged", init);
    };
  }, []);

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
      setDoctorList(docs.map(d => ({ address: d })));
    } catch {
      setDoctorList([]);
    }
  }

  // ✅ SAFE FETCH (fixes 0x error)
  async function fetchRecords() {
    try {
      const contract = await getContract(false);
      const data = await contract.viewMyRecords();

      if (!data || data.length === 0) {
        setRecords([]);
        return;
      }

      let sorted = [...data];

      if (sortOrder === "newest") {
        sorted.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      } else {
        sorted.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
      }

      setRecords(sorted);

    } catch (err) {
      console.error(err);
      setRecords([]);
      showToast("No records found", "error");
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
      setNotifications(prev => ["New record uploaded", ...prev]);

      fetchRecords();

    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  if (initLoading) {
    return (
      <div className="flex">
        <Sidebar onToggle={setSidebarOpen} />
        <div className="flex-1 p-6 space-y-3">
          <Skeleton /><Skeleton /><Skeleton />
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="flex">
        <Sidebar onToggle={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2 className="text-red-500 text-xl font-bold">Access Denied</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar onToggle={setSidebarOpen} />

      <div className="flex-1 p-6 transition-all duration-300">

        <Toast toast={toast} />

        {/* ✅ CLEAN HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Patient</h1>
            <p className="text-sm text-gray-500">
              Manage your medical records securely
            </p>
          </div>

          <button
            onClick={() => {
              clearSession();
              location.reload();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* 🔔 NOTIFICATIONS */}
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Notifications 🔔</h2>
          <div className="bg-white p-3 rounded shadow text-sm">
            {notifications.length === 0 ? "No notifications" :
              notifications.map((n, i) => <p key={i}>• {n}</p>)
            }
          </div>
        </div>

        {/* 📊 STATS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded">Records: {records.length}</div>
          <div className="bg-green-100 p-4 rounded">Doctors: {doctorList.length}</div>
        </div>

        {/* 🔽 SORT */}
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            fetchRecords();
          }}
          className="mb-4 border p-2 rounded"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* 📤 UPLOAD */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button
            onClick={uploadRecord}
            className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* 📂 RECORDS */}
        <div className="space-y-3">
          {records.length === 0 ? (
            <p className="text-gray-400">No records</p>
          ) : (
            records.map((r, i) => (
              <div key={i} className="bg-white p-4 rounded shadow">
                <p className="font-semibold">{r.fileName}</p>
                <p className="text-sm text-gray-500">
                  {r.fileType?.includes("pdf") ? "PDF 📄" : "Image 🖼️"}
                </p>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <footer className="bg-black text-white text-center py-3 mt-10 rounded">
          © 2026 MedTrack
        </footer>

      </div>
    </div>
  );
}