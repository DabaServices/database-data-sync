---
paths:
  - 'src/**/*.{ts,tsx}'
  - '*.ts'
status: adopted
---

### CONV-TS-01: Use strict TypeScript and avoid `any`.

- Respect `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, and `verbatimModuleSyntax`.
- **Enforced:** tsc + eslint

### CONV-TS-02: Use `import type` for type-only imports.

- **Enforced:** tsc (`verbatimModuleSyntax`)

### CONV-TS-03: Prefer `interface` for object-shaped contracts; use `type` for unions, tuples, primitives, and mapped or conditional types.

- **Enforced:** none
