# Conventions guide

**Not for routine coding.** Read only when adding, changing, or retiring a convention, and only on explicit request.

## Location

`.claude/rules/conventions/<topic>.md`, one file per topic. Claude Code and VS Code Copilot attach a file when a matching path is read or edited. [conventions/index.md](conventions/index.md) lists every file and scope for other agents. No symlinks are involved.

## File frontmatter

```yaml
---
paths:
  - 'src/**/*.{spec,test}.{ts,tsx}'
status: adopted # adopted | migrating | deprecated
---
```

## Rule format

```md
### CONV-<AREA>-<NN>: <One-sentence rule.>

- <Clarification or exception.>
- **Why:** <one-line reason>
- **Legacy (don't copy):** <paths> # migrating rules only
- **Enforced:** <lint rule | test | partial | none>
```

- IDs are stable and never reused; cite them in PRs, commits, and reviews.
- `Enforced: none` or `partial` means the agent is responsible for compliance.

## Status

- `adopted`: follow in all new and modified code.
- `migrating`: follow in new code; old code may keep the old pattern; do not migrate unrelated code.
- `deprecated`: do not follow; kept to explain existing code.

## Precedence

Package > language > repo-wide. Package overrides are listed in that package's file with a justification.

## Adding or changing

1. Add the rule to the matching file with the next unused ID and fill `Enforced`.
2. Update `docs/conventions/index.md` in the same change.
3. Retire a rule by marking it `deprecated`, never by deleting or reusing its ID.
4. Keep rules lean: one line per field; examples only for easily misapplied rules. Never invent rules without evidence in the codebase.
