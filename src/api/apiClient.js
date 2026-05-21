import axios from "axios";
import { useAuthStore } from "../store/authStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/voice-ai",
  withCredentials: true, // Required for HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;

    const isFormData = config.data instanceof FormData;

    if (isFormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    } else if (config.headers) {
      config.headers['Content-Type'] = 'application/json';
    }

    // If we have a token in JS (e.g. from a previous version or if the API also sends it in body), send it.
    // Otherwise, browser cookies will handle it if withCredentials is true.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Auto logout if 401 response returned from API
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
