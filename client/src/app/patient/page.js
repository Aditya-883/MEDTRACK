'use client';

import { useState, useEffect } from 'react';
import { getContract } from '../../web3/contract';
import { encryptData, decryptData } from '../../utils/encryption';
import { uploadToIPFS } from '../../web3/ipfs';
import { getIPFSUrl } from '../../utils/ipfsGateway';
import FileViewer from '../../components/FileViewer';
import { checkUserRole } from '../../lib/auth';
import { clearSession } from '../../lib/session';

export default function PatientPage() {
  const [account, setAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [doctorAddress, setDoctorAddress] = useState('');
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [authorized, setAuthorized] = useState(null);

  const [doctorList, setDoctorList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 🔥 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  async function init() {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    const currentAccount = accounts[0];
    setAccount(currentAccount);

    if (!currentAccount) {
      setAuthorized(false);
      return;
    }

    const user = await checkUserRole(currentAccount);

    if (!user || user.role !== 'patient') {
      setAuthorized(false);
      return;
    }

    setAuthorized(true);

    await fetchMyRecords();
    await fetchDoctorAccessList();
  }

  async function fetchDoctorAccessList() {
    try {
      const contract = await getContract(false);
      const doctors = await contract.getAuthorizedDoctors(account);

      const list = [];

      for (let doc of doctors) {
        const status = await contract.checkAccess(account, doc);
        if (status) {
          list.push({ address: doc, active: status });
        }
      }

      setDoctorList(list);
    } catch (err) {
      console.error(err);
    }
  }

  if (authorized === false) {
    return <div className="p-6">Unauthorized</div>;
  }

  if (authorized === null) return null;

  function validateFile(file) {
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
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

  async function uploadRecord() {
    if (!file) return alert("Select file");

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

      await fetchMyRecords();

    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function fetchMyRecords() {
    try {
      const contract = await getContract(false);

      const data = await contract.viewMyRecords();

      const formatted = data.map(r => ({
        hash: decryptData(r.ipfsHash),
        fileType: r.fileType,
        fileName: r.fileName,
        timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
      }));

      setRecords(formatted);
      setCurrentPage(1); // reset page

    } catch (err) {
      console.error(err);
    }
  }

  async function grantAccess() {
    if (!doctorAddress) return alert("Enter doctor address");

    const already = doctorList.find(d => d.address === doctorAddress);
    if (already) return alert("Already has access");

    const contract = await getContract(true);
    const tx = await contract.grantAccess(doctorAddress);
    await tx.wait();

    await fetchDoctorAccessList();
    alert("Access granted");
  }

  async function revokeDoctor(address) {
    const contract = await getContract(true);
    const tx = await contract.revokeAccess(address);
    await tx.wait();

    await fetchDoctorAccessList();
  }

  function copyAddress() {
    navigator.clipboard.writeText(account);
    alert("Copied!");
  }

  const totalRecords = records.length;
  const activeDoctors = doctorList.length;

  // 🔥 PAGINATION LOGIC
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = records.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(records.length / recordsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          <button
            onClick={() => { clearSession(); window.location.reload(); }}
            className="bg-red-100 text-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        {/* ACCOUNT */}
        <div className="flex justify-between mb-4">
          <p><b>Connected:</b> {account}</p>
          <button onClick={copyAddress} className="bg-gray-200 px-2 py-1 rounded text-xs">
            Copy
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded">
            <p>Total Records</p>
            <p className="text-xl font-bold">{totalRecords}</p>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <p>Active Doctors</p>
            <p className="text-xl font-bold">{activeDoctors}</p>
          </div>
        </div>

        {/* DOCTORS */}
        <h2 className="font-semibold mb-2">Authorized Doctors</h2>

        {doctorList.length === 0 ? (
          <p className="text-gray-400 mb-4">No doctors added yet</p>
        ) : (
          doctorList.map((doc, i) => (
            <div key={i} className="flex justify-between items-center border p-2 rounded mb-2">
              <span className="text-sm">{doc.address}</span>

              <button
                onClick={() => revokeDoctor(doc.address)}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Revoke
              </button>
            </div>
          ))
        )}

        {/* UPLOAD */}
        <h2 className="font-semibold mt-6 mb-2">Upload New Record</h2>

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

        {message && <p className="text-sm text-gray-600">{message}</p>}

        {/* ACCESS */}
        <h2 className="font-semibold mt-6 mb-2">Add Doctor</h2>

        <input
          type="text"
          placeholder="Doctor Wallet Address"
          value={doctorAddress}
          onChange={(e) => setDoctorAddress(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />

        <button
          onClick={grantAccess}
          className="bg-green-500 text-white px-4 py-1 rounded mb-4"
        >
          Grant Access
        </button>

        {/* RECORDS */}
        <h2 className="font-semibold mt-6 mb-2">Your Records</h2>

        {records.length === 0 ? (
          <p className="text-gray-400">No records yet</p>
        ) : (
          <>
            {currentRecords.map((rec, i) => (
              <div key={i} className="border p-4 rounded bg-gray-50 mb-3">
                <p className="font-semibold">{rec.fileName}</p>
                <p className="text-xs text-gray-500 mb-2">{rec.timestamp}</p>

                <FileViewer
                  url={getIPFSUrl(rec.hash)}
                  fileType={rec.fileType}
                />
              </div>
            ))}

            {/* PAGINATION */}
            <div className="flex justify-between mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm">
                Page {currentPage} / {totalPages || 1}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}