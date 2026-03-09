import type { AppState, Habit, HabitCompletion } from '../types'

export interface HabitBackendState {
  habits: Habit[];
  completions: HabitCompletion[];
}

export interface HabitApi {
  loadState: (userId: string) => Promise<HabitBackendState>;
  saveState: (userId: string, state: HabitBackendState) => Promise<void>;
}

export interface AuthUser {
  userId: string;
  email: string;
}

export interface AuthApi {
  register: (email: string, password: string) => Promise<AuthUser>;
  login: (email: string, password: string) => Promise<AuthUser>;
}

const emptyState: HabitBackendState = {
  habits: [],
  completions: [],
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const habitApi: HabitApi = {
  async loadState(userId) {
    try {
      const response = await fetch('/api/state', {
        headers: {
          'x-user-id': userId,
        },
      })
      if (!response.ok) {
        return emptyState
      }
      const data = (await response.json()) as Partial<AppState>
      return {
        habits: data.habits ?? [],
        completions: data.completions ?? [],
      }
    } catch {
      return emptyState
    }
  },

  async saveState(userId, state) {
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(state),
      })
    } catch {
      // placeholder: ignore network errors for now
    }
  },
}

export const authApi: AuthApi = {
  async register(email, password) {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = (await response.json()) as AuthUser
        return data
      }
    } catch {
      // fall back to local-only user
    }

    return {
      userId: generateId(),
      email,
    }
  },

  async login(email, password) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = (await response.json()) as AuthUser
        return data
      }
    } catch {
      // fall back to local-only user
    }

    return {
      userId: generateId(),
      email,
    }
  },
}


