import React, { useState, useEffect } from "react";
import "../Css/LogIn.css";
import useLogin from '../Hooks/useLogin';  

const LoginForm: React.FC = () => {
  const [role, setRole] = useState<string>("Viewer");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>(""); // Renamed error to loginError
  const [showModal, setShowModal] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const { login } = useLogin(); // Removed error from destructuring

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      setLoginError("Username and password are required.");
      return;
    }

    setLoginError("");
    setLoading(true);

    try {
      const loginResponse = await login(username, password);
      if (loginResponse && loginResponse.user) {
        setShowPopup(true);
      } else {
        setLoginError("Invalid username or password");
      }
    } catch (submitError: unknown) {
      setLoginError((submitError as Error).message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      const success = await resetPassword(resetEmail);
      if (success) {
        alert("Password reset email sent successfully!");
        setShowModal(false);
        setResetEmail("");
      } else {
        setLoginError("Failed to send password reset email.");
      }
    } catch (resetError: unknown) {
      setLoginError((resetError as Error).message || "Failed to send password reset email.");
    }
  };

  // Auto-close popup after 3 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // Replace this with your actual reset password logic
      // This is a placeholder, you'll need to implement the actual API call here
      console.log('Resetting password for:', email);
      return true; // Replace with actual API response
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  };


  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        {loginError && (
          <div className="error-message">
            {loginError}
          </div>
        )}

        <div>
          <label htmlFor="role-select" className="block mb-1 text-sm font-medium text-gray-700">
            Select Role
          </label>
          <select
            id="role-select"
            value={role}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
            className="input-field"
          >
            <option value="Viewer">Viewer</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            className="input-field"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="input-field pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              aria-label="Show/Hide Password"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.964 9.964 0 014.239-8.073m5.656 2.352A10.05 10.05 0 0112 5c5.523 0 10 4.477 10 10a9.964 9.964 0 01-4.239 8.073M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.964 9.964 0 014.239-8.073m1.77 1.53A9.959 9.959 0 0112 5c5.523 0 10 4.477 10 10a9.96 9.96 0 01-3.536 7.536M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="forgot-password-button"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`submit-button ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 hover:scale-105"}`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {showPopup && (
        <div className="popup-container">
          <div className="popup">
            <h3 className="text-xl font-bold mb-2">Login Successful!</h3>
            <p className="text-sm">Welcome, {role}!</p>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="popup-close"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-container">
          <div className="modal">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
              Reset Password
            </h3>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResetEmail(e.target.value)}
                required
                className="input-field"
              />
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Send Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
