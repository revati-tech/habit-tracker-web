import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { markHabitCompleted, unmarkHabitCompleted, getCompletions } from "@/lib/api";

interface UseHabitCompletionReturn {
  completedHabits: Set<number>;
  toggleCompletion: (habitId: number) => Promise<void>;
  removeFromCompleted: (habitId: number) => void;
}

export function useHabitCompletion(): UseHabitCompletionReturn {
  const [completedHabits, setCompletedHabits] = useState<Set<number>>(new Set());
  const router = useRouter();

  // Get local date in YYYY-MM-DD format (not UTC)
  const getTodayDate = () => new Date().toLocaleDateString('en-CA');

  // Load today's completions on mount
  useEffect(() => {
    const loadCompletions = async () => {
      try {
        const today = getTodayDate();
        const completions = await getCompletions(today);
        // Extract unique habit IDs that are completed today
        const completedIds = new Set(completions.map((c) => c.habitId));
        setCompletedHabits(completedIds);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        }
        // Silently fail if completions can't be loaded - state stays empty
      }
    };

    loadCompletions();
  }, [router]);

  const toggleCompletion = useCallback(
    async (habitId: number) => {
      const isCurrentlyCompleted = completedHabits.has(habitId);
      const today = getTodayDate();

      try {
        if (isCurrentlyCompleted) {
          await unmarkHabitCompleted(habitId, today);
        } else {
          await markHabitCompleted(habitId);
        }

        // Update state only after API succeeds
        setCompletedHabits((prev) => {
          const newSet = new Set(prev);
          isCurrentlyCompleted ? newSet.delete(habitId) : newSet.add(habitId);
          return newSet;
        });
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          alert(err.response?.data?.message || "Failed to update habit completion. Please try again.");
        }
      }
    },
    [completedHabits, router]
  );

  const removeFromCompleted = useCallback((habitId: number) => {
    setCompletedHabits((prev) => {
      const newSet = new Set(prev);
      newSet.delete(habitId);
      return newSet;
    });
  }, []);

  return {
    completedHabits,
    toggleCompletion,
    removeFromCompleted,
  };
}

