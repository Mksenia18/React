## App Overview

Habit Tracker app that helps a user track recurring habits, mark them complete for specific days, and see streaks and completion statistics.

Core entities (defined in `src/types.ts`):

- `Habit` – a single habit with name, category, target frequency, streak freeze, archived flag, and timestamps.
- `HabitCompletion` – a record of whether a habit was completed for a given date.
- `HabitStats` – derived statistics per habit (current/longest streak, completion rate, totals).
- `AppState` – collections of these entities for the whole app.

Tech stack: React + TypeScript (strict), Vite, React Router, Vitest + @testing-library/react, Express backend for simple persistence.

## State Management Approach

Shared app state is managed with **Zustand** in a single store:

- Main store hook: `src/store/habitStore.ts` (`useHabitStore`).
- The store holds the domain state (`habits`, `completions`, `habitStats`) plus `loading` and `error`.
- Zustand was chosen over Redux Toolkit / Jotai / Context because:
  - It has minimal boilerplate and a simple mental model (just hooks).
  - Fits the size of this app better than Redux Toolkit, while still scaling better than bare Context.
  - Allows us to keep domain logic close to the state without complex setup.

Local UI and form state (input fields, filters, etc.) stay in `useState` inside components; routing is handled by `react-router-dom`.

## State Shape

The complete TypeScript type for the store lives in `src/store/habitStore.ts`:

```ts
import type {
  AppState,
  DayOfWeek,
  Habit,
  HabitCategory,
  HabitCompletion,
  HabitFrequency,
  HabitStats,
} from '../types'

export interface HabitStoreState extends AppState {
  loading: boolean;
  error: string | null;
  addHabit: (input: {
    name: string;
    category: HabitCategory;
    targetFrequency: HabitFrequency;
    customDays?: DayOfWeek[];
    streakFreezeDays?: number;
  }) => void;
  toggleCompletionForDate: (habitId: string, date: string) => void;
}
```

Key points:

- `AppState` contains the domain collections; the store extends it with `loading`/`error` for async operations.
- Store operations (`addHabit`, `toggleCompletionForDate`) update state immutably and recompute `habitStats`.

## API Conventions

All backend interactions go through `src/services/api.ts`:

- Interface:
  - `HabitBackendState` – `{ habits: Habit[]; completions: HabitCompletion[] }`.
  - `HabitApi` – `{ loadState(): Promise<HabitBackendState>; saveState(state): Promise<void> }`.
- Implementation: `habitApi` uses **`fetch`** and the Express backend endpoints:
  - `GET /api/state` – returns current `habits` and `completions`.
  - `POST /api/state` – saves `habits` and `completions`.
- The Vite dev server proxies `/api` to `http://localhost:4000` (see `vite.config.ts`).
- Backend base path is configured in `src/services/api-config.ts` as `API_BASE`.

When adding new server operations:

- Extend `HabitApi` with new methods.
- Implement them in `habitApi` using `fetch` and the appropriate `/api/...` endpoints.
- Call them from the store or custom hooks; do not call `fetch` directly from page components.

## File Structure

High-level layout:

- `src/types.ts` – domain types (`Habit`, `HabitCompletion`, `HabitStats`, `AppState`).
- `src/store/habitStore.ts` – Zustand store (`HabitStoreState`, `useHabitStore`).
- `src/services/api.ts` – API interface and `habitApi` implementation.
- `src/hooks/useHabitTracker.ts` – custom hook from Project 3 (still valid for tests and examples).
- `src/pages/` – page components:
  - `HomePage.tsx` – overview.
  - `HabitsPage.tsx` – uses `useHabitStore` to add/list habits and show stats.
  - `DailyPage.tsx` – uses `useHabitStore` to show today’s checklist and toggle completion.
  - `SettingsPage.tsx` – account page with logout.
  - `AboutPage.tsx` – project overview and “Assemble First” explanation.
- `server/index.js` – Express backend with file-based persistence (`server/state.json`).

Naming:

- Stores live under `src/store/` and are named `*Store.ts`.
- Service/API modules live under `src/services/` and are named by domain (here `api.ts`).
- Domain types live in `src/types.ts` and are reused everywhere.

## Adding New Features

When adding a new domain operation or feature, follow this step-down template:

1. **Update domain types** (`src/types.ts`):
   - Add or adjust interfaces/unions as needed (e.g., new field on `Habit` or a new entity).
2. **Extend the store** (`src/store/habitStore.ts`):
   - Update `HabitStoreState` with any new fields or operations.
   - Implement operations using immutable updates and reuse `recalculateStats` when relevant.
3. **Update the API layer** (`src/services/api.ts`):
   - Extend `HabitApi` with new methods if backend support is required.
   - Implement them in `habitApi` using `fetch` and the appropriate `/api/...` endpoints.
4. **Wire to the UI**:
   - Use `useHabitStore` in the relevant page/component to call the new operations.
   - Keep components focused on presentation and event wiring; avoid inline business logic.
5. **Add tests**:
   - For store logic, add or extend tests using Vitest and @testing-library/react hooks utilities.
   - Cover both normal and edge cases (e.g., unknown IDs, empty arrays).

Always keep updates immutable, respect the existing state shape (`loading`, `error`), and avoid calling `fetch` directly from components.

## Project 5 Notes (End-to-End Assembly)

- Backend choice: **custom Express API** with file persistence (`server/state.json`).
- Auth: `src/store/authStore.ts` uses `authApi` in `src/services/api.ts`, and persists session in `localStorage`.
- Routing: all pages must be reachable via navigation links (no typing URLs).
- Convention: components/hooks should never call `fetch` directly; they must use `src/services/api.ts`.

## Agent Instructions for Habit Tracker Repo

These instructions are for AI coding assistants working in this repository.

### Tech Stack

- React + TypeScript (strict).
- Vite for bundling/dev server.
- Vitest + @testing-library/react for tests.
- React Router for navigation.

### Code Style and Structure

- Use **TypeScript everywhere** for app code (`.ts` / `.tsx` only, no `.js` / `.jsx`).
- Prefer **small, focused components** over large pages with raw HTML:
  - Extract presentational pieces into reusable components when JSX starts to grow.
  - Keep page components as compositions of these abstractions, not walls of HTML/CSS.
- Use **function components + hooks** only (no class components).
- All state that is shared across multiple pages should live in **custom hooks** or higher-level components, not scattered `useState` calls.
- Keep CSS in dedicated files (e.g. `App.css`), no inline styles or ad-hoc `<style>` tags in components.

### State Management and Persistence

- The central domain is the Habit Tracker:
  - Core types live in `src/types.ts` (`Habit`, `HabitCompletion`, `HabitStats`, `AppState`, etc.).
  - The main stateful hook is `src/hooks/useHabitTracker.ts`.
- When updating state:
  - Always use **immutable updates** (`setState(prev => ...)`, array spreads, object spreads).
  - Never mutate arrays/objects in place (no `push`, `splice`, direct property assignments on existing objects).
- Persistence:
  - Local, browser-based persistence is done via `localStorage` inside `useHabitTracker`.
  - When adding new fields that belong to `AppState`, make sure they are:
    - Included in the `AppState` type.
    - Loaded/saved in the persistence layer (currently `localStorage`).
    - Covered by tests when behavior is non-trivial.
- Future server persistence (Node backend or BaaS like Firebase) should:
  - Keep the **hook API stable** (`useHabitTracker` remains the main entrypoint).
  - Move side effects (network calls) into the hook or dedicated service layer.

### Testing

- Use **Vitest** as the test runner (`npm run test`).
- For React hooks/components, use `@testing-library/react`:
  - `renderHook` + `act` for hooks.
  - `render`, `screen`, and user events for components.
- Every custom hook should have:
  - Tests for happy path behavior.
  - At least one edge-case test (empty state, invalid input, unknown IDs, etc.).
- Keep tests deterministic:
  - Avoid real timers and real network calls; mock or abstract as needed.

### Step-Down Rule

When implementing features, follow a **step-down** approach:

1. **High-level intent**: Start with the top-level behavior (what the feature should do in user terms).
2. **Domain layer**: Express that behavior in domain concepts defined in `types.ts` and hooks like `useHabitTracker`.
3. **Implementation details**: Only then drop down into low-level implementation (loops, conditionals, exact JSX structure).

Corollaries:

- Do not start by wiring buttons and raw HTML; first think in terms of domain operations (e.g. “add habit”, “toggle completion for date”).
- Page components should read like a storyboard of domain operations and UI sections, not as low-level layout code.

### What Not to Do

- Do not introduce new frameworks or state managers (no Redux, MobX, etc.) without a strong reason.
- Do not add untyped or `any`-heavy code; if typing is tricky, improve the type definitions instead.
- Do not break existing tests; if behavior must change, update tests alongside the implementation, with clear rationale.
- Do not perform destructive git operations (rebase -i, force-push to main) unless the user explicitly asks for it.

