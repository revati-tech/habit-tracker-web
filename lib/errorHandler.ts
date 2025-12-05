import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/**
 * Handle API errors, specifically 401 Unauthorized errors
 * @param err - The error object from the API call
 * @param router - Next.js router instance for navigation
 * @returns true if error was handled (401), false otherwise
 */
export const handleApiError = (
  err: unknown,
  router: AppRouterInstance
): boolean => {
  const apiError = err as ApiError;
  if (apiError?.response?.status === 401) {
    localStorage.removeItem("token");
    router.push("/login");
    return true; // handled
  }
  return false; // not handled
};

/**
 * Extract error message from an API error
 * @param err - The error object from the API call
 * @param defaultMessage - Default message if error message cannot be extracted
 * @returns Error message string
 */
export const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  const apiError = err as ApiError;
  return apiError?.response?.data?.message || apiError?.message || defaultMessage;
};

