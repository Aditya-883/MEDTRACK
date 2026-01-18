export const metadata = {
  title: "Admin | MedTrack",
};

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Admin Console</h1>

      <p className="text-gray-700 max-w-2xl">
        System-level monitoring, role oversight, and compliance tooling.
      </p>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">
          This area is restricted. Wallet-based admin authorization will be enforced.
        </p>
      </div>
    </section>
  );
}
