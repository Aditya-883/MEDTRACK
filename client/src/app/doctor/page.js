'use client';

import { useState, useEffect } from 'react';
import { getContract } from '../../web3/contract';
import { decryptData } from '../../utils/encryption';

export default function DoctorPage() {
  const [account, setAccount] = useState(null);
  const [patientAddress, setPatientAddress] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.ethereum) return;

    async function init() {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
    }

    init();
  }, []);

  // ✅ Simple CID validation
  function isValidCID(hash) {
    return hash && hash.startsWith("Qm") && hash.length > 40;
  }

  // ✅ IPFS URL
  function getIPFSUrl(hash) {
    return `https://ipfs.io/ipfs/${hash}`;
  }

  async function fetchRecords() {
    if (!patientAddress) {
      alert("Enter patient address");
      return;
    }

    try {
      setLoading(true);

      const contract = await getContract();

      const data = await contract.viewRecords(patientAddress);

      const validRecords = [];

      for (let r of data) {
        try {
          const hash = decryptData(r.ipfsHash);

          // ❌ Skip broken/old records
          if (!isValidCID(hash)) {
            console.warn("Skipping invalid record:", hash);
            continue;
          }

          validRecords.push({
            hash,
            fileType: r.fileType,
            fileName: r.fileName,
            uploadedBy: r.uploadedBy,
            timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
          });

        } catch (err) {
          console.warn("Skipping corrupted record");
        }
      }

      setRecords(validRecords);

    } catch (err) {
      console.error(err);
      alert(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Doctor Dashboard</h1>

      <p><b>Account:</b> {account}</p>

      <input
        type="text"
        placeholder="Patient Address"
        value={patientAddress}
        onChange={(e) => setPatientAddress(e.target.value)}
        style={{ width: '400px' }}
      />

      <br /><br />

      <button onClick={fetchRecords}>
        {loading ? "Fetching..." : "Fetch Records"}
      </button>

      <hr />

      {/* ✅ Empty state */}
      {!loading && records.length === 0 && (
        <p>No valid records found</p>
      )}

      {/* ✅ Clean records */}
      {records.map((rec, i) => (
        <div key={i} style={{ marginBottom: '25px' }}>
          <p><b>File:</b> {rec.fileName}</p>
          <p><b>Type:</b> {rec.fileType}</p>
          <p><b>Uploaded By:</b> {rec.uploadedBy}</p>
          <p><b>Time:</b> {rec.timestamp}</p>

          {rec.fileType.startsWith("image") ? (
            <img
              src={getIPFSUrl(rec.hash)}
              width="300"
              alt="preview"
            />
          ) : (
            <a href={getIPFSUrl(rec.hash)} target="_blank">
              Open File
            </a>
          )}
        </div>
      ))}
    </div>
  );
}