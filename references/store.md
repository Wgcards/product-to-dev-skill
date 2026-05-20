# Store Architecture

## Default Library

- New React projects default to `zustand` for shared frontend stores.
- Use `zustand/persist` only when state must survive reloads, browser restarts, or route re-entry.
- Do not use Zustand for simple local component state. Prefer `useState` or `useReducer` when state is owned by one component.
- Use React Context for component-subtree state that must be shared by a component and its children but is not global or domain-shared.

## Ownership Decision Order

Decide store ownership in this order:

1. If the state is used globally across app shell, request headers, many modules, routing, or cross-page UX, put it under `src/shared/store/`.
2. If global state has business meaning, split it by business concern. For example, `cartStore` and `wishlistStore` must be separate stores even though both are global.
3. If global state is not business data, group it by runtime responsibility instead of creating a catch-all store:
   - `sessionStore`: auth token, current user summary, login/session status.
   - `preferenceStore`: locale, currency, theme, display preferences.
   - `runtimeStore`: non-persisted app runtime flags, current environment state, short-lived shell state.
4. If the state is shared only inside one business domain, put it under `src/features/<module>/store/` and name it by business meaning.
5. If the state is shared only inside one component tree, do not create a Zustand store. Use local state or React Context.

## Global Stores

- Global stores live in `src/shared/store/`.
- Split global business stores by business property or aggregate, such as `cartStore`, `wishlistStore`, `notificationStore`, or `workspaceStore`.
- Do not merge unrelated business concerns into a generic `publicStore`, `globalStore`, or `commonStore`.
- Non-business global stores may be grouped by platform responsibility, such as session, preferences, runtime, or layout shell.
- State that is used by most modules can still be global even when it has business meaning. The deciding factor is usage scope, then business ownership.

## Feature Stores

- Feature stores live in `src/features/<module>/store/`.
- Use feature stores for state shared by multiple pages, views, or components inside the same business domain.
- Examples: product-module viewed-history state, shared filters for product list/detail, domain draft state, selected records, and domain workflow UI state.
- If a feature store becomes a stable dependency of multiple business domains, reassess whether it should move to `src/shared/store/` and be renamed by its business ownership.

## Component State And Context

- Component-private state stays in the component through `useState` or `useReducer`.
- Component-subtree state shared by a component and its children should use React Context before Zustand.
- This keeps reusable components portable because their internal coordination can be extracted with the component.
- Generic reusable components must not read application stores directly. They receive data, callbacks, and flags through props or context owned by the component package.
- Business components may call the matching global or feature store directly, but complex screens should prefer a business hook or container that aggregates store data before passing props to presentation components.

## Persistence Rules

- Persist only state with a clear reload-survival requirement.
- Locale, currency, theme, collapsed navigation, and other user preferences are good persist candidates.
- Persisting tokens is a project security decision. If allowed, persist only the minimal token/session identifier, clear it on logout, and avoid persisting sensitive user details.
- Do not persist server caches, large API responses, form drafts with sensitive data, or short-lived loading/error states unless the business explicitly requires recovery.
- Use versioned persist config or migration logic when persisted state shape can change.

## APIClient Runtime Context

- APIClient must not read scattered `localStorage` keys directly for auth, locale, currency, tenant, merchant, or workspace context.
- APIClient should read request context from store getters or small non-React accessors backed by the relevant stores.
- APIClient must inject `authorization` from session state when a backend token exists.
- APIClient must inject `Accept-Language` from the current locale/preference state when backend i18n is part of the contract.
- Tenant, organization, merchant, workspace, currency, or data-scope headers should be added from their owning stores only when the business contract requires them.
- APIClient and other non-React modules must not call React hooks. Use Zustand `store.getState()` or exported getter functions.

## Anti-Patterns

- A single global store containing session, locale, cart, wishlist, modal state, filters, and server responses.
- A feature store used as a hidden cross-domain dependency.
- A generic UI component importing `cartStore`, `sessionStore`, or any project-specific store.
- Persisting every store by default.
- Duplicating server data into Zustand just because it is returned by an API.
- APIClient building headers from ad hoc localStorage reads while the same data also exists in stores.
