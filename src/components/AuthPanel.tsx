import { useState } from 'react'

type AuthMode = 'login' | 'register'

interface SignedOutProps {
  loading: boolean
  error: string | null
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string) => Promise<void>
}

function SignedOutAuth({ loading, error, onLogin, onRegister }: SignedOutProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [formEmail, setFormEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formEmail.trim() || !password.trim()) return

    if (mode === 'login') {
      await onLogin(formEmail.trim(), password)
    } else {
      await onRegister(formEmail.trim(), password)
    }
  }

  return (
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
          className={mode === 'register' ? 'auth-toggle-button auth-toggle-button--active' : 'auth-toggle-button'}
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
  )
}

interface SignedInProps {
  email: string | null
  onLogout: () => void
}

function SignedInAuth({ email, onLogout }: SignedInProps) {
  return (
    <div className="auth-card">
      <p>
        Signed in as <strong>{email}</strong>
      </p>
      <div className="auth-actions">
        <button type="button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </div>
  )
}

interface AuthPanelProps {
  userId: string | null
  email: string | null
  loading: boolean
  error: string | null
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string) => Promise<void>
  onLogout: () => void
}

export function AuthPanel({ userId, email, loading, error, onLogin, onRegister, onLogout }: AuthPanelProps) {
  return (
    <section>
      <h2>Account</h2>
      {userId ? (
        <SignedInAuth email={email} onLogout={onLogout} />
      ) : (
        <SignedOutAuth loading={loading} error={error} onLogin={onLogin} onRegister={onRegister} />
      )}
    </section>
  )
}

