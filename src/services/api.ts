import type { AppState, Habit, HabitCompletion } from '../types'
import { API_BASE } from './api-config'

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

export const habitApi: HabitApi = {
  async loadState(userId) {
    const response = await fetch(`${API_BASE}/state`, {
      headers: {
        'x-user-id': userId,
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to load state (${response.status})`)
    }
    const data = (await response.json()) as Partial<AppState>
    return {
      habits: data.habits ?? [],
      completions: data.completions ?? [],
    }
  },

  async saveState(userId, state) {
    const response = await fetch(`${API_BASE}/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify(state),
    })
    if (!response.ok) {
      throw new Error(`Failed to save state (${response.status})`)
    }
  },
}

export const authApi: AuthApi = {
  async register(email, password) {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      let message = `Registration failed (${response.status})`
      try {
        const data = (await response.json()) as { error?: unknown }
        if (typeof data.error === 'string' && data.error.trim()) {
          message = data.error
        }
      } catch {
        // ignore parse errors
      }
      throw new Error(message)
    }

    return (await response.json()) as AuthUser
  },

  async login(email, password) {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      let message = `Login failed (${response.status})`
      try {
        const data = (await response.json()) as { error?: unknown }
        if (typeof data.error === 'string' && data.error.trim()) {
          message = data.error
        }
      } catch {
        // ignore parse errors
      }
      throw new Error(message)
    }

    return (await response.json()) as AuthUser
  },
}


