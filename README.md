# Live URL: https://YOUR-FRONTEND-URL.vercel.app

# Habit Tracker – Final Project

A Habit Tracker app for tracking daily habits with streaks, frequencies, and statistics. Auth and data use **Firebase** (Authentication + Firestore).

## Firebase setup (required)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Enable **Firestore Database** (start in production mode, then deploy rules from `firestore.rules`).
4. Register a **Web app** and copy the config into `.env` (see `.env.example`). All keys must be prefixed with `VITE_` for Vite.
5. Deploy Firestore rules (CLI or Console): only `users/{uid}/habits/*` and `users/{uid}/completions/*` are used.

## Deploy frontend (e.g. Vercel)

1. Import this repo and set **Environment Variables** to match `.env.example` (`VITE_FIREBASE_*`).
2. Build: `npm run build`, output directory: `dist`.
3. Put your public app URL on line 1 of this README.

### Optional legacy server

The `server/` Express app is **not** used by the main UI when Firebase is configured. You can ignore it for deployment.

### Quick Host Setup

- **Frontend (Vercel/Netlify)**: build command `npm run build`, output `dist`
- **Data + auth**: Firebase Firestore + Firebase Auth

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

The hook also persists to **browser `localStorage`** for tests and demos. The live app uses **`useHabitStore` + Firebase Firestore** for cloud sync.

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

**Firebase Authentication + Cloud Firestore** for per-user habits and completions. Rules live in `firestore.rules`.

### Authentication approach

**Email/password** via Firebase Auth (`src/store/authStore.ts`). Sessions are restored automatically by the Firebase client SDK.

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

