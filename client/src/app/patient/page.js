'use client';

import { useState, useEffect } from 'react';
import { getContract } from '../../web3/contract';
import { encryptData } from '../../utils/encryption';
import { uploadToIPFS } from '../../web3/ipfs';

export default function PatientPage() {
  const [account, setAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [doctorAddress, setDoctorAddress] = useState('');

  const [uploading, setUploading] = useState(false);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0]);
    };

    async function init() {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
    }

    init();

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  }

  async function uploadRecord() {
    if (uploading) return;

    if (!file) {
      alert("Select a file");
      return;
    }

    try {
      setUploading(true);

      const contract = await getContract();

      // ✅ STEP 1: Upload REAL file
      const ipfsHash = await uploadToIPFS(file);

      // ✅ STEP 2: Encrypt hash (optional)
      const encryptedHash = encryptData(ipfsHash);

      // ✅ STEP 3: Store on blockchain
      const tx = await contract.uploadRecord(
        account,
        encryptedHash,
        file.type,
        file.name
      );

      await tx.wait();

      alert("✅ Record uploaded successfully");

      setFile(null);

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function grantAccess() {
    if (granting) return;

    if (!doctorAddress) {
      alert("Enter doctor address");
      return;
    }

    try {
      setGranting(true);

      const contract = await getContract();

      const tx = await contract.grantAccess(doctorAddress);
      await tx.wait();

      alert("✅ Access granted");
      setDoctorAddress('');

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setGranting(false);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Patient Dashboard</h1>

      <p><b>Account:</b> {account}</p>

      <hr />

      <h2>Upload Medical Record</h2>

      <input type="file" onChange={handleFileChange} />

      <br /><br />

      <button onClick={uploadRecord}>
        {uploading ? "Uploading..." : "Upload Record"}
      </button>

      <hr />

      <h2>Grant Doctor Access</h2>

      <input
        type="text"
        placeholder="Doctor Address"
        value={doctorAddress}
        onChange={(e) => setDoctorAddress(e.target.value)}
        style={{ width: '400px' }}
      />

      <br /><br />

      <button onClick={grantAccess}>
        {granting ? "Processing..." : "Grant Access"}
      </button>
    </div>
  );
}