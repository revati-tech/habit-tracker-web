"use client";

import { useState } from "react";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      if (response.token) {
        // Save token to localStorage
        localStorage.setItem("token", response.token);
        // Redirect to habits dashboard
        router.push("/habits");
      } else {
        setError("Login failed: No token received");
      }
    } catch (err: any) {
      // Handle different types of errors
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Request timed out. Please check your connection and try again.");
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        const baseURL = err.config?.baseURL || "unknown";
        setError(
          `Network error. Cannot reach backend at ${baseURL}. ` +
          "Please check if the backend server is running and CORS is configured correctly."
        );
      } else if (err.code === "ERR_CORS" || err.message?.includes("CORS")) {
        setError(
          "CORS error: Backend is not allowing requests from this domain. " +
          "Please check backend CORS configuration."
        );
      } else if (err.response) {
        // Server responded with error status
        setError(
          err.response.data?.message || 
          `Login failed: ${err.response.status} ${err.response.statusText || ""}`.trim()
        );
      } else {
        // Other errors (CORS, etc.)
        const errorMsg = err.message || "Login failed. Please check your connection and try again.";
        setError(`${errorMsg} (Code: ${err.code || "unknown"})`);
      }
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            {/* TODO: Implement "Remember Me" functionality */}
            {/* TODO: Implement "Forgot Password" functionality */}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
