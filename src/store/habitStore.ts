import { create } from 'zustand'
import { habitApi } from '../services/api'
import type {
  AppState,
  DayOfWeek,
  Habit,
  HabitCategory,
  HabitCompletion,
  HabitFrequency,
  HabitStats,
} from '../types'

export interface HabitStoreState extends AppState {
  loading: boolean;
  error: string | null;
  userId: string | null;
  addHabit: (input: {
    name: string;
    category: HabitCategory;
    targetFrequency: HabitFrequency;
    customDays?: DayOfWeek[];
    streakFreezeDays?: number;
  }) => void;
  toggleCompletionForDate: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;
  initFromBackend: () => Promise<void>;
  setUser: (userId: string | null) => void;
}

function createEmptyState(): AppState {
  return {
    habits: [],
    completions: [],
    habitStats: [],
  }
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function recalculateStats(state: AppState): HabitStats[] {
  const byHabit = new Map<string, { dates: string[]; completedDates: string[] }>()

  for (const completion of state.completions) {
    const current = byHabit.get(completion.habitId) ?? { dates: [], completedDates: [] }
    current.dates.push(completion.date)
    if (completion.completed) {
      current.completedDates.push(completion.date)
    }
    byHabit.set(completion.habitId, current)
  }

  const stats: HabitStats[] = []

  for (const habit of state.habits) {
    const data = byHabit.get(habit.id)
    if (!data) {
      stats.push({
        habitId: habit.id,
        currentStreak: 0,
        longestStreak: 0,
        completionRate: 0,
        totalCompletions: 0,
        totalPossible: 0,
      })
      continue
    }

    const uniqueDates = Array.from(new Set(data.dates)).sort()
    const completedSet = new Set(data.completedDates)

    let currentStreak = 0
    let longestStreak = 0
    let previousDate: Date | null = null

    for (const dateStr of uniqueDates) {
      if (!completedSet.has(dateStr)) {
        currentStreak = 0
        previousDate = null
        continue
      }

      const currentDate = new Date(dateStr)
      if (Number.isNaN(currentDate.getTime())) {
        continue
      }

      if (
        previousDate &&
        currentDate.getTime() - previousDate.getTime() === 24 * 60 * 60 * 1000
      ) {
        currentStreak += 1
      } else {
        currentStreak = 1
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak
      }

      previousDate = currentDate
    }

    const totalCompletions = data.completedDates.length
    const totalPossible = uniqueDates.length
    const completionRate =
      totalPossible === 0 ? 0 : Math.round((totalCompletions / totalPossible) * 100)

    stats.push({
      habitId: habit.id,
      currentStreak,
      longestStreak,
      completionRate,
      totalCompletions,
      totalPossible,
    })
  }

  return stats
}

export const useHabitStore = create<HabitStoreState>((set, get) => ({
  ...createEmptyState(),
  loading: false,
  error: null,
  userId: null,

  initFromBackend: async () => {
    const userId = get().userId
    if (!userId) {
      set((prev) => ({
        ...prev,
        habits: [],
        completions: [],
        habitStats: [],
      }))
      return
    }

    set((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await habitApi.loadState(userId)
      const draft: AppState = {
        habits: data.habits,
        completions: data.completions,
        habitStats: [],
      }
      const habitStats = recalculateStats(draft)
      set({
        ...draft,
        habitStats,
        loading: false,
        error: null,
      })
    } catch (error) {
      set((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load state',
      }))
    }
  },

  setUser: (userId) => {
    set((prev) => ({
      ...prev,
      userId,
      habits: userId ? prev.habits : [],
      completions: userId ? prev.completions : [],
      habitStats: userId ? prev.habitStats : [],
    }))
  },

  addHabit: (input) => {
    const nowIso = new Date().toISOString()
    const newHabit: Habit = {
      id: generateId(),
      name: input.name,
      category: input.category,
      targetFrequency: input.targetFrequency,
      customDays: input.customDays,
      streakFreezeDays: input.streakFreezeDays ?? 0,
      archived: false,
      createdAt: nowIso,
    }

    set((prev) => {
      if (!prev.userId) return prev
      const habits = [...prev.habits, newHabit]
      const draft: AppState = { habits, completions: prev.completions, habitStats: prev.habitStats }

      void habitApi.saveState(prev.userId, {
        habits: draft.habits,
        completions: draft.completions,
      }).catch((error) => {
        set((current) => ({
          ...current,
          error: error instanceof Error ? error.message : 'Failed to save state',
        }))
      })

      return {
        ...draft,
        loading: prev.loading,
        error: prev.error,
        habitStats: recalculateStats(draft),
      }
    })
  },

  toggleCompletionForDate: (habitId, date) => {
    set((prev) => {
      if (!prev.userId) return prev
      const habitExists = prev.habits.some((habit) => habit.id === habitId)
      if (!habitExists) return prev

      const completions: HabitCompletion[] = [...prev.completions]
      const existingIndex = completions.findIndex(
        (entry) => entry.habitId === habitId && entry.date === date,
      )

      if (existingIndex === -1) {
        completions.push({
          id: generateId(),
          habitId,
          date,
          completed: true,
        })
      } else {
        const existing = completions[existingIndex]
        completions[existingIndex] = { ...existing, completed: !existing.completed }
      }

      const draft: AppState = {
        habits: prev.habits,
        completions,
        habitStats: prev.habitStats,
      }

      void habitApi.saveState(prev.userId, {
        habits: draft.habits,
        completions: draft.completions,
      }).catch((error) => {
        set((current) => ({
          ...current,
          error: error instanceof Error ? error.message : 'Failed to save state',
        }))
      })

      return {
        ...draft,
        loading: prev.loading,
        error: prev.error,
        habitStats: recalculateStats(draft),
      }
    })
  },
  deleteHabit: (habitId) => {
    set((prev) => {
      if (!prev.userId) return prev

      const habits = prev.habits.filter((habit) => habit.id !== habitId)
      const completions = prev.completions.filter(
        (completion) => completion.habitId !== habitId,
      )

      const draft: AppState = {
        habits,
        completions,
        habitStats: prev.habitStats,
      }

      void habitApi.saveState(prev.userId, {
        habits: draft.habits,
        completions: draft.completions,
      }).catch((error) => {
        set((current) => ({
          ...current,
          error: error instanceof Error ? error.message : 'Failed to save state',
        }))
      })

      return {
        ...draft,
        loading: prev.loading,
        error: prev.error,
        habitStats: recalculateStats(draft),
      }
    })
  },
}))

