"use client";
import { useState } from "react";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState(null);

  // Mock data 
  const doctors = [
    { name: "Dr. Amit Sharma", dept: "Cardiology", available: "Mon–Fri" },
    { name: "Dr. Neha Verma", dept: "Neurology", available: "Tue–Sat" },
  ];

  const patients = [
    { name: "Rahul Kumar", age: 32, condition: "Diabetes" },
    { name: "Anita Singh", age: 28, condition: "Migraine" },
  ];

  const reports = [
    { title: "Daily Login Report", status: "Generated" },
    { title: "Doctor Activity Log", status: "Updated" },
  ];

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <h1>🛠️ Admin Dashboard</h1>
        <p>Secure control panel for managing healthcare operations</p>
      </header>

      {/* Action Buttons */}
      <section className="admin-actions">
        <button
          className="admin-btn"
          onClick={() => setActiveSection("doctors")}
        >
          👨‍⚕️ View Doctors
        </button>

        <button
          className="admin-btn"
          onClick={() => setActiveSection("addDoctor")}
        >
          ➕ Add New Doctor
        </button>

        <button
          className="admin-btn"
          onClick={() => setActiveSection("patients")}
        >
          👥 View Patients (Limited)
        </button>

        <button
          className="admin-btn"
          onClick={() => setActiveSection("reports")}
        >
          📊 System Reports
        </button>
      </section>

      {/* Dynamic Content */}
      <section className="admin-data">
        {activeSection === "doctors" && (
          <>
            <h2>👨‍⚕️ Doctors List</h2>
            {doctors.map((doc, index) => (
              <div key={index} className="data-card">
                <p><strong>Name:</strong> {doc.name}</p>
                <p><strong>Department:</strong> {doc.dept}</p>
                <p><strong>Availability:</strong> {doc.available}</p>
              </div>
            ))}
          </>
        )}

        {activeSection === "addDoctor" && (
          <>
            <h2>➕ Add New Doctor</h2>
            <div className="data-card">
              <p>This is where the doctor registration form will go.</p>
              <p>(You can connect this to backend later)</p>
            </div>
          </>
        )}

        {activeSection === "patients" && (
          <>
            <h2>👥 Patient Records</h2>
            {patients.map((pat, index) => (
              <div key={index} className="data-card">
                <p><strong>Name:</strong> {pat.name}</p>
                <p><strong>Age:</strong> {pat.age}</p>
                <p><strong>Condition:</strong> {pat.condition}</p>
              </div>
            ))}
          </>
        )}

        {activeSection === "reports" && (
          <>
            <h2>📊 System Reports</h2>
            {reports.map((rep, index) => (
              <div key={index} className="data-card">
                <p><strong>Report:</strong> {rep.title}</p>
                <p><strong>Status:</strong> {rep.status}</p>
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
}
