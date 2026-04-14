import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from './config.js';

const ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'patient', type: 'address' },
      { indexed: true, internalType: 'address', name: 'doctor', type: 'address' },
    ],
    name: 'AccessGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'patient', type: 'address' },
      { indexed: true, internalType: 'address', name: 'doctor', type: 'address' },
    ],
    name: 'AccessRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'patient', type: 'address' },
      { indexed: false, internalType: 'string', name: 'ipfsHash', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'fileType', type: 'string' },
      { indexed: false, internalType: 'string', name: 'fileName', type: 'string' },
    ],
    name: 'RecordUploaded',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: 'patient', type: 'address' },
      { internalType: 'address', name: 'doctor', type: 'address' },
    ],
    name: 'checkAccess',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'patient', type: 'address' }],
    name: 'getAuthorizedDoctors',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'doctor', type: 'address' }],
    name: 'grantAccess',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'doctor', type: 'address' }],
    name: 'revokeAccess',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'patient', type: 'address' },
      { internalType: 'string', name: 'ipfsHash', type: 'string' },
      { internalType: 'string', name: 'fileType', type: 'string' },
      { internalType: 'string', name: 'fileName', type: 'string' },
    ],
    name: 'uploadRecord',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'viewMyRecords',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'ipfsHash', type: 'string' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'address', name: 'uploadedBy', type: 'address' },
          { internalType: 'string', name: 'fileType', type: 'string' },
          { internalType: 'string', name: 'fileName', type: 'string' },
        ],
        internalType: 'struct MedicalRecord.Record[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'patient', type: 'address' }],
    name: 'viewRecords',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'ipfsHash', type: 'string' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'address', name: 'uploadedBy', type: 'address' },
          { internalType: 'string', name: 'fileType', type: 'string' },
          { internalType: 'string', name: 'fileName', type: 'string' },
        ],
        internalType: 'struct MedicalRecord.Record[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const getProvider = () => new ethers.BrowserProvider(window.ethereum);

export const getSigner = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getSigner();
};

export const getContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};
