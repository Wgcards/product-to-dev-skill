# Quality Tooling

## New Project Baseline

New single-app React projects must generate:

- `eslint.config.mjs`
- `.prettierrc.cjs`
- `.prettierignore`
- `.editorconfig`
- `.commitlintrc.cjs`
- `.husky/pre-commit`
- `.husky/commit-msg`

Use ESLint flat config with `@eslint/js`, `typescript-eslint`, React Hooks rules, React Refresh or Vite React safety rules, and `eslint-config-prettier`.

New frontend projects default to `pnpm`; generated scripts, lockfile expectations, and scaffold next-step output must use pnpm commands. Existing projects keep their current package manager unless the user explicitly approves migration.

## Single App Versus Monorepo

- 单应用项目把质量工具链配置放在应用根目录，直接服务当前 app。
- Monorepo 项目把基础配置放在 workspace 根目录，`apps/*` 与 `packages/*` 继承根配置后按框架、runtime、测试环境或发布目标扩展。
- 新建 monorepo 时，根目录应提供 ESLint、Prettier、Commitlint、EditorConfig、lint-staged、Husky、TypeScript base config 和聚合 `check` 脚本。
- `apps/*` 不应复制一套完全独立的 ESLint/Prettier/Commitlint/EditorConfig；如果目标 app 必须偏离根配置，应在 app 级配置中只覆盖差异，并在 handoff 中说明原因。
- 可以按需要增加 `packages/eslint-config`、`packages/tsconfig` 或 `configs/*` 承载共享配置；不要为了目录完整创建空配置包。
- Monorepo 的根 `check` 应聚合 lint、typecheck、format check 和必要 contract check；每个 app/package 仍应保留可单独执行的窄验证命令。

## Architecture Boundaries

ESLint must protect basic architecture boundaries where practical:

- `src/shared/**` must not depend on `src/app/**`, `src/pages/**`, or `src/features/**`.
- Business domains must not import each other casually; extract real cross-domain reuse into `shared` or document the module dependency.
- Page layers must not depend back on bootstrap/provider assembly details.
- Parent relative imports such as `../` and `../../../` are forbidden for application code. Allow only same-directory `./` imports; cross-directory imports must use the configured alias, and TypeScript plus build/test/lint tooling must share that alias configuration.
- In monorepo projects, `packages/*` must not depend on `apps/*`, and cross-package imports should use package names plus `exports` paths instead of `../packages/...`.
- In shared packages with runtime folders, `src/client` must not import `src/server`, and `src/shared` must not import client-only or server-only APIs.
- SSR/BFF server-only helpers, Node APIs, secrets, gateway code, and server environment access must not be importable from browser app entries, Client Components, or shared UI client entries.

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

Single-app project `package.json` must include:

- `lint`
- `lint:fix`
- `lint-staged`
- `commitlint`
- `format`
- `format:check`
- `check`
- `prepare`

`check` should at least run lint, typecheck, and format check.

In monorepo projects:

- root `package.json` exposes aggregate scripts such as `lint`, `typecheck`, `format:check`, `check`, and package-manager-specific filtered commands.
- each `apps/*` package exposes app-local `dev`, `build`, `typecheck`, and mock/dev commands when applicable.
- each `packages/*` package exposes at least typecheck or build validation when it contains source code.
- if Turbo is introduced, the root scripts may delegate to Turbo, but the handoff must document why Turbo is needed and which tasks are cached.

## Existing Projects

If an existing project already has quality tooling, prefer compatibility. If Husky, Commitlint, EditorConfig, or architecture boundaries are missing, decide by change scope whether to add them directly or ask the user to approve a broader tooling migration.
