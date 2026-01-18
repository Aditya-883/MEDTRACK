export const metadata = {
  title: "Doctor Dashboard | MedTrack",
};

export default function DoctorPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Doctor Dashboard</h1>

      <p className="text-gray-700 max-w-2xl">
        Request access to patient records, view authorized data, and maintain
        audit-compliant medical workflows.
      </p>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">
          Patient access requests and approved records will appear here.
        </p>
      </div>
    </section>
  );
}
