---
paths:
  - 'src/**/*.{ts,tsx,scss}'
status: adopted
---

### CONV-ARCH-01: Feature slices own everything for their domain under `src/features/<feature>/`.

- Colocate `components/`, `queries.ts`, `types.ts`; add `hooks/`, `services/`, `utils/` only when genuinely reusable.
- Top-level `hooks/`, `lib/`, `queries/`, `utils/` are for generic cross-feature code only.
- **Why:** Keeps domain change local and the shared layers small.
- **Enforced:** none

### CONV-ARCH-02: Routes wire loaders and search params and compose `features/`; domain data-fetching and non-trivial business logic live in the owning feature.

- Simple, general logic may stay inline; do not let heavy domain logic accumulate in routes.
- **Enforced:** none

### CONV-ARCH-03: `components/ui/` is domain-free and must never import from `@/features/**`.

- If a shared component needs app data: pass it as a prop, move it into the owning feature, or put it in a sibling `components/<group>/`.
- **Enforced:** lint (`app/ui-boundary`)

### CONV-ARCH-04: Sibling `components/<group>/` folders (e.g. `layout/`, `navigation/`, `errors/`) hold shared, app-aware components; create a new kebab-case group instead of forcing a component into `ui/`.

- **Enforced:** none

### CONV-ARCH-05: The app is RTL-first; direction is set once in `src/routes/__root.tsx` and styles use logical CSS properties.

- **Enforced:** none

### CONV-ARCH-06: Avoid `useEffect` when state can be derived during render or updates can be event-driven; use effects only to synchronize with external systems.

- **Why:** Derived state in effects causes extra renders and stale values.
- **Enforced:** partial (`eslint-plugin-react-hooks`)
