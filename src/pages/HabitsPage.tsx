import { useState } from 'react'
import { useHabitTracker } from '../hooks/useHabitTracker'
import type { HabitCategory, HabitFrequency } from '../types'

function HabitsPage() {
  const { state, addHabit, archiveHabit, deleteHabit, resetAll } = useHabitTracker()

  const [name, setName] = useState('')
  const [category, setCategory] = useState<HabitCategory>('health')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return

    addHabit({
      name: name.trim(),
      category,
      targetFrequency: frequency,
    })
    setName('')
  }

  const activeHabits = state.habits.filter((habit) => !habit.archived)
  const archivedHabits = state.habits.filter((habit) => habit.archived)

  return (
    <div className="page">
      <h1>My Habits</h1>

      <section>
        <h2>Create a Habit</h2>
        <form onSubmit={handleSubmit} className="habit-form">
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Drink water"
            />
          </label>

          <label>
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as HabitCategory)}
            >
              <option value="health">Health</option>
              <option value="productivity">Productivity</option>
              <option value="learning">Learning</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            Frequency
            <select
              value={frequency}
              onChange={(event) => setFrequency(event.target.value as HabitFrequency)}
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          <button type="submit">Add Habit</button>
          {state.habits.length > 0 && (
            <button type="button" onClick={resetAll}>
              Reset All
            </button>
          )}
        </form>
      </section>

      <section>
        <h2>Active Habits ({activeHabits.length})</h2>
        {activeHabits.length === 0 ? (
          <p>No active habits yet. Create one above.</p>
        ) : (
          <ul className="habit-list">
            {activeHabits.map((habit) => {
              const stats = state.habitStats.find((entry) => entry.habitId === habit.id)
              return (
                <li key={habit.id}>
                  <div>
                    <strong>{habit.name}</strong> ({habit.category} – {habit.targetFrequency})
                  </div>
                  {stats && (
                    <div className="habit-stats">
                      Streak: {stats.currentStreak} days (best {stats.longestStreak}) ·
                      Completion rate: {stats.completionRate}%
                    </div>
                  )}
                  <div className="habit-actions">
                    <button type="button" onClick={() => archiveHabit(habit.id)}>
                      Archive
                    </button>
                    <button type="button" onClick={() => deleteHabit(habit.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {archivedHabits.length > 0 && (
        <section>
          <h2>Archived Habits ({archivedHabits.length})</h2>
          <ul className="habit-list">
            {archivedHabits.map((habit) => (
              <li key={habit.id}>
                <strong>{habit.name}</strong> ({habit.category})
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default HabitsPage
