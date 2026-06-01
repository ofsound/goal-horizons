# Goal Horizons

Goal Horizons is a React + Three.js goal planner that places goals on a visual time horizon. The app combines a 3D timeline scene with floating controls, a goal editor, category management, filters, simulated time controls, and local backup import/export.

## Tech Stack

- React 19 with TypeScript
- Vite 7
- Tailwind CSS 4
- Three.js with React Three Fiber and Drei
- Zustand for local app state and persisted settings/goals
- date-fns for date math
- Vitest + jsdom for unit tests

## Getting Started

Install dependencies:

```sh
npm install
```

Start the local dev server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview a production build:

```sh
npm run preview
```

## Quality Checks

Run lint:

```sh
npm run lint
```

Run tests:

```sh
npm test
```

Watch tests while developing:

```sh
npm run test:watch
```

## Project Structure

```text
src/
  components/
    3d/       Three.js scene, globe, billboards, camera behavior
    editor/   Goal editor, list, category manager
    ui/       Floating controls, filters, theme and time controls
  hooks/      Shared React hooks
  store/      Zustand stores for goals, settings, and UI state
  themes/     Theme configuration used by UI and 3D materials
  types/      Shared application types
  utils/      Date, globe, and import validation helpers
```

## State And Persistence

The app uses three Zustand stores:

- `goalStore`: goals, categories, filters, import/export helpers
- `settingsStore`: theme, horizon mode, curvature, grid, time simulation, camera rail
- `uiStore`: editor selection, hover state, and transient UI toggles

Goals and settings persist to browser storage with separate keys:

- `goal-horizons-goals`
- `goal-horizons-settings`

Backup imports are validated before they are accepted. The expected backup shape is:

```ts
{
  goals: Goal[];
  categories: Category[];
}
```

## Development Notes

- `npm audit fix` has been run and the current dependency tree reports zero known vulnerabilities.
- The production bundle currently emits Vite's large chunk warning because Three.js and React Three Fiber are bundled into the main app. Treat code splitting as a later performance pass rather than a correctness blocker.
- Tests currently focus on utility logic and store behavior. Add component or browser-level tests when changing interactive editor workflows or 3D rendering behavior.
