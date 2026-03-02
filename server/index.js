import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000
const DATA_FILE = path.join(__dirname, 'state.json')

app.use(express.json())

function ensureFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      habits: [],
      completions: [],
    }
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8')
  }
}

function readState() {
  ensureFile()
  const raw = fs.readFileSync(DATA_FILE, 'utf8')
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { habits: [], completions: [] }
    }
    return {
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      completions: Array.isArray(parsed.completions) ? parsed.completions : [],
    }
  } catch {
    return { habits: [], completions: [] }
  }
}

function writeState(nextState) {
  const safeState = {
    habits: Array.isArray(nextState.habits) ? nextState.habits : [],
    completions: Array.isArray(nextState.completions) ? nextState.completions : [],
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(safeState, null, 2), 'utf8')
}

app.get('/api/state', (_req, res) => {
  const state = readState()
  res.json(state)
})

app.post('/api/state', (req, res) => {
  const body = req.body ?? {}
  const nextState = {
    habits: Array.isArray(body.habits) ? body.habits : [],
    completions: Array.isArray(body.completions) ? body.completions : [],
  }

  writeState(nextState)
  res.status(204).end()
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Habit Tracker backend listening on http://localhost:${PORT}`)
})

