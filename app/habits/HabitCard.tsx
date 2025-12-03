"use client";

import type { Habit } from "@/lib/api";

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggleCompletion: (habitId: number) => void;
  onDelete: (habitId: number) => void;
}

export function HabitCard({
  habit,
  isCompleted,
  onToggleCompletion,
  onDelete,
}: HabitCardProps) {
  return (
    <div
      id={`habit-${habit.id}`}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {habit.description}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onToggleCompletion(habit.id)}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                isCompleted
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {isCompleted ? "✓ Completed Today" : "Mark as Complete"}
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

