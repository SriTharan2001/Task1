import { useState } from "react";

// Define possible roles as a union type
type Role = "Viewer" | "Admin" | "Editor";

// Define form data interface
export interface FormDataType {
  userName: string;
  email: string;
  password: string;
  role: Role;
}

// Define expected API response structure
interface ApiResponse {
  message?: string;
  error?: string;
}

// Get backend base URL from .env with fallback
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const useUserRegisterForm = () => {
  const [formData, setFormData] = useState<FormDataType>({
    userName: "",
    email: "",
    password: "",
    role: "Viewer",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle input changes with precise typing
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Ensure role is a valid Role type
    if (name === "role") {
      if (["Viewer", "Admin", "Editor"].includes(value)) {
        setFormData((prev) => ({ ...prev, [name]: value as Role }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!BASE_URL) {
        throw new Error("API base URL is not defined.");
      }

      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await res.json();

      if (res.ok) {
setSuccessMessage(data.message || "Registered successfully!");
        setErrorMessage("");
        // Reset form after success message is cleared
        setTimeout(() => {
          setFormData({ userName: "", email: "", password: "", role: "Viewer" });
          setSuccessMessage("");
        }, 3000);
      } else {
        setSuccessMessage("");
        setErrorMessage(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("API Error:", err);
      setSuccessMessage("");
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to connect to server."
      );
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    successMessage,
    errorMessage,
  };
};

export default useUserRegisterForm;