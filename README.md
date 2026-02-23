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
npm run dev
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

## AI Usage

- Type definitions were designed with AI assistance (generating interfaces and union types from the theme description).
- Router setup and page scaffolding (file structure, Routes, Link navigation) were generated with AI; structure and naming were reviewed for consistency with the project requirements.
