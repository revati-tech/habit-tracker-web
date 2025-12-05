"use client";

import { useState } from "react";
import type { Habit } from "@/lib/api";
import { getStreakColor } from "@/lib/streakUtils";
import { CompletionCalendar } from "./CompletionCalendar";

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggleTodayCompletion: (habitId: number) => void;
  onDelete: (habitId: number) => void;
  onRefreshAll: () => void;
}

export function HabitCard({
  habit,
  isCompleted,
  onToggleTodayCompletion,
  onDelete,
  onRefreshAll,
}: HabitCardProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleCalendarClose = () => {
    setIsCalendarOpen(false);
    // Refresh today's completions and habits (to get updated streaks from backend)
    // after user makes changes in the calendar
    onRefreshAll();
  };

  return (
    <>
      <div
        id={`habit-${habit.id}`}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow transition-all duration-300"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {habit.name}
              </h3>
              {habit.currentStreak !== undefined && habit.currentStreak > 0 && (
                <div
                  className={`text-sm font-semibold ${getStreakColor(
                    habit.currentStreak
                  )}`}
                  title={`Current streak: ${habit.currentStreak} days`}
                >
                  🔥 {habit.currentStreak}
                </div>
              )}
            </div>
            {habit.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {habit.description}
              </p>
            )}
            {habit.longestStreak !== undefined && habit.longestStreak > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Best streak: {habit.longestStreak} days
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition duration-200 flex items-center gap-2"
                title="View calendar and edit past dates"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>View Calendar</span>
              </button>
              <button
                onClick={() => onToggleTodayCompletion(habit.id)}
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

      {/* 
        CompletionCalendar Modal:
        - Always rendered in DOM but conditionally visible based on isOpen prop
        - When user clicks "View Calendar" button, isCalendarOpen becomes true → calendar appears
        - When user closes calendar, handleCalendarClose runs → isCalendarOpen becomes false → calendar hides
        - When calendar closes, onRefreshAll() refreshes completions and habits (to get updated streaks from backend)
      */}
      <CompletionCalendar
        habit={habit}
        isOpen={isCalendarOpen}
        onClose={handleCalendarClose}
      />
    </>
  );
}

