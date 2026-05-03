import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import HabitsPage from './pages/HabitsPage.tsx'
import DailyPage from './pages/DailyPage.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import AboutPage from './pages/AboutPage.tsx'
import { useAuthStore } from './store/authStore'
import { useHabitStore } from './store/habitStore'
import './App.css'

function App() {
  const { userId, initAuthListener } = useAuthStore()
  const setUser = useHabitStore((state) => state.setUser)

  useEffect(() => {
    initAuthListener()
  }, [initAuthListener])

  useEffect(() => {
    setUser(userId)
  }, [userId, setUser])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/habits" element={<HabitsPage />} />
      <Route path="/daily" element={<DailyPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  )
}

export default App
