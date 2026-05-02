import type { Habit, HabitCompletion } from '../types'

interface DailyChecklistProps {
  date: string
  habits: Habit[]
  completions: HabitCompletion[]
  onToggle: (habitId: string, date: string) => void
}

interface DailyHabitRowProps {
  habit: Habit
  checked: boolean
  onToggle: () => void
}

function DailyHabitRow({ habit, checked, onToggle }: DailyHabitRowProps) {
  return (
    <li className="daily-item">
      <label className="daily-item-label">
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <span>{habit.name}</span>
      </label>
    </li>
  )
}

export function DailyChecklist({ date, habits, completions, onToggle }: DailyChecklistProps) {
  const todaysHabits = habits.filter((habit) => !habit.archived)

  const isCompleted = (habitId: string) =>
    completions.some(
      (completion) => completion.habitId === habitId && completion.date === date && completion.completed,
    )

  if (todaysHabits.length === 0) {
    return <p className="empty-state">No habits for today yet. Go to the Habits page to add one.</p>
  }

  return (
    <ul className="daily-list">
      {todaysHabits.map((habit) => (
        <DailyHabitRow
          key={habit.id}
          habit={habit}
          checked={isCompleted(habit.id)}
          onToggle={() => onToggle(habit.id, date)}
        />
      ))}
    </ul>
  )
}

