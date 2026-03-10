import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { habitApi } from '../services/api'

function HomePage() {
  const { userId, email, loading, error, register, login, logout } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formEmail, setFormEmail] = useState('')
  const [password, setPassword] = useState('')
  const [serverData, setServerData] = useState<string | null>(null)
  const [serverDataError, setServerDataError] = useState<string | null>(null)
  const [serverDataLoading, setServerDataLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formEmail.trim() || !password.trim()) return

    if (mode === 'login') {
      await login(formEmail.trim(), password)
    } else {
      await register(formEmail.trim(), password)
    }
  }

  const handleLoadServerData = async () => {
    if (!userId) return
    setServerDataLoading(true)
    setServerDataError(null)
    try {
      const data = await habitApi.loadState(userId)
      setServerData(JSON.stringify({ userId, email, ...data }, null, 2))
    } catch (e) {
      setServerDataError(e instanceof Error ? e.message : 'Failed to load server data')
    } finally {
      setServerDataLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Habit Tracker</h1>
      <p>Track daily habits with streaks, frequencies, and statistics.</p>

      <section>
        <h2>Account</h2>
        {userId ? (
          <div className="auth-card">
            <p>
              Signed in as <strong>{email}</strong>
            </p>
            <div className="auth-actions">
              <button type="button" onClick={logout}>
                Log out
              </button>
              <button type="button" onClick={handleLoadServerData} disabled={serverDataLoading}>
                {serverDataLoading ? 'Loading…' : 'Show my server data'}
              </button>
            </div>
            {serverDataError && <p className="auth-error">{serverDataError}</p>}
            {serverData && (
              <pre className="data-preview">{serverData}</pre>
            )}
          </div>
        ) : (
          <div className="auth-card">
            <div className="auth-toggle">
              <button
                type="button"
                className={mode === 'login' ? 'auth-toggle-button auth-toggle-button--active' : 'auth-toggle-button'}
                onClick={() => setMode('login')}
              >
                Log in
              </button>
              <button
                type="button"
                className={
                  mode === 'register' ? 'auth-toggle-button auth-toggle-button--active' : 'auth-toggle-button'
                }
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </div>
            <form onSubmit={handleSubmit} className="auth-form">
              <label>
                Email
                <input
                  type="email"
                  value={formEmail}
                  onChange={(event) => setFormEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
              </button>
            </form>
          </div>
        )}
      </section>

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
    </div>
  )
}

export default HomePage
