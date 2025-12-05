"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Habit, deleteHabit } from "@/lib/api";
import { handleApiError, getErrorMessage } from "@/lib/errorHandler";
import { logout } from "@/lib/authUtils";
import { useRequireAuth } from "./useRequireAuth";
import { useScrollToNewHabit } from "./useScrollToNewHabit";
import { useHabitsWithCompletions } from "./useHabitsWithCompletions";
import { CreateHabitForm } from "./CreateHabitForm";
import { HabitCard } from "./HabitCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { ErrorMessage } from "./ErrorMessage";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export default function HabitsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newlyCreatedHabitId, setNewlyCreatedHabitId] = useState<number | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const router = useRouter();

  // Require authentication - redirects to login if not authenticated
  useRequireAuth();

  const {
    habits,
    completedHabits,
    isLoading,
    error,
    toggleTodayCompletion,
    loadAll,
    refetchHabits,
  } = useHabitsWithCompletions();

  // Scroll to newly created habit
  useScrollToNewHabit({
    newlyCreatedHabitId,
    habits,
    onScrollComplete: () => setNewlyCreatedHabitId(null),
  });

  const handleLogout = () => {
    logout(router);
  };

  const handleHabitCreated = async (newHabit: Habit) => {
    setShowCreateForm(false);
    setNewlyCreatedHabitId(newHabit.id);
    await refetchHabits();
  };

  const showDeleteDialog = (habitId: number) => {
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      setHabitToDelete(habit);
    }
  };

  const handleHabitDeletion = async () => {
    if (habitToDelete === null) return;

    const habitId = habitToDelete.id;
    setHabitToDelete(null);

    try {
      await deleteHabit(habitId);
      // Refresh both habits and completions to keep state in sync
      await loadAll();
    } catch (err: unknown) {
      if (handleApiError(err, router)) {
        // Error was handled (401)
        return;
      }
      alert(getErrorMessage(err, "Failed to delete habit. Please try again."));
    }
  };


  if (isLoading) {
    return <LoadingSpinner />;
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
        {error && <ErrorMessage message={error} />}

        {/* Delete confirmation dialog */}
        {habitToDelete && (
          <DeleteConfirmDialog
            habitName={habitToDelete.name}
            onConfirm={handleHabitDeletion}
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
                onToggleTodayCompletion={toggleTodayCompletion}
                onDelete={showDeleteDialog}
                onRefreshAll={loadAll}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

