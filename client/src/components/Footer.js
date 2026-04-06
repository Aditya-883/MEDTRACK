export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">

      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2">

        <p className="text-sm text-gray-300">
          Built with Blockchain • End-to-End Encryption • Privacy First
        </p>

        <p className="text-xs">
          © {new Date().getFullYear()} MedTrack
        </p>

      </div>

    </footer>
  );
}