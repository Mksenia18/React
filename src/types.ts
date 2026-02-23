/**
 * Habit Tracker – TypeScript type definitions
 * Core entities, union types for status/category/frequency, and app state.
 */

/** How often a habit should be done */
export type HabitFrequency = 'daily' | 'weekdays' | 'custom';

/** Category for grouping and filtering habits */
export type HabitCategory = 'health' | 'productivity' | 'learning' | 'mindfulness' | 'other';

/** Days of the week for custom frequency (0 = Sunday, 6 = Saturday) */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Single habit entity */
export interface Habit {
  id: string;
  name: string;
  targetFrequency: HabitFrequency;
  /** For custom frequency: which days of the week (e.g. [1,3,5] = Mon, Wed, Fri) */
  customDays?: DayOfWeek[];
  category: HabitCategory;
  /** Number of missed days allowed without breaking streak */
  streakFreezeDays: number;
  archived: boolean;
  createdAt: string; // ISO date string
}

/** Completion record for a habit on a given day */
export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

/** Streak and stats for a habit (derived/computed) */
export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0–100
  totalCompletions: number;
  totalPossible: number;
}

/** App state: collections and values used across the app */
export interface AppState {
  habits: Habit[];
  completions: HabitCompletion[];
  /** Optional cached stats; can be computed from completions + habits */
  habitStats: HabitStats[];
}
