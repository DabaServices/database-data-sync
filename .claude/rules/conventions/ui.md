---
paths:
  - 'src/components/**'
  - 'src/theme/**'
  - 'src/**/*.scss'
  - 'src/**/*.tsx'
status: adopted
---

### CONV-UI-01: Build interactive controls on Base UI primitives; add Reshet UI components with `pnpm dlx shadcn@latest add @reshet-ui/<name>` and read the `reshet-ui` skill first.

- Registry configuration is in `components.json`.
- **Enforced:** none

### CONV-UI-02: Use CSS custom properties from `src/theme/` instead of hardcoded colors, sizes, or spacing.

- Tokens use OKLCH and switch light/dark through `data-theme` on `<html>`. See the `oklch-skill` for color work.
- **Enforced:** partial (stylelint)

### CONV-UI-04: Colocate a `*.stories.tsx` file with each `components/ui/` component; skeleton loaders use `*.Skeleton.tsx`.

- **Enforced:** none

### CONV-UI-05: Compose multiple or conditional `className` values with `clsx()`.

- **Enforced:** none

### CONV-UI-06: Express component state used for styling with data attributes (`data-state`, `data-disabled`) rather than conditionally added state classes.

- Base UI already exposes state through data attributes; style those.
- **Enforced:** none

### CONV-UI-07: Generate skeleton placeholder sequences with Remeda's `range(0, count)`.

- **Enforced:** none
