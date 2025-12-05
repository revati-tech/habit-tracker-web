/**
 * Get today's date in YYYY-MM-DD format (local timezone, not UTC)
 * Uses 'en-CA' locale which formats dates as YYYY-MM-DD
 */
export const getTodayDate = (): string => {
  return new Date().toLocaleDateString("en-CA");
};

