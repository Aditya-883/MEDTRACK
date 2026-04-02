# 🏥 MedTrack

**Blockchain-Based Electronic Health Record (EHR) Management System**

MedTrack is a production-oriented Healthcare DApp designed to give patients full ownership of their medical records while enabling secure, auditable access for doctors using blockchain technology.

It is built with a strong focus on **security, privacy, scalability, and real-world applicability**.

---

## ✨ Key Features

### 🔐 Patient-Centric Ownership

* Full control over medical records
* Consent-based access sharing
* Ability to revoke access anytime

### 🧑‍⚕️ Doctor Access Management

* Doctors request access to records
* Patients approve/reject requests
* Immutable audit trail of all access

### 🔒 Security & Privacy

* Client-side AES encryption before upload
* No plaintext medical data stored
* Secure off-chain storage (IPFS)

### ⛓️ Blockchain Integrity

* Tamper-proof access logs
* On-chain permission control
* Role-Based Access Control (RBAC)

---

## 🔄 System Flow

1. User connects wallet
2. Backend verifies or creates user
3. Patient uploads encrypted file → IPFS
4. IPFS hash stored on blockchain
5. Access managed via smart contract
6. Doctor fetches & decrypts data (if authorized)

---

## 🧠 Architecture

```
MedTrack (Monorepo)
├── client/              # Next.js Frontend
├── backend/             # Node.js / Express API
├── smart_contracts/     # Solidity + Hardhat
└── README.md
```

### Architecture Principles

* Separation of concerns
* Wallet-based identity
* Minimal on-chain data
* Scalable monorepo structure

---

## 🛠️ Tech Stack

### 🎨 Frontend

* Next.js (App Router)
* React
* Tailwind CSS

### 🔗 Blockchain

* Solidity
* Hardhat
* Ethers.js

### ⚙️ Backend

* Node.js
* Express.js
* MongoDB

### 📦 Storage

* IPFS (via Pinata)

### 🔐 Security

* AES Encryption
* SHA-256 Hashing
* RBAC (Role-Based Access Control)
* Wallet Authentication (MetaMask)

---

## 🚀 Features Implemented

### ✅ Core System

* Patient dashboard (upload & view records)
* Doctor dashboard (authorized access)
* Smart contract-based permissions
* Grant / revoke access system

### ✅ File Handling

* Encrypted file uploads to IPFS
* File validation (PDF / Images)
* Secure retrieval & decryption

### ✅ Role System

* Backend user registration
* Role-based route protection
* Admin-controlled role updates

### ✅ UI/UX

* File preview (PDF & images)
* Download functionality
* Pagination
* Clean dashboard interface

---

## 🚧 Upcoming Features

### 🔥 Admin Panel

* Access tracking
* Activity monitoring
* System analytics

### 📊 Logs & Analytics

* Upload tracking
* Access logs
* Doctor activity insights

### 🔐 Advanced Security

* Signature-based authentication
* Secure APIs
* Rate limiting & validation

---

## 🚀 Getting Started

### 📦 Prerequisites

* Node.js (>=18)
* MongoDB
* MetaMask
* Hardhat

---

### 🔧 Installation

#### 1. Clone Repository

```
git clone https://github.com/<your-username>/medtrack.git
cd medtrack
```

#### 2. Backend Setup

```
cd backend
npm install
npm run dev
```

Runs on: http://localhost:5000

---

#### 3. Frontend Setup

```
cd client
npm install
npm run dev
```

Runs on: http://localhost:3000

---

#### 4. Smart Contracts

```
cd smart_contracts
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

---

## 🔐 Security & Compliance

MedTrack follows a healthcare-first design approach:

* No plaintext medical data storage
* Encryption before IPFS upload
* Wallet-based identity (no passwords)
* Blockchain-based access control
* Designed with HIPAA/GDPR principles (conceptual)

