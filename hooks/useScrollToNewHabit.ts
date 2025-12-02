import { useEffect } from "react";

interface UseScrollToNewHabitParams {
  newlyCreatedHabitId: number | null;
  habits: unknown[];
  onScrollComplete?: () => void;
}

export function useScrollToNewHabit({
  newlyCreatedHabitId,
  habits,
  onScrollComplete,
}: UseScrollToNewHabitParams) {
  useEffect(() => {
    if (newlyCreatedHabitId === null || habits.length === 0) return;

    setTimeout(() => {
      const habitElement = document.getElementById(`habit-${newlyCreatedHabitId}`);
      if (habitElement) {
        habitElement.scrollIntoView({ behavior: "smooth", block: "center" });
        habitElement.classList.add("ring-4", "ring-indigo-400");
        setTimeout(() => {
          habitElement.classList.remove("ring-4", "ring-indigo-400");
        }, 2000);
      }
      onScrollComplete?.();
    }, 100);
  }, [newlyCreatedHabitId, habits, onScrollComplete]);
}
