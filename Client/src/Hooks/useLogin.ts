import { setStoreValue } from "pulsy";
import axios from "axios";
import { AUTH_STORE_NAME } from "../Store/useStoreValue";

const BASE_URL = "http://localhost:5000/api/auth";

export const login = async (
  email: string,
  password: string,
  role: string
): Promise<boolean> => {
  const response = await axios.post(`${BASE_URL}/login`, {
    email,
    password,
    role,
  });

  const data = response.data as {
    success: boolean;
    user?: {
      userName: string;
      email: string;
      role: string;
      userId: string;
      picture?: string;
    };
    token?: string;
    message?: string;
  };

  if (!data.success || !data.user || !data.token) {
    throw new Error(data.message || "Login failed");
  }

  localStorage.setItem("token", data.token);

  const { userName, email: userEmail, role: userRole, userId, picture } = data.user;

  setStoreValue(AUTH_STORE_NAME, {
    user: {
      userName,
      email: userEmail,
      role: userRole,
      _id: userId,
      picture,
    },
  });

  return true;
};
