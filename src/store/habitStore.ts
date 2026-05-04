import { create } from 'zustand'
import type {
  AppState,
  DayOfWeek,
  Habit,
  HabitCategory,
  HabitCompletion,
  HabitFrequency,
  HabitStats,
} from '../types'
import {
  addHabitDocument,
  deleteHabitAndCompletions,
  setCompletionForDate,
  subscribeUserCompletions,
  subscribeUserHabits,
  updateHabitDocument,
} from '../services/firebase/habitFirestore'

export interface HabitStoreState extends AppState {
  loading: boolean
  error: string | null
  userId: string | null
  addHabit: (input: {
    name: string
    category: HabitCategory
    targetFrequency: HabitFrequency
    customDays?: DayOfWeek[]
    streakFreezeDays?: number
  }) => void
  toggleCompletionForDate: (habitId: string, date: string) => void
  deleteHabit: (habitId: string) => void
  updateHabit: (habitId: string, input: {
    name: string
    category: HabitCategory
    targetFrequency: HabitFrequency
    customDays?: DayOfWeek[]
    streakFreezeDays?: number
  }) => void
  initFromBackend: () => Promise<void>
  setUser: (userId: string | null) => void
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

let habitUnsub: (() => void) | undefined
let completionUnsub: (() => void) | undefined

let latestHabits: Habit[] = []
let latestCompletions: HabitCompletion[] = []

function clearFirestoreListeners() {
  habitUnsub?.()
  completionUnsub?.()
  habitUnsub = undefined
  completionUnsub = undefined
}

export const useHabitStore = create<HabitStoreState>((set, get) => ({
  ...createEmptyState(),
  loading: false,
  error: null,
  userId: null,

  initFromBackend: async () => {
    // Real-time sync is attached in setUser(); kept for call sites that still invoke it.
    return
  },

  setUser: (userId) => {
    clearFirestoreListeners()
    latestHabits = []
    latestCompletions = []

    if (!userId) {
      set({
        ...createEmptyState(),
        userId: null,
        loading: false,
        error: null,
      })
      return
    }

    set({
      userId,
      habits: [],
      completions: [],
      habitStats: [],
      loading: true,
      error: null,
    })

    const applySnapshot = () => {
      const draft: AppState = {
        habits: latestHabits,
        completions: latestCompletions,
        habitStats: [],
      }
      set({
        ...draft,
        habitStats: recalculateStats(draft),
        loading: false,
      })
    }

    try {
      habitUnsub = subscribeUserHabits(
        userId,
        (habits) => {
          latestHabits = habits
          applySnapshot()
        },
        (message) => {
          set((prev) => ({ ...prev, error: message, loading: false }))
        },
      )

      completionUnsub = subscribeUserCompletions(
        userId,
        (completions) => {
          latestCompletions = completions
          applySnapshot()
        },
        (message) => {
          set((prev) => ({ ...prev, error: message, loading: false }))
        },
      )
    } catch (error) {
      set((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe to habits',
      }))
    }
  },

  addHabit: (input) => {
    const uid = get().userId
    if (!uid) return
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

    void addHabitDocument(uid, newHabit).catch((error) => {
      set((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Failed to save habit',
      }))
    })
  },

  toggleCompletionForDate: (habitId, date) => {
    const uid = get().userId
    if (!uid) return
    const habitExists = get().habits.some((habit) => habit.id === habitId)
    if (!habitExists) return

    const existing = get().completions.find((c) => c.habitId === habitId && c.date === date)
    const nextCompleted = existing ? !existing.completed : true

    void setCompletionForDate(uid, habitId, date, nextCompleted).catch((error) => {
      set((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Failed to save completion',
      }))
    })
  },

  deleteHabit: (habitId) => {
    const uid = get().userId
    if (!uid) return

    void deleteHabitAndCompletions(uid, habitId).catch((error) => {
      set((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Failed to delete habit',
      }))
    })
  },

  updateHabit: (habitId, input) => {
    const uid = get().userId
    if (!uid) return
    const exists = get().habits.some((habit) => habit.id === habitId)
    if (!exists) return

    void updateHabitDocument(uid, habitId, {
      name: input.name,
      category: input.category,
      targetFrequency: input.targetFrequency,
      customDays: input.customDays,
      streakFreezeDays: input.streakFreezeDays,
    }).catch((error) => {
      set((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Failed to update habit',
      }))
    })
  },
}))
