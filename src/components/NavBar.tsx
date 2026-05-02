import { Link } from 'react-router-dom'

interface NavBarProps {
  email: string | null
  userId: string | null
}

export function NavBar({ email, userId }: NavBarProps) {
  return (
    <nav className="nav">
      <div className="app-title">Habit Tracker</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/habits">Habits</Link>
        <Link to="/daily">Daily</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/about">About</Link>
      </div>
      {userId && (
        <div className="nav-user">
          <span>{email}</span>
        </div>
      )}
    </nav>
  )
}

