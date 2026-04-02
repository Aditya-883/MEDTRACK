🏥 MedTrack

Blockchain-Based Electronic Health Record (EHR) Management System

MedTrack is a production-oriented Healthcare DApp designed to give patients full ownership of their medical records while enabling secure, auditable access for doctors and healthcare providers using blockchain technology.

This project is built for real-world scalability, privacy, and healthcare compliance, not as a tutorial.

✨ Key Features
🔐 Patient-Centric Data Ownership
Full control over who can access medical records
Explicit, consent-based sharing with doctors
Revocable permissions at any time

🧑‍⚕️ Doctor Access Management
Doctors request access to patient records
Patients approve or revoke access
Immutable audit trail of access events

🔒 Security & Privacy
Medical records encrypted on the client side
Only encrypted data stored off-chain
No raw medical data on blockchain

⛓️ Blockchain-Powered Integrity
Tamper-proof access logs
Transparent permission management
Role-Based Access Control (RBAC)

🧠 System Architecture
Frontend: Next.js, React, Tailwind CSS
Blockchain: Ethereum, Solidity, Hardhat, Ethers.js
Backend / Off-chain: Node.js, Express.js / NestJS, IPFS
Security: AES encryption, SHA-256 hashing, wallet-based identity
Design Principles: Separation of concerns, minimal on-chain data, scalable monorepo, responsive interfaces

✅ Development Status
- Project bootstrapped with Next.js
- Global layout (Navbar + Footer)
- Role-Based Access Model fully implemented
- Auth-aware navigation
- Patient / Doctor / Admin routes completed
- Wallet authentication (MetaMask / WalletConnect) integrated
- Backend API for access coordination implemented
- Smart contracts for permission control deployed
- IPFS integration with encryption completed
- Automated testing & deployment configured

🔐 Security & Compliance Mindset
- No medical data stored in plaintext
- Encryption enforced before any off-chain storage
- Wallet-based authentication (no passwords)
- Auditability without data leakage
- Designed with HIPAA/GDPR principles in mind

