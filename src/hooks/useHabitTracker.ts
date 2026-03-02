import { useCallback, useEffect, useState } from 'react'
import type {
  AppState,
  DayOfWeek,
  Habit,
  HabitCategory,
  HabitFrequency,
  HabitStats,
} from '../types'

export interface HabitTrackerOperations {
  state: AppState;
  addHabit: (input: {
    name: string;
    category: HabitCategory;
    targetFrequency: HabitFrequency;
    customDays?: DayOfWeek[];
    streakFreezeDays?: number;
  }) => void;
  archiveHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  toggleCompletionForDate: (habitId: string, date: string) => void;
  setCompletionForDate: (habitId: string, date: string, completed: boolean) => void;
  resetAll: () => void;
}

const STORAGE_KEY = 'habit-tracker-state-v1'

function loadFromStorage(): AppState {
  if (typeof window === 'undefined') return createEmptyState()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyState()
    const parsed = JSON.parse(raw) as Partial<AppState>

    if (!parsed || !Array.isArray(parsed.habits) || !Array.isArray(parsed.completions)) {
      return createEmptyState()
    }

    return {
      habits: parsed.habits ?? [],
      completions: parsed.completions ?? [],
      habitStats: recalculateStats({
        habits: parsed.habits ?? [],
        completions: parsed.completions ?? [],
        habitStats: [],
      }),
    }
  } catch {
    return createEmptyState()
  }
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

export function useHabitTracker(initialState?: AppState): HabitTrackerOperations {
  const [state, setState] = useState<AppState>(() =>
    initialState ? { ...initialState, habitStats: recalculateStats(initialState) } : loadFromStorage(),
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof fetch !== 'function') return

    let cancelled = false

    const loadFromServer = async () => {
      try {
        const response = await fetch('/api/state')
        if (!response.ok) return
        const data = (await response.json()) as Partial<AppState>
        if (cancelled || !data || !Array.isArray(data.habits) || !Array.isArray(data.completions)) {
          return
        }

        setState({
          habits: data.habits,
          completions: data.completions,
          habitStats: recalculateStats({
            habits: data.habits,
            completions: data.completions,
            habitStats: [],
          }),
        })
      } catch {
        // ignore server errors in the hook, keep local state
      }
    }

    void loadFromServer()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        habits: state.habits,
        completions: state.completions,
      }),
    )
    if (typeof fetch !== 'function') return

    const saveToServer = async () => {
      try {
        await fetch('/api/state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            habits: state.habits,
            completions: state.completions,
          }),
        })
      } catch {
        // ignore network errors, localStorage still keeps a copy
      }
    }

    void saveToServer()
  }, [state.habits, state.completions])

  const addHabit: HabitTrackerOperations['addHabit'] = useCallback((input) => {
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

    setState((prev) => {
      const nextHabits = [...prev.habits, newHabit]
      return {
        ...prev,
        habits: nextHabits,
        habitStats: recalculateStats({ ...prev, habits: nextHabits }),
      }
    })
  }, [])

  const archiveHabit: HabitTrackerOperations['archiveHabit'] = useCallback((habitId) => {
    setState((prev) => {
      const nextHabits = prev.habits.map((habit) =>
        habit.id === habitId ? { ...habit, archived: true } : habit,
      )
      return {
        ...prev,
        habits: nextHabits,
        habitStats: recalculateStats({ ...prev, habits: nextHabits }),
      }
    })
  }, [])

  const deleteHabit: HabitTrackerOperations['deleteHabit'] = useCallback((habitId) => {
    setState((prev) => {
      const nextHabits = prev.habits.filter((habit) => habit.id !== habitId)
      const nextCompletions = prev.completions.filter(
        (completion) => completion.habitId !== habitId,
      )
      const draft: AppState = {
        ...prev,
        habits: nextHabits,
        completions: nextCompletions,
      }
      return {
        ...draft,
        habitStats: recalculateStats(draft),
      }
    })
  }, [])

  const setCompletionForDate: HabitTrackerOperations['setCompletionForDate'] = useCallback(
    (habitId, date, completed) => {
      setState((prev) => {
        const habitExists = prev.habits.some((habit) => habit.id === habitId)
        if (!habitExists) {
          return prev
        }

        const existingIndex = prev.completions.findIndex(
          (entry) => entry.habitId === habitId && entry.date === date,
        )

        let nextCompletions = [...prev.completions]

        if (existingIndex === -1) {
          nextCompletions = [
            ...nextCompletions,
            {
              id: generateId(),
              habitId,
              date,
              completed,
            },
          ]
        } else {
          const existing = nextCompletions[existingIndex]
          nextCompletions[existingIndex] = { ...existing, completed }
        }

        const draft: AppState = {
          ...prev,
          completions: nextCompletions,
        }

        return {
          ...draft,
          habitStats: recalculateStats(draft),
        }
      })
    },
    [],
  )

  const toggleCompletionForDate: HabitTrackerOperations['toggleCompletionForDate'] =
    useCallback(
      (habitId, date) => {
        setState((prev) => {
          const habitExists = prev.habits.some((habit) => habit.id === habitId)
          if (!habitExists) {
            return prev
          }

          const existingIndex = prev.completions.findIndex(
            (entry) => entry.habitId === habitId && entry.date === date,
          )

          let nextCompletions = [...prev.completions]

          if (existingIndex === -1) {
            nextCompletions = [
              ...nextCompletions,
              {
                id: generateId(),
                habitId,
                date,
                completed: true,
              },
            ]
          } else {
            const existing = nextCompletions[existingIndex]
            nextCompletions[existingIndex] = {
              ...existing,
              completed: !existing.completed,
            }
          }

          const draft: AppState = {
            ...prev,
            completions: nextCompletions,
          }

          return {
            ...draft,
            habitStats: recalculateStats(draft),
          }
        })
      },
      [],
    )

  const resetAll: HabitTrackerOperations['resetAll'] = useCallback(() => {
    setState(createEmptyState())
  }, [])

  return {
    state,
    addHabit,
    archiveHabit,
    deleteHabit,
    toggleCompletionForDate,
    setCompletionForDate,
    resetAll,
  }
}

