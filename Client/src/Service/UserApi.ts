// Define possible roles as a union type
type Role = "Viewer" | "Admin" | "Manager";

// Define form data interface
export interface FormDataType {
  userName: string;
  email: string;
  password: string;
  role: Role;
}

// Define expected API response structure
// interface ApiResponse {
//   message?: string;
//   error?: string;
// }

// Get backend base URL from .env with fallback
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const fetchUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/users`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch users");
    }
    const data = await response.json();
    return data;
  } catch (error:any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Error fetching users:", error);
    throw error;
  }
};

const updateUser = async (userData: FormDataType, userId: number) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

   if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      } catch (jsonError) {
        // If parsing JSON fails, it's likely an HTML error page
        throw new Error("Failed to update user. Server returned an unexpected response.");
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Error updating user:", error);
    throw error;
  }
};

const deleteUser = async (userId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/users/${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete user");
    }

    const data = await response.json();
    return data;
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Error deleting user:", error);
    throw error;
  }
};

const addUser = async (userData: FormDataType) => {
  try {
 const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

   if (!response.ok) {
      // If the response is not ok, parse the JSON and throw an error
      const errorData = await response.json();
      if (response.status === 400 && errorData.message === "User already exists") {
        throw new Error("Email already registered");
      }
      throw new Error(errorData.message || "Failed to register user");
    }

    const data = await response.json();
    return data.user;
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Error registering user:", error);
    throw error;
  }
};

const useUserRegisterForm = () => {
  return { fetchUsers, updateUser, deleteUser, addUser };
};

export default useUserRegisterForm;
