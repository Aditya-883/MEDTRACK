export default function AdminDashboard() {
  return (
    <div className="admin-page">
      <h1 className="admin-title">🛠️ Admin Dashboard</h1>

      <p className="admin-subtitle">
        Secure system control panel for managing healthcare operations
      </p>

      {/* ACTION BUTTONS */}
      <div className="admin-actions">
        <button className="admin-btn primary">👨‍⚕️ View Doctors</button>
        <button className="admin-btn secondary">➕ Add New Doctor</button>
        <button className="admin-btn warning">👥 View Patients (Limited)</button>
        <button className="admin-btn info">📊 System Reports</button>
      </div>

      {/* RESPONSIBILITIES */}
      <section className="admin-section">
        <h2>🔐 What Admin Can Access</h2>
        <ul>
          <li>👨‍⚕️ Doctor profiles (name, department, availability)</li>
          <li>📅 Doctor schedules and assignments</li>
          <li>🧾 System usage logs and activity reports</li>
          <li>⚙️ Platform configuration and access roles</li>
        </ul>
      </section>

      {/* PRIVACY */}
      <section className="admin-section">
        <h2>🛡️ Patient Data Protection</h2>
        <p>
          Admins <strong>cannot view patient medical records</strong>,
          prescriptions, diagnoses, or personal health data.  
          This ensures full compliance with healthcare data privacy standards.
        </p>
      </section>

      {/* SYSTEM OVERVIEW */}
      <section className="admin-section">
        <h2>📊 System Overview</h2>
        <div className="admin-stats">
          <div className="stat-card">👨‍⚕️ Doctors<br /><strong>12</strong></div>
          <div className="stat-card">🧑‍⚕️ Patients<br /><strong>150</strong></div>
          <div className="stat-card">📁 Records<br /><strong>420</strong></div>
          <div className="stat-card">🟢 Active Sessions<br /><strong>28</strong></div>
        </div>
      </section>
    </div>
  )
}
