"use client";

import { RequireAuth } from "../../auth/requireAuth";
import { ROLES } from "../../auth/roles";

export default function DoctorPage() {
  return (
    <RequireAuth role={ROLES.DOCTOR}>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>

        <p className="text-gray-700 max-w-2xl">
          Request access to patient records and view approved medical data.
        </p>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">
            Authorized patient data and audit logs will appear here.
          </p>
        </div>
      </section>
    </RequireAuth>
  );
}
