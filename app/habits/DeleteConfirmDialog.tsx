"use client";

interface DeleteConfirmDialogProps {
  habitName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ habitName, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <p className="text-gray-900 dark:text-white mb-6">
          Are you sure you want to delete habit <strong>{habitName}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

