export const metadata = {
  title: "Patient Dashboard | MedTrack",
};

export default function PatientPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Patient Dashboard</h1>

      <p className="text-gray-700 max-w-2xl">
        Manage your medical records, grant or revoke doctor access, and view your
        health history securely.
      </p>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">
          Encrypted medical records and access controls will appear here.
        </p>
      </div>
    </section>
  );
}
