import Link from "next/link"

export default function PatientDashboard() {
  return (
    <div className="patient-page">
      <h1 className="patient-title">🧑‍⚕️ Patient Dashboard</h1>

      <p className="patient-subtitle">
        Access your health information securely and stay connected with your care
      </p>

      <div className="patient-actions">
        <Link href="/patient/profile">
          <button className="patient-btn primary">👤 My Profile</button>
        </Link>

        <Link href="/patient/appointments">
          <button className="patient-btn secondary">📅 Appointments</button>
        </Link>

        <Link href="/patient/prescriptions">
          <button className="patient-btn success">💊 Prescriptions</button>
        </Link>

        <Link href="/patient/history">
          <button className="patient-btn info">📄 Medical History</button>
        </Link>
      </div>

      <h2 className="patient-section">🔐 What You Can Access</h2>
      <ul className="patient-list">
        <li>🧾 Personal health records (read-only)</li>
        <li>📅 Appointment schedules</li>
        <li>💊 Doctor-issued prescriptions</li>
        <li>🩺 Visit and diagnosis history</li>
      </ul>
    </div>
  )
}
