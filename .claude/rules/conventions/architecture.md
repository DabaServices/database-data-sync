---
paths:
  - 'src/**/*.ts'
status: adopted
---

### CONV-ARCH-01: `src/index.ts` only wires config, runs the sync, and sets the exit code; logic lives in `config/`, `db/`, `sync/`, and `log.ts`.

- **Enforced:** none

### CONV-ARCH-02: Production is read-only: the source database is used only inside a `READ ONLY` transaction and for `COPY (SELECT ...) TO STDOUT`; writes go only to targets.

- **Why:** The job must never be able to modify production.
- **Enforced:** none

### CONV-ARCH-03: Copy data only: no DDL (`CREATE`, `ALTER`, `DROP`) and no `TRUNCATE ... CASCADE`; the single `TRUNCATE` lists exactly the configured tables.

- **Why:** `CASCADE` can wipe tables outside the configured list; DDL is managed elsewhere.
- **Enforced:** none

### CONV-ARCH-04: Table names reach SQL only through `quoteTable`; never interpolate config or env values into SQL any other way.

- **Enforced:** none

### CONV-ARCH-05: Each target syncs in one transaction and is isolated from the others: a failure rolls back that target, is logged, and the process exits non-zero.

- **Enforced:** none

### CONV-ARCH-06: Never log connection strings or credentials; log error messages, not full connection objects.

- **Enforced:** none
