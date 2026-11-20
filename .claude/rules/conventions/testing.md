---
paths:
  - 'src/**/*.test.ts'
status: adopted
---

### CONV-TEST-01: Every behavior change gets a regression test written first.

- Configuration, schema, and wiring changes may be tested after implementation.
- **Enforced:** none

### CONV-TEST-02: Test observable behavior at boundaries (SQL statements issued, commit or rollback, results, exit status) using `createFakeDatabase`; no real database in unit tests.

- Cover credible regressions, not every branch.
- **Enforced:** none

### CONV-TEST-03: Colocate tests next to the code as `*.test.ts`.

- **Enforced:** none
