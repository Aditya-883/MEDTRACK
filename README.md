# 🏥 MedTrack — Blockchain Medical Records DApp

MedTrack is a decentralized healthcare application where patient medical records are secured on the **Sepolia testnet** via a Solidity smart contract. Files are stored on **IPFS via Pinata**; only the encrypted hash is stored on-chain.

---

## 📁 Project Structure

```
MEDTRACK/
├── smart_contracts/       # Hardhat project (Solidity)
│   ├── contracts/
│   │   └── MedicalRecord.sol
│   ├── scripts/
│   │   └── deploy.js
│   └── hardhat.config.js
├── backend/               # Node.js + Express + MongoDB
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── client/                # Next.js 14 frontend
    └── src/
        ├── app/           # Pages (home, patient, doctor, admin)
        ├── components/    # Sidebar, FileViewer, Footer
        ├── web3/          # Contract ABI, IPFS, config
        ├── utils/         # Encryption, IPFS gateway
        └── lib/           # Auth helpers
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MetaMask** browser extension
- **Sepolia testnet ETH** (get free from https://sepoliafaucet.com)
- **MongoDB** (Atlas free tier: https://cloud.mongodb.com)
- **Pinata account** (free tier: https://app.pinata.cloud)
- **Alchemy or Infura** account for Sepolia RPC

---

## 🚀 Setup & Usage Guide

### STEP 1 — Deploy the Smart Contract

```bash
cd smart_contracts
npm install
```

Create `.env` (copy from `.env.example`):
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xYOUR_METAMASK_PRIVATE_KEY
ETHERSCAN_API_KEY=OPTIONAL
```

> ⚠️ **PRIVATE_KEY**: Export from MetaMask → Account Details → Show Private Key.  
> Make sure this wallet has Sepolia ETH for gas.

Deploy:
```bash
npm run deploy:sepolia
```

You'll see output like:
```
✅ MedicalRecord deployed to: 0xABC123...
```

**Copy this address!**

---

### STEP 2 — Update Frontend Contract Address

Open `client/src/web3/config.js` and replace:
```js
export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```
with your deployed address from Step 1.

---

### STEP 3 — Start the Backend

```bash
cd backend
npm install
```

Create `.env` (copy from `.env.example`):
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/medtrack
JWT_SECRET=any_long_random_string_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

Start the server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

---

### STEP 4 — Create the First Admin User

Before using the admin panel, you must manually insert your wallet address as admin in MongoDB.

**Option A — MongoDB Atlas UI:**
1. Go to your Atlas cluster → Browse Collections → medtrack → users
2. Insert document:
```json
{
  "address": "0xyourwalletaddressinlowercase",
  "role": "admin",
  "createdAt": { "$date": "2024-01-01T00:00:00Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00Z" }
}
```

**Option B — via API (curl):**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"address": "0xyouraddress", "role": "admin"}'
```
Then manually update role to admin in MongoDB Atlas.

---

### STEP 5 — Start the Frontend

```bash
cd client
npm install
```

Create `.env.local` (copy from `.env.local.example`):
```
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
```

Start:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## 🔑 How Authentication Works

| Role    | How to get it | What they can do |
|---------|--------------|-----------------|
| Patient | Auto-assigned on first wallet connect | Upload records, grant/revoke doctor access |
| Doctor  | Admin assigns via Admin Panel | View records of patients who granted access |
| Admin   | Manually set in MongoDB | Manage all users, assign roles |

### Flow:
1. User visits site → clicks **Connect Wallet** in sidebar
2. MetaMask prompts to switch to **Sepolia** network
3. User signs a message (proves wallet ownership)
4. Backend checks if wallet exists → creates as `patient` if new
5. Role is stored in sidebar; pages check role via backend

---

## 📋 Feature Guide

### Patient Dashboard (`/patient`)
- **Upload Record**: Select a PDF or image → uploads to IPFS → stores encrypted hash on-chain
- **Grant Access**: Enter a doctor's wallet address → calls `grantAccess()` on smart contract
- **Revoke Access**: Remove a doctor's access → calls `revokeAccess()` on smart contract
- **My Records**: View/download all your uploaded records

### Doctor Dashboard (`/doctor`)
- **Check Access**: Enter a patient's wallet address → checks `checkAccess()` on-chain
- **Fetch Records**: If access granted → calls `viewRecords()` → decrypts and displays files

### Admin Panel (`/admin`)
- **View all users** with search and role filter
- **Change role**: Click → Admin / → Doctor / → Patient buttons
- Requires admin JWT token (obtained via MetaMask signature)

---

## 🔧 Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| "MetaMask not installed" | Install MetaMask extension and refresh |
| Wrong network error | Sidebar auto-prompts to switch to Sepolia |
| "User not found" on patient/doctor page | Connect wallet first (sidebar) to register |
| Admin page redirects to /unauthorized | Your wallet must have `role: "admin"` in MongoDB |
| IPFS upload fails | Check Pinata API keys in `client/.env.local` |
| Contract call fails | Verify `CONTRACT_ADDRESS` in `client/src/web3/config.js` |
| TX rejected / no gas | Get Sepolia ETH from https://sepoliafaucet.com |
| MongoDB connection error | Check `MONGO_URI` in `backend/.env` |

---

## 🌐 Sepolia Testnet Info

- **Chain ID**: 11155111 (0xaa36a7)
- **Explorer**: https://sepolia.etherscan.io
- **Faucets**:
  - https://sepoliafaucet.com (Alchemy)
  - https://faucet.sepolia.dev
  - https://faucet.chainstack.com

---

## 🔒 Security Notes

- Private keys must **never** be committed to git. Use `.env` files only.
- The `.gitignore` already excludes `.env`, `.env.local`, etc.
- Current encryption is lightweight obfuscation. For production, use AES-256 with a patient-derived key.
- Admin JWT expires after 8 hours; re-connect wallet to refresh.
