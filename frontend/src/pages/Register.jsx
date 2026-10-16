 
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthError } from "../features/auth/authSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await dispatch(
        registerUser({ name, email, password })
      ).unwrap();

      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setMessage(
        typeof err === "string"
          ? err
          : "Registration failed. Please try again."
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold">Create an Account</h1>

        <p className="text-sm text-gray-500">
          Register to access the Support Ticket System.
        </p>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border p-3"
          autoComplete="name"
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border p-3"
          autoComplete="email"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border p-3"
          autoComplete="new-password"
          required
        />

        {message && (
          <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            {message}
          </p>
        )}

        {error && !message && (
          <p className="text-sm text-red-600">
            {typeof error === "string" ? error : "Registration failed."}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            onClick={() => dispatch(clearAuthError())}
            className="font-medium text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
