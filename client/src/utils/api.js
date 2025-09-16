import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // your backend
  withCredentials: true
});

api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(true); // refresh if expired
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;