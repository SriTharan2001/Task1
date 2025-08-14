// src/api/axiosInstance.ts
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // உங்கள் API base URL
});

// ✅ Interceptor add pannunga
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // 🔁 auto logout & redirect
    }
    return Promise.reject(error);
  }
);

export default instance;
