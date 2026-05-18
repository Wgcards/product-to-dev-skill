# Quality Tooling

## New Project Baseline

New React projects must generate:

- `eslint.config.mjs`
- `.prettierrc.cjs`
- `.prettierignore`
- `.editorconfig`
- `.commitlintrc.cjs`
- `.husky/pre-commit`
- `.husky/commit-msg`

Use ESLint flat config with `@eslint/js`, `typescript-eslint`, React Hooks rules, React Refresh or Vite React safety rules, and `eslint-config-prettier`.

New frontend projects default to `pnpm`; generated scripts, lockfile expectations, and scaffold next-step output must use pnpm commands. Existing projects keep their current package manager unless the user explicitly approves migration.

## Architecture Boundaries

ESLint must protect basic architecture boundaries where practical:

- `src/shared/**` must not depend on `src/app/**`, `src/pages/**`, or `src/features/**`.
- Business domains must not import each other casually; extract real cross-domain reuse into `shared` or document the module dependency.
- Page layers must not depend back on bootstrap/provider assembly details.
- Parent relative imports such as `../` and `../../../` are forbidden for application code. Allow only same-directory `./` imports; cross-directory imports must use the configured alias, and TypeScript plus build/test/lint tooling must share that alias configuration.

## Formatting

Prettier defaults:

```js
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
};
```

`.prettierignore` should cover `dist`, `.cache`, `.vite`, `coverage`, `node_modules`, `.husky/_`, and generated files.

`.editorconfig` should use UTF-8, LF, spaces, `indent_size = 2`, final newline, and trimmed trailing whitespace. Markdown may keep trailing whitespace.

## Commit Hooks

- Commitlint uses a conventional commits baseline.
- Husky `pre-commit` runs `lint-staged`.
- Husky `commit-msg` runs `commitlint --edit "$1"`.
- `lint-staged` should run ESLint fix and Prettier for JS/TS/TSX, and Prettier for CSS/HTML/JSON/Markdown/YAML.

## Scripts

New project `package.json` must include:

- `lint`
- `lint:fix`
- `lint-staged`
- `commitlint`
- `format`
- `format:check`
- `check`
- `prepare`

`check` should at least run lint, typecheck, and format check.

## Existing Projects

If an existing project already has quality tooling, prefer compatibility. If Husky, Commitlint, EditorConfig, or architecture boundaries are missing, decide by change scope whether to add them directly or ask the user to approve a broader tooling migration.
