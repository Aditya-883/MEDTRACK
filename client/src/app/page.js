import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-xl shadow-md text-center w-[350px]">

        <h1 className="text-3xl font-bold mb-6">🏥 MedTrack</h1>

        <div className="flex flex-col gap-4">

          <Link href="/patient">
            <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
              Patient
            </button>
          </Link>

          <Link href="/doctor">
            <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
              Doctor
            </button>
          </Link>

          <Link href="/admin">
            <button className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600">
              Admin
            </button>
          </Link>

        </div>

      </div>

    </div>
  );
}