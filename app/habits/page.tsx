"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getHabits, createHabit, type Habit } from "@/lib/api";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDescription, setNewHabitDescription] = useState("");
  const [completedHabits, setCompletedHabits] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
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

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newHabitName.trim()) {
      setError("Habit name is required");
      return;
    }

    try {
      setIsCreating(true);
      setError("");
      
      await createHabit({
        name: newHabitName.trim(),
        description: newHabitDescription.trim() || undefined,
      });
      
      // Reset form
      setNewHabitName("");
      setNewHabitDescription("");
      setShowCreateForm(false);
      
      // Refresh habits list
      await fetchHabits();
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        setError(err.response?.data?.message || "Failed to create habit. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
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
          <form
            onSubmit={handleCreateHabit}
            className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Habit
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Habit Name *
              </label>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Exercise, Read, Meditate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={newHabitDescription}
                onChange={(e) => setNewHabitDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Add a description for your habit..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Habit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewHabitName("");
                  setNewHabitDescription("");
                  setError("");
                }}
                disabled={isCreating}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
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
            {habits.map((habit) => {
              const isCompleted = completedHabits.has(habit.id);
              return (
                <div
                  key={habit.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
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
                          onClick={() => handleMarkCompletion(habit.id)}
                          className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                            isCompleted
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {isCompleted ? "✓ Completed Today" : "Mark as Complete"}
                        </button>
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

