import { create } from 'zustand'
import { authApi } from '../services/api'

export interface AuthState {
  userId: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initFromStorage: () => void;
}

const STORAGE_KEY = 'habit-tracker-auth'

function loadStoredUser():
  | {
      userId: string;
      email: string;
    }
  | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { userId?: string; email?: string }
    if (parsed && typeof parsed.userId === 'string' && typeof parsed.email === 'string') {
      return { userId: parsed.userId, email: parsed.email }
    }
    return null
  } catch {
    return null
  }
}

function saveStoredUser(user: { userId: string; email: string } | null) {
  if (typeof window === 'undefined') return
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  loading: false,
  error: null,

  initFromStorage: () => {
    const stored = loadStoredUser()
    if (stored) {
      set({
        userId: stored.userId,
        email: stored.email,
        loading: false,
        error: null,
      })
    }
  },

  register: async (email, password) => {
    set((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const user = await authApi.register(email, password)
      saveStoredUser(user)
      set({
        userId: user.userId,
        email: user.email,
        loading: false,
        error: null,
      })
    } catch (error) {
      set({
        userId: null,
        email: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      })
    }
  },

  login: async (email, password) => {
    set((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const user = await authApi.login(email, password)
      saveStoredUser(user)
      set({
        userId: user.userId,
        email: user.email,
        loading: false,
        error: null,
      })
    } catch (error) {
      set({
        userId: null,
        email: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      })
    }
  },

  logout: () => {
    saveStoredUser(null)
    set({
      userId: null,
      email: null,
      loading: false,
      error: null,
    })
  },
}))

