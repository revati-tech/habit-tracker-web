import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getHabits,
  getCompletions,
  markHabitCompleted,
  unmarkHabitCompleted,
  type Habit,
} from "@/lib/api";
import { getTodayDate } from "@/lib/dateUtils";
import { handleApiError, getErrorMessage } from "@/lib/errorHandler";

interface UseHabitsWithCompletionsReturn {
  habits: Habit[];
  completedHabits: Set<number>;
  isLoading: boolean;
  error: string | null;
  toggleTodayCompletion: (habitId: number) => Promise<void>;
  loadAll: () => Promise<void>;
  refetchHabits: () => Promise<void>;
}

export function useHabitsWithCompletions(): UseHabitsWithCompletionsReturn {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadCompletions = useCallback(async () => {
    try {
      const today = getTodayDate();
      const completions = await getCompletions(today);
      const completedIds = new Set(completions.map((c) => c.habitId));
      setCompletedHabits(completedIds);
    } catch (err: unknown) {
      if (handleApiError(err, router)) {
        // Error was handled (401), silently fail
        return;
      }
      // Silently fail if completions can't be loaded
    }
  }, [router]);

  const loadHabits = useCallback(async () => {
    try {
      const data = await getHabits();
      setHabits(data);
      setError(null);
    } catch (err: unknown) {
      if (handleApiError(err, router)) {
        // Error was handled (401)
        return;
      }
      setError(getErrorMessage(err, "Failed to load habits"));
    }
  }, [router]);

  // Load both habits and completions
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([loadHabits(), loadCompletions()]);
    setIsLoading(false);
  }, [loadHabits, loadCompletions]);

  // Initial load
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const toggleTodayCompletion = useCallback(
    async (habitId: number) => {
      const today = getTodayDate();
      const isCurrentlyCompleted = completedHabits.has(habitId);

      try {
        if (isCurrentlyCompleted) {
          await unmarkHabitCompleted(habitId, today);
        } else {
          await markHabitCompleted(habitId, today);
        }

        // Reload today's completions to update completedHabits state
        await loadCompletions();

        // Always refresh habits to get updated streaks from backend
        await loadHabits();
      } catch (err: unknown) {
        if (handleApiError(err, router)) {
          // Error was handled (401)
          return;
        }
        alert(getErrorMessage(err, "Failed to update habit completion. Please try again."));
      }
    },
    [completedHabits, loadCompletions, loadHabits, router]
  );

  const refetchHabits = useCallback(async () => {
    await loadHabits();
  }, [loadHabits]);

  return {
    habits,
    completedHabits,
    isLoading,
    error,
    toggleTodayCompletion,
    loadAll,
    refetchHabits,
  };
}

