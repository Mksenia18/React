import { useAuthStore } from '../store/authStore'

function SettingsPage() {
  const { userId, email, logout } = useAuthStore()

  return (
    <div className="page">
      <h1>Settings</h1>
      <section>
        <h2>Account</h2>
        {userId ? (
          <div>
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
    </div>
  )
}

export default SettingsPage

