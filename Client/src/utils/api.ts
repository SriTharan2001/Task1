import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // Change if your backend uses a different base
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("🔐 Sending token:", token); // Debug log

  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("⚠️ No token found in localStorage.");
  }

  return config;
  api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

}, (error) => {
  return Promise.reject(error);
});

export default api;
