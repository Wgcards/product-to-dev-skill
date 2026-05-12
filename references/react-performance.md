# React Performance Checklist

Use this checklist when adding data fetching, expensive rendering, heavy dependencies, or client-side interactions.

## Critical

- Start independent async work early and await with `Promise.all`.
- Avoid sequential waterfalls in route loaders, server actions, API handlers, and client hooks.
- Import directly from packages or files; avoid broad barrel imports for heavy libraries.
- Dynamically import rarely used heavy surfaces such as charts, editors, maps, exports, and admin-only tools.
- Keep static paths and imports analyzable.

## Server And Data

- Do not store request-specific mutable state in module scope.
- Authenticate server actions and route handlers like APIs.
- Deduplicate per-request reads with framework-supported caching when available.
- Pass minimal serialized data to client components.
- Model loading, error, empty, and stale states explicitly when switching from fixtures to real APIs.

## Client Rendering

- Derive state during render when possible instead of syncing with effects.
- Use functional `setState` when callbacks depend on previous state.
- Split hooks by dependency and responsibility.
- Use primitive dependencies in effects and memoization.
- Use refs for transient values that should not re-render the UI.
- Avoid defining components inside components.
- Do not memoize simple primitive expressions; reserve memoization for expensive work or stable child props.
- Use `startTransition` or deferred values for non-urgent expensive filtering and search.

## DOM And Interaction

- Use passive listeners for scroll and touch when adding global listeners.
- Deduplicate global listeners in shared hooks.
- For long lists, add pagination, virtualization, or `content-visibility` before shipping large DOM trees.
- Animate wrappers around complex SVGs instead of animating many SVG internals.
