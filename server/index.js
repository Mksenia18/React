import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000
const DATA_FILE = path.join(__dirname, 'state.json')

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

app.use(express.json())

function ensureFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      users: [],
      dataByUserId: {},
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
      return { users: [], dataByUserId: {} }
    }
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      dataByUserId:
        parsed.dataByUserId && typeof parsed.dataByUserId === 'object'
          ? parsed.dataByUserId
          : {},
    }
  } catch {
    return { users: [], dataByUserId: {} }
  }
}

function writeState(nextState) {
  const safeState = {
    users: Array.isArray(nextState.users) ? nextState.users : [],
    dataByUserId:
      nextState.dataByUserId && typeof nextState.dataByUserId === 'object'
        ? nextState.dataByUserId
        : {},
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(safeState, null, 2), 'utf8')
}

function mergeUserData(dataByUserId) {
  const allHabits = []
  const allCompletions = []

  for (const value of Object.values(dataByUserId ?? {})) {
    if (!value || typeof value !== 'object') continue
    if (Array.isArray(value.habits)) {
      allHabits.push(...value.habits)
    }
    if (Array.isArray(value.completions)) {
      allCompletions.push(...value.completions)
    }
  }

  const seenHabitIds = new Set()
  const habits = allHabits.filter((habit) => {
    const id = habit?.id
    if (typeof id !== 'string' || !id) return false
    if (seenHabitIds.has(id)) return false
    seenHabitIds.add(id)
    return true
  })

  const seenCompletionIds = new Set()
  const completions = allCompletions.filter((completion) => {
    const id = completion?.id
    if (typeof id !== 'string' || !id) return false
    if (seenCompletionIds.has(id)) return false
    seenCompletionIds.add(id)
    return true
  })

  return { habits, completions }
}

function bootstrapUserIfMissing(state, email, password) {
  const hasUsers = state.users.length > 0
  if (hasUsers) return null

  const userId = generateId()
  const userData = mergeUserData(state.dataByUserId)

  const nextState = {
    ...state,
    users: [{ id: userId, email, password }],
    dataByUserId: {
      [userId]: userData,
    },
  }

  writeState(nextState)
  return { userId, email }
}

app.post('/api/register', (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const state = readState()
  const bootstrapped = bootstrapUserIfMissing(state, email, password)
  if (bootstrapped) {
    res.status(201).json(bootstrapped)
    return
  }

  const existingUser = state.users.find((user) => user.email === email)
  if (existingUser) {
    res.status(409).json({ error: 'User already exists' })
    return
  }

  const userId = generateId()
  const newUser = {
    id: userId,
    email,
    password,
  }

  const nextState = {
    ...state,
    users: [...state.users, newUser],
    dataByUserId: {
      ...state.dataByUserId,
      [userId]: { habits: [], completions: [] },
    },
  }

  writeState(nextState)
  res.status(201).json({ userId, email })
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const state = readState()
  const bootstrapped = bootstrapUserIfMissing(state, email, password)
  if (bootstrapped) {
    res.json(bootstrapped)
    return
  }

  const user = state.users.find((u) => u.email === email && u.password === password)
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  res.json({ userId: user.id, email: user.email })
})

app.get('/api/state', (req, res) => {
  const { dataByUserId } = readState()
  const userId = req.header('x-user-id')
  if (!userId) {
    res.json({ habits: [], completions: [] })
    return
  }

  const userData = dataByUserId[userId] ?? { habits: [], completions: [] }
  res.json({
    habits: Array.isArray(userData.habits) ? userData.habits : [],
    completions: Array.isArray(userData.completions) ? userData.completions : [],
  })
})

app.post('/api/state', (req, res) => {
  const userId = req.header('x-user-id')
  if (!userId) {
    res.status(400).json({ error: 'Missing x-user-id header' })
    return
  }

  const state = readState()
  const body = req.body ?? {}
  const nextState = {
    ...state,
    dataByUserId: {
      ...state.dataByUserId,
      [userId]: {
        habits: Array.isArray(body.habits) ? body.habits : [],
        completions: Array.isArray(body.completions) ? body.completions : [],
      },
    },
  }

  writeState(nextState)
  res.status(204).end()
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Habit Tracker backend listening on http://localhost:${PORT}`)
})

