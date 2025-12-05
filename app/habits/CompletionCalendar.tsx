"use client";

import { useState, useEffect, useCallback } from "react";
import { HabitCompletion, getHabitCompletions, markHabitCompleted, unmarkHabitCompleted, getHabit, type Habit } from "@/lib/api";
import { getDaysInMonth, formatDate, isDateCompleted, isToday, isFutureDate, MONTH_NAMES, DAY_NAMES, getAdjacentMonth } from "@/lib/calendarUtils";
import { getErrorMessage } from "@/lib/errorHandler";

interface CompletionCalendarProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
}

export function CompletionCalendar({
  habit,
  isOpen,
  onClose,
}: CompletionCalendarProps) {
  const habitId = habit.id;
  const habitName = habit.name;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  // Local state for streaks - updated after toggles, synced with props when they change
  const [currentStreak, setCurrentStreak] = useState(habit.currentStreak);
  const [longestStreak, setLongestStreak] = useState(habit.longestStreak);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHabitCompletions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getHabitCompletions(habitId);
      setCompletions(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load completions"));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [habitId]);

  const loadHabitStreaks = useCallback(async () => {
    try {
      const updatedHabit = await getHabit(habitId);
      setCurrentStreak(updatedHabit.currentStreak);
      setLongestStreak(updatedHabit.longestStreak);
    } catch (err: unknown) {
      // Silently fail - streaks will use initial values
      console.error("Failed to load habit streaks", err);
    }
  }, [habitId]);

  useEffect(() => {
    if (isOpen) {
      loadHabitCompletions();
      // Sync streaks with props when calendar opens (parent may have refreshed)
      setCurrentStreak(habit.currentStreak);
      setLongestStreak(habit.longestStreak);
    }
  }, [isOpen, habit.currentStreak, habit.longestStreak, loadHabitCompletions]);

  const toggleDateCompletion = async (date: string) => {
    const isCompleted = completions.some(
      (c) => c.completionDate === date
    );

    try {
      if (isCompleted) {
        await unmarkHabitCompleted(habitId, date);
      } else {
        await markHabitCompleted(habitId, date);
      }
      // Reload completions and streaks to update the calendar display
      await Promise.all([loadHabitCompletions(), loadHabitStreaks()]);
      // Parent will refresh when calendar closes (via onClose callback)
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to update completion"));
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => getAdjacentMonth(prev, direction));
  };

  if (!isOpen) return null;

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {habitName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Streak Info */}
          {(currentStreak !== undefined || longestStreak !== undefined) && (
            <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Current Streak
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    🔥 {currentStreak || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Best Streak
                  </div>
                  <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    {longestStreak || 0} days
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Calendar */}
          <div className="mb-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                ←
              </button>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {MONTH_NAMES[month]} {year}
              </h3>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {DAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = formatDate(year, month, day);
                const completed = isDateCompleted(date, completions);
                const isTodayDate = isToday(date);
                const isFuture = isFutureDate(date);

                return (
                  <button
                    key={day}
                    onClick={() => !isFuture && toggleDateCompletion(date)}
                    disabled={isFuture || isLoading}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                      completed
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : isTodayDate
                        ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-500"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    } ${
                      isFuture
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500" />
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



