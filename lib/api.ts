import axios from "axios";

// Create an Axios client configured for http://localhost:8080/api.
// Include JSON headers and export the instance.
export const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Login function
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
}

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    "/auth/login",
    credentials
  );
  return response.data;
};

// Habit interfaces and functions
export interface Habit {
  id: number;
  name: string;
  description?: string;
}

// Get all habits for the current user
export const getHabits = async (): Promise<Habit[]> => {
  const response = await apiClient.get<Habit[]>("/habits");
  return response.data;
};
