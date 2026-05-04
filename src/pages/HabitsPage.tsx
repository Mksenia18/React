import { useState } from 'react'
import { useHabitStore } from '../store/habitStore'
import { AppLayout } from '../components/AppLayout'
import { HabitForm } from '../components/HabitForm'
import { HabitList } from '../components/HabitList'
import { LoadingError } from '../components/LoadingError'
import type { HabitCategory, HabitFrequency } from '../types'

function HabitsPage() {
  const { habits, habitStats, completions, loading, error, addHabit, deleteHabit, updateHabit } = useHabitStore()

  const [form, setForm] = useState<{ name: string; category: HabitCategory; frequency: HabitFrequency }>({
    name: '',
    category: 'health',
    frequency: 'daily',
  })
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)

  const resetForm = () => {
    setForm({
      name: '',
      category: 'health',
      frequency: 'daily',
    })
    setEditingHabitId(null)
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return
    if (editingHabitId) {
      updateHabit(editingHabitId, {
        name: form.name.trim(),
        category: form.category,
        targetFrequency: form.frequency,
      })
      resetForm()
      return
    }
    addHabit({
      name: form.name.trim(),
      category: form.category,
      targetFrequency: form.frequency,
    })
    resetForm()
  }

  const startEditing = (habitId: string) => {
    const habit = habits.find((entry) => entry.id === habitId)
    if (!habit) return
    setEditingHabitId(habitId)
    setForm({
      name: habit.name,
      category: habit.category,
      frequency: habit.targetFrequency,
    })
  }

  const activeHabits = habits.filter((habit) => !habit.archived)
  const archivedHabits = habits.filter((habit) => habit.archived)

  return (
    <AppLayout title="My Habits">
      <LoadingError loading={loading} error={error} />

      <HabitForm
        values={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        mode={editingHabitId ? 'edit' : 'create'}
        onCancelEdit={editingHabitId ? resetForm : undefined}
      />

      <HabitList
        title="Active Habits"
        habits={activeHabits}
        habitStats={habitStats}
        completions={completions}
        onDeleteHabit={deleteHabit}
        onEditHabit={startEditing}
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
