# Architecture Review Results

> Analyzed on: 2026-05-02
> Project: /Users/kseniamaranda/Documents/project2Frontend
> Total components analyzed: 12
> Issues found: 5

## Summary

The project already has a good high-level separation (`services` -> `stores` -> `pages/components`) and page files are mostly readable. The most impactful issue is a layering violation in `AuthPanel`: a UI component directly imports and calls `habitApi`, which bypasses state ownership and makes data flow harder to reason about. Secondary issues are SLA inconsistencies in list/rendering components and missing a dedicated reusable app shell component.

## Issues

### AR-001: UI component directly calls API service

**Severity**: High
**Principle**: Missing API Abstraction
**Location**: `src/components/AuthPanel.tsx`

`AuthPanel` mixes rendering responsibility with external data fetching (`habitApi.loadState`). This splits data ownership between component-local state and stores, which makes side effects harder to test and maintain.

#### Current (Bad)

```tsx
import { habitApi } from '../services/api'

function SignedInAuth({ userId, email, onLogout }: SignedInProps) {
  const [serverData, setServerData] = useState<string | null>(null)

  const handleLoadServerData = async () => {
    const data = await habitApi.loadState(userId)
    setServerData(JSON.stringify({ userId, email, ...data }, null, 2))
  }
  // ...
}
```

#### Recommended (Good)

```tsx
// store/habitStore.ts
export interface HabitStoreState extends AppState {
  // ...
  loadDebugSnapshot: () => Promise<void>;
  debugSnapshot: HabitBackendState | null;
}

// components/AuthPanel.tsx
function SignedInAuth({ email, onLogout }: SignedInProps) {
  const { debugSnapshot, loadDebugSnapshot, loading, error } = useHabitStore()

  return (
    <>
      <button type="button" onClick={() => void loadDebugSnapshot()} disabled={loading}>
        {loading ? 'Loading…' : 'Show my server data'}
      </button>
      {error && <p className="auth-error">{error}</p>}
      {debugSnapshot && <pre className="data-preview">{JSON.stringify(debugSnapshot, null, 2)}</pre>}
    </>
  )
}
```

**Why this is better**: one state owner (store) keeps side effects centralized and preserves predictable data flow through props/selectors.

---

### AR-002: Legacy hook bypasses service layer with raw fetch

**Severity**: High
**Principle**: Missing API Abstraction
**Location**: `src/hooks/useHabitTracker.ts`

The hook performs direct `fetch('/api/state')` calls in effects, while the app also has `src/services/api.ts` and Zustand stores. This creates two competing architectures for the same domain and increases duplication/risk of drift.

#### Current (Bad)

```tsx
useEffect(() => {
  const loadFromServer = async () => {
    const response = await fetch('/api/state')
    // ...
  }
  void loadFromServer()
}, [])

useEffect(() => {
  const saveToServer = async () => {
    await fetch('/api/state', {
      method: 'POST',
      // ...
    })
  }
  void saveToServer()
}, [state.habits, state.completions])
```

#### Recommended (Good)

```tsx
import { habitApi } from '../services/api'

useEffect(() => {
  const loadFromServer = async () => {
    const data = await habitApi.loadState(activeUserId)
    setState((prev) => ({ ...prev, habits: data.habits, completions: data.completions }))
  }
  void loadFromServer()
}, [activeUserId])

useEffect(() => {
  void habitApi.saveState(activeUserId, {
    habits: state.habits,
    completions: state.completions,
  })
}, [activeUserId, state.habits, state.completions])
```

**Why this is better**: all external communication flows through one API abstraction, reducing duplication and backend-coupled logic in hooks.

---

### AR-003: `HabitList` mixes high-level composition with inline low-level blocks

**Severity**: Medium
**Principle**: SLA Violation
**Location**: `src/components/HabitList.tsx`

The component combines list orchestration, stats formatting, chart-cell rendering, and action button styling inline in one map callback. This makes the component harder to describe and evolve as a single abstraction level.

#### Current (Bad)

```tsx
{habits.map((habit) => {
  const stats = habitStats.find((entry) => entry.habitId === habit.id)
  return (
    <li key={habit.id} className="habit-card">
      {/* header + stats + 7-day chart + inline delete styles */}
      {onDeleteHabit && (
        <div style={{ marginTop: '0.5rem' }}>
          <button type="button" onClick={() => onDeleteHabit(habit.id)} style={{ background: '#ef4444' }}>
            Delete
          </button>
        </div>
      )}
    </li>
  )
})}
```

#### Recommended (Good)

```tsx
function HabitList(props: HabitListProps) {
  return (
    <section>
      <h2>{props.title} ({props.habits.length})</h2>
      <ul className="habit-list">
        {props.habits.map((habit) => (
          <HabitListItem
            key={habit.id}
            habit={habit}
            stats={props.habitStatsById[habit.id]}
            completions={props.completionsByHabitId[habit.id] ?? []}
            onDelete={props.onDeleteHabit}
            showChart={props.showChart}
          />
        ))}
      </ul>
    </section>
  )
}
```

**Why this is better**: list-level orchestration and item-level rendering are separated, so each component stays at one abstraction level.

---

### AR-004: Missing reusable page layout component

**Severity**: Medium
**Principle**: Missing Layout
**Location**: `src/App.tsx`, `src/pages/*.tsx`

Pages repeat shell primitives (`<div className="page">`, heading/intro structure, section framing), while app-level shell is split between `App.tsx` and each page. A dedicated layout component would centralize page skeleton and reduce duplication.

#### Current (Bad)

```tsx
// App.tsx
<>
  <NavBar userId={userId} email={email} />
  <main>
    <Routes>
      <Route path="/habits" element={<HabitsPage />} />
      {/* ... */}
    </Routes>
  </main>
</>

// pages/HabitsPage.tsx
<div className="page">
  <h1>My Habits</h1>
  {/* ... */}
</div>
```

#### Recommended (Good)

```tsx
// components/AppLayout.tsx
export function AppLayout({ title, subtitle, children }: Props) {
  const { userId, email } = useAuthStore()
  return (
    <>
      <NavBar userId={userId} email={email} />
      <main className="page">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {children}
      </main>
    </>
  )
}

// pages/HabitsPage.tsx
<AppLayout title="My Habits">
  <HabitForm ... />
  <HabitList ... />
</AppLayout>
```

**Why this is better**: page files become self-contained compositions with a single shared shell abstraction and less repeated structure.

---

### AR-005: Inconsistent callback API shape in checklist/list item rendering

**Severity**: Low
**Principle**: Poor Component API
**Location**: `src/components/DailyChecklist.tsx`, `src/components/HabitList.tsx`

Callbacks expose low-level primitives (`onToggle(habitId, date)`) and force child components to own date/habit lookup wiring. This leaks orchestration concerns downward and reduces readability in map/list rendering.

#### Current (Bad)

```tsx
interface DailyChecklistProps {
  date: string
  onToggle: (habitId: string, date: string) => void
}

<input
  type="checkbox"
  checked={isCompleted(habit.id)}
  onChange={() => onToggle(habit.id, date)}
/>
```

#### Recommended (Good)

```tsx
interface DailyChecklistProps {
  date: string
  onToggleHabit: (habitId: string) => void
}

<DailyHabitRow
  key={habit.id}
  habit={habit}
  checked={isCompleted(habit.id)}
  onToggle={() => onToggleHabit(habit.id)}
/>
```

**Why this is better**: child APIs express domain intent (`toggle habit`) instead of plumbing details, improving composability and testability.

---

## Recommendations Summary

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 1 | Move API calls out of `AuthPanel` into store/service-backed flow | Medium | High |
| 2 | Deprecate or align `useHabitTracker` with `services/api.ts` abstraction | Medium | High |
| 3 | Split `HabitList` into list + item/chart/action subcomponents | Medium | Medium |
| 4 | Introduce `AppLayout` and compose it inside each page | Medium | Medium |
| 5 | Simplify callback signatures to domain-level handlers | Low | Medium |

## Architecture Health Score

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| Single Level of Abstraction | 3 | Pages are mostly clean; list/checklist internals still mix levels |
| Component API Design | 3 | Typed props are good; several callbacks are low-level/plumbing-oriented |
| Data Flow Clarity | 3 | Zustand ownership is clear in app path, but mixed with component-local side effects |
| API Abstraction Layer | 2 | `services/api.ts` exists, but direct API calls remain in component/hook paths |
| App Layout / Shell | 3 | Global nav exists; reusable page shell abstraction is missing |
| Code Duplication | 3 | Some duplicated domain logic across store and legacy hook |
| Composition Patterns | 3 | Good decomposition in auth panel mode split, less so in list rendering |
| **Overall** | **3** | Solid base architecture with several high-value refactors to improve consistency |

