"use client";

interface EmptyStateProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
      <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{message}</p>
      <button
        onClick={onAction}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200"
      >
        {actionLabel}
      </button>
    </div>
  );
}

