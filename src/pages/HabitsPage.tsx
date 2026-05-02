import { useState } from 'react'
import { useHabitStore } from '../store/habitStore'
import { AppLayout } from '../components/AppLayout'
import { HabitForm } from '../components/HabitForm'
import { HabitList } from '../components/HabitList'
import { LoadingError } from '../components/LoadingError'
import type { HabitCategory, HabitFrequency } from '../types'

function HabitsPage() {
  const { habits, habitStats, completions, loading, error, addHabit, deleteHabit } = useHabitStore()

  const [form, setForm] = useState<{ name: string; category: HabitCategory; frequency: HabitFrequency }>({
    name: '',
    category: 'health',
    frequency: 'daily',
  })

  const handleSubmit = () => {
    if (!form.name.trim()) return
    addHabit({
      name: form.name.trim(),
      category: form.category,
      targetFrequency: form.frequency,
    })
    setForm((prev) => ({ ...prev, name: '' }))
  }

  const activeHabits = habits.filter((habit) => !habit.archived)
  const archivedHabits = habits.filter((habit) => habit.archived)

  return (
    <AppLayout title="My Habits">
      <LoadingError loading={loading} error={error} />

      <HabitForm values={form} onChange={setForm} onSubmit={handleSubmit} />

      <HabitList
        title="Active Habits"
        habits={activeHabits}
        habitStats={habitStats}
        completions={completions}
        onDeleteHabit={deleteHabit}
        showChart
      />

      {archivedHabits.length > 0 && (
        <HabitList
          title="Archived Habits"
          habits={archivedHabits}
          habitStats={habitStats}
          completions={completions}
          showChart={false}
        />
      )}
    </AppLayout>
  )
}

export default HabitsPage
