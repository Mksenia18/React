import type { HabitCategory, HabitFrequency } from '../types'

interface HabitFormValues {
  name: string
  category: HabitCategory
  frequency: HabitFrequency
}

interface HabitFormProps {
  values: HabitFormValues
  onChange: (next: HabitFormValues) => void
  onSubmit: () => void
  mode?: 'create' | 'edit'
  onCancelEdit?: () => void
}

export function HabitForm({ values, onChange, onSubmit, mode = 'create', onCancelEdit }: HabitFormProps) {
  const isEdit = mode === 'edit'

  return (
    <section>
      <h2>{isEdit ? 'Edit Habit' : 'Create a Habit'}</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
        className="habit-form"
      >
        <label>
          Name
          <input
            type="text"
            value={values.name}
            onChange={(event) => onChange({ ...values, name: event.target.value })}
            placeholder="e.g. Drink water"
          />
        </label>

        <label>
          Category
          <select
            value={values.category}
            onChange={(event) => onChange({ ...values, category: event.target.value as HabitCategory })}
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
            value={values.frequency}
            onChange={(event) => onChange({ ...values, frequency: event.target.value as HabitFrequency })}
          >
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays</option>
            <option value="custom">Custom</option>
          </select>
        </label>

        <button type="submit">{isEdit ? 'Save Changes' : 'Add Habit'}</button>
        {isEdit && onCancelEdit ? (
          <button type="button" className="button-secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        ) : null}
      </form>
    </section>
  )
}

