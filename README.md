🏥 MedTrack

Blockchain-Based Electronic Health Record (EHR) Management System

MedTrack is a real-world, production-oriented Healthcare DApp designed to give patients full ownership of their medical records while enabling secure, auditable access for doctors and healthcare providers using blockchain technology.

This project is not a tutorial demo. It is built with scalability, security, privacy, and healthcare compliance in mind.

---

✨ Key Features

🔐 Patient-Centric Data Ownership

- Patients control who can access their medical records
- Explicit consent-based sharing with doctors
- Revocable permissions

🧑‍⚕️ Doctor Access Management

- Doctors request access to patient records
- Patients approve or revoke access
- Immutable audit trail of access events

🔒 Security & Privacy First

- Medical records encrypted before leaving the client
- Only encrypted data stored off-chain
- No raw medical data stored on blockchain

⛓️ Blockchain-Powered Integrity

- Tamper-proof access logs
- Transparent permission management
- On-chain role-based access control (RBAC)

---

🧠 System Architecture (High-Level)

MedTrack (Monorepo)
├── client/              # Next.js Frontend (App Router)
├── backend/             # Node.js / Express (planned)
├── smart_contracts/     # Solidity + Hardhat (planned)
└── README.md

Architecture Principles

- Frontend-first design
- Separation of concerns
- Wallet-based identity
- Minimal on-chain data
- Scalable monorepo structure

---

🛠️ Tech Stack

Frontend

- Next.js (App Router)
- React (JavaScript)
- Tailwind CSS
- Context API for auth state

Blockchain (Planned)

- Ethereum
- Solidity
- Hardhat
- Ethers.js

Backend / Off-chain (Planned)

- Node.js
- Express.js / NestJS
- IPFS for encrypted file storage

Security

- AES encryption (client-side)
- SHA-256 hashing
- Role-Based Access Control (RBAC)

---

🚧 Current Development Status

✅ Completed

- Project bootstrapped with Next.js
- Global layout (Navbar + Footer)
- Role-Based Access Model (UI-level)
- Auth-aware navigation (mocked)
- Patient / Doctor / Admin routes
- Clean monorepo Git setup

🔄 In Progress / Planned

- Route guards (role-based)
- Wallet authentication (MetaMask / WalletConnect)
- Backend API for access coordination
- Smart contracts for permission control
- IPFS integration with encryption
- Automated testing & deployment

---

🚀 Getting Started (Frontend)

Prerequisites

- Node.js (>= 18)
- npm or yarn
- Git

Setup

git clone https://github.com/<your-username>/medtrack.git
cd medtrack/client
npm install
npm run dev

Open:

http://localhost:3000

---

🔐 Security & Compliance Mindset

MedTrack is built with a healthcare-first approach:

- No medical data stored in plaintext
- Encryption enforced before IPFS upload
- Wallet-based identity (no passwords)
- Auditability without data leakage
- Designed with HIPAA/GDPR principles in mind (conceptually)

«⚠️ This project is under active development and not yet production deployed.»

---

🤝 Collaboration

This project follows:

- Clean Git history
- Small, descriptive commits
- Clear separation of features
- Review-friendly structure

Contributions, reviews, and discussions are welcome.

---

📌 Disclaimer

MedTrack is a research and engineering project.
It is not a certified medical system and should not be used in production healthcare environments without proper legal, security, and compliance audits.

---

📬 Contact

For collaboration, feedback, or questions:

- Open an issue
- Reach out via GitHub

---

Built with a focus on security, ownership, and real-world applicability.
