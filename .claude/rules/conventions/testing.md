---
paths:
  - 'src/**/*.{spec,test}.{ts,tsx}'
status: adopted
---

### CONV-TEST-01: Every behavior change gets a regression test written first.

- Configuration, schema, and wiring changes may be tested after implementation.
- **Enforced:** none

### CONV-TEST-02: Test observable behavior (rendered output, calls at boundaries), not implementation details.

- Cover credible regressions, not every branch.
- Prefer accessible queries in order: `getByRole`, then `getByLabelText`, then `getByText`; avoid test ids and internals.
- **Enforced:** none

### CONV-TEST-03: Colocate tests next to the code as `*.test.ts(x)`.

- **Enforced:** none
