import { setStoreValue } from "pulsy";
import axios from "axios";
import { AUTH_STORE_NAME } from "../Store/useStoreValue.ts";

const BASE_URL = "http://localhost:5000/api/auth";

interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    userName: string;
    email: string;
    role: string;
    objectId: string;
  };
}

export const login = async (
  email: string,
  password: string,
  role: string
): Promise<boolean> => {
  try {
    const response = await axios.post<LoginResponse>(`${BASE_URL}/login`, {
      email,
      password,
      role,
    });

    const data = response.data;

    if (!data.success || !data.user) {
      throw new Error(data.message || "Login failed");
    }

    const { userName, email: userEmail, role: userRole, objectId } = data.user;

    setStoreValue(AUTH_STORE_NAME, {
      user: { userName, email: userEmail, role: userRole, _id: objectId },
    });

    return true;
  } catch (err: unknown) {
    let message = "Login failed";
    if (err instanceof Error) {
      message = err.message;
    }
    console.error(message, err);
    throw new Error(message);
  }
};
