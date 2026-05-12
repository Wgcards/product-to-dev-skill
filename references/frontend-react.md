# Frontend React

## Project Rules

- Existing project wins: follow its framework, routes, request wrapper, state management, component library, mock convention, style tokens, auth, menu, and permission model.
- New SPA projects should use Vite + React + TypeScript unless the user or target repo requires another stack.
- For a new project from this skill folder, run:

```bash
python3 scripts/create_react_app.py /path/to/frontend --name "业务应用名称"
```

- After scaffolding, replace the template business language and mock data before polishing visual details.
- Keep page components as orchestration layers. Split reusable UI, service methods, mock data, types, formatters, and business constants.

## Interaction Requirements

Frontend output must be genuinely usable, not a static screenshot:

- Include realistic list, filter/search, create or edit, detail, status operation, confirmation, validation, feedback, loading, empty, and error behavior when relevant.
- Lists must support pagination or a clear bounded data set; long lists need pagination, virtualization, or `content-visibility`.
- Forms must include useful validation: required fields, length, amount, email, phone, enum values, date ranges, and cross-field rules when the domain requires them.
- Dangerous actions must show a confirmation before committing a mock or real state change.
- Status labels, enum mappings, money/date/file formatting, and risk tone mappings must be centralized.

## Data And Service Shape

- Frontend pages must not directly hardcode business records.
- Store mock business records in one file by default: `src/mocks/mock-data.ts`.
- Put API-facing methods in `src/services/` or the existing service directory.
- Put shared DTO/VO/frontend model types in `src/types/`.
- Keep TypeScript field names aligned with API docs and mock data.
- Keep service methods stable so real HTTP calls can replace mock internals without rewriting pages.
- Include `VITE_API_BASE_URL` support for real API switching even while mock mode is the default. In the bundled template, use `src/services/api-client.ts` and keep service method names unchanged.

## UI Direction

- For UI, UE, and UX design work, prefer the companion `ui-ux-pro-max` skill when it is installed. Use it to search product type, style, typography, color, chart, UX, and stack guidance before finalizing screens.
- If `ui-ux-pro-max` is not installed or not available in the current Codex session, continue with this file plus `design-direction.md`, state in the handoff that UI UX Pro MAX was unavailable, and tell the user to install it through their standard skill installation process. Do not include installation steps unless the user asks for them.
- Operational tools should open on the working surface, not a landing-page hero.
- Show current context, navigation, KPIs, workflow state, actionable lists, owners, freshness, and exceptions in the first screen.
- Use quiet hierarchy, stable dimensions, readable spacing, and one primary accent.
- Use icons from `lucide-react` for clear tool actions; keep labels for primary business commands.
- Avoid card mosaics. Use panels only for repeated entities, modals, framed tools, or clear interaction groups.
- Keep cards at 8px radius or less unless an existing design system says otherwise.

Read `design-direction.md` for landing page versus app choices, `tailwind-v4-system.md` for Tailwind v4 tokens, and `react-performance.md` when rendering cost or data fetching matters.

## TypeScript And Comments

- Use `interface` names with an `I` prefix.
- Use `type` aliases with a `T` prefix.
- Use React component names in PascalCase.
- Use normal files and directories in kebab-case unless the project already uses another convention.
- Add concise Chinese comments only where they help: mock replacement points, important TSX sections, complex business branches, service behavior, and non-obvious formatter logic.

## Verification

Run the available project checks after frontend changes:

- Install dependencies if needed.
- Run typecheck or build; common commands are `npm run typecheck`, `npm run build`, `pnpm build`, or the target repo's existing script.
- Start or preview locally when feasible.
- Inspect the UI in a browser or screenshot when the environment supports it.

If a check cannot run because dependencies, network, scripts, or project files are missing, state the exact reason in the final handoff.
