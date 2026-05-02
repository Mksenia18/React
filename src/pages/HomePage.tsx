import { useAuthStore } from '../store/authStore'
import { AppLayout } from '../components/AppLayout'
import { AuthPanel } from '../components/AuthPanel'

function HomePage() {
  const { userId, email, loading, error, register, login, logout } = useAuthStore()

  return (
    <AppLayout
      title="Habit Tracker"
      subtitle="Track daily habits with streaks, frequencies, and statistics."
    >
      <AuthPanel
        userId={userId}
        email={email}
        loading={loading}
        error={error}
        onLogin={login}
        onRegister={register}
        onLogout={logout}
      />

      <section>
        <h2>How it works</h2>
        <ul>
          <li>Create and manage habits with target frequency and category</li>
          <li>Mark habits complete for any day and build streaks</li>
          <li>View your daily checklist and weekly/monthly overview</li>
        </ul>
        <p>
          Use the navigation above to go to <strong>Habits</strong> or <strong>Daily</strong>. Each account sees only
          their own habits and completions.
        </p>
      </section>
    </AppLayout>
  )
}

export default HomePage
