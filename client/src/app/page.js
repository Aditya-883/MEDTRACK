export default function HomePage() {
  return (
    <div className="home-page">
      
      {/* HERO SECTION */}
      <section className="home-hero">
        <h1>🏥 MedTrack</h1>
        <p className="home-tagline">
          Smart, secure & role-based medical tracking — built for
          <span> Admins</span>, <span>Doctors</span> & <span>Patients</span>.
        </p>

        <div className="home-buttons">
          <a href="/admin/login" className="home-btn admin">🛠️ Admin</a>
          <a href="/doctor/login" className="home-btn doctor">🩺 Doctor</a>
          <a href="/patient/login" className="home-btn patient">🧑‍⚕️ Patient</a>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-features">
        <div className="feature-card">
          🛡️
          <h3>Secure Access</h3>
          <p>
            Role-based login ensures doctors, patients, and admins
            only see what they are authorized to view.
          </p>
        </div>

        <div className="feature-card">
          📋
          <h3>Organized Records</h3>
          <p>
            Doctors manage consultations, prescriptions, and reports
            without exposing sensitive patient data.
          </p>
        </div>

        <div className="feature-card">
          📊
          <h3>Admin Control</h3>
          <p>
            Admins can manage doctors, monitor system usage, and
            maintain platform integrity.
          </p>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="home-info">
        <h2>✨ Why MedTrack?</h2>
        <ul>
          <li>✅ Clean & responsive design</li>
          <li>✅ Privacy-focused architecture</li>
          <li>✅ Separate dashboards for each role</li>
          <li>✅ Scalable for real hospital systems</li>
        </ul>
      </section>

    </div>
  )
}
