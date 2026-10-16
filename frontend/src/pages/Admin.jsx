
import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-8 shadow-sm">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-blue-600 hover:underline"
        >
          &larr; Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="mt-3 text-slate-600">
          This page is reserved for administrators.
        </p>

        <div className="mt-6 rounded-lg border border-slate-200 p-5">
          <h2 className="font-semibold">Ticket Management</h2>
          <p className="mt-2 text-sm text-slate-500">
            Admin ticket controls and dashboard statistics will be
            added in a later phase.
          </p>
        </div>
      </div>
    </main>
  );
}

export default Admin;
