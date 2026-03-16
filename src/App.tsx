import { useEffect } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import HabitsPage from './pages/HabitsPage.tsx'
import DailyPage from './pages/DailyPage.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import AboutPage from './pages/AboutPage.tsx'
import { useAuthStore } from './store/authStore'
import { useHabitStore } from './store/habitStore'
import './App.css'

function App() {
  const { userId, email, initFromStorage } = useAuthStore()
  const initFromBackend = useHabitStore((state) => state.initFromBackend)
  const setUser = useHabitStore((state) => state.setUser)

  useEffect(() => {
    initFromStorage()
  }, [initFromStorage])

  useEffect(() => {
    setUser(userId)
    if (userId) {
      void initFromBackend()
    }
  }, [userId, initFromBackend, setUser])

  return (
    <>
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
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
