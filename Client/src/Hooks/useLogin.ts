import { setStoreValue } from "pulsy";
import axios from "axios";
import { AUTH_STORE_NAME } from "../Store/useStoreValue";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const browser = navigator.userAgent;

export const login = async (
  email: string,
  password: string,
  role: string
): Promise<{ token: string; userId: string }> => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
      role,
      browser,
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

    // ✅ Store token & userId in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user.userId);

    // ✅ Set authenticated user in store
    setStoreValue(AUTH_STORE_NAME, {
      user: {
        userName: data.user.userName,
        email: data.user.email,
        role: data.user.role,
        _id: data.user.userId,
        picture: data.user.picture,
      },
    });

    // ✅ Return for client-side navigation
    return {
      token: data.token,
      userId: data.user.userId,
    };
  } catch (err) {
    if (typeof err === "object" && err !== null && "response" in err) {
      const res = (err as { response?: { data?: { message?: string } } }).response;
      const message = res?.data?.message || "Login failed";
      throw new Error(message);
    }
    throw new Error("Login failed");
  }
};
