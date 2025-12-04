import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { markHabitCompleted, unmarkHabitCompleted } from "@/lib/api";

interface UseHabitCompletionReturn {
  completedHabits: Set<number>;
  toggleCompletion: (habitId: number) => Promise<void>;
  removeFromCompleted: (habitId: number) => void;
}

export function useHabitCompletion(): UseHabitCompletionReturn {
  const [completedHabits, setCompletedHabits] = useState<Set<number>>(new Set());
  const router = useRouter();

  const toggleCompletion = useCallback(
    async (habitId: number) => {
      const isCurrentlyCompleted = completedHabits.has(habitId);
      // Get local date in YYYY-MM-DD format (not UTC)
      const today = new Date().toLocaleDateString('en-CA'); // Returns YYYY-MM-DD in local timezone

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

