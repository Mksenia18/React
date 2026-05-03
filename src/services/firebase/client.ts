import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

export interface FirebaseWebConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function readConfig(): FirebaseWebConfig {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? ''
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? ''
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? ''
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ?? ''
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? ''
  const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim() ?? ''

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error(
      'Missing Firebase web config. Set VITE_FIREBASE_* env vars (see .env.example).',
    )
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  }
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(readConfig())
  }
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp())
  }
  return db
}
