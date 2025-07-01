import React, { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setLoginError("Email and password are required.");
      return;
    }

    setLoginError("");
    setLoading(true);

    try {
      const success = await login(email, password, role);
      if (success) {
        navigate("/dashboard");
        return;
      } else {
        setLoginError("Invalid email or password.");
      }
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#073BA4FF", // Tailwind's gray-100
        padding: "16px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#ffffff",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            textAlign: "center",
            color: "#1f2937", // Tailwind's gray-800
          }}
        >
          Login
        </h2>

        {loginError && (
          <div
            style={{
              color: "#dc2626", // Tailwind's red-600
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {loginError}
          </div>
        )}

        <div>
          <label
            htmlFor="role-select"
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151", // Tailwind's gray-700
            }}
          >
            Select Role
          </label>
          <select
            id="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #d1d5db", // Tailwind's gray-300
              borderRadius: "4px",
              fontSize: "16px",
              color: "#1f2937",
              backgroundColor: "#ffffff",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")} // Tailwind's blue-500
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            <option value="Viewer">Viewer</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "16px",
              color: "#1f2937",
              backgroundColor: "#ffffff",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            placeholder="Enter your email"
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "90%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "16px",
                color: "#1f2937",
                backgroundColor: "#ffffff",
                outline: "none",
                transition: "border-color 0.2s",
                paddingRight: "40px", // Space for the toggle icon
              }}
              placeholder="Enter your password"
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "#6b7280", // Tailwind's gray-500
              }}
              aria-label="Show/Hide Password"
            >
              {showPassword ? "\uD83D\uDE48" : "\uD83D\uDC40"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#93c5fd" : "#3b82f6", // Tailwind's blue-300 for disabled, blue-500 for normal
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "500",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s, transform 0.2s",
            opacity: loading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#1d4ed8"; // Tailwind's blue-700
            if (!loading) e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#3b82f6";
            if (!loading) e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
