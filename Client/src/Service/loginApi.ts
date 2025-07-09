// src/Hooks/useLogin.ts

import { useState } from "react";

export type LoginResponse = {
  token: string;
  user: {
    objectId: string;
    username: string;
    email?: string;
  };
};

const useLogin = () => {
  const [auth, setAuth] = useState<LoginResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data: LoginResponse = await response.json();
      setAuth(data);
      return data;
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return { auth, login, error };
};

export default useLogin;
