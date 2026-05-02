import { useAuthStore } from '../store/authStore'
import { AppLayout } from '../components/AppLayout'

function SettingsPage() {
  const { userId, email, logout } = useAuthStore()

  return (
    <AppLayout title="Settings">
      <section>
        <h2>Account</h2>
        {userId ? (
          <div className="auth-card">
            <p>
              Signed in as <strong>{email}</strong>
            </p>
            <button type="button" onClick={logout}>
              Log out
            </button>
          </div>
        ) : (
          <p>You are not signed in. Go to Home to log in or register.</p>
        )}
      </section>
    </AppLayout>
  )
}

export default SettingsPage

