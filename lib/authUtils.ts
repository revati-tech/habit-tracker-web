import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Check if user is authenticated (has token in localStorage)
 * @returns True if token exists
 */
export const isAuthenticated = (): boolean => {
  return typeof window !== "undefined" && !!localStorage.getItem("token");
};

/**
 * Logout user by removing token and redirecting to login
 * @param router - Next.js router instance
 */
export const logout = (router: AppRouterInstance): void => {
  localStorage.removeItem("token");
  router.push("/login");
};

/**
 * Get authentication token from localStorage
 * @returns Token string or null
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

