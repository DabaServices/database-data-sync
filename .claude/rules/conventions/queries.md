---
paths:
  - 'src/**/queries.ts'
  - 'src/queries/**'
  - 'src/features/**/*.{ts,tsx}'
  - 'src/routes/**'
status: adopted
---

### CONV-QRY-01: Export `queryOptions()` / `infiniteQueryOptions()` factories from `queries.ts` instead of hooks wrapping `useQuery`; consume them as `useQuery(myQueryOptions(...))`, never with inline `useQuery({ ... })` config.

- **Why:** Keys and fetchers stay reusable across hooks, loaders, and prefetching.
- **Enforced:** partial (`@tanstack/eslint-plugin-query`)

### CONV-QRY-02: Keep each query definition in the `queries.ts` of the feature that owns the resource; other features import it from the owner. Only genuinely cross-feature queries go in `src/queries/`.

- **Enforced:** none
