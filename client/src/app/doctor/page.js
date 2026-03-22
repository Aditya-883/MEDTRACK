"use client";

import { useState } from "react";
import { getContract } from "../../web3/contract";

export default function DoctorPage() {
  const [patientAddress, setPatientAddress] = useState("");
  const [records, setRecords] = useState([]);

  // 🔍 Fetch patient records
  const fetchRecords = async () => {
    if (!patientAddress) {
      alert("Enter patient address");
      return;
    }

    try {
      const contract = await getContract();

      const data = await contract.viewRecords(patientAddress);

      console.log("Patient Records:", data);

      setRecords(data);
    } catch (err) {
      console.error("DOCTOR FETCH ERROR:", err);
      alert("Access denied or error");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Doctor Dashboard</h1>

      {/* Input */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="Enter Patient Address"
          value={patientAddress}
          onChange={(e) => setPatientAddress(e.target.value)}
          className="border p-2 mr-2 w-[400px]"
        />

        <button
          onClick={fetchRecords}
          className="bg-blue-600 text-white px-4 py-2"
        >
          View Records
        </button>
      </div>

      {/* Records */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Patient Records</h2>

        {records.length === 0 ? (
          <p>No records found or no access</p>
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