import { useMemo } from 'react'
import { useHabitStore } from '../store/habitStore'
import { AppLayout } from '../components/AppLayout'
import { DailyChecklist } from '../components/DailyChecklist'
import { LoadingError } from '../components/LoadingError'

function DailyPage() {
  const { habits, completions, loading, error, toggleCompletionForDate } = useHabitStore()

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  return (
    <AppLayout
      title="Daily Checklist"
      subtitle="Your daily list of active habits to mark complete or incomplete."
    >
      <LoadingError loading={loading} error={error} />
      <DailyChecklist date={today} habits={habits} completions={completions} onToggle={toggleCompletionForDate} />
    </AppLayout>
  )
}

export default DailyPage
