import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import type { DayOfWeek, Habit, HabitCategory, HabitCompletion, HabitFrequency } from '../../types'
import { getFirestoreDb } from './client'

function habitsPath(uid: string) {
  return `users/${uid}/habits`
}

function completionsPath(uid: string) {
  return `users/${uid}/completions`
}

function completionDocId(habitId: string, date: string) {
  return `${habitId}_${date}`
}

/** Firestore rejects `undefined` field values; omit optional fields when unset. */
function stripUndefinedFields<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      out[key] = value
    }
  }
  return out
}

function habitFromFirestore(docId: string, data: Record<string, unknown>): Habit {
  return {
    id: docId,
    name: String(data.name ?? ''),
    category: data.category as HabitCategory,
    targetFrequency: data.targetFrequency as HabitFrequency,
    customDays: data.customDays as DayOfWeek[] | undefined,
    streakFreezeDays: typeof data.streakFreezeDays === 'number' ? data.streakFreezeDays : 0,
    archived: Boolean(data.archived),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  }
}

function completionFromFirestore(docId: string, data: Record<string, unknown>): HabitCompletion {
  return {
    id: docId,
    habitId: String(data.habitId ?? ''),
    date: String(data.date ?? ''),
    completed: Boolean(data.completed),
  }
}

export function subscribeUserHabits(
  uid: string,
  onHabits: (habits: Habit[]) => void,
  onError: (message: string) => void,
): () => void {
  const db = getFirestoreDb()
  const ref = collection(db, habitsPath(uid))
  return onSnapshot(
    ref,
    (snap) => {
      const habits = snap.docs.map((d) => habitFromFirestore(d.id, d.data() as Record<string, unknown>))
      onHabits(habits)
    },
    (err) => {
      onError(err.message)
    },
  )
}

export function subscribeUserCompletions(
  uid: string,
  onCompletions: (completions: HabitCompletion[]) => void,
  onError: (message: string) => void,
): () => void {
  const db = getFirestoreDb()
  const ref = collection(db, completionsPath(uid))
  return onSnapshot(
    ref,
    (snap) => {
      const completions = snap.docs.map((d) =>
        completionFromFirestore(d.id, d.data() as Record<string, unknown>),
      )
      onCompletions(completions)
    },
    (err) => {
      onError(err.message)
    },
  )
}

export async function addHabitDocument(
  uid: string,
  habit: Habit,
): Promise<void> {
  const db = getFirestoreDb()
  const { id, ...rest } = habit
  const payload = stripUndefinedFields({ ...rest } as Record<string, unknown>)
  await setDoc(doc(db, habitsPath(uid), id), payload)
}

export async function updateHabitDocument(
  uid: string,
  habitId: string,
  updates: {
    name: string
    category: HabitCategory
    targetFrequency: HabitFrequency
    customDays?: DayOfWeek[]
    streakFreezeDays?: number
  },
): Promise<void> {
  const db = getFirestoreDb()
  const payload = stripUndefinedFields({
    name: updates.name,
    category: updates.category,
    targetFrequency: updates.targetFrequency,
    customDays: updates.customDays,
    streakFreezeDays: updates.streakFreezeDays,
  } as Record<string, unknown>)
  await setDoc(doc(db, habitsPath(uid), habitId), payload, { merge: true })
}

export async function deleteHabitAndCompletions(uid: string, habitId: string): Promise<void> {
  const db = getFirestoreDb()
  const batch = writeBatch(db)
  batch.delete(doc(db, habitsPath(uid), habitId))

  const q = query(collection(db, completionsPath(uid)), where('habitId', '==', habitId))
  const snaps = await getDocs(q)
  snaps.forEach((d) => {
    batch.delete(d.ref)
  })

  await batch.commit()
}

export async function setCompletionForDate(
  uid: string,
  habitId: string,
  date: string,
  completed: boolean,
): Promise<void> {
  const db = getFirestoreDb()
  const id = completionDocId(habitId, date)
  const ref = doc(db, completionsPath(uid), id)
  await setDoc(
    ref,
    {
      habitId,
      date,
      completed,
    },
    { merge: true },
  )
}
