import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { AppState } from '../types'
import { useHabitTracker } from './useHabitTracker'

function createTestState(): AppState {
  return {
    habits: [],
    completions: [],
    habitStats: [],
  }
}

describe('useHabitTracker', () => {
  it('starts with an empty state by default', () => {
    const { result } = renderHook(() => useHabitTracker())

    expect(result.current.state.habits).toHaveLength(0)
    expect(result.current.state.completions).toHaveLength(0)
    expect(result.current.state.habitStats).toHaveLength(0)
  })

  it('can add a new habit with default values', () => {
    const { result } = renderHook(() => useHabitTracker(createTestState()))

    act(() => {
      result.current.addHabit({
        name: 'Drink water',
        category: 'health',
        targetFrequency: 'daily',
      })
    })

    const { habits } = result.current.state
    expect(habits).toHaveLength(1)
    expect(habits[0].name).toBe('Drink water')
    expect(habits[0].category).toBe('health')
    expect(habits[0].targetFrequency).toBe('daily')
    expect(habits[0].archived).toBe(false)
  })

  it('archives a habit immutably', () => {
    const initial: AppState = {
      habits: [
        {
          id: 'h1',
          name: 'Read',
          category: 'learning',
          targetFrequency: 'weekdays',
          customDays: undefined,
          streakFreezeDays: 0,
          archived: false,
          createdAt: new Date().toISOString(),
        },
      ],
      completions: [],
      habitStats: [],
    }

    const { result } = renderHook(() => useHabitTracker(initial))

    act(() => {
      result.current.archiveHabit('h1')
    })

    const { habits } = result.current.state
    expect(habits).toHaveLength(1)
    expect(habits[0].archived).toBe(true)
  })

  it('toggles completion for a given date', () => {
    const initial: AppState = {
      habits: [
        {
          id: 'h1',
          name: 'Walk',
          category: 'health',
          targetFrequency: 'daily',
          customDays: undefined,
          streakFreezeDays: 0,
          archived: false,
          createdAt: new Date().toISOString(),
        },
      ],
      completions: [],
      habitStats: [],
    }

    const { result } = renderHook(() => useHabitTracker(initial))
    const date = '2025-01-01'

    act(() => {
      result.current.toggleCompletionForDate('h1', date)
    })

    expect(result.current.state.completions).toHaveLength(1)
    expect(result.current.state.completions[0].completed).toBe(true)

    act(() => {
      result.current.toggleCompletionForDate('h1', date)
    })

    expect(result.current.state.completions).toHaveLength(1)
    expect(result.current.state.completions[0].completed).toBe(false)
  })

  it('updates stats when completions change', () => {
    const initial: AppState = {
      habits: [
        {
          id: 'h1',
          name: 'Meditate',
          category: 'mindfulness',
          targetFrequency: 'daily',
          customDays: undefined,
          streakFreezeDays: 0,
          archived: false,
          createdAt: new Date().toISOString(),
        },
      ],
      completions: [],
      habitStats: [],
    }

    const { result } = renderHook(() => useHabitTracker(initial))

    act(() => {
      result.current.setCompletionForDate('h1', '2025-01-01', true)
      result.current.setCompletionForDate('h1', '2025-01-02', true)
      result.current.setCompletionForDate('h1', '2025-01-03', false)
    })

    const stats = result.current.state.habitStats
    expect(stats).toHaveLength(1)
    expect(stats[0].totalCompletions).toBe(2)
    expect(stats[0].totalPossible).toBe(3)
    expect(stats[0].currentStreak).toBe(0)
    expect(stats[0].longestStreak).toBe(2)
    expect(stats[0].completionRate).toBeGreaterThan(0)
  })

  it('does not change state for unknown habit IDs (edge case)', () => {
    const initial = createTestState()
    const { result } = renderHook(() => useHabitTracker(initial))

    act(() => {
      result.current.toggleCompletionForDate('missing-habit', '2025-01-01')
    })

    expect(result.current.state.completions).toHaveLength(0)
    expect(result.current.state.habitStats).toHaveLength(0)
  })
})

