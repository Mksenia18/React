import { useMemo } from 'react'
import { useHabitTracker } from '../hooks/useHabitTracker'

function DailyPage() {
  const { state, toggleCompletionForDate } = useHabitTracker()

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const todaysHabits = state.habits.filter((habit) => !habit.archived)

  const isCompleted = (habitId: string) =>
    state.completions.some(
      (completion) =>
        completion.habitId === habitId &&
        completion.date === today &&
        completion.completed,
    )

  return (
    <div className="page">
      <h1>Daily Checklist</h1>
      <p>Your daily list of active habits to mark complete or incomplete.</p>

      {todaysHabits.length === 0 ? (
        <p>No habits for today yet. Go to the Habits page to add one.</p>
      ) : (
        <ul className="habit-list">
          {todaysHabits.map((habit) => (
            <li key={habit.id}>
              <label>
                <input
                  type="checkbox"
                  checked={isCompleted(habit.id)}
                  onChange={() => toggleCompletionForDate(habit.id, today)}
                />
                {habit.name}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DailyPage
