# Tailwind V4 System

## Setup

Use CSS-first Tailwind v4 configuration:

```css
@import "tailwindcss";

@theme {
  --color-background: oklch(99% 0.01 95);
  --color-foreground: oklch(18% 0.02 255);
}

@custom-variant dark (&:where(.dark, .dark *));
```

For Vite, use `@tailwindcss/vite` in `vite.config.ts`.

## Token Rules

- Define semantic tokens in CSS with `@theme`; avoid reintroducing `tailwind.config.ts` unless a legacy project requires it.
- Use OKLCH for color tokens when authoring a new system.
- Keep component classes semantic: `bg-background`, `text-foreground`, `border-border`, `bg-primary`.
- Use one primary accent, plus restrained state colors for success, warning, danger, and info.
- Keep radii at 8px or less for routine app UI unless brand direction explicitly differs.

## Component Rules

- Prefer small reusable primitives only when the project will use them more than once.
- Use `class-variance-authority` only when variants are repeated enough to justify the dependency.
- Keep simple business prototypes dependency-light; inline Tailwind classes are acceptable when the component is not part of a reusable library.
- Store shared class merging in `cn()` only when both `clsx` and `tailwind-merge` are installed.

## Dark Mode

Use class-based dark mode with:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Add a theme toggle only when requested or when dark mode is part of the product requirement. Otherwise keep tokens ready but avoid extra UI.

## Migration Notes

- Replace `@tailwind base/components/utilities` with `@import "tailwindcss"`.
- Replace `theme.extend` color/radius tokens with CSS variables inside `@theme`.
- Replace plugin animation defaults with CSS keyframes and `--animate-*` tokens.
