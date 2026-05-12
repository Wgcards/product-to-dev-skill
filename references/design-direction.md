# Design Direction

## Companion Skill

Frontend UI, UE, and UX design should use `ui-ux-pro-max` when the skill is installed. The downstream design workflow should search product, style, typography, color, UX, chart, and stack guidance before settling on layout, tokens, and interaction patterns.

If `ui-ux-pro-max` is unavailable, use the defaults below as a local fallback and tell the user to install UI UX Pro MAX through their standard skill installation process. Do not include installation steps unless the user asks for them.

## App UI Defaults

For dashboards, CRM, workflow, admin, finance, operations, and internal tools:

- Start with the working surface, not a landing-page hero.
- Use quiet hierarchy, dense but readable spacing, and one clear accent.
- Show status, freshness, owners, risk, and next actions near the top.
- Prefer sections, tables, lists, segmented controls, tabs, and inspectors over decorative cards.
- Use cards only for repeated entities, modals, or interaction frames.
- Keep headings factual: "Pipeline", "Approvals", "Open risks", "This week", "At-risk accounts".

## Landing Or Brand Pages

Use a more expressive direction only when the user asks for a website, landing page, product page, campaign page, or visual demo.

- Make brand or product name the first-viewport signal.
- Use one dominant visual anchor or full-bleed scene.
- Keep the hero edge-to-edge; constrain inner text rather than boxing the whole hero.
- Do not use hero cards, stat strips, logo clouds, or generic SaaS card grids by default.
- Keep copy short and let sections each do one job: explain, prove, deepen, convert.

## Motion

Use motion when it improves orientation:

- Entrance: reveal the primary workspace or hero content once.
- Interaction: hover, focus, selected state, drawer, filter, or row expansion.
- Progression: scroll-linked or sticky storytelling only for visual pages.

Prefer CSS transitions for routine app UI. Add Framer Motion only when the project already uses it or the requested motion is central to the experience.

## Visual Checks

Before finishing:

- Ensure text does not overflow buttons, tabs, cards, or mobile columns.
- Ensure controls keep stable dimensions during hover, loading, empty, and filtered states.
- Ensure the palette does not collapse into one hue family.
- Ensure the first viewport communicates the product or workspace without reading long body copy.
