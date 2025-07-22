import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../Hooks/useLogin";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("Admin");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  // Auto dismiss error after 4 seconds
  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!role.trim()) {
      setLoginError("Role is required.");
      return;
    }
    if (!email.trim()) {
      setLoginError("Email is required.");
      return;
    }
    if (!password.trim()) {
      setLoginError("Password is required.");
      return;
    }

    setLoginError("");
    setLoading(true);

    // Login attempt
    try {
      const success = await login(email, password, role);
      if (success) {
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setLoginError(error.message); // Server error like "Invalid credentials" or "Role mismatch"
      } else {
        setLoginError("Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-900 px-4 relative">
      {/* Floating Error Popup */}
      {loginError && (
        <div className="fixed top-5 right-5 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg flex items-start justify-between gap-2 animate-fade-in max-w-xs">
            <div>
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{loginError}</span>
            </div>
            <button
              onClick={() => setLoginError("")}
              className="text-xl font-bold text-red-700 hover:text-red-900 leading-none"
              aria-label="Close error message"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        {/* Role Selection */}
        <div>
          <label
            htmlFor="role-select"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Select Role
          </label>
          <select
            id="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring focus:border-blue-500 transition"
          >
            <option value="">-- Select Role --</option>
            <option value="Viewer">Viewer</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring focus:border-blue-500 transition"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pr-10 p-2 border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring focus:border-blue-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-lg text-gray-500"
              aria-label="Toggle password visibility"
            >
              {showPassword ? "🙈" : "👀"}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded text-white font-medium transition transform ${
            loading
              ? "bg-blue-300 cursor-not-allowed opacity-50"
              : "bg-blue-500 hover:bg-blue-700 hover:scale-105"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
