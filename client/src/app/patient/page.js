"use client";

import { useEffect, useState } from "react";
import { getContract } from "../../web3/contract";
import { useWeb3 } from "../../context/Web3Context";
import { uploadToIPFS } from "../../web3/ipfs";
import { encryptData } from "../../web3/encryption";

export default function PatientPage() {
  const { account } = useWeb3();

  const [records, setRecords] = useState([]);
  const [file, setFile] = useState(null);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔍 Fetch records
  const fetchRecords = async () => {
    try {
      const contract = await getContract();
      const data = await contract.viewOwnRecords();
      setRecords(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🚀 Upload file
  const uploadRecord = async () => {
    if (!file) return alert("Select file");

    try {
      setLoading(true);

      // 🔐 Read file
      const reader = new FileReader();

      reader.onloadend = async () => {
        const fileData = reader.result;

        const encrypted = encryptData(fileData);

        // Convert encrypted string → file
        const blob = new Blob([encrypted], { type: "text/plain" });
        const encryptedFile = new File([blob], "record.txt");

        const hash = await uploadToIPFS(encryptedFile);

        console.log("IPFS Hash:", hash);

        // ⛓️ Store on blockchain
        const contract = await getContract();

        const tx = await contract.uploadRecord(account, hash);
        await tx.wait();

        alert("Encrypted record uploaded!");

        fetchRecords();
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔓 Grant access
  const grantAccess = async () => {
    const contract = await getContract();
    const tx = await contract.grantAccess(doctorAddress);
    await tx.wait();
    alert("Access granted!");
  };

  useEffect(() => {
    fetchRecords();
  }, [account]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Patient Dashboard</h1>

      {/* File Upload */}
      <div className="mt-6">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={uploadRecord}
          className="bg-green-600 text-white px-4 py-2 ml-2"
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      {/* Access */}
      <div className="mt-6">
        <input
          placeholder="Doctor Address"
          value={doctorAddress}
          onChange={(e) => setDoctorAddress(e.target.value)}
          className="border p-2 mr-2 w-[400px]"
        />

        <button
          onClick={grantAccess}
          className="bg-blue-600 text-white px-4 py-2"
        >
          Grant Access
        </button>
      </div>

      {/* Records */}
      <div className="mt-6">
        <h2>Your Records</h2>

        {records.map((r, i) => (
          <div key={i} className="border p-2 mt-2">
            <p>Hash: {r.ipfsHash}</p>

            <a
              href={`https://ipfs.io/ipfs/${r.ipfsHash}`}
              target="_blank"
            >
              View File
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}