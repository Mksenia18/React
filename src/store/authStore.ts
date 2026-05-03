import { create } from 'zustand'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getFirebaseAuth } from '../services/firebase/client'
import { mapFirebaseAuthError } from '../services/firebase/authErrors'

export interface AuthState {
  userId: string | null
  email: string | null
  loading: boolean
  error: string | null
  register: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  initAuthListener: () => void
}

let authListenerStarted = false

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  loading: false,
  error: null,

  initAuthListener: () => {
    if (authListenerStarted) return
    authListenerStarted = true
    try {
      const auth = getFirebaseAuth()
      onAuthStateChanged(auth, (user) => {
        set({
          userId: user?.uid ?? null,
          email: user?.email ?? null,
          loading: false,
          error: null,
        })
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Firebase failed to initialize',
        loading: false,
      })
    }
  },

  register: async (email, password) => {
    set((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const auth = getFirebaseAuth()
      await createUserWithEmailAndPassword(auth, email, password)
      set((prev) => ({ ...prev, loading: false }))
    } catch (error) {
      set({
        userId: null,
        email: null,
        loading: false,
        error: mapFirebaseAuthError(error),
      })
    }
  },

  login: async (email, password) => {
    set((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const auth = getFirebaseAuth()
      await signInWithEmailAndPassword(auth, email, password)
      set((prev) => ({ ...prev, loading: false }))
    } catch (error) {
      set({
        userId: null,
        email: null,
        loading: false,
        error: mapFirebaseAuthError(error),
      })
    }
  },

  logout: async () => {
    set((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await signOut(getFirebaseAuth())
    } catch (error) {
      set((prev) => ({
        ...prev,
        error: mapFirebaseAuthError(error),
      }))
    } finally {
      set((prev) => ({ ...prev, loading: false }))
    }
  },
}))
