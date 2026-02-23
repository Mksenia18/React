import { Link, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import HabitsPage from './pages/HabitsPage.tsx'
import DailyPage from './pages/DailyPage.tsx'
import './App.css'

function App() {
  return (
    <>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/habits">Habits</Link>
        <Link to="/daily">Daily</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/daily" element={<DailyPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
