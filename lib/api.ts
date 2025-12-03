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

// Create habit request interface
export interface CreateHabitRequest {
  name: string;
  description?: string;
}

// Create a new habit
export const createHabit = async (
  habitData: CreateHabitRequest
): Promise<Habit> => {
  const response = await apiClient.post<Habit>("/habits", habitData);
  return response.data;
};

// Delete a habit
export const deleteHabit = async (habitId: number): Promise<void> => {
  await apiClient.delete(`/habits/${habitId}`);
};

// Mark habit as completed for a specific date
export const markHabitCompleted = async (
  habitId: number,
  date?: string
): Promise<void> => {
  const url = date
    ? `/habits/${habitId}/completions?date=${date}`
    : `/habits/${habitId}/completions`;
  await apiClient.post(url);
};

// Unmark habit completion for a specific date
export const unmarkHabitCompleted = async (
  habitId: number,
  date: string
): Promise<void> => {
  await apiClient.delete(`/habits/${habitId}/completions/${date}`);
};
