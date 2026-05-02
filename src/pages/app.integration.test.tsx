import { beforeEach, describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HabitsPage from './HabitsPage'
import DailyPage from './DailyPage'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'

function resetStores() {
  useAuthStore.setState({
    userId: 'user-1',
    email: 'demo@example.com',
    loading: false,
    error: null,
  })

  useHabitStore.setState({
    habits: [],
    completions: [],
    habitStats: [],
    userId: 'user-1',
    loading: false,
    error: null,
  })
}

describe('app integration flows', () => {
  beforeEach(() => {
    act(() => {
      resetStores()
    })
  })

  it('adds a habit from Habits page', () => {
    render(
      <MemoryRouter>
        <HabitsPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('e.g. Drink water'), {
      target: { value: 'Read 20 minutes' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add Habit' }))

    expect(screen.queryByText('Read 20 minutes')).not.toBeNull()
    expect(screen.queryByText(/Active Habits \(1\)/)).not.toBeNull()
  })

  it('toggles completion from Daily page for existing habit', () => {
    const today = new Date().toISOString().slice(0, 10)

    act(() => {
      useHabitStore.getState().addHabit({
        name: 'Workout',
        category: 'health',
        targetFrequency: 'daily',
      })
    })

    render(
      <MemoryRouter>
        <DailyPage />
      </MemoryRouter>,
    )

    const checkbox = screen.getByRole('checkbox')
    expect((checkbox as HTMLInputElement).checked).toBe(false)

    fireEvent.click(checkbox)
    expect((checkbox as HTMLInputElement).checked).toBe(true)

    const completion = useHabitStore
      .getState()
      .completions.find((entry) => entry.date === today && entry.completed)

    expect(completion).toBeDefined()
  })
})

