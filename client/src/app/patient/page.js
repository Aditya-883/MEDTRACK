"use client";

import { RequireAuth } from "../../auth/requireAuth";
import { ROLES } from "../../auth/roles";

export default function PatientPage() {
  return (
    <RequireAuth role={ROLES.PATIENT}>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">Patient Dashboard</h1>

        <p className="text-gray-700 max-w-2xl">
          Manage your medical records, control doctor access, and securely
          share data.
        </p>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">
            Patient medical records and permissions will appear here.
          </p>
        </div>
      </section>
    </RequireAuth>
  );
}
