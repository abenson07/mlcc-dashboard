# Dashboard design tokens

The admin shell follows a Mercury-style layout (type scale, spacing, surfaces) with a **Wise-inspired** brand accent: light lime green fills and deep forest green for emphasis and hover.

## Brand accent (CTA, links, charts, focus)

| Role | Hex | Usage |
|------|-----|--------|
| Primary accent | `#9fe870` | Default button fill, selected controls, chart primary, `brand-500` |
| Secondary / hover | `#054d28` | Hover and pressed states on primary actions, `brand-600` |
| **Text on light accent** | **`#163300`** | **Label and icon color when the background is `#9fe870` (the green is light — do not use white text; it fails WCAG contrast).** |
| Text on dark accent | `#ffffff` | When the background is `#054d28` or darker `brand-700+`, use white (or very light) foreground. |

Implementation: CSS variable `--color-mercury-on-accent` is `#163300`. Primary buttons and solid `brand-500` surfaces use `text-mercury-on-accent` by default and `hover:text-white` (or equivalent) when `hover:bg-brand-600` applies.

The lighter `brand-25`–`brand-400` ramp in `src/app/globals.css` is derived for tints, borders, and dark-mode translucent accents. Darker stops `brand-700`–`brand-950` extend from the hover green for focus rings, form borders in dark theme, and depth.

## Surfaces

| Token | Hex | Usage |
|-------|-----|--------|
| `mercury-bg` | `#ffffff` | Default page / header canvas |
| `mercury-sidebar-canvas` | `#fafafa` | Sidebar rail only |
| `mercury-surface` | `#ffffff` | Cards and panels |

## Reference in code

- Semantic tokens and full ramp: `src/app/globals.css` (`@theme`: `--color-mercury-primary`, `--color-brand-*`, `--color-mercury-on-accent`, `--color-mercury-sidebar-canvas`).
- Shared chart series colors: `src/lib/theme/chartDefaults.ts`.
