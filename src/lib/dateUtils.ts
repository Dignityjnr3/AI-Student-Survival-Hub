import { format, isValid } from 'date-fns';

/**
 * Safely converts a value to a Date object.
 * Handles strings, numbers, and Firestore Timestamps.
 */
export const toDate = (date: any): Date | null => {
  if (!date) return null;
  
  // Handle Firestore Timestamp
  if (typeof date === 'object' && date.seconds !== undefined) {
    return new Date(date.seconds * 1000);
  }
  
  const d = new Date(date);
  return isValid(d) ? d : null;
};

/**
 * Safely formats a date using date-fns.
 * Returns a fallback string if the date is invalid.
 */
export const safeFormat = (date: any, formatStr: string, fallback: string = 'N/A'): string => {
  const d = toDate(date);
  if (!d) return fallback;
  return format(d, formatStr);
};

/**
 * Safely gets a locale date string.
 */
export const safeLocaleDate = (date: any, fallback: string = 'N/A'): string => {
  const d = toDate(date);
  if (!d) return fallback;
  return d.toLocaleDateString();
};
