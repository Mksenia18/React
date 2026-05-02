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
  const { userId, initFromStorage } = useAuthStore()
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
