import { setStoreValue } from 'pulsy';
import axios from 'axios';
import { BASE_URL } from '../config';
import type { LoginResponse } from '../Types/ApiResponse';

const BASE_URL_AUTH = `${BASE_URL}/api/auth`;

export const login = async (email: string, password: string) => {
  try {
    const response: { data: LoginResponse } = await axios.post(`${BASE_URL_AUTH}/users`, { email, password });
console.log("Login API Response:", response.data);
    if (response.data.message === 'success') {
      window.location.href = '/dashboard'; // Redirect to dashboard
      return true;
    } else {
      console.error('Login failed', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('Login failed', error);
    return false;
  }
};

export const logout = () => {
  setStoreValue('auth', { user: null, token: null });
  localStorage.removeItem('pulsy_auth');
};
