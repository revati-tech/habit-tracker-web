"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Habit, deleteHabit } from "@/lib/api";
import { useScrollToNewHabit } from "./useScrollToNewHabit";
import { useHabits } from "./useHabits";
import { CreateHabitForm } from "./CreateHabitForm";
import { HabitCard } from "./HabitCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { ErrorMessage } from "./ErrorMessage";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export default function HabitsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [completedHabits, setCompletedHabits] = useState<Set<number>>(new Set());
  const [newlyCreatedHabitId, setNewlyCreatedHabitId] = useState<number | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<number | null>(null);
  const router = useRouter();

  const { habits, isLoading, error, refetch } = useHabits();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Scroll to newly created habit
  useScrollToNewHabit({
    newlyCreatedHabitId,
    habits,
    onScrollComplete: () => setNewlyCreatedHabitId(null),
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleHabitCreated = async (newHabit: Habit) => {
    setShowCreateForm(false);
    setNewlyCreatedHabitId(newHabit.id);
    await refetch();
  };

  const handleDeleteHabit = (habitId: number) => {
    setHabitToDelete(habitId);
  };

  const confirmDelete = async () => {
    if (habitToDelete === null) return;

    const habitId = habitToDelete;
    setHabitToDelete(null);

    try {
      await deleteHabit(habitId);
      // Remove from completed set if it was there
      setCompletedHabits((prev) => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
      // Refresh habits list
      await refetch();
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        alert(err.response?.data?.message || "Failed to delete habit. Please try again.");
      }
    }
  };

  const handleMarkCompletion = (habitId: number) => {
    setCompletedHabits((prev) => {
      const newSet = new Set(prev);
      newSet.has(habitId) ? newSet.delete(habitId) : newSet.add(habitId);
      return newSet;
    });
    // TODO: Implement mark completion API call
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const habitToDeleteData = habitToDelete !== null 
    ? habits.find((h) => h.id === habitToDelete)
    : null;

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
        {error && <ErrorMessage message={error} />}

        {/* Delete confirmation dialog */}
        {habitToDeleteData && (
          <DeleteConfirmDialog
            habitName={habitToDeleteData.name}
            onConfirm={confirmDelete}
            onCancel={() => setHabitToDelete(null)}
          />
        )}

        {/* Create habit button/form */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="mb-6 w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            + Add New Habit
          </button>
        ) : (
          <CreateHabitForm
            onSuccess={handleHabitCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Habits list */}
        {habits.length === 0 ? (
          <EmptyState
            message="No habits found."
            actionLabel="Create Your First Habit"
            onAction={() => setShowCreateForm(true)}
          />
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

