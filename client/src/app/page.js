export default function HomePage() {
  return (
    <section className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Secure Healthcare Records, <br />
            <span className="text-blue-600">Powered by Blockchain</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            MedTrack is a patient-owned Electronic Health Record platform that
            ensures privacy, transparency, and secure access using blockchain
            technology.
          </p>

          <div className="mt-8 flex gap-4">
            <a
              href="/patient"
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Patient Portal
            </a>
            <a
              href="/doctor"
              className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              Doctor Portal
            </a>
          </div>
        </div>

        {/* Right Visual */}
        <div className="hidden md:block">
          <div className="bg-white rounded-2xl shadow-xl p-10 border">
            <h3 className="text-xl font-semibold text-gray-900">
              Why MedTrack?
            </h3>
            <ul className="mt-4 space-y-3 text-gray-600">
              <li>✔ Patient-controlled access</li>
              <li>✔ Tamper-proof medical records</li>
              <li>✔ Secure doctor-patient sharing</li>
              <li>✔ Built for real-world hospitals</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
