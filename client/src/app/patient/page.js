"use client";

import { useEffect, useState } from "react";
import { getContract } from "../../web3/contract";
import { useWeb3 } from "../../context/Web3Context";

export default function PatientPage() {
  const { account } = useWeb3();

  const [records, setRecords] = useState([]);
  const [ipfsHash, setIpfsHash] = useState("");
  const [doctorAddress, setDoctorAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔍 Fetch records
  const fetchRecords = async () => {
    try {
      if (!account) return;

      const contract = await getContract();
      const data = await contract.viewOwnRecords();

      setRecords(data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  // 🚀 Upload record
  const uploadRecord = async () => {
    if (!ipfsHash) return alert("Enter IPFS hash");

    try {
      setLoading(true);

      const contract = await getContract();

      const tx = await contract.uploadRecord(account, ipfsHash);
      await tx.wait();

      alert("Record uploaded!");
      setIpfsHash("");

      fetchRecords();
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔓 Grant access
  const grantAccess = async () => {
    if (!doctorAddress) return alert("Enter doctor address");

    try {
      const contract = await getContract();

      const tx = await contract.grantAccess(doctorAddress);
      await tx.wait();

      alert("Access granted!");
      setDoctorAddress("");
    } catch (err) {
      console.error("GRANT ERROR:", err);
      alert("Failed to grant access");
    }
  };

  // 🔒 Revoke access
  const revokeAccess = async () => {
    if (!doctorAddress) return alert("Enter doctor address");

    try {
      const contract = await getContract();

      const tx = await contract.revokeAccess(doctorAddress);
      await tx.wait();

      alert("Access revoked!");
      setDoctorAddress("");
    } catch (err) {
      console.error("REVOKE ERROR:", err);
      alert("Failed to revoke access");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [account]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Patient Dashboard</h1>

      {/* Upload */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="IPFS Hash"
          value={ipfsHash}
          onChange={(e) => setIpfsHash(e.target.value)}
          className="border p-2 mr-2"
        />

        <button
          onClick={uploadRecord}
          className="bg-green-600 text-white px-4 py-2"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Access Control */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="Doctor Address"
          value={doctorAddress}
          onChange={(e) => setDoctorAddress(e.target.value)}
          className="border p-2 mr-2 w-[400px]"
        />

        <button
          onClick={grantAccess}
          className="bg-blue-600 text-white px-4 py-2 mr-2"
        >
          Grant Access
        </button>

        <button
          onClick={revokeAccess}
          className="bg-red-600 text-white px-4 py-2"
        >
          Revoke Access
        </button>
      </div>

      {/* Records */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Your Records</h2>

        {records.length === 0 ? (
          <p>No records found</p>
        ) : (
          records.map((r, i) => (
            <div key={i} className="border p-3 mt-2">
              <p><b>IPFS:</b> {r.ipfsHash}</p>
              <p><b>Uploaded By:</b> {r.uploadedBy}</p>
              <p><b>Timestamp:</b> {Number(r.timestamp)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}