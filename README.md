# Habit Tracker – Project 2 Foundation

A Habit Tracker app for tracking daily habits with streaks, frequencies, and statistics. This repository contains the **Project 2: App Foundation** setup: TypeScript types, React Router, and initial page components.

## Theme

**Habit Tracker** (from APP_THEMES.md). I chose this theme because:

- **State management**: Habits, completions per day, and derived stats (streaks, completion rate) give interesting state interactions and possible persistence (e.g. localStorage or API).
- **Logic complexity**: Streak calculation, frequency rules (daily / weekdays / custom days), and streak freeze are non-trivial business rules beyond simple CRUD.
- **Motivation**: Building a personal habit tracker is engaging and the feature set (streaks, filters, archives) is well-scoped for the semester.

## How to Run

```bash
npm install
npm run server   # start backend on http://localhost:4000
npm run dev      # start frontend on http://localhost:5173
```

Then open the URL shown in the terminal (e.g. `http://localhost:5173`). Use the navigation links (Home, Habits, Daily) to move between pages.

## Project Structure

```
project2Frontend/
├── src/
│   ├── types.ts       # TypeScript type definitions (entities, unions, app state)
│   ├── main.tsx       # Entry point; wraps <App /> in <BrowserRouter>
│   ├── App.tsx        # <Routes> and <Route> definitions; top-level <Link> nav
│   └── pages/
│       ├── HomePage.tsx
│       ├── HabitsPage.tsx
│       └── DailyPage.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Type Definitions (`src/types.ts`)

- **Core entities**: `Habit`, `HabitCompletion`, `HabitStats`
- **Union types**: `HabitFrequency` ('daily' | 'weekdays' | 'custom'), `HabitCategory`, `DayOfWeek`
- **State type**: `AppState` (habits, completions, habitStats arrays)

These types support the planned features: create/edit/archive habits, mark completions per day, compute streaks and completion rate, and filter by category/frequency.

## Verification

- **TypeScript**: Run `tsc --noEmit` (no errors).
- **Dev server**: Run `npm run dev` and confirm the app loads; test every route (Home, Habits, Daily) via the navigation links.

## Project 3: Custom Hook

For Project 3, the app adds a custom hook that manages the habit tracker state and exposes typed operations plus tests for core behaviors.

### Hook Operations

The hook is implemented in `src/hooks/useHabitTracker.ts` and returns:

1. `addHabit` – creates a new habit with name, category, and frequency and appends it to state.
2. `archiveHabit` – marks a habit as archived without removing it from history.
3. `deleteHabit` – removes a habit and all of its completion records.
4. `toggleCompletionForDate` – toggles whether a habit is completed on a specific date.
5. `setCompletionForDate` – explicitly sets completed/ not completed for a given habit and date.
6. `resetAll` – clears all habits, completions, and stats back to an empty state.

All updates are immutable and the hook recomputes `habitStats` (streaks, completion rate, totals) whenever relevant data changes.

The hook also:

- Loads initial state from a small Express backend (`GET /api/state`).
- Saves every change to that backend (`POST /api/state`) and mirrors it in `localStorage` as a fallback.

### Running Tests

```bash
npm install
npm run test
```

### Test Coverage

The tests live in `src/hooks/useHabitTracker.test.ts` and cover:

- Initial empty state when no initial data is provided.
- Adding a new habit and verifying its default values.
- Archiving a habit and keeping the rest of the state intact.
- Toggling completion for a habit on a specific date.
- Updating streak and completion statistics when completions change.
- Edge case: calling operations with an unknown habit ID does not change state.

## AI Usage

- Type definitions were designed with AI assistance (generating interfaces and union types from the theme description).
- Router setup and page scaffolding (file structure, Routes, Link navigation) were generated with AI; structure and naming were reviewed for consistency with the project requirements.
- For Project 3, AI was used to help design the `useHabitTracker` hook API, implement immutable state updates, scaffold Vitest/@testing-library tests, and refine documentation. All code and tests were reviewed and understood before inclusion.

## Project 5: End-to-End Assembly with Persistence

### Backend choice

**Custom Express backend + file-based persistence** (`server/index.js` + `server/state.json`) because it is the simplest way to get real, user-specific persistence working end-to-end without introducing a third-party platform.

### Authentication approach

**Email/password auth** via backend endpoints (`POST /api/register`, `POST /api/login`). The frontend persists the session in `localStorage` via `src/store/authStore.ts` so auth survives reload.

### Feature verification table

| Feature | UI trigger | Visible result | Persists after reload |
|---|---|---|---|
| Register account | Home → Register form → submit | Shows signed-in email | Yes |
| Log in | Home → Log in form → submit | Shows signed-in email | Yes |
| Log out | Home/Settings → Log out | Returns to signed-out state | Yes |
| Add habit | Habits → Add habit form | Habit appears in list | Yes |
| Delete habit | Habits → Delete button | Habit disappears | Yes |
| Toggle completion | Daily → Toggle checkbox/button | Completion changes + stats update | Yes |
| Load persisted data | Refresh page after changes | State restored for user | Yes |

### How to run

```bash
npm install
npm run server
npm run dev
```

