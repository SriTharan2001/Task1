import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../Hooks/useLogin";
import image from "../assets/expence.png";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!role.trim()) return setLoginError("Role is required.");
    if (!email.trim()) return setLoginError("Email is required.");
    // Basic email format validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return setLoginError("Email is invalid.");
    }
    if (!password.trim()) return setLoginError("Password is required.");

    setLoginError("");
    setLoading(true);

    try {
      const response = await login(email, password, role);
      if (!response || !response.token || !response.userId) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("userId", response.userId);
      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError("Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Image Section */}
      <div
        style={{ backgroundColor: "#14213D" }}
        className="hidden md:block w-1/2 relative"
      >
        <img
          src={image}
          alt="Login Visual"
          className="object-cover pr-15 w-full h-full"
        />
      </div>

      {/* Right Form Section */}
      <div
        style={{ backgroundColor: "#14213D" }}
        className="w-full md:w-1/2 flex justify-center items-center px-4"
      >
        <div className="w-full max-w-md">
          {/* Error Popup */}
          {loginError && (
            <div className="fixed top-5 right-5 z-50">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg flex items-start justify-between gap-2 max-w-xs">
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

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            style={{ backgroundColor: "#262525" }}
            className=" text-gray-100 p-6 md:p-10 rounded-2xl shadow-2xl flex flex-col gap-6 animate-fade-in"
          >
            <h2 className="text-3xl font-poppin text-center text-gray-100 mb-4 tracking-wide">
              Welcome Back 👋
            </h2>

            {/* Role (Custom Dropdown) */}
            <div className="relative" ref={dropdownRef}>
              <label
                htmlFor="role-select"
                className="block mb-1 text-sm font-semibold text-gray-100"
              >
                Select Role
              </label>
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white text-left text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition relative"
              >
                {role || "-- Select Role --"}
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ▼
                </span>
              </button>
              {showDropdown && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-auto">
                  {["Admin", "Viewer", "Manager"].map((item) => (
                    <li
                      key={item}
                      onClick={() => {
                        setRole(item);
                        setShowDropdown(false);
                      }}
                      className={`px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 cursor-pointer ${
                        role === item ? "bg-yellow-50 font-semibold" : ""
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-semibold text-gray-100"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-[30px] px-2 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-semibold text-gray-100"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-[30px] pr-10 px-2 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-gray-500"
                  aria-label="Show or hide password"
                >
                  {showPassword ? "🙈" : "👀"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-semibold transition-all duration-300 shadow-md ${
                loading
                  ? "bg-yellow-300 cursor-not-allowed opacity-50"
                  : "bg-yellow-600 hover:bg-yellow-500 hover:scale-105"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
