import type { Habit, HabitCompletion, HabitStats } from '../types'

function computeLast7Days() {
  const days: string[] = []
  const today = new Date()
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    days.push(date.toISOString().slice(0, 10))
  }
  return days
}

interface HabitListProps {
  title: string
  habits: Habit[]
  habitStats: HabitStats[]
  completions: HabitCompletion[]
  onDeleteHabit?: (habitId: string) => void
  onEditHabit?: (habitId: string) => void
  showChart?: boolean
}

interface HabitCardProps {
  habit: Habit
  stats?: HabitStats
  completions: HabitCompletion[]
  onDeleteHabit?: (habitId: string) => void
  onEditHabit?: (habitId: string) => void
  showChart: boolean
  last7Days: string[]
}

function HabitChart({ habitId, last7Days, completions }: { habitId: string; last7Days: string[]; completions: HabitCompletion[] }) {
  return (
    <div className="habit-chart">
      {last7Days.map((day) => {
        const completedOnDay = completions.some(
          (completion) => completion.habitId === habitId && completion.date === day && completion.completed,
        )
        return (
          <div
            key={day}
            className={`habit-chart-day${completedOnDay ? ' habit-chart-day--completed' : ''}`}
          />
        )
      })}
    </div>
  )
}

function HabitCard({
  habit,
  stats,
  completions,
  onDeleteHabit,
  onEditHabit,
  showChart,
  last7Days,
}: HabitCardProps) {
  return (
    <li className="habit-card">
      <div className="habit-header">
        <div className="habit-name">{habit.name}</div>
        <div className="habit-meta">
          {habit.category} · {habit.targetFrequency}
        </div>
      </div>
      {stats && (
        <div className="habit-stats">
          Streak: {stats.currentStreak} days (best {stats.longestStreak}) · Completion rate: {stats.completionRate}%
        </div>
      )}
      {showChart ? <HabitChart habitId={habit.id} last7Days={last7Days} completions={completions} /> : null}
      {(onDeleteHabit || onEditHabit) ? (
        <div className="habit-actions">
          {onEditHabit ? (
            <button type="button" className="button-secondary" onClick={() => onEditHabit(habit.id)}>
              Edit
            </button>
          ) : null}
          {onDeleteHabit ? (
            <button
              type="button"
              className="button-danger"
              onClick={() => onDeleteHabit(habit.id)}
            >
              Delete
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

export function HabitList({
  title,
  habits,
  habitStats,
  completions,
  onDeleteHabit,
  onEditHabit,
  showChart = true,
}: HabitListProps) {
  const last7Days = computeLast7Days()

  return (
    <section>
      <h2>
        {title} ({habits.length})
      </h2>
      {habits.length === 0 ? (
        <p className="empty-state">No habits yet.</p>
      ) : (
        <ul className="habit-list">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              stats={habitStats.find((entry) => entry.habitId === habit.id)}
              completions={completions}
              onDeleteHabit={onDeleteHabit}
              onEditHabit={onEditHabit}
              showChart={showChart}
              last7Days={last7Days}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

