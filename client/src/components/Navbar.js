import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-white shadow">

      <h1 className="font-bold text-lg">MedTrack</h1>

      <div className="flex gap-4 text-sm">
        <Link href="/">Home</Link>
        <Link href="/patient">Patient</Link>
        <Link href="/doctor">Doctor</Link>
        <Link href="/admin">Admin</Link>
      </div>

    </nav>
  );
}