# Frontend Architecture

## Existing Projects

- Identify the current framework, UI library, request wrapper, mock system, env files, i18n, route/menu/auth model, and directory layout before changing code.
- If the current project does not match the new standard, explain the difference and ask before reshaping directories, dependencies, scripts, config, or request flow.
- Mature existing UI libraries and request wrappers win unless the user approves migration.
- After a user declines migration in one project, keep using that project's current convention for similar follow-up work unless the user explicitly reopens the decision.

## New Project Layout

New React projects should use this layout unless the user specifies another one:

```text
src/
  app/                  # app bootstrap, providers, router, runtime for shared, or top-level layout
  features              # business scope
    /<module>/          # pages, components, hooks, service, constants for one domain
      tools/            # tools for domain
      components/       # components for domain
      types/            # typescript types for domain
      hooks/            # hooks for domain
      store/            # store for domain
      view/             # child view for domain
        ...             # structure like feature module
      index.tsx         # domain entry component
  shared/
    tools/              # APIClient, pure functions, class, and business-agnostic helpers
    config/             # common config
    hooks/              # common react hooks
    store/              # global store
    components/         # ui components
    ...                 # other type tools
  types/
    dto/                # API DTO interfaces and type aliases
    enum/               # typescript enum
    ...                 # other typescript types
  locale/               # i18next setup and locale dictionaries
    zh-CN.json          # zh-CN material
    en-US.json          # en-US material
    ...                 # other language material
```

Do not create empty directories just to make the tree look complete.

Use each folder by ownership, not by file extension alone:

- `app/` owns runtime wiring: provider composition, route/bootstrap entry, top-level layouts, and app shell code that is not a business domain.
- `features/<module>/` owns one business domain. Domain pages, domain components, domain hooks, domain services, domain constants, domain stores, and domain-only tools stay together.
- `features/<module>/view/` is only needed when a domain has nested child views or sub-flows with their own internal structure.
- `shared/` is for cross-domain capabilities that have already proven reusable. Do not move one-off business code into `shared` just because it looks generic.
- `types/dto/` is for API contract DTOs. Domain-only UI types should stay inside `features/<module>/types/`.

## APIClient

- New projects must use `src/shared/tools/APIClient` as the only request entry.
- Pages, components, hooks, and services must not call `fetch` directly or build base URLs themselves.
- APIClient handles base URL selection, path joining, `authorization`, JSON body, `Content-Type`, timeout, HTTP non-2xx, `code !== "200"`, network errors, and a consistent error object or message.
- Use env vars to choose mock, dev, test, or prod services; do not scatter service URLs through components.

## Stores

- New React projects use `zustand` for frontend stores.
- Put truly global UI/runtime state in `src/shared/store/`, such as app shell preferences, global search text, current workspace selection, or user-facing runtime flags.
- Put domain state in `src/features/<module>/store/`, such as filters, selected records, draft dialog state, or workflow UI state for that domain.
- Keep server data in request hooks or query libraries unless the state must be shared as editable client state across distant components.
- Do not split a domain into many tiny stores for every field. A domain store should group closely related UI state.
- Do not let one store own unrelated concerns. If a store starts mixing global app state, multiple domains, API cache, form drafts, and modal state, split by responsibility.
- Store actions should be small and semantic, such as `setKeyword`, `setStatus`, `openActionDialog`, and `closeActionDialog`; avoid exposing raw multi-purpose setters as the only API.

## Feature Hooks

- Each business domain may have `features/<module>/hooks/` when there is real domain logic to share.
- Domain request hooks such as `useItems` or `useSampleDashboard` must call APIClient through the domain service layer and expose at least `data`, `loading`, and `error`.
- Add `refetch`, `mutate`, or `reset` only when the business flow needs them.
- Hooks must follow single responsibility. Do not combine unrelated concerns into names such as `useHttpDebounce`; implement independent primitives such as `useHttp` and `useDebounce`, then compose them inside the domain only when a real flow needs both.
- Put cross-domain primitive hooks in `src/shared/hooks/`; put business-specific orchestration hooks in `src/features/<module>/hooks/`.

## DTOs And Types

- Put API DTOs in `src/types/dto/`.
- `interface` names use `I` prefix; `type` aliases use `T` prefix.
- DTO fields must match OpenAPI schemas, API docs, Prism examples, and service payloads.
- Do not use OpenAPI DTO generation by default; hand-write DTOs from the contract and business semantics.

## Component Split Rules

- Components, hooks, methods, stores, and tools must follow single responsibility.
- Page components orchestrate data loading, business sections, Dialog/Drawer state, and Snackbar coordination.
- Business components render domain behavior and interaction, but do not know APIClient details.
- Keep constants and enum label maps inside the feature `constants` directory unless they are truly cross-domain.
- Do not extract a single-use static JSX fragment under 20 lines without independent business meaning.
- Around 300 lines, evaluate whether to split business sections, forms, tables, Dialogs, state operations, or hooks.
- Above 500 hand-written lines, split unless it is generated code or the user explicitly wants one file.
