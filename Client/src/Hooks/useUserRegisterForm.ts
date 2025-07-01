import { useState, useCallback } from "react";

// Define possible roles as a union type
type Role = "Viewer" | "Admin" | "Editor";

// Define form data interface
export interface FormDataType {
  userName: string;
  email: string;
  password: string;
  role: Role;
}

export interface UserWithId extends FormDataType {
  id: number;
}

// Define expected API response structures
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
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      userName: "",
      email: "",
      password: "",
      role: "Viewer",
    });
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.userName || !formData.email || !formData.password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccessMessage(data.message || "Registered successfully!");
      setErrorMessage("");
      resetForm();
    } catch (err) {
      console.error("Registration Error:", err);
      setSuccessMessage("");
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to connect to server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = useCallback(async (): Promise<UserWithId[]> => {
    try {
      setIsLoading(true);
      const url = `${BASE_URL}/api/auth/users`;
      console.log("Trying to fetch from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Error response from server:", response.status, text);
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Full fetch error details:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Network error. Check backend & connection."
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addUser = async (userData: FormDataType): Promise<UserWithId> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to add user: ${response.status}`);
      }

      setSuccessMessage("User added successfully!");
      return data as UserWithId;
    } catch (error) {
      console.error("Add User Error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to add user"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (
    userData: FormDataType,
    userId: number
  ): Promise<UserWithId> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}/api/auth/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to update user: ${response.status}`
        );
      }

      setSuccessMessage("User updated successfully!");
      return data as UserWithId;
    } catch (error) {
      console.error("Update User Error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update user"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to delete user: ${response.status}`);
      }

      setSuccessMessage("User deleted successfully!");
    } catch (error) {
      console.error("Delete User Error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete user"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    addUser,
    successMessage,
    errorMessage,
    isLoading,
    resetForm,
    fetchUsers,
    updateUser,
    deleteUser,
  };
};

export default useUserRegisterForm;
