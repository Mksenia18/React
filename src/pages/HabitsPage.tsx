import { useState } from 'react'
import { useHabitStore } from '../store/habitStore'
import type { HabitCategory, HabitFrequency } from '../types'

function HabitsPage() {
  const { habits, habitStats, completions, addHabit, deleteHabit } = useHabitStore()

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

  const activeHabits = habits.filter((habit) => !habit.archived)
  const archivedHabits = habits.filter((habit) => habit.archived)

  const computeLast7Days = () => {
    const days: string[] = []
    const today = new Date()
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today)
      date.setDate(today.getDate() - offset)
      days.push(date.toISOString().slice(0, 10))
    }
    return days
  }

  const last7Days = computeLast7Days()

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
        </form>
      </section>

      <section>
        <h2>Active Habits ({activeHabits.length})</h2>
        {activeHabits.length === 0 ? (
          <p>No active habits yet. Create one above.</p>
        ) : (
          <ul className="habit-list">
            {activeHabits.map((habit) => {
              const stats = habitStats.find((entry) => entry.habitId === habit.id)

              return (
                <li key={habit.id} className="habit-card">
                  <div className="habit-header">
                    <div className="habit-name">{habit.name}</div>
                    <div className="habit-meta">
                      {habit.category} · {habit.targetFrequency}
                    </div>
                  </div>
                  {stats && (
                    <div className="habit-stats">
                      Streak: {stats.currentStreak} days (best {stats.longestStreak}) · Completion
                      rate: {stats.completionRate}%
                    </div>
                  )}
                  <div className="habit-chart">
                    {last7Days.map((day) => {
                      const completedOnDay = completions.some(
                        (completion) =>
                          completion.habitId === habit.id &&
                          completion.date === day &&
                          completion.completed,
                      )
                      return (
                        <div
                          key={day}
                          className={`habit-chart-day${
                            completedOnDay ? ' habit-chart-day--completed' : ''
                          }`}
                        />
                      )
                    })}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => deleteHabit(habit.id)}
                      style={{
                        background: '#ef4444',
                        boxShadow: '0 8px 16px rgba(239,68,68,0.25)',
                      }}
                    >
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
