# MedTrack — Blockchain Healthcare DApp

Secure, decentralised medical record management on Sepolia testnet.

## Project Structure

```
medtrack/
├── backend/          # Node.js + Express API
│   ├── .env          # Backend environment variables
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
│
└── frontend/         # React + Vite SPA
    ├── .env          # Frontend environment variables
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── api/          # Axios client + API helpers (reads VITE_API_URL)
        ├── components/   # Shared UI & layout components
        ├── pages/        # Home, Admin, Doctor, Patient
        ├── utils/        # encryption, IPFS gateway, wallet helpers
        └── web3/         # ethers.js config, contract, IPFS upload
```

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
# Edit .env — set MONGO_URI, JWT_SECRET, PORT, CLIENT_URL
npm run dev       # nodemon server.js → http://localhost:5000
```

**`backend/.env` variables:**

| Variable     | Description                          |
|-------------|--------------------------------------|
| `PORT`       | Port to run the server on (default 5000) |
| `MONGO_URI`  | MongoDB connection string            |
| `JWT_SECRET` | Secret for signing JWTs              |
| `CLIENT_URL` | Frontend URL for CORS (e.g. http://localhost:5173) |

---

### 2. Frontend

```bash
cd frontend
npm install
# Edit .env — set VITE_API_URL and Pinata keys
npm run dev       # Vite dev server → http://localhost:5173
```

**`frontend/.env` variables:**

| Variable                  | Description                                   |
|--------------------------|-----------------------------------------------|
| `VITE_API_URL`           | Backend base URL (e.g. http://localhost:5000/api) |
| `VITE_PINATA_API_KEY`    | Pinata API key for IPFS uploads               |
| `VITE_PINATA_SECRET_KEY` | Pinata secret key                             |
| `VITE_CONTRACT_ADDRESS`  | Deployed MedTrack smart contract address      |
| `VITE_CHAIN_ID`          | Chain ID in hex (0xaa36a7 = Sepolia)          |
| `VITE_CHAIN_NAME`        | Human-readable chain name                     |
| `VITE_RPC_URL`           | RPC endpoint for the chain                    |
| `VITE_EXPLORER_URL`      | Block explorer base URL                       |

---

## No More Hardcoded URLs

All `http://localhost:5000` references have been removed from source code.

- **Frontend** reads `VITE_API_URL` via `src/api/client.js` — one axios instance shared by every page.
- **Backend** reads `CLIENT_URL` from `.env` for CORS.
- **Chain config** (contract address, RPC, chain ID) is read from `VITE_*` vars in `src/web3/config.js`.
- **Pinata keys** are read from `VITE_PINATA_API_KEY` / `VITE_PINATA_SECRET_KEY`.

To point at a different backend or network, only change the `.env` file — no source edits needed.

---

## Tech Stack

| Layer     | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Vite, React Router v6, Tailwind CSS |
| Backend  | Node.js, Express 5, Mongoose            |
| Auth     | MetaMask wallet + JWT                   |
| Storage  | IPFS via Pinata                         |
| Chain    | Ethereum Sepolia testnet (ethers.js v6) |
| DB       | MongoDB Atlas                           |
