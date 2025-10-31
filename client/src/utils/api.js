import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    // Only refresh token if it's expired or about to expire
    // Force refresh only on first call, then let Firebase handle automatic refresh
    try {
      const token = await user.getIdToken(false); // false = don't force refresh
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error getting token:', error);
    }
  }
  return config;
});

export default api;