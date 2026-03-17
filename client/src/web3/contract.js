import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "./config";
import { getSigner } from "./provider";

const ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "patient", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "doctor", "type": "address" }
    ],
    "name": "AccessGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "patient", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "doctor", "type": "address" }
    ],
    "name": "AccessRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "patient", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "RecordUploaded",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "address", "name": "doctor", "type": "address" }],
    "name": "grantAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "doctor", "type": "address" }],
    "name": "revokeAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "patient", "type": "address" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" }
    ],
    "name": "uploadRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "viewOwnRecords",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "uploadedBy", "type": "address" }
        ],
        "internalType": "struct MedicalRecord.Record[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "patient", "type": "address" }],
    "name": "viewRecords",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "uploadedBy", "type": "address" }
        ],
        "internalType": "struct MedicalRecord.Record[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const getContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};