export default function Footer() {
  return (
    <footer className="w-full text-center py-4 bg-blue-500 dark:bg-blue-800 text-white border-t">
      © {new Date().getFullYear()} MedTrack
    </footer>
  );
}