---
paths:
  - '**/*'
status: adopted
---

### CONV-REPO-01: Use the `@/` alias for imports from `src/`; use relative imports only within the same feature.

- **Why:** Stable paths survive moves; relative paths across features hide coupling.
- **Enforced:** none

### CONV-REPO-02: Never edit `src/routeTree.gen.ts`; regenerate it with `pnpm generate-routes`.

- **Why:** It is generated and overwritten by the router plugin.
- **Enforced:** partial (readonly in VS Code, ignored by prettier)

### CONV-REPO-03: Name things by kind: component folders and feature folders kebab-case; component files, styles, and exports PascalCase; hooks camelCase with `use`; utilities and services camelCase; route files kebab-case with `$` params; types PascalCase.

- Examples: `components/ui/button/Button.tsx`, `Button.module.scss`, `useDebounce.ts`, `features/home-actions/`, `processes.$name.tsx`.
- **Why:** Predictable paths let agents and humans locate code without searching.
- **Legacy (don't copy):** `src/components/ui/Button/` (PascalCase folder).
- **Enforced:** none

### CONV-REPO-04: Keep code self-explanatory; comment only a non-obvious why, workaround, subtle contract, or intentional deviation.

- Do not add comments that restate the code, or docstrings on code you did not change.
- **Enforced:** none

### CONV-REPO-05: Prefer Remeda helpers (`mapValues`, `mapToObj`, `groupBy`, `pipe`, `isString`) over manual boilerplate such as `Object.fromEntries(Object.entries(...).map(...))`.

- Use native methods when they are clearer.
- **Why:** Less noise, not a functional style for its own sake.
- **Enforced:** none

### CONV-REPO-06: Prefer a direct optional property when a missing value and `undefined` have no meaningful distinction.

- Write `{ title?: string }`, not `{ title: string | undefined }`.
- **Enforced:** none

### CONV-REPO-07: Keep credentials, tokens, and environment values out of source, instructions, skills, and docs; keep real `.env` files local and commit only `.env.example` without secrets.

- **Why:** Anything committed or placed in agent-readable files leaks.
- **Enforced:** partial (`.env*` reads denied in `.claude/settings.json`)
