"use client";

import { useState, FormEvent } from "react";
import { createHabit, type Habit } from "@/lib/api";
import { handleApiError, getErrorMessage } from "@/lib/errorHandler";
import { useRouter } from "next/navigation";

interface CreateHabitFormProps {
  onSuccess: (habit: Habit) => void;
  onCancel: () => void;
}

export function CreateHabitForm({ onSuccess, onCancel }: CreateHabitFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Habit name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const newHabit = await createHabit({
        name: trimmedName,
        description: description.trim() || undefined,
      });

      // Reset form and notify parent
      setName("");
      setDescription("");
      onSuccess(newHabit);
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (handleApiError(err, router)) {
        // Error was handled (401), show user-friendly message
        setError("Session expired. Please log in again.");
        return;
      }
      setError(getErrorMessage(err, "Failed to create habit. Please try again."));
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setError("");
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Create New Habit
      </h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Habit Name *
        </label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          placeholder="e.g., Exercise, Read, Meditate"
        />
      </div>

      <div>
        <label htmlFor="habit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description (optional)
        </label>
        <textarea
          id="habit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          placeholder="Add a description for your habit..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Habit"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

