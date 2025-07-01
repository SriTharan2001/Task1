import { createStore, setStoreValue } from 'pulsy';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/auth';

interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    userName: string;
    email: string;
    role: string;
    objectId: string;
    password?: string;
  };
}

export type { LoginResponse };

createStore(
  'auth',
  {
    user: null,
  },
  { persist: true }
);

export const login = async (email: string, password: string, role: string): Promise<boolean> => {
  try {
    // API call
    const response = await axios.post<LoginResponse>(`${BASE_URL}/login`, {
      email,
      password,
      role,
    });

    console.log("Login API Response:", response);

    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }

    if (!data.user) {
      throw new Error("User data not returned from server.");
    }

    const {
      userName,
      email: userEmail,
      role: userRole,
      objectId: _id,
    } = data.user;

    setStoreValue('auth', {
      user: { userName, email: userEmail, role: userRole, _id },
    });

    return true;
  } catch (error) {
    let message = "Login failed";

    // try-catch inside catch to safely extract message
    try {
 interface AxiosErrorWithResponse {
    response?: {
      data?: {
        message?: string;
        [key: string]: unknown;
      };
    };
    message?: string;
    [key: string]: unknown;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as AxiosErrorWithResponse).response === "object"
  ) {
    const responseData = (error as AxiosErrorWithResponse).response?.data;
    if (responseData && typeof responseData === "object" && "message" in responseData) {
      message = String(responseData.message);
    } else if ("message" in error) {
      message = String((error as { message?: string }).message);
    }
  } else if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: string }).message === "string"
  ) {
    message = (error as { message?: string }).message ?? "Login failed";
  }
    } catch {
      message = "Unknown error occurred";
    }

    console.error("Login error:", message, error);
    throw new Error(message);
  }
};
