import axios from "axios";

// Get the API base URL from environment variable
const getApiBaseURL = () => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  // Log in production to help debug (this is safe as it's a public env var)
  if (typeof window !== "undefined" && !baseURL.includes("localhost")) {
    console.log("API Base URL:", baseURL);
  }
  return baseURL;
};

// Create an Axios client configured with environment variable for API base URL.
// Include JSON headers and export the instance.
export const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout to prevent hanging requests
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Always log errors for debugging (including production)
    console.error("API Error:", {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
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

// Signup function
export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  token?: string;
}

export const signup = async (
  credentials: SignupRequest
): Promise<SignupResponse> => {
  const response = await apiClient.post<SignupResponse>(
    "/auth/signup",
    credentials
  );
  return response.data;
};

// Habit interfaces and functions
export interface Habit {
  id: number;
  name: string;
  description?: string;
  currentStreak?: number;
  longestStreak?: number;
}

// Get all habits for the current user
export const getHabits = async (): Promise<Habit[]> => {
  const response = await apiClient.get<Habit[]>("/habits");
  return response.data;
};

// Get a single habit by ID
export const getHabit = async (habitId: number): Promise<Habit> => {
  const response = await apiClient.get<Habit>(`/habits/${habitId}`);
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

// Completion interface
export interface HabitCompletion {
  habitId: number;
  habitName: string;
  habitDescription?: string;
  completionDate: string;
}

// Get all completions for a specific date (defaults to today)
export const getCompletions = async (date?: string): Promise<HabitCompletion[]> => {
  const url = date
    ? `/habits/completions?date=${date}`
    : `/habits/completions`;
  const response = await apiClient.get<HabitCompletion[]>(url);
  return response.data;
};

// Get all completions for a specific habit
export const getHabitCompletions = async (habitId: number): Promise<HabitCompletion[]> => {
  const response = await apiClient.get<HabitCompletion[]>(`/habits/${habitId}/completions`);
  return response.data;
};
