"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getHabits, type Habit } from "@/lib/api";
import { useScrollToNewHabit } from "@/hooks/useScrollToNewHabit";
import { CreateHabitForm } from "./CreateHabitForm";
import { HabitCard } from "./HabitCard";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [completedHabits, setCompletedHabits] = useState<Set<number>>(new Set());
  const [newlyCreatedHabitId, setNewlyCreatedHabitId] = useState<number | null>(null);
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchHabits();
  }, [router]);

  // Scroll to newly created habit
  useScrollToNewHabit({
    newlyCreatedHabitId,
    habits,
    onScrollComplete: () => setNewlyCreatedHabitId(null),
  });

  const fetchHabits = async () => {
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
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleHabitCreated = async (newHabit: Habit) => {
    setShowCreateForm(false);
    setNewlyCreatedHabitId(newHabit.id);
    await fetchHabits();
  };

  const handleDeleteHabit = (habitId: number) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      console.log("Delete habit:", habitId);
      // TODO: Implement delete habit API call
    }
  };

  const handleMarkCompletion = (habitId: number) => {
    console.log("Mark completion for habit:", habitId);
    // Toggle completion state for UX
    setCompletedHabits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
    // TODO: Implement mark completion API call
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Habits
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your daily habits and build consistency
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Logout
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Create habit button/form */}
        {!showCreateForm ? (
          <button
            onClick={() => {
              setShowCreateForm(true);
              setError("");
            }}
            className="mb-6 w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            + Add New Habit
          </button>
        ) : (
          <CreateHabitForm
            onSuccess={handleHabitCreated}
            onCancel={() => {
              setShowCreateForm(false);
              setError("");
            }}
          />
        )}

        {/* Habits list */}
        {habits.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              No habits found.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompleted={completedHabits.has(habit.id)}
                onToggleCompletion={handleMarkCompletion}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

