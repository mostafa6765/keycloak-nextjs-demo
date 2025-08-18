// api/axiosClient.ts
import axios from "axios";
import { useKeycloakAuth } from "@/providers/KeycloakProvider";

// Factory function that returns a pre-configured Axios instance
export function useAxios() {
  const { token, refreshToken } = useKeycloakAuth();

  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // e.g. "http://localhost:8000/api"
    timeout: 10000,
  });

  // Attach token before each request
  axiosInstance.interceptors.request.use(
    async (config: any) => {
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  // Handle 401 errors -> try token refresh
  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      if (error.response?.status === 401) {
        try {
          await refreshToken(); // refresh token if expired
          if (token) {
            error.config.headers["Authorization"] = `Bearer ${token}`;
            return axios(error.config); // retry request
          }
        } catch (refreshError) {
          console.error("Token refresh failed, redirecting to login");
        }
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
}
