export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} MedTrack. All rights reserved.
      </div>
    </footer>
  );
}
