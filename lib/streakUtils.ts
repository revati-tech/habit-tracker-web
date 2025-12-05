/**
 * Get color class for streak display based on streak length
 * @param streak - The streak number
 * @returns Tailwind CSS color class string
 */
export const getStreakColor = (streak: number): string => {
  if (streak === 0) return "text-gray-500 dark:text-gray-400";
  if (streak < 4) return "text-blue-600 dark:text-blue-400";
  if (streak < 8) return "text-green-600 dark:text-green-400";
  if (streak < 15) return "text-orange-600 dark:text-orange-400";
  return "text-yellow-600 dark:text-yellow-400";
};

