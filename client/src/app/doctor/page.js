import Link from "next/link"

export default function DoctorDashboard() {
  return (
    <div className="doctor-page">
      <h1 className="doctor-title">🩺 Doctor Dashboard</h1>

      <p className="doctor-subtitle">    
        Manage your appointments, patients, and medical records securely
      </p>

      <div className="doctor-actions">
        <Link href="/doctor/patients">
          <button className="doctor-btn primary">👥 My Patients</button>
        </Link>

        <Link href="/doctor/appointments">
          <button className="doctor-btn secondary">📅 Appointments</button>
        </Link>

        <Link href="/doctor/prescriptions">
          <button className="doctor-btn success">💊 Prescriptions</button>
        </Link>

        <Link href="/doctor/schedule">
          <button className="doctor-btn info">🕒 My Schedule</button>
        </Link>
      </div>

      <h2 className="doctor-section">🔐 Doctor Access Includes</h2>
      <ul className="doctor-list">
        <li>🧑‍⚕️ Assigned patient profiles only</li>
        <li>📝 Medical notes & diagnosis updates</li>
        <li>💊 Prescription management</li>
        <li>📅 Appointment scheduling</li>
      </ul>
    </div>
  )
}
