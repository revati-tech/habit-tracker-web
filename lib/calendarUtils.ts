import type { HabitCompletion } from "@/lib/api";
import { getTodayDate } from "@/lib/dateUtils";

/**
 * Get calendar information for a given month
 * @param date - The date to get calendar info for
 * @returns Object with daysInMonth, startingDayOfWeek, year, and month
 */
export const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  return { daysInMonth, startingDayOfWeek, year, month };
};

/**
 * Format a date as YYYY-MM-DD string
 * @param year - The year
 * @param month - The month (0-indexed)
 * @param day - The day
 * @returns Formatted date string
 */
export const formatDate = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

/**
 * Check if a date is completed based on completions list
 * @param date - The date to check (YYYY-MM-DD format)
 * @param completions - Array of habit completions
 * @returns True if the date is completed
 */
export const isDateCompleted = (date: string, completions: HabitCompletion[]): boolean => {
  return completions.some((c) => c.completionDate === date);
};

/**
 * Check if a date is today
 * @param date - The date to check (YYYY-MM-DD format)
 * @returns True if the date is today
 */
export const isToday = (date: string): boolean => {
  return date === new Date().toISOString().split("T")[0];
};

/**
 * Check if a date is in the future (including tomorrow)
 * @param date - The date to check (YYYY-MM-DD format)
 * @returns True if the date is after today (including tomorrow)
 */
export const isFutureDate = (date: string): boolean => {
  const today = getTodayDate(); // Get today in YYYY-MM-DD format
  // Compare strings directly - YYYY-MM-DD format allows lexicographic comparison
  return date > today;
};

/**
 * Month names for display
 */
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Day names for calendar headers
 */
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Get the previous or next month date from a given date
 * @param date - The current date
 * @param direction - "prev" for previous month, "next" for next month
 * @returns New Date object for the previous or next month
 */
export const getAdjacentMonth = (date: Date, direction: "prev" | "next"): Date => {
  const newDate = new Date(date);
  if (direction === "prev") {
    newDate.setMonth(newDate.getMonth() - 1);
  } else {
    newDate.setMonth(newDate.getMonth() + 1);
  }
  return newDate;
};

