# Common Components

Reusable design-system building blocks for the CodeMind UI live here.

## Guidelines

- Components should stay below 100 lines whenever practical.
- Components should support CodeMind's premium developer-tool identity.
- Components should be composable — small, focused, and easily combined.
- Use Tailwind CSS for all styling.

## Components

| File | Description |
|---|---|
| `PageShell.tsx` | Dark gradient full-screen page wrapper with radial glow and grid overlay |
| `Panel.tsx` | Reusable card/panel container with rounded border and subtle shadow |
| `Badge.tsx` | Small label badge — variants: `default` (indigo), `accent` (violet), `muted` |
| `StatusPill.tsx` | Status indicator pill — states: `checking`, `connected`, `error`, `idle` |
| `SectionHeader.tsx` | Reusable section title block with optional eyebrow and description |
