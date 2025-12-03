import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getHabits, type Habit } from "@/lib/api";

interface UseHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

export function useHabits(): UseHabitsReturn {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const habitsData = await getHabits();
      setHabits(habitsData);
      setError("");
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        setError(err.response?.data?.message || "Failed to load habits");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Auto-fetch on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    habits,
    isLoading,
    error,
    refetch,
  };
}

