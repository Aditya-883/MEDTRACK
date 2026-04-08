export default function AccessDenied({ role = "user" }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          Unauthorized Access
        </h2>
        <p className="text-gray-600 mb-4">
          Please switch to a {role} wallet
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Reload
        </button>
      </div>
    </div>
  );
}