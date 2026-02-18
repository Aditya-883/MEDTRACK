export default function HomePage() {
  return (
    <div className="home-page">
      <h1 className="home-title">MedTrack</h1>

      <p className="home-subtitle">
        A smart and secure Medical Tracking System
      </p>

      <section className="home-section">
        <h2>🏥 About MedTrack</h2>
        <p>
          MedTrack is a modern healthcare management platform designed to
          simplify medical record tracking, improve communication between
          doctors and patients, and ensure secure access to healthcare data.
        </p>
      </section>

      <section className="home-section">
        <h2>⚙️ Key Features</h2>
        <ul>
          <li>📋 Centralized patient medical records</li>
          <li>🩺 Doctor dashboards for patient management</li>
          <li>🧑‍⚕️ Patient access to medical history</li>
          <li>🔐 Secure login with ID, password, and OTP</li>
          <li>🛠️ Admin control for system management</li>
        </ul>
      </section>

      <section className="home-section">
        <h2>🚀 Why Choose MedTrack?</h2>
        <p>
          MedTrack improves healthcare efficiency by reducing paperwork,
          minimizing errors, and providing real-time access to critical medical
          information — all in one easy-to-use platform.
        </p>
      </section>
    </div>
  )
}
