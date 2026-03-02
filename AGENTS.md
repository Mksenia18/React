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

