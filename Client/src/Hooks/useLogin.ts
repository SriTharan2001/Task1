// useLogin.ts
import { useState } from 'react';
import axios from 'axios';

// Define types for the response data
interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<LoginResponse>('/api/login', { username, password });
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);

      return { token, user };
    } catch (err: unknown) {
      // Check if it's an axios error by checking for response property
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } }, message?: string };
        setError(axiosError.response?.data?.message || axiosError.message || 'Login failed');
      } else if (err instanceof Error) {
        setError(err.message || 'Something went wrong');
      } else {
        setError('An unknown error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, loginError: error };
}
