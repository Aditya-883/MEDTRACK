export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Brand */}
        <h2 className="text-sm text-white font-medium">
          MedTrack
        </h2>

        {/* Copyright */}
        <p className="text-xs">
          © {new Date().getFullYear()}
        </p>

      </div>

    </footer>
  );
}