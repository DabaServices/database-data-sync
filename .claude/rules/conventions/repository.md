---
paths:
  - '**/*'
status: adopted
---

### CONV-REPO-01: Use relative imports with the `.ts` extension (`import { x } from './x.ts'`); there is no path alias.

- **Why:** `tsc` rewrites the extension on build and no alias exists at runtime.
- **Enforced:** tsc

### CONV-REPO-03: Name files and folders lowercase or camelCase (`syncTarget.ts`, `src/db/`); colocate tests as `<name>.test.ts`; name types and interfaces PascalCase.

- **Why:** Predictable paths let agents and humans locate code without searching.
- **Enforced:** none

### CONV-REPO-04: Keep code self-explanatory; comment only a non-obvious why, workaround, subtle contract, or intentional deviation.

- Do not add comments that restate the code, or docstrings on code you did not change.
- **Enforced:** none

### CONV-REPO-06: Prefer a direct optional property when a missing value and `undefined` have no meaningful distinction.

- Write `{ title?: string }`, not `{ title: string | undefined }`.
- **Enforced:** none

### CONV-REPO-07: Keep credentials, tokens, connection strings, and environment values out of source, instructions, skills, and docs; keep real `.env` files local and commit only `.env.example` with placeholders.

- **Why:** Anything committed or placed in agent-readable files leaks.
- **Enforced:** partial (`.env*` reads denied in `.claude/settings.json`)
